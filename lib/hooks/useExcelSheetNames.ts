import { useState, useEffect } from "react";

/**
 * Extracts sheet names from an XLSX file by parsing only the ZIP Central
 * Directory and reading `xl/workbook.xml` — no full workbook is loaded into
 * memory, so this is safe for large files.
 *
 * XLSX files are standard ZIP archives. Only three small slices of the file
 * are read:
 *   1. Last ≤64 KB  → find the End of Central Directory (EOCD) record
 *   2. Central Directory block → locate the `xl/workbook.xml` entry
 *   3. The compressed `xl/workbook.xml` data itself
 *
 * Sheet names are then extracted via a regex on the decompressed XML.
 */
async function extractXlsxSheetNames(file: File): Promise<string[]> {
  const EOCD_SIG = 0x06054b50; // PK\x05\x06
  const CD_SIG = 0x02014b50; // PK\x01\x02
  const LFH_SIG = 0x04034b50; // PK\x03\x04

  // ── Step 1: Find the End of Central Directory record ─────────────────────
  // EOCD is in the last 22–65,557 bytes of the file.
  const readSize = Math.min(file.size, 65536);
  const tail = await file.slice(file.size - readSize).arrayBuffer();
  const tailView = new DataView(tail);

  let eocdPos = -1;
  for (let i = tail.byteLength - 22; i >= 0; i--) {
    if (tailView.getUint32(i, true) === EOCD_SIG) {
      eocdPos = i;
      break;
    }
  }
  if (eocdPos === -1) throw new Error("Not a valid XLSX (ZIP) file");

  const cdOffset = tailView.getUint32(eocdPos + 16, true);
  const cdSize = tailView.getUint32(eocdPos + 12, true);

  // ── Step 2: Read the Central Directory and find xl/workbook.xml ──────────
  const cdBuffer = await file.slice(cdOffset, cdOffset + cdSize).arrayBuffer();
  const cdView = new DataView(cdBuffer);
  const decoder = new TextDecoder();

  let pos = 0;
  let entryOffset = -1;
  let compSize = 0;
  let uncompSize = 0;
  let compMethod = 0;

  while (pos + 46 <= cdBuffer.byteLength) {
    if (cdView.getUint32(pos, true) !== CD_SIG) break;

    const method = cdView.getUint16(pos + 10, true);
    const cSize = cdView.getUint32(pos + 20, true);
    const uSize = cdView.getUint32(pos + 24, true);
    const fnLen = cdView.getUint16(pos + 28, true);
    const exLen = cdView.getUint16(pos + 30, true);
    const cmLen = cdView.getUint16(pos + 32, true);
    const lfhOffset = cdView.getUint32(pos + 42, true);
    const name = decoder.decode(new Uint8Array(cdBuffer, pos + 46, fnLen));

    if (name === "xl/workbook.xml") {
      entryOffset = lfhOffset;
      compSize = cSize;
      uncompSize = uSize;
      compMethod = method;
      break;
    }

    pos += 46 + fnLen + exLen + cmLen;
  }

  if (entryOffset === -1) throw new Error("xl/workbook.xml not found in file");

  // ── Step 3: Read the Local File Header to find the exact data offset ─────
  const lfhBuffer = await file
    .slice(entryOffset, entryOffset + 30)
    .arrayBuffer();
  const lfhView = new DataView(lfhBuffer);
  if (lfhView.getUint32(0, true) !== LFH_SIG)
    throw new Error("Invalid local file header");

  const lfnLen = lfhView.getUint16(26, true);
  const lexLen = lfhView.getUint16(28, true);
  const dataStart = entryOffset + 30 + lfnLen + lexLen;

  // ── Step 4: Read and decompress xl/workbook.xml ───────────────────────────
  const compData = await file
    .slice(dataStart, dataStart + compSize)
    .arrayBuffer();

  let xmlText: string;

  if (compMethod === 0) {
    // Stored — no compression
    xmlText = decoder.decode(compData);
  } else if (compMethod === 8) {
    // DEFLATE — use the native browser DecompressionStream API
    const ds = new DecompressionStream("deflate-raw");
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();

    writer.write(new Uint8Array(compData));
    writer.close();

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const result = new Uint8Array(uncompSize);
    let off = 0;
    for (const chunk of chunks) {
      result.set(chunk, off);
      off += chunk.length;
    }
    xmlText = decoder.decode(result);
  } else {
    throw new Error(`Unsupported ZIP compression method: ${compMethod}`);
  }

  // ── Step 5: Extract sheet names via regex ─────────────────────────────────
  // Handles both quoted forms: name="..." and name='...'
  const re = /<sheet\b[^>]+\bname=["']([^"']+)["']/g;
  const names: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(xmlText)) !== null) {
    names.push(match[1]);
  }
  return names;
}

interface UseExcelSheetNamesResult {
  sheetNames: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that extracts sheet names from an uploaded Excel (.xlsx) file without
 * loading any cell data into memory. Falls back gracefully for non-XLSX files
 * or when the browser does not support DecompressionStream.
 */
export function useExcelSheetNames(
  file: File | null,
): UseExcelSheetNamesResult {
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setSheetNames([]);
      setError(null);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx") {
      // Old .xls binary format is not a ZIP — skip sheet detection
      setSheetNames([]);
      setError(null);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    extractXlsxSheetNames(file)
      .then((names) => {
        if (!cancelled) setSheetNames(names);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to read sheet names",
          );
          setSheetNames([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return { sheetNames, loading, error };
}

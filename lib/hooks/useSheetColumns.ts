import { useState, useEffect } from "react";

/**
 * Extracts column headers for a specific sheet from an XLSX file using only
 * ZIP-level reads — no full workbook is loaded into memory.
 *
 * File slices read per invocation:
 *   1. Last ≤64 KB             → EOCD → Central Directory location
 *   2. Central Directory        → build filename → entry map
 *   3. xl/workbook.xml          → find r:id for the target sheet name
 *   4. xl/_rels/workbook.xml.rels → resolve sheet file path
 *   5. xl/worksheets/sheetN.xml → read first row cells
 *   6. xl/sharedStrings.xml     → (only if first row uses shared strings)
 */

const EOCD_SIG = 0x06054b50;
const CD_SIG = 0x02014b50;
const LFH_SIG = 0x04034b50;

interface ZipEntry {
  compMethod: number;
  compSize: number;
  uncompSize: number;
  lfhOffset: number;
}

async function buildCentralDirectory(
  file: File,
): Promise<Map<string, ZipEntry>> {
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
  if (eocdPos === -1) throw new Error("Not a valid ZIP/XLSX file");

  const cdOffset = tailView.getUint32(eocdPos + 16, true);
  const cdSize = tailView.getUint32(eocdPos + 12, true);

  const cdBuf = await file.slice(cdOffset, cdOffset + cdSize).arrayBuffer();
  const cdView = new DataView(cdBuf);
  const dec = new TextDecoder();
  const map = new Map<string, ZipEntry>();

  let pos = 0;
  while (pos + 46 <= cdBuf.byteLength) {
    if (cdView.getUint32(pos, true) !== CD_SIG) break;
    const compMethod = cdView.getUint16(pos + 10, true);
    const compSize = cdView.getUint32(pos + 20, true);
    const uncompSize = cdView.getUint32(pos + 24, true);
    const fnLen = cdView.getUint16(pos + 28, true);
    const exLen = cdView.getUint16(pos + 30, true);
    const cmLen = cdView.getUint16(pos + 32, true);
    const lfhOffset = cdView.getUint32(pos + 42, true);
    const name = dec.decode(new Uint8Array(cdBuf, pos + 46, fnLen));
    map.set(name, { compMethod, compSize, uncompSize, lfhOffset });
    pos += 46 + fnLen + exLen + cmLen;
  }
  return map;
}

async function decompressEntry(file: File, entry: ZipEntry): Promise<string> {
  const lfhBuf = await file
    .slice(entry.lfhOffset, entry.lfhOffset + 30)
    .arrayBuffer();
  const lfhView = new DataView(lfhBuf);
  if (lfhView.getUint32(0, true) !== LFH_SIG)
    throw new Error("Bad local file header");

  const lfnLen = lfhView.getUint16(26, true);
  const lexLen = lfhView.getUint16(28, true);
  const dataStart = entry.lfhOffset + 30 + lfnLen + lexLen;

  const raw = await file
    .slice(dataStart, dataStart + entry.compSize)
    .arrayBuffer();
  const dec = new TextDecoder();

  if (entry.compMethod === 0) return dec.decode(raw);

  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();

  writer.write(new Uint8Array(raw));
  writer.close();

  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const out = new Uint8Array(entry.uncompSize);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return dec.decode(out);
}

async function extractColumnsForSheet(
  file: File,
  sheetName: string,
): Promise<string[]> {
  const entries = await buildCentralDirectory(file);

  // ── 1. Find r:id for the target sheet in xl/workbook.xml ─────────────────
  const wbEntry = entries.get("xl/workbook.xml");
  if (!wbEntry) throw new Error("xl/workbook.xml not found");
  const wbXml = await decompressEntry(file, wbEntry);

  let rId: string | null = null;
  const sheetTagRe = /<sheet\b([^>]*)>/g;
  let m: RegExpExecArray | null;

  while ((m = sheetTagRe.exec(wbXml)) !== null) {
    const attrs = m[1];
    const nameM = attrs.match(/\bname=["']([^"']+)["']/);
    const rIdM = attrs.match(/\br:id=["']([^"']+)["']/);
    if (nameM?.[1] === sheetName && rIdM) {
      rId = rIdM[1];
      break;
    }
  }
  if (!rId) throw new Error(`Sheet "${sheetName}" not found in workbook.xml`);

  // ── 2. Resolve file path from xl/_rels/workbook.xml.rels ─────────────────
  const relsEntry = entries.get("xl/_rels/workbook.xml.rels");
  if (!relsEntry) throw new Error("xl/_rels/workbook.xml.rels not found");
  const relsXml = await decompressEntry(file, relsEntry);

  let sheetTarget: string | null = null;
  const relRe = /<Relationship\b([^>]*)>/g;
  while ((m = relRe.exec(relsXml)) !== null) {
    const attrs = m[1];
    const idM = attrs.match(/\bId=["']([^"']+)["']/);
    const targetM = attrs.match(/\bTarget=["']([^"']+)["']/);
    if (idM?.[1] === rId && targetM) {
      sheetTarget = targetM[1];
      break;
    }
  }
  if (!sheetTarget) throw new Error(`Relationship ${rId} not found`);

  const sheetPath = sheetTarget.startsWith("/")
    ? sheetTarget.slice(1)
    : `xl/${sheetTarget}`;

  // ── 3. Read first row from the sheet XML ─────────────────────────────────
  const sheetEntry = entries.get(sheetPath);
  if (!sheetEntry) throw new Error(`${sheetPath} not found in ZIP`);
  const sheetXml = await decompressEntry(file, sheetEntry);

  const firstRowM = sheetXml.match(/<row\b[^>]*>([\s\S]*?)<\/row>/);
  if (!firstRowM) return [];
  const rowXml = firstRowM[1];

  const cellValues: string[] = [];
  const ssResolve: Array<{ pos: number; idx: number }> = [];
  const cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;

  while ((m = cellRe.exec(rowXml)) !== null) {
    const attrs = m[1];
    const inner = m[2];
    const typeM = attrs.match(/\bt=["']([^"']+)["']/);
    const type = typeM?.[1] ?? "";

    // Inline string
    const isM = inner.match(/<is>[\s\S]*?<t(?:[^>]*)>([\s\S]*?)<\/t>/);
    // Value node
    const vM = inner.match(/<v>([\s\S]*?)<\/v>/);

    let val = "";
    if (isM) {
      val = isM[1];
    } else if (vM) {
      val = vM[1];
      if (type === "s") {
        ssResolve.push({ pos: cellValues.length, idx: parseInt(val, 10) });
      }
    }
    cellValues.push(val);
  }

  // ── 4. Resolve shared string indices ─────────────────────────────────────
  if (ssResolve.length > 0) {
    const ssEntry = entries.get("xl/sharedStrings.xml");
    if (ssEntry) {
      const ssXml = await decompressEntry(file, ssEntry);
      const strings: string[] = [];
      const siRe = /<si>([\s\S]*?)<\/si>/g;

      while ((m = siRe.exec(ssXml)) !== null) {
        const parts: string[] = [];
        const tRe = /<t(?:\s[^>]*)?>([^<]*)<\/t>/g;
        let tM: RegExpExecArray | null;
        while ((tM = tRe.exec(m[1])) !== null) parts.push(tM[1]);
        strings.push(parts.join(""));
      }

      for (const { pos, idx } of ssResolve) {
        if (idx < strings.length) cellValues[pos] = strings[idx];
      }
    }
  }

  return cellValues.filter((v) => v.trim() !== "");
}

// ─────────────────────────────────────────────────────────────────────────────

interface UseSheetColumnsResult {
  columns: string[];
  loading: boolean;
  error: string | null;
}

export function useSheetColumns(
  file: File | null,
  sheetName: string | undefined,
): UseSheetColumnsResult {
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !sheetName) {
      setColumns([]);
      setError(null);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx") {
      setColumns([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setColumns([]);

    extractColumnsForSheet(file, sheetName)
      .then((cols) => {
        if (!cancelled) setColumns(cols);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to read columns",
          );
          setColumns([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file, sheetName]);

  return { columns, loading, error };
}

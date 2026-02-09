/**
 * Chat utility functions for clipboard operations, file handling, and formatting
 */

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

/**
 * Extract filename from file path
 */
export function extractFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Check if message is uploaded file message
 */
export function isUploadedFileMessage(content: string): boolean {
  return /^(File uploaded:|Uploaded file:)\s+.+/.test(content);
}

/**
 * Extract filename from upload message
 */
export function extractUploadedFileName(content: string): string | null {
  const match = content.match(/^(File uploaded:|Uploaded file:)\s+(.+)$/);
  return match ? match[2] : null;
}

/**
 * Find matching uploaded file by comparing paths
 */
export function findMatchingUploadedFile(
  filePath: string,
  uploadedFiles: Array<{ file_path: string; download_url: string }>
): { file_path: string; download_url: string } | null {
  return uploadedFiles.find(f => f.file_path === filePath) || null;
}

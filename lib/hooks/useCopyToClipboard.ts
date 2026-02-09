"use client";

import { useState } from "react";

/**
 * Hook for copying text to clipboard with feedback
 */
export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    }
  };

  return { copyToClipboard, isCopied };
}

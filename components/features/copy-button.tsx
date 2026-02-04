"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  label?: string;
  showIcon?: boolean;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CopyButton({ 
  text, 
  label, 
  showIcon = true,
  variant = "ghost",
  size = "sm"
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`Copied: ${text}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Button 
      onClick={handleCopy} 
      variant={variant}
      size={size}
      className="gap-1"
    >
      {showIcon && (copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />)}
      {label && <span>{label}</span>}
    </Button>
  );
}

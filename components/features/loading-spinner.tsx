import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}

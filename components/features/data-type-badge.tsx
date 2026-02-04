import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DataTypeBadgeProps {
  dataType: string;
  className?: string;
}

const dataTypeColors: Record<string, string> = {
  int64: "text-amber-500 border-amber-500/20 bg-amber-500/10",
  float64: "text-blue-500 border-blue-500/20 bg-blue-500/10",
  str: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
  string: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
  bool: "text-rose-500 border-rose-500/20 bg-rose-500/10",
  boolean: "text-rose-500 border-rose-500/20 bg-rose-500/10",
  datetime: "text-cyan-500 border-cyan-500/20 bg-cyan-500/10",
  object: "text-purple-500 border-purple-500/20 bg-purple-500/10",
};

export function DataTypeBadge({ dataType, className }: DataTypeBadgeProps) {
  const normalizedType = dataType.toLowerCase();
  const colorClass = dataTypeColors[normalizedType] || "text-gray-500 border-gray-500/20 bg-gray-500/10";
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-mono text-xs",
        colorClass,
        className
      )}
    >
      {dataType}
    </Badge>
  );
}

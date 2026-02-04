import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DataTypeBadgeProps {
  type: string;
  className?: string;
}

// Map data types to IDE-style colors
const typeColorMap: Record<string, string> = {
  // Integer types
  "int": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "int8": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "int16": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "int32": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "int64": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "uint8": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "uint16": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "uint32": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "uint64": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "integer": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  
  // Float types
  "float": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "float16": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "float32": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "float64": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "double": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "decimal": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  
  // String types
  "str": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "string": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "varchar": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "text": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "char": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  
  // Boolean types
  "bool": "text-purple-500 bg-purple-500/10 border-purple-500/20",
  "boolean": "text-purple-500 bg-purple-500/10 border-purple-500/20",
  
  // Date/Time types
  "date": "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  "datetime": "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  "timestamp": "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  "time": "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  
  // Default fallback
  "default": "text-gray-500 bg-gray-500/10 border-gray-500/20",
};

export function DataTypeBadge({ type, className }: DataTypeBadgeProps) {
  const normalizedType = type.toLowerCase();
  const colorClass = typeColorMap[normalizedType] || typeColorMap.default;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-mono text-xs",
        colorClass,
        className
      )}
    >
      {type}
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DataTypeChipProps {
  type: string;
  className?: string;
}

const dataTypeColors: Record<string, string> = {
  str: 'text-green-600 bg-green-50 border-green-200',
  string: 'text-green-600 bg-green-50 border-green-200',
  int64: 'text-blue-600 bg-blue-50 border-blue-200',
  int: 'text-blue-600 bg-blue-50 border-blue-200',
  integer: 'text-blue-600 bg-blue-50 border-blue-200',
  float64: 'text-purple-600 bg-purple-50 border-purple-200',
  float: 'text-purple-600 bg-purple-50 border-purple-200',
  bool: 'text-orange-600 bg-orange-50 border-orange-200',
  boolean: 'text-orange-600 bg-orange-50 border-orange-200',
  datetime64: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  datetime: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  date: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  object: 'text-gray-600 bg-gray-50 border-gray-200',
  default: 'text-gray-600 bg-gray-50 border-gray-200',
};

export function DataTypeChip({ type, className }: DataTypeChipProps) {
  const normalizedType = type.toLowerCase().trim();
  const colorClass = dataTypeColors[normalizedType] || dataTypeColors.default;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-mono text-xs border",
        colorClass,
        className
      )}
    >
      {type}
    </Badge>
  );
}

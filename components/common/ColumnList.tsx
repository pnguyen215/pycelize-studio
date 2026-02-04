import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyableText } from "./CopyableText";
import { DataTypeChip } from "./DataTypeChip";
import { Separator } from "@/components/ui/separator";

interface ColumnListProps {
  columns: string[];
  dataTypes?: Record<string, string>;
  title?: string;
  className?: string;
}

export function ColumnList({ columns, dataTypes, title = "Columns", className }: ColumnListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {columns.map((column, index) => (
            <div key={index}>
              <div className="flex items-center justify-between py-2">
                <CopyableText text={column} className="flex-1" />
                {dataTypes && dataTypes[column] && (
                  <DataTypeChip type={dataTypes[column]} className="ml-4" />
                )}
              </div>
              {index < columns.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

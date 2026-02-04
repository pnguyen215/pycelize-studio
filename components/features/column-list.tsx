import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTypeBadge } from "./data-type-badge";
import { CopyButton } from "./copy-button";

interface ColumnListProps {
  columns: string[];
  dataTypes?: Record<string, string>;
  title?: string;
}

export function ColumnList({ columns, dataTypes, title = "Columns" }: ColumnListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column Name</TableHead>
              {dataTypes && <TableHead>Data Type</TableHead>}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columns.map((column, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono text-sm">{column}</TableCell>
                {dataTypes && (
                  <TableCell>
                    <DataTypeBadge dataType={dataTypes[column] || "unknown"} />
                  </TableCell>
                )}
                <TableCell>
                  <CopyButton text={column} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

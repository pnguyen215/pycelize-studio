import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultDisplayProps {
  title: string;
  data: any;
  className?: string;
}

export function ResultDisplay({ title, data, className }: ResultDisplayProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

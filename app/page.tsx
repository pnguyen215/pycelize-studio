import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileSpreadsheet, Database, Braces } from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "System & Health",
      description: "Monitor service health and status",
      icon: Activity,
      count: 2
    },
    {
      title: "Excel & CSV Operations",
      description: "Process and transform spreadsheet data",
      icon: FileSpreadsheet,
      count: 8
    },
    {
      title: "SQL Generation",
      description: "Generate SQL statements from data",
      icon: Database,
      count: 2
    },
    {
      title: "JSON Generation",
      description: "Create JSON from structured data",
      icon: Braces,
      count: 2
    }
  ];

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Pycelize Studio</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Professional UI for Excel/CSV processing, data transformation, SQL/JSON generation, and file operations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{feature.count}</div>
                <p className="text-xs text-muted-foreground">Features Available</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Explore the features using the sidebar navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Quick Overview</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ <strong>Health Check:</strong> Monitor API service status</li>
              <li>✅ <strong>Excel Operations:</strong> Extract, map, and bind Excel data</li>
              <li>✅ <strong>CSV Operations:</strong> Analyze and convert CSV files</li>
              <li>✅ <strong>Data Transformation:</strong> Normalize data with 20+ types</li>
              <li>✅ <strong>SQL Generation:</strong> Create INSERT statements for multiple databases</li>
              <li>✅ <strong>JSON Generation:</strong> Transform data to JSON format</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Requirements</h3>
            <p className="text-sm text-muted-foreground">
              Make sure the Pycelize Flask API is running at{" "}
              <code className="bg-muted px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_PYCELIZE_API_URL || 'http://localhost:5050/api/v1'}
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

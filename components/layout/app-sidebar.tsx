"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Activity,
  FileText,
  Columns,
  GitBranch,
  Link as LinkIcon,
  Link2,
  FileSpreadsheet,
  ArrowRightLeft,
  Wand2,
  FileInput,
  Database,
  Code2,
  Braces,
  FileJson,
  AlertTriangle,
  Search,
  MessageSquare,
} from "lucide-react";

const navigationGroups = [
  {
    group: "System",
    items: [
      { name: "Dashboard", path: "/", icon: Home },
      { name: "Health Check", path: "/features/health", icon: Activity },
    ],
  },
  {
    group: "AI Assistant",
    items: [
      { name: "Chat Bot", path: "/features/chatbot", icon: MessageSquare },
    ],
  },
  {
    group: "Excel Operations",
    items: [
      { name: "File Info", path: "/features/excel-info", icon: FileText },
      {
        name: "Extract Columns (JSON)",
        path: "/features/column-extraction",
        icon: Columns,
        disabled: true,
      },
      {
        name: "Extract Columns (File)",
        path: "/features/column-extraction-file",
        icon: Columns,
      },
      {
        name: "Map Columns",
        path: "/features/column-mapping",
        icon: GitBranch,
      },
      {
        name: "Binding (Single Key)",
        path: "/features/excel-binding-single",
        icon: LinkIcon,
      },
      {
        name: "Binding (Multi Key)",
        path: "/features/excel-binding-multi",
        icon: Link2,
      },
      {
        name: "Search & Filter",
        path: "/features/excel-search",
        icon: Search,
      },
    ],
  },
  {
    group: "CSV Operations",
    items: [
      { name: "CSV Info", path: "/features/csv-info", icon: FileSpreadsheet },
      {
        name: "CSV to Excel",
        path: "/features/csv-convert",
        icon: ArrowRightLeft,
      },
      {
        name: "Search & Filter",
        path: "/features/csv-search",
        icon: Search,
      },
    ],
  },
  {
    group: "Data Transformation",
    items: [
      { name: "Normalization", path: "/features/normalization", icon: Wand2 },
      {
        name: "File Binding",
        path: "/features/file-binding",
        icon: FileInput,
        disabled: true,
      },
    ],
  },
  {
    group: "SQL Generation",
    items: [
      {
        name: "Standard SQL",
        path: "/features/sql-generation",
        icon: Database,
      },
      {
        name: "SQL Template",
        path: "/features/sql-custom",
        icon: Code2,
      },
    ],
  },
  {
    group: "JSON Generation",
    items: [
      {
        name: "Standard JSON",
        path: "/features/json-generation",
        icon: Braces,
        disabled: true,
      },
      {
        name: "JSON Template",
        path: "/features/json-template",
        icon: FileJson,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-6">
        <h2 className="text-lg font-semibold">Pycelize Studio</h2>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-6 px-3">
          {navigationGroups.map((group) => (
            <div key={group.group}>
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  const isDisabled = item.disabled;

                  if (isDisabled) {
                    return (
                      <div
                        key={item.path}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground opacity-50 cursor-not-allowed"
                        title="This feature is currently disabled"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="line-through">{item.name}</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

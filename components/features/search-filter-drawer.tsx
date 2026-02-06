"use client"

import * as React from "react"
import { Search, Plus, X } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { 
  SearchCondition, 
  SearchRequest,
  ColumnOperatorSuggestion 
} from "@/lib/api/types"

interface SearchFilterDrawerProps {
  file: File | null
  fileType: "excel" | "csv"
  columns: string[]
  onSearch: (request: Omit<SearchRequest, "file">) => Promise<void>
  onFetchOperators?: (file: File) => Promise<Record<string, ColumnOperatorSuggestion>>
}

interface ConditionRow extends SearchCondition {
  id: string
}

export function SearchFilterDrawer({
  file,
  fileType,
  columns,
  onSearch,
  onFetchOperators,
}: SearchFilterDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [conditions, setConditions] = React.useState<ConditionRow[]>([])
  const [logic, setLogic] = React.useState<"AND" | "OR">("AND")
  const [outputFormat, setOutputFormat] = React.useState<"xlsx" | "csv" | "json">("xlsx")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [operatorSuggestions, setOperatorSuggestions] = React.useState<
    Record<string, ColumnOperatorSuggestion>
  >({})
  const [loadingOperators, setLoadingOperators] = React.useState(false)

  const isExcelOrCSV = React.useMemo(() => {
    if (!file) return false
    const extension = file.name.split('.').pop()?.toLowerCase()
    return ['csv', 'xlsx', 'xls'].includes(extension || '')
  }, [file])

  // Fetch operator suggestions when drawer opens
  React.useEffect(() => {
    const fetchOperators = async () => {
      if (isOpen && file && onFetchOperators && Object.keys(operatorSuggestions).length === 0) {
        setLoadingOperators(true)
        try {
          const suggestions = await onFetchOperators(file)
          setOperatorSuggestions(suggestions)
        } catch (err) {
          console.error("Failed to fetch operator suggestions:", err)
        } finally {
          setLoadingOperators(false)
        }
      }
    }
    fetchOperators()
  }, [isOpen, file, onFetchOperators, operatorSuggestions])

  // Reset state when drawer closes
  React.useEffect(() => {
    if (!isOpen) {
      setConditions([])
      setLogic("AND")
      setOutputFormat("xlsx")
      setError(null)
    }
  }, [isOpen])

  const addCondition = () => {
    const newCondition: ConditionRow = {
      id: `condition-${Date.now()}`,
      column: columns[0] || "",
      operator: "equals",
      value: "",
    }
    setConditions([...conditions, newCondition])
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id))
  }

  const updateCondition = (
    id: string,
    field: keyof SearchCondition,
    value: string | number | boolean | null
  ) => {
    setConditions(
      conditions.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    )
  }

  const getOperatorsForColumn = (columnName: string): string[] => {
    if (operatorSuggestions[columnName]) {
      return operatorSuggestions[columnName].operators
    }
    // Default operators if suggestions not available
    return [
      "equals",
      "not_equals",
      "contains",
      "not_contains",
      "starts_with",
      "ends_with",
      "greater_than",
      "less_than",
      "is_empty",
      "is_not_empty",
    ]
  }

  const handleSearch = async () => {
    if (conditions.length === 0) {
      setError("Please add at least one search condition")
      return
    }

    // Validate conditions
    for (const condition of conditions) {
      if (!condition.column) {
        setError("Please select a column for all conditions")
        return
      }
      if (!condition.operator) {
        setError("Please select an operator for all conditions")
        return
      }
      if (
        condition.value === "" &&
        condition.operator !== "is_empty" &&
        condition.operator !== "is_not_empty"
      ) {
        setError("Please enter a value for all conditions")
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const searchConditions: SearchCondition[] = conditions.map(({ id, ...rest }) => rest)
      await onSearch({
        conditions: searchConditions,
        logic,
        outputFormat,
      })
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isExcelOrCSV || !file || columns.length === 0) {
    return null
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2">
          <Search className="mr-2 h-4 w-4" />
          Search & Filter
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Search & Filter: {file.name}</DrawerTitle>
          <DrawerDescription>
            Define search conditions to filter your data
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-auto flex-1">
          {loadingOperators && (
            <div className="flex items-center justify-center py-4">
              <p className="text-sm text-muted-foreground">Loading operator suggestions...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Logic and Output Format */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="logic">Condition Logic</Label>
              <Select value={logic} onValueChange={(value) => setLogic(value as "AND" | "OR")}>
                <SelectTrigger id="logic" className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND (All conditions must match)</SelectItem>
                  <SelectItem value="OR">OR (Any condition matches)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="output-format">Output Format</Label>
              <Select
                value={outputFormat}
                onValueChange={(value) => setOutputFormat(value as "xlsx" | "csv" | "json")}
              >
                <SelectTrigger id="output-format" className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Conditions */}
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <Label>Search Conditions</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addCondition}
                disabled={loadingOperators}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Condition
              </Button>
            </div>

            {conditions.length === 0 && (
              <div className="text-center py-8 border rounded-md border-dashed">
                <p className="text-sm text-muted-foreground">
                  No conditions added. Click "Add Condition" to start.
                </p>
              </div>
            )}

            {conditions.map((condition, index) => (
              <div
                key={condition.id}
                className="border rounded-md p-4 space-y-3 bg-muted/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Condition {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(condition.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Column Select */}
                  <div>
                    <Label htmlFor={`column-${condition.id}`}>Column</Label>
                    <Select
                      value={condition.column}
                      onValueChange={(value) => updateCondition(condition.id, "column", value)}
                    >
                      <SelectTrigger id={`column-${condition.id}`} className="mt-2">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator Select */}
                  <div>
                    <Label htmlFor={`operator-${condition.id}`}>Operator</Label>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(condition.id, "operator", value)}
                    >
                      <SelectTrigger id={`operator-${condition.id}`} className="mt-2">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {getOperatorsForColumn(condition.column).map((op) => (
                          <SelectItem key={op} value={op}>
                            {op.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value Input */}
                  <div>
                    <Label htmlFor={`value-${condition.id}`}>Value</Label>
                    <Input
                      id={`value-${condition.id}`}
                      type="text"
                      value={condition.value as string}
                      onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                      placeholder="Enter value"
                      className="mt-2"
                      disabled={
                        condition.operator === "is_empty" ||
                        condition.operator === "is_not_empty"
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DrawerFooter>
          <Button onClick={handleSearch} disabled={isLoading || conditions.length === 0}>
            {isLoading ? "Searching..." : "Execute Search"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

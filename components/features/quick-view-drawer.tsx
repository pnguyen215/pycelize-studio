"use client"

import * as React from "react"
import * as ExcelJS from "exceljs"
import Papa from "papaparse"
import { Eye } from "lucide-react"
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
import { Slider } from "@/components/ui/slider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface QuickViewDrawerProps {
  file: File | null
}

interface ParsedData {
  headers: string[]
  rows: string[][]
}

export function QuickViewDrawer({ file }: QuickViewDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [rowCount, setRowCount] = React.useState(10)
  const [parsedData, setParsedData] = React.useState<ParsedData | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isExcelOrCSV = React.useMemo(() => {
    if (!file) return false
    const extension = file.name.split('.').pop()?.toLowerCase()
    return ['csv', 'xlsx', 'xls'].includes(extension || '')
  }, [file])

  const parseFile = React.useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // File size limit: 10MB for security and performance
      const MAX_FILE_SIZE = 10 * 1024 * 1024
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 10MB limit')
      }
      
      const extension = file.name.split('.').pop()?.toLowerCase()
      
      if (extension === 'csv') {
        // Parse CSV using PapaParse
        const text = await file.text()
        const result = Papa.parse(text, {
          header: false,
          skipEmptyLines: true,
          preview: 1000, // Limit parsing to first 1000 rows for performance
        })
        
        if (result.errors.length > 0) {
          throw new Error('Failed to parse CSV file')
        }
        
        const data = result.data as string[][]
        if (data.length === 0) {
          throw new Error('CSV file is empty')
        }
        
        const headers = data[0]
        const rows = data.slice(1)
        
        setParsedData({ headers, rows })
      } else if (extension === 'xlsx' || extension === 'xls') {
        // Parse Excel using ExcelJS
        const arrayBuffer = await file.arrayBuffer()
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(arrayBuffer)
        
        // Get first worksheet
        const worksheet = workbook.worksheets[0]
        
        if (!worksheet) {
          throw new Error('No worksheets found in Excel file')
        }
        
        // Convert to array of arrays (limit to first 1000 rows)
        const data: string[][] = []
        let rowCount = 0
        
        worksheet.eachRow((row) => {
          if (rowCount >= 1000) return
          
          const rowData: string[] = []
          row.eachCell({ includeEmpty: true }, (cell) => {
            // Convert cell value to string
            const value = cell.value
            if (value === null || value === undefined) {
              rowData.push('')
            } else if (typeof value === 'object' && 'text' in value) {
              // Handle rich text
              rowData.push(value.text || '')
            } else if (value instanceof Date) {
              rowData.push(value.toLocaleDateString())
            } else {
              rowData.push(String(value))
            }
          })
          
          data.push(rowData)
          rowCount++
        })
        
        if (data.length === 0) {
          throw new Error('Excel file is empty')
        }
        
        const headers = data[0]
        const rows = data.slice(1)
        
        setParsedData({ headers, rows })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
      setParsedData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (isOpen && file && isExcelOrCSV) {
      parseFile(file)
    }
  }, [isOpen, file, isExcelOrCSV, parseFile])

  const displayedRows = React.useMemo(() => {
    if (!parsedData) return []
    return parsedData.rows.slice(0, Math.min(rowCount, parsedData.rows.length))
  }, [parsedData, rowCount])

  const handleRowCountChange = (value: number[]) => {
    const num = value[0]
    if (num >= 1 && num <= 10000) {
      setRowCount(num)
    }
  }

  if (!isExcelOrCSV || !file) {
    return null
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2">
          <Eye className="mr-2 h-4 w-4" />
          Quick View
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>File Preview: {file.name}</DrawerTitle>
          <DrawerDescription>
            {parsedData && `Showing ${displayedRows.length} of ${parsedData.rows.length} rows`}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4 overflow-auto flex-1">
          <div className="mb-4 flex flex-col gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="row-count">Number of rows to preview</Label>
                <span className="text-sm font-medium">{rowCount}</span>
              </div>
              <Slider
                id="row-count"
                min={1}
                max={10000}
                step={1}
                value={[rowCount]}
                onValueChange={handleRowCountChange}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  1 row
                </p>
                <p className="text-xs text-muted-foreground">
                  10,000 rows
                </p>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading file...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!isLoading && !error && parsedData && (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {parsedData.headers.map((header, index) => (
                        <TableHead key={index} className="whitespace-nowrap">
                          {header || `Column ${index + 1}`}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={parsedData.headers.length}
                          className="text-center text-muted-foreground"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedRows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {parsedData.headers.map((_, cellIndex) => (
                            <TableCell key={cellIndex} className="whitespace-nowrap">
                              {row[cellIndex] || ''}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

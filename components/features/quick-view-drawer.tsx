"use client"

import * as React from "react"
import * as XLSX from "xlsx"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
        // Parse Excel using xlsx
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { 
          type: 'array',
          sheetRows: 1000, // Limit rows read for performance and security
        })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to array of arrays
        const data = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
        }) as string[][]
        
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

  const handleRowCountChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0 && num <= 10000) {
      setRowCount(num)
    } else if (value === '') {
      setRowCount(10) // Reset to default on empty
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
          <div className="mb-4 flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="row-count">Number of rows to preview</Label>
              <Input
                id="row-count"
                type="number"
                min="1"
                max="10000"
                value={rowCount}
                onChange={(e) => handleRowCountChange(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 10,000 rows
              </p>
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

# Search and Filter Feature

## Overview

The Search and Filter feature provides powerful data filtering capabilities for Excel and CSV files. Users can define multiple search conditions, combine them with logical operators, and export filtered results in various formats.

## Quick Start

### Excel Search
1. Navigate to `/features/excel-search`
2. Upload an Excel file (.xlsx, .xls)
3. Click "Search & Filter" button
4. Add search conditions
5. Execute search and download results

### CSV Search
1. Navigate to `/features/csv-search`
2. Upload a CSV file
3. Click "Search & Filter" button
4. Add search conditions
5. Execute search and download results

## Features

### Multi-Condition Search
- Add unlimited search conditions
- Each condition specifies: column, operator, and value
- Dynamically add/remove conditions

### Smart Operator Suggestions
- System automatically suggests valid operators per column
- Based on column data type (string, numeric, date)
- Prevents invalid operator selections

### Flexible Logic
- **AND**: All conditions must match (intersection)
- **OR**: Any condition matches (union)

### Multiple Export Formats
- Excel (.xlsx) - Original formatting preserved
- CSV (.csv) - Universal compatibility
- JSON (.json) - API-friendly format

### Result Metrics
- Total rows in original file
- Number of filtered rows
- Number of conditions applied

## Supported Operators

### For Text Columns
- `equals` - Exact match
- `not_equals` - Not equal to
- `contains` - Contains substring
- `not_contains` - Doesn't contain
- `starts_with` - Starts with text
- `ends_with` - Ends with text
- `is_empty` - Field is empty
- `is_not_empty` - Field has value

### For Numeric Columns
- `equals` - Equal to number
- `not_equals` - Not equal to
- `greater_than` - Greater than
- `greater_than_or_equal` - ≥
- `less_than` - Less than
- `less_than_or_equal` - ≤
- `between` - Within range

### For Date Columns
- `equals` - Exact date
- `before` - Before date
- `after` - After date
- `between` - Date range

## Example Use Cases

### 1. Find Active Customers with High Value
```
Condition 1: status = "active"
Condition 2: amount > 5000
Logic: AND
Output: Excel
```

### 2. Filter Multiple Regions
```
Condition 1: region = "North"
Condition 2: region = "South"
Logic: OR
Output: CSV
```

### 3. Age Range with Status
```
Condition 1: age between [25, 40]
Condition 2: status = "active"
Logic: AND
Output: JSON
```

### 4. Find Empty Fields
```
Condition 1: phone is_empty
Logic: N/A (single condition)
Output: Excel
```

## UI Components

### SearchFilterDrawer
Located in `components/features/search-filter-drawer.tsx`

**Props:**
- `file: File | null` - The uploaded file
- `fileType: "excel" | "csv"` - Type of file
- `columns: string[]` - Available columns
- `onSearch: (request) => Promise<void>` - Search handler
- `onFetchOperators?: (file) => Promise<...>` - Operator fetcher

### Feature Pages
- Excel Search: `app/features/excel-search/page.tsx`
- CSV Search: `app/features/csv-search/page.tsx`

## API Integration

### Endpoints Used

**Excel:**
- `POST /api/v1/excel/search` - Execute search
- `POST /api/v1/excel/search/suggest-operators` - Get operators
- `POST /api/v1/excel/info` - Get file info

**CSV:**
- `POST /api/v1/csv/search` - Execute search
- `POST /api/v1/csv/search/suggest-operators` - Get operators
- `POST /api/v1/csv/info` - Get file info

### Request Format

```typescript
POST /api/v1/excel/search
Content-Type: multipart/form-data

{
  file: File,
  conditions: [
    {
      column: "status",
      operator: "equals",
      value: "active"
    },
    {
      column: "amount",
      operator: "greater_than",
      value: 1000
    }
  ],
  logic: "AND",
  output_format: "xlsx"
}
```

### Response Format

```json
{
  "data": {
    "download_url": "/api/v1/files/downloads/search_results_20260206.xlsx",
    "total_rows": 1000,
    "filtered_rows": 45,
    "conditions_applied": 2
  },
  "message": "Search completed successfully. 45 rows matched.",
  "status_code": 200
}
```

## Validation

The system validates:
- ✅ At least one condition required
- ✅ All conditions must have column selected
- ✅ All conditions must have operator selected
- ✅ All conditions must have value (except is_empty/is_not_empty)

## Error Handling

User-friendly error messages for:
- Network errors
- Invalid file format
- Missing required fields
- Backend errors
- File size limits exceeded

## Performance

- Operator suggestions cached after first fetch
- Minimal re-renders with React optimization
- Efficient state management
- Fast condition addition/removal

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Limitations

- File size limits apply (configured on backend)
- Maximum conditions: unlimited (reasonable use)
- Search is performed on backend (not client-side)
- Results are temporary (auto-cleanup after period)

## Tips

1. **Start Simple**: Begin with one or two conditions
2. **Use OR for Alternatives**: Find multiple values in same column
3. **Use AND for Precision**: Narrow down results across columns
4. **Check Operators**: Different columns show different operators
5. **Preview First**: Use Quick View before searching
6. **Export Format**: Choose based on next step (Excel for humans, JSON for APIs)

## Troubleshooting

### "Failed to load file information"
- Ensure backend server is running
- Check file format is supported
- Verify file isn't corrupted

### "No operators available"
- Wait for suggestions to load
- Check network connection
- Verify file was processed correctly

### "Search failed"
- Check all conditions are filled
- Verify values match column types
- Review error message for details

## Related Features

- **Quick View**: Preview file data before searching
- **Excel Info**: View file metadata
- **CSV Info**: View CSV file structure
- **Column Extraction**: Extract specific columns only

## Future Enhancements

- Result preview before download
- Save search templates
- Search history
- Advanced regex operators
- Batch file search
- Schedule recurring searches

## Documentation

- Implementation Guide: `docs/SEARCH_FILTER_IMPLEMENTATION.md`
- UI Mockup: `docs/SEARCH_FILTER_UI_MOCKUP.md`

## Support

For issues or questions:
1. Check documentation
2. Review API documentation at Pycelize repository
3. Open an issue on GitHub

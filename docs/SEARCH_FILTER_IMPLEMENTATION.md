# Search and Filter Feature - Implementation Documentation

## Overview
This document describes the implementation of the Search and Filter functionality for Excel and CSV files in the Pycelize Studio frontend.

## Features Implemented

### 1. API Integration (`lib/api/`)

#### New Types (`lib/api/types.ts`)
- `SearchCondition`: Represents a single search condition (column, operator, value)
- `SearchRequest`: Complete search request with conditions, logic, and output format
- `SearchResponse`: Search result with download URL and statistics
- `ColumnOperatorSuggestion`: Operator suggestions for a column based on data type
- `SuggestOperatorsResponse`: Map of column names to their operator suggestions

#### Excel API Methods (`lib/api/excel.ts`)
- `excelApi.search()`: Search and filter Excel data
- `excelApi.suggestOperators()`: Get suggested operators for Excel columns

#### CSV API Methods (`lib/api/csv.ts`)
- `csvApi.search()`: Search and filter CSV data
- `csvApi.suggestOperators()`: Get suggested operators for CSV columns

### 2. UI Components

#### SearchFilterDrawer (`components/features/search-filter-drawer.tsx`)
A reusable drawer component that provides:
- **File Context Display**: Shows currently selected file
- **Condition Builder**: Dynamic interface to add/remove search conditions
  - Column selector (dropdown)
  - Operator selector (populated from API suggestions)
  - Value input field
  - Remove condition button
- **Search Configuration**:
  - Logic selector (AND/OR between conditions)
  - Output format selector (Excel/CSV/JSON)
- **Operator Suggestions**: Automatically fetches and displays valid operators per column
- **Validation**: Ensures all conditions are properly filled before search
- **Error Handling**: Displays user-friendly error messages

### 3. Feature Pages

#### Excel Search Page (`app/features/excel-search/page.tsx`)
Complete page for searching and filtering Excel files:
- File upload with validation
- Automatic column extraction from uploaded file
- Integration with QuickView drawer for data preview
- Integration with SearchFilter drawer for defining conditions
- Result display with metrics:
  - Total rows
  - Filtered rows
  - Conditions applied
- Download link for filtered results

#### CSV Search Page (`app/features/csv-search/page.tsx`)
Similar functionality for CSV files:
- CSV file upload
- Column extraction
- Quick view and search filter integration
- Result metrics and download

## User Flow

1. **Upload File**: User uploads an Excel or CSV file
2. **File Processing**: Frontend calls `/excel/info` or `/csv/info` to get column names
3. **View Options**: User can:
   - Click "Quick View" to preview data
   - Click "Search & Filter" to open the search drawer
4. **Define Conditions**: In the Search & Filter drawer:
   - System fetches operator suggestions for each column
   - User adds one or more search conditions
   - Each condition specifies: column, operator, and value
   - User selects logic (AND/OR) between conditions
   - User selects output format (xlsx/csv/json)
5. **Execute Search**: User clicks "Execute Search"
6. **View Results**: System displays:
   - Statistics (total rows, filtered rows, conditions applied)
   - Download link for the filtered result file

## Supported Search Operators

### String Operators
- `equals` - Exact match
- `not_equals` - Not equal to
- `contains` - Contains substring (case-insensitive)
- `not_contains` - Does not contain substring
- `starts_with` - Starts with string
- `ends_with` - Ends with string
- `is_empty` - Field is empty or null
- `is_not_empty` - Field is not empty

### Numeric Operators
- `equals` - Equal to number
- `not_equals` - Not equal to number
- `greater_than` - Greater than
- `greater_than_or_equal` - Greater than or equal
- `less_than` - Less than
- `less_than_or_equal` - Less than or equal
- `between` - Between two values

### Date Operators
- `equals` - Exact date match
- `before` - Before date
- `after` - After date
- `between` - Between two dates

## Design Patterns

### Reusability
- `SearchFilterDrawer` component is file-type agnostic
- Takes `fileType` prop ("excel" or "csv")
- Uses same component for both Excel and CSV search pages

### Existing Infrastructure Reuse
- Leverages existing `QuickViewDrawer` for data preview
- Uses same file upload flow as other features
- Integrates with existing API client architecture
- Follows established UI component patterns from shadcn/ui

### Consistency
- Matches design patterns from existing features (excel-info, csv-info)
- Uses same card-based layout
- Consistent error handling and loading states
- Same metric card display for results

## API Endpoints Used

### Excel Search
- `POST /api/v1/excel/search` - Execute search with conditions
- `POST /api/v1/excel/search/suggest-operators` - Get operator suggestions
- `POST /api/v1/excel/info` - Get file metadata (existing)

### CSV Search
- `POST /api/v1/csv/search` - Execute search with conditions
- `POST /api/v1/csv/search/suggest-operators` - Get operator suggestions
- `POST /api/v1/csv/info` - Get file metadata (existing)

## Example Request/Response

### Suggest Operators Request
```typescript
POST /api/v1/excel/search/suggest-operators
Content-Type: multipart/form-data

file: [Excel file]
```

### Suggest Operators Response
```json
{
  "data": {
    "customer_id": {
      "type": "object",
      "operators": ["equals", "not_equals", "contains", "starts_with", "ends_with"]
    },
    "amount": {
      "type": "float64",
      "operators": ["equals", "not_equals", "greater_than", "less_than", "between"]
    }
  },
  "message": "Operator suggestions generated successfully",
  "status_code": 200
}
```

### Search Request
```typescript
POST /api/v1/excel/search
Content-Type: multipart/form-data

file: [Excel file]
conditions: [
  {"column": "status", "operator": "equals", "value": "active"},
  {"column": "amount", "operator": "greater_than", "value": 1000}
]
logic: "AND"
output_format: "xlsx"
```

### Search Response
```json
{
  "data": {
    "download_url": "/api/v1/files/downloads/search_results_20260206_120000.xlsx",
    "total_rows": 1000,
    "filtered_rows": 45,
    "conditions_applied": 2
  },
  "message": "Search completed successfully. 45 rows matched.",
  "status_code": 200
}
```

## Technical Implementation Details

### State Management
- Local React state using `useState` hooks
- No global state management needed
- File and column data fetched on upload
- Operator suggestions cached in component state

### Type Safety
- Full TypeScript support
- Type-safe API calls
- Interface definitions for all data structures

### Error Handling
- Try-catch blocks for all async operations
- User-friendly error messages
- Visual error indicators (red alert boxes)
- Console logging for debugging

### Performance Considerations
- Operator suggestions fetched once per file
- Cached in component state to avoid repeated API calls
- Minimal re-renders through proper React patterns
- File size validation before upload

## Testing

### Manual Testing Checklist
- [x] TypeScript compilation passes
- [x] ESLint passes with no critical errors
- [x] Build succeeds without errors
- [x] Excel search page loads correctly
- [x] CSV search page loads correctly
- [x] File upload UI works
- [x] UI components render properly
- [ ] Integration test with backend API (requires running backend server)
- [ ] End-to-end search workflow test with real data

## Future Enhancements

1. **Preview Results**: Add ability to preview filtered data before download
2. **Save Searches**: Allow users to save frequently used search conditions
3. **Advanced Operators**: Add more operators like regex matching
4. **Batch Search**: Search multiple files at once
5. **Export Options**: Additional export formats (PDF, HTML)
6. **Search History**: Track and display previous searches

## Notes

- Backend API server must be running at `http://localhost:5050/api/v1`
- File size limits apply (configured on backend)
- Search results are temporary and cleaned up after a period
- All searches preserve original file data (read-only operation)

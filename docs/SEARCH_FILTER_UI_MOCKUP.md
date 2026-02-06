# Search & Filter Drawer - UI Mockup

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Search & Filter: sample_data.csv                                    ×  │
│  Define search conditions to filter your data                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Condition Logic                 Output Format                          │
│  ┌──────────────────────────┐   ┌──────────────────────────┐          │
│  │ AND (All must match)  ▼ │   │ Excel (.xlsx)        ▼  │          │
│  └──────────────────────────┘   └──────────────────────────┘          │
│                                                                          │
│  Search Conditions                                    [+ Add Condition] │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Condition 1                                                  × │   │
│  │                                                                 │   │
│  │ Column               Operator            Value                 │   │
│  │ ┌─────────────┐     ┌──────────────┐   ┌──────────────────┐  │   │
│  │ │ status    ▼│     │ equals     ▼│   │ active           │  │   │
│  │ └─────────────┘     └──────────────┘   └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Condition 2                                                  × │   │
│  │                                                                 │   │
│  │ Column               Operator            Value                 │   │
│  │ ┌─────────────┐     ┌──────────────┐   ┌──────────────────┐  │   │
│  │ │ amount    ▼│     │ greater_than▼│   │ 1000             │  │   │
│  │ └─────────────┘     └──────────────┘   └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Condition 3                                                  × │   │
│  │                                                                 │   │
│  │ Column               Operator            Value                 │   │
│  │ ┌─────────────┐     ┌──────────────┐   ┌──────────────────┐  │   │
│  │ │ age       ▼│     │ between    ▼│   │ [25, 40]         │  │   │
│  │ └─────────────┘     └──────────────┘   └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                       [ Execute Search ]     [ Cancel ]                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Structure

### Header Section
- **Title**: Shows the filename being searched
- **Description**: Brief help text
- **Close Button**: X button to close drawer

### Configuration Section
- **Condition Logic Dropdown**:
  - AND (All conditions must match)
  - OR (Any condition matches)
  
- **Output Format Dropdown**:
  - Excel (.xlsx)
  - CSV (.csv)
  - JSON (.json)

### Search Conditions Section
- **Header Row**:
  - "Search Conditions" label
  - "+ Add Condition" button (right-aligned)

- **Condition Cards** (dynamically added/removed):
  - Card header with "Condition N" label and remove (×) button
  - Three-column layout:
    - **Column Dropdown**: Lists all available columns from the file
    - **Operator Dropdown**: Shows operators valid for selected column type
    - **Value Input**: Text field for search value
      - Disabled for `is_empty` and `is_not_empty` operators

### Empty State
When no conditions are added:
```
┌─────────────────────────────────────────────┐
│                                              │
│  No conditions added.                        │
│  Click "Add Condition" to start.             │
│                                              │
└─────────────────────────────────────────────┘
```

### Footer Section
- **Execute Search Button**: Primary action button (blue)
  - Disabled when no conditions added
  - Shows "Searching..." when loading
- **Cancel Button**: Secondary button to close drawer

## Operator Suggestions by Column Type

### Text/String Columns
- equals
- not_equals
- contains
- not_contains
- starts_with
- ends_with
- is_empty
- is_not_empty

### Numeric Columns
- equals
- not_equals
- greater_than
- greater_than_or_equal
- less_than
- less_than_or_equal
- between

### Date Columns
- equals
- before
- after
- between

## Interaction Flow

1. **Open Drawer**: User clicks "Search & Filter" button after uploading file
2. **Load Operators**: System automatically fetches operator suggestions from API
3. **Add Condition**: User clicks "+ Add Condition" button
4. **Configure Condition**:
   - Select column from dropdown
   - Select operator (filtered based on column type)
   - Enter value (or leave empty for is_empty/is_not_empty)
5. **Add More Conditions**: Repeat step 3-4 as needed
6. **Configure Search**:
   - Choose AND/OR logic
   - Choose output format
7. **Execute**: Click "Execute Search" button
8. **View Results**: Drawer closes, results displayed on main page

## Validation

### Before Search Execution
- ✓ At least one condition must be added
- ✓ Each condition must have a column selected
- ✓ Each condition must have an operator selected
- ✓ Each condition must have a value (except is_empty/is_not_empty operators)

### Error Display
Errors shown in red alert box at top of drawer:
- "Please add at least one search condition"
- "Please select a column for all conditions"
- "Please select an operator for all conditions"
- "Please enter a value for all conditions"

## Responsive Design

### Desktop (>768px)
- Drawer takes 90% of viewport height
- Conditions displayed in 3-column grid
- Full button text visible

### Tablet/Mobile (<768px)
- Drawer takes full height
- Conditions stack vertically
- Buttons stack or use icons

## Accessibility Features

- Keyboard navigation support
- ARIA labels on all interactive elements
- Focus management when drawer opens
- Screen reader announcements for dynamic content
- High contrast mode support

## Example Use Cases

### Case 1: Find Active High-Value Customers
```
Conditions:
1. status = "active"
2. amount > 5000
Logic: AND
Output: xlsx
```

### Case 2: Find Multiple Regions
```
Conditions:
1. region = "North"
2. region = "South"
Logic: OR
Output: csv
```

### Case 3: Filter by Age Range and Status
```
Conditions:
1. age between [25, 40]
2. status = "active"
3. email contains "@gmail.com"
Logic: AND
Output: json
```

## Technical Notes

- Uses shadcn/ui Drawer component for base layout
- Vaul library provides drawer animations
- Form state managed with React useState hooks
- Operator suggestions cached after first fetch
- Condition IDs generated with timestamps for React keys
- Value field type detection based on operator selection

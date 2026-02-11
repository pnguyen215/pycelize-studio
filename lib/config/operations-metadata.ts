/**
 * Operation Metadata Configuration
 * 
 * Defines the structure and required inputs for each supported operation
 */

export interface OperationField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'file' | 'textarea' | 'checkbox' | 'json' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  description?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface OperationMetadata {
  name: string;
  description: string;
  category: string;
  fields: OperationField[];
  requiresFile: boolean;
}

/**
 * Operation metadata mapping
 * Maps operation endpoints to their required inputs
 */
export const OPERATIONS_METADATA: Record<string, OperationMetadata> = {
  // Excel Operations
  'excel/info': {
    name: 'Excel Info',
    description: 'Get information about an Excel file',
    category: 'excel',
    requiresFile: true,
    fields: []
  },
  'excel/extract-columns': {
    name: 'Extract Columns',
    description: 'Extract specific columns from Excel file',
    category: 'excel',
    requiresFile: true,
    fields: [
      {
        name: 'columns',
        label: 'Columns',
        type: 'json',
        required: true,
        placeholder: '["column1", "column2"]',
        description: 'Array of column names to extract'
      },
      {
        name: 'remove_duplicates',
        label: 'Remove Duplicates',
        type: 'checkbox',
        required: false,
        defaultValue: false
      }
    ]
  },
  'excel/extract-columns-to-file': {
    name: 'Extract Columns to File',
    description: 'Extract columns and save to a new file',
    category: 'excel',
    requiresFile: true,
    fields: [
      {
        name: 'columns',
        label: 'Columns',
        type: 'json',
        required: true,
        placeholder: '["column1", "column2"]',
        description: 'Array of column names to extract'
      },
      {
        name: 'remove_duplicates',
        label: 'Remove Duplicates',
        type: 'checkbox',
        required: false,
        defaultValue: false
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'output.xlsx'
      }
    ]
  },
  'excel/search': {
    name: 'Excel Search',
    description: 'Search and filter data in Excel files',
    category: 'excel',
    requiresFile: true,
    fields: [
      {
        name: 'conditions',
        label: 'Search Conditions',
        type: 'json',
        required: true,
        placeholder: '[{"column": "age", "operator": "gt", "value": "18"}]',
        description: 'Array of search conditions'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'filtered.xlsx'
      }
    ]
  },
  'excel/binding-single': {
    name: 'Excel Binding Single',
    description: 'Bind data from one Excel file to another',
    category: 'excel',
    requiresFile: true,
    fields: [
      {
        name: 'column_mapping',
        label: 'Column Mapping',
        type: 'json',
        required: true,
        placeholder: '{"source_col": "target_col"}',
        description: 'Map source columns to target columns'
      }
    ]
  },

  // CSV Operations
  'csv/info': {
    name: 'CSV Info',
    description: 'Get information about a CSV file',
    category: 'csv',
    requiresFile: true,
    fields: []
  },
  'csv/convert': {
    name: 'CSV to Excel',
    description: 'Convert CSV file to Excel format',
    category: 'csv',
    requiresFile: true,
    fields: [
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'output.xlsx'
      }
    ]
  },
  'csv/search': {
    name: 'CSV Search',
    description: 'Search and filter data in CSV files',
    category: 'csv',
    requiresFile: true,
    fields: [
      {
        name: 'conditions',
        label: 'Search Conditions',
        type: 'json',
        required: true,
        placeholder: '[{"column": "name", "operator": "eq", "value": "John"}]',
        description: 'Array of search conditions'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'filtered.csv'
      }
    ]
  },

  // SQL Operations
  'sql/generate': {
    name: 'Generate SQL',
    description: 'Generate SQL INSERT statements from file',
    category: 'sql',
    requiresFile: true,
    fields: [
      {
        name: 'table_name',
        label: 'Table Name',
        type: 'text',
        required: true,
        placeholder: 'users'
      },
      {
        name: 'database_type',
        label: 'Database Type',
        type: 'select',
        required: true,
        options: [
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'sqlite', label: 'SQLite' }
        ]
      },
      {
        name: 'columns',
        label: 'Columns',
        type: 'json',
        required: false,
        placeholder: '["col1", "col2"]',
        description: 'Specific columns to include (optional)'
      }
    ]
  },
  'sql/custom': {
    name: 'Custom SQL',
    description: 'Generate SQL using custom template',
    category: 'sql',
    requiresFile: true,
    fields: [
      {
        name: 'template',
        label: 'SQL Template',
        type: 'textarea',
        required: true,
        placeholder: 'INSERT INTO {table} (col1, col2) VALUES ({col1}, {col2});',
        description: 'Custom SQL template with placeholders'
      }
    ]
  },

  // JSON Operations
  'json/generate': {
    name: 'Generate JSON',
    description: 'Convert file data to JSON format',
    category: 'json',
    requiresFile: true,
    fields: [
      {
        name: 'pretty_print',
        label: 'Pretty Print',
        type: 'checkbox',
        required: false,
        defaultValue: true
      },
      {
        name: 'null_handling',
        label: 'Null Handling',
        type: 'select',
        required: false,
        options: [
          { value: 'include', label: 'Include' },
          { value: 'exclude', label: 'Exclude' },
          { value: 'default', label: 'Default' }
        ]
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'output.json'
      }
    ]
  },
  'json/template': {
    name: 'JSON Template',
    description: 'Generate JSON using custom template',
    category: 'json',
    requiresFile: true,
    fields: [
      {
        name: 'template',
        label: 'JSON Template',
        type: 'json',
        required: true,
        placeholder: '{"name": "{name}", "age": "{age}"}',
        description: 'JSON template with placeholders'
      },
      {
        name: 'pretty_print',
        label: 'Pretty Print',
        type: 'checkbox',
        required: false,
        defaultValue: true
      }
    ]
  },

  // Column Operations
  'column/extract': {
    name: 'Extract Columns',
    description: 'Extract specific columns from file',
    category: 'column',
    requiresFile: true,
    fields: [
      {
        name: 'columns',
        label: 'Columns',
        type: 'json',
        required: true,
        placeholder: '["column1", "column2"]',
        description: 'Array of column names to extract'
      }
    ]
  },
  'column/mapping': {
    name: 'Column Mapping',
    description: 'Map and transform column names',
    category: 'column',
    requiresFile: true,
    fields: [
      {
        name: 'column_mapping',
        label: 'Column Mapping',
        type: 'json',
        required: true,
        placeholder: '{"old_name": "new_name"}',
        description: 'Map old column names to new names'
      }
    ]
  },

  // Normalization
  'data/normalize': {
    name: 'Normalize Data',
    description: 'Apply data normalization transformations',
    category: 'data',
    requiresFile: true,
    fields: [
      {
        name: 'normalizations',
        label: 'Normalizations',
        type: 'json',
        required: true,
        placeholder: '[{"column": "email", "type": "lowercase"}]',
        description: 'Array of normalization rules'
      }
    ]
  },

  // File Binding
  'file/binding': {
    name: 'File Binding',
    description: 'Bind data from multiple files',
    category: 'file',
    requiresFile: true,
    fields: [
      {
        name: 'column_mapping',
        label: 'Column Mapping',
        type: 'json',
        required: true,
        placeholder: '{"file1_col": "file2_col"}',
        description: 'Map columns between files'
      }
    ]
  }
};

/**
 * Get operation metadata by endpoint
 */
export function getOperationMetadata(endpoint: string): OperationMetadata | undefined {
  return OPERATIONS_METADATA[endpoint];
}

/**
 * Get all operations by category
 */
export function getOperationsByCategory(category: string): Record<string, OperationMetadata> {
  return Object.entries(OPERATIONS_METADATA)
    .filter(([_, metadata]) => metadata.category === category)
    .reduce((acc, [key, metadata]) => ({ ...acc, [key]: metadata }), {});
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  const categories = new Set<string>();
  Object.values(OPERATIONS_METADATA).forEach(metadata => {
    categories.add(metadata.category);
  });
  return Array.from(categories).sort();
}

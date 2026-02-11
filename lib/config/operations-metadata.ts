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
  // Bind Data Operations
  'excel/bind-single-key': {
    name: 'Excel Bind Single Key',
    description: 'Bind data from one Excel file to another using a single key',
    category: 'bind_data',
    requiresFile: true,
    fields: [
      {
        name: 'key_column',
        label: 'Key Column',
        type: 'text',
        required: true,
        placeholder: 'id',
        description: 'Column name to use as binding key'
      },
      {
        name: 'source_columns',
        label: 'Source Columns',
        type: 'json',
        required: true,
        placeholder: '["name", "email", "phone"]',
        description: 'Columns to bind from source file'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'bound_data.xlsx'
      }
    ]
  },
  'excel/bind-multi-key': {
    name: 'Excel Bind Multi Key',
    description: 'Bind data from one Excel file to another using multiple keys',
    category: 'bind_data',
    requiresFile: true,
    fields: [
      {
        name: 'key_columns',
        label: 'Key Columns',
        type: 'json',
        required: true,
        placeholder: '["id", "type"]',
        description: 'Array of column names to use as composite binding key'
      },
      {
        name: 'source_columns',
        label: 'Source Columns',
        type: 'json',
        required: true,
        placeholder: '["name", "email", "phone"]',
        description: 'Columns to bind from source file'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'bound_data.xlsx'
      }
    ]
  },

  // Convert Format Operations
  'csv/convert-to-excel': {
    name: 'CSV to Excel',
    description: 'Convert CSV file to Excel format',
    category: 'convert_format',
    requiresFile: true,
    fields: [
      {
        name: 'sheet_name',
        label: 'Sheet Name',
        type: 'text',
        required: false,
        placeholder: 'Sheet1',
        description: 'Name for the Excel sheet'
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

  // Extract Columns Operations
  'excel/extract-columns-to-file': {
    name: 'Extract Columns to File',
    description: 'Extract specific columns from Excel file and save to a new file',
    category: 'extract_columns',
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
        defaultValue: false,
        description: 'Remove duplicate rows from output'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'extracted_columns.xlsx'
      }
    ]
  },

  // Generate JSON Operations
  'json/generate': {
    name: 'Generate JSON',
    description: 'Convert file data to JSON format',
    category: 'generate_json',
    requiresFile: true,
    fields: [
      {
        name: 'pretty_print',
        label: 'Pretty Print',
        type: 'checkbox',
        required: false,
        defaultValue: true,
        description: 'Format JSON with indentation'
      },
      {
        name: 'array_format',
        label: 'Array Format',
        type: 'checkbox',
        required: false,
        defaultValue: true,
        description: 'Output as JSON array'
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
  'json/generate-with-template': {
    name: 'Generate JSON with Template',
    description: 'Generate JSON using a custom template',
    category: 'generate_json',
    requiresFile: true,
    fields: [
      {
        name: 'template',
        label: 'JSON Template',
        type: 'json',
        required: true,
        placeholder: '{"name": "{name}", "age": "{age}"}',
        description: 'JSON template with placeholders (use {column_name} syntax)'
      },
      {
        name: 'pretty_print',
        label: 'Pretty Print',
        type: 'checkbox',
        required: false,
        defaultValue: true,
        description: 'Format JSON with indentation'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'templated_output.json'
      }
    ]
  },

  // Generate SQL Operations
  'sql/generate': {
    name: 'Generate SQL',
    description: 'Generate SQL INSERT statements from file data',
    category: 'generate_sql',
    requiresFile: true,
    fields: [
      {
        name: 'table_name',
        label: 'Table Name',
        type: 'text',
        required: true,
        placeholder: 'users',
        description: 'Name of the database table'
      },
      {
        name: 'database_type',
        label: 'Database Type',
        type: 'select',
        required: false,
        options: [
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'sqlite', label: 'SQLite' },
          { value: 'mssql', label: 'MS SQL Server' }
        ],
        defaultValue: 'postgresql',
        description: 'Target database system'
      },
      {
        name: 'columns',
        label: 'Columns',
        type: 'json',
        required: false,
        placeholder: '["col1", "col2"]',
        description: 'Specific columns to include (leave empty for all columns)'
      },
      {
        name: 'batch_size',
        label: 'Batch Size',
        type: 'number',
        required: false,
        placeholder: '100',
        description: 'Number of rows per INSERT statement'
      }
    ]
  },
  'sql/generate-to-text': {
    name: 'Generate SQL to Text File',
    description: 'Generate SQL statements and save to a text file',
    category: 'generate_sql',
    requiresFile: true,
    fields: [
      {
        name: 'table_name',
        label: 'Table Name',
        type: 'text',
        required: true,
        placeholder: 'users',
        description: 'Name of the database table'
      },
      {
        name: 'database_type',
        label: 'Database Type',
        type: 'select',
        required: false,
        options: [
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'sqlite', label: 'SQLite' },
          { value: 'mssql', label: 'MS SQL Server' }
        ],
        defaultValue: 'postgresql',
        description: 'Target database system'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'insert_statements.sql'
      }
    ]
  },

  // Map Columns Operations
  'excel/map-columns': {
    name: 'Map Columns',
    description: 'Rename and transform column names in Excel file',
    category: 'map_columns',
    requiresFile: true,
    fields: [
      {
        name: 'column_mapping',
        label: 'Column Mapping',
        type: 'json',
        required: true,
        placeholder: '{"old_name": "new_name", "another_old": "another_new"}',
        description: 'Map old column names to new column names'
      },
      {
        name: 'keep_unmapped',
        label: 'Keep Unmapped Columns',
        type: 'checkbox',
        required: false,
        defaultValue: true,
        description: 'Keep columns that are not in the mapping'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'mapped_columns.xlsx'
      }
    ]
  },

  // Normalize Data Operations
  'normalization/apply': {
    name: 'Apply Normalization',
    description: 'Apply data normalization transformations to file',
    category: 'normalize_data',
    requiresFile: true,
    fields: [
      {
        name: 'normalizations',
        label: 'Normalization Rules',
        type: 'json',
        required: true,
        placeholder: '[{"column": "email", "type": "lowercase"}, {"column": "phone", "type": "remove_spaces"}]',
        description: 'Array of normalization rules (types: lowercase, uppercase, trim, remove_spaces, remove_special_chars)'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'normalized_data.xlsx'
      }
    ]
  },

  // Search Filter Operations
  'excel/search': {
    name: 'Excel Search & Filter',
    description: 'Search and filter data in Excel files based on conditions',
    category: 'search_filter',
    requiresFile: true,
    fields: [
      {
        name: 'conditions',
        label: 'Search Conditions',
        type: 'json',
        required: true,
        placeholder: '[{"column": "age", "operator": "gt", "value": 18}]',
        description: 'Array of conditions (operators: eq, ne, gt, lt, gte, lte, contains, startswith, endswith)'
      },
      {
        name: 'match_all',
        label: 'Match All Conditions',
        type: 'checkbox',
        required: false,
        defaultValue: true,
        description: 'If true, all conditions must match (AND). If false, any condition can match (OR)'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'filtered_results.xlsx'
      }
    ]
  },
  'csv/search': {
    name: 'CSV Search & Filter',
    description: 'Search and filter data in CSV files based on conditions',
    category: 'search_filter',
    requiresFile: true,
    fields: [
      {
        name: 'conditions',
        label: 'Search Conditions',
        type: 'json',
        required: true,
        placeholder: '[{"column": "name", "operator": "contains", "value": "John"}]',
        description: 'Array of conditions (operators: eq, ne, gt, lt, gte, lte, contains, startswith, endswith)'
      },
      {
        name: 'match_all',
        label: 'Match All Conditions',
        type: 'checkbox',
        required: false,
        defaultValue: true,
        description: 'If true, all conditions must match (AND). If false, any condition can match (OR)'
      },
      {
        name: 'output_filename',
        label: 'Output Filename',
        type: 'text',
        required: false,
        placeholder: 'filtered_results.csv'
      }
    ]
  },
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

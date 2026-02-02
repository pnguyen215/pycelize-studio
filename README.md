# Pycelize Studio

Professional web interface for Excel/CSV processing, data transformation, SQL/JSON generation, and file operations.

## 🌟 Features

### System & Monitoring
- ✅ Health check dashboard
- ✅ Service status monitoring

### Excel Operations (6 features)
- ✅ File information extraction
- ✅ Column extraction (JSON output)
- ✅ Column extraction (file output)
- ✅ Column mapping/renaming
- ✅ Single-key Excel binding
- ✅ Multi-key Excel binding

### CSV Operations (2 features)
- ✅ CSV file information
- ✅ CSV to Excel conversion

### Data Transformation (2 features)
- ✅ Data normalization (20+ types)
- ✅ File binding with custom mapping

### SQL Generation (2 features)
- ✅ Standard SQL INSERT generation
- ✅ Custom template SQL generation

### JSON Generation (2 features)
- ✅ Standard JSON mapping
- ✅ Template-based JSON generation

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Pycelize Flask API backend running (default: `http://localhost:5050/api/v1`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pnguyen215/pycelize-studio.git
cd pycelize-studio
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local and set your API URL
NEXT_PUBLIC_PYCELIZE_API_URL=http://localhost:5050/api/v1
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Project Structure

```
pycelize-studio/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar
│   ├── page.tsx                      # Dashboard home
│   └── features/                     # Feature pages
│       ├── health/                   # Health check
│       ├── excel-info/              # Excel operations
│       ├── csv-info/                # CSV operations
│       ├── normalization/           # Data transformation
│       ├── sql-generation/          # SQL generation
│       └── json-generation/         # JSON generation
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── layout/                      # Layout components
│   │   └── app-sidebar.tsx         # Main sidebar navigation
│   └── features/                    # Feature components
│       ├── file-upload.tsx         # File upload component
│       ├── result-display.tsx      # Result display
│       └── download-button.tsx     # Download handler
├── lib/
│   ├── api/                         # API client modules
│   │   ├── client.ts               # Axios client
│   │   ├── excel.ts                # Excel API
│   │   ├── csv.ts                  # CSV API
│   │   ├── sql.ts                  # SQL API
│   │   ├── json.ts                 # JSON API
│   │   └── types.ts                # TypeScript types
│   └── utils.ts                     # Utility functions
└── types/                           # Type definitions
```

---

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_PYCELIZE_API_URL` | Pycelize API backend URL | `http://localhost:5050/api/v1` |

---

## 📚 API Integration

This application integrates with the [Pycelize Flask API](https://github.com/pnguyen215/pycelize) backend.

### Backend Setup

Make sure the Pycelize API is running before using the frontend:

```bash
# Clone and setup the backend
git clone https://github.com/pnguyen215/pycelize.git
cd pycelize

# Install dependencies and run
pip install -r requirements.txt
python app.py
```

The API should be accessible at `http://localhost:5050/api/v1`

---

## 🎨 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI Library:** shadcn/ui + Tailwind CSS
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **State Management:** React Hooks

---

## 📖 Feature Documentation

### Excel Operations

#### File Info
Extract metadata from Excel files including sheet names, row counts, column names.

#### Column Extraction
Extract specific columns from Excel files. Choose between JSON response or file download.

#### Column Mapping
Rename columns in Excel files with optional default values.

#### Excel Binding
Bind data from two Excel files using single or multiple comparison keys.

### CSV Operations

#### CSV Info
Extract metadata from CSV files including delimiter detection.

#### CSV to Excel
Convert CSV files to Excel format with customizable options.

### Data Transformation

#### Normalization
Apply data transformations like uppercase, lowercase, trim, title case, etc.

#### File Binding
Bind two files together using custom column mapping.

### SQL Generation

#### Standard SQL
Generate SQL INSERT statements for PostgreSQL, MySQL, or SQLite.

#### Custom SQL
Create SQL using custom templates with placeholders.

### JSON Generation

#### Standard JSON
Transform Excel/CSV data to JSON with column mapping.

#### Template JSON
Generate JSON using custom templates with nested structure support.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is part of the Pycelize ecosystem.

---

## 🔗 Links

- **Backend Repository:** [pycelize](https://github.com/pnguyen215/pycelize)
- **Issues:** [Report a bug or request a feature](https://github.com/pnguyen215/pycelize-studio/issues)

---

## 👤 Author

**pnguyen215**

- GitHub: [@pnguyen215](https://github.com/pnguyen215)

---

Built with ❤️ using Next.js and Pycelize

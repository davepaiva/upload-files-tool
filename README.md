# Bulk File Upload Tool

A lightweight React + TypeScript web application for bulk-uploading staff documents with drag-and-drop functionality, controlled concurrency, and comprehensive accessibility features.

## Features

- **Drag & Drop Interface**: Support for folder drag-and-drop with "Choose folder" button fallback
- **Recursive File Enumeration**: Automatically scans directories up to 2 levels deep
- **Controlled Concurrency**: Configurable parallel upload limit (default: 3)
- **Automatic Retry Logic**: Retries failed uploads up to 2 times on HTTP 5xx errors
- **Progress Tracking**: Individual file progress bars and global batch progress
- **Pause/Resume**: Full control over upload operations
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Responsive Design**: Mobile-first approach supporting screens ≥ 320px wide

## Prerequisites

- Node.js 16+ and npm
- Supabase account for file storage

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_SUPABASE_BUCKET_NAME=staff-documents

# Upload Configuration (Optional)
REACT_APP_MAX_CONCURRENT_UPLOADS=3
REACT_APP_MAX_RETRY_ATTEMPTS=2
REACT_APP_MAX_FILE_SIZE_MB=50
```

### 2. Supabase Project Setup

#### Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your Project URL and anon public key from the API settings

#### Step 2: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Create a new bucket named `staff-documents`
3. Set the bucket as **Public** if you want uploaded files to be publicly accessible

#### Step 3: Configure Bucket Policies

In the Supabase dashboard, go to **Storage** → **Policies** and create the following policies:

**Policy 1: Allow Public Insertions**
```sql
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'staff-documents');
```


## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Development Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production

## Project Structure

```
src/
├── components/          # Main application components
├── design-system/       # Reusable UI components
│   ├── atoms/          # Basic UI elements
│   ├── molecules/      # Composite UI components
│   └── organisms/      # Complex UI components
├── hooks/              # Custom React hooks
└── utils/              # Utility functions
```

## File Upload Flow





















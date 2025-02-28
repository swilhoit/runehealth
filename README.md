# RuneHealth Lab Report Analysis Dashboard

A web application for uploading, analyzing, and visualizing medical lab reports.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication and database)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/runehealth.git
   cd runehealth
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The application requires two database tables in Supabase:

1. `lab_reports` - Stores metadata about uploaded lab reports
2. `biomarkers` - Stores individual biomarkers extracted from lab reports

To set up these tables:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `lib/supabase/schema.sql`
4. Run the SQL to create the tables and set up Row Level Security policies

### Checking Database Schema

To verify that your database schema matches what the application expects, you can:

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy and run the contents of `lib/supabase/schema_check.sql`
3. The script will report:
   - Whether required tables exist
   - The structure of each table
   - Whether critical fields are present
   - The RLS policies that are configured

This is especially helpful when troubleshooting database-related errors.

### Troubleshooting Database Setup

If you encounter a permission error like this:
```
ERROR: 42501: permission denied to set parameter "anon.selected_schemas"
```

This happens because standard Supabase projects don't give superuser privileges. The schema has been updated to remove this line, as it's not essential for the application's functionality.

If you're still having issues:
1. Make sure you're using the updated schema.sql file
2. Try running the SQL commands in smaller batches
3. Check for any other commands in the SQL that might require elevated permissions

## Database Schema

### `lab_reports` Table

| Column        | Type                     | Nullable | Description                         |
|---------------|--------------------------|----------|-------------------------------------|
| id            | uuid                     | NO       | Primary key                         |
| user_id       | uuid                     | NO       | Reference to auth.users             |
| report_date   | date                     | NO       | Date of the report                  |
| lab_name      | text                     | YES      | Name of the lab                     |
| provider_name | text                     | YES      | Name of the healthcare provider     |
| notes         | text                     | YES      | Additional notes                    |
| pdf_url       | text                     | YES      | URL to the PDF file                 |
| file_path     | text                     | YES      | Path to stored file                 |
| status        | text                     | YES      | Processing status                   |
| created_at    | timestamp with time zone | NO       | Creation timestamp                  |
| updated_at    | timestamp with time zone | NO       | Last update timestamp               |
| test_date     | timestamp with time zone | NO       | Date when test was performed        |

### `biomarkers` Table

| Column          | Type                     | Nullable | Description                         |
|-----------------|--------------------------|----------|-------------------------------------|
| id              | uuid                     | NO       | Primary key                         |
| report_id       | uuid                     | NO       | Reference to lab_reports.id         |
| name            | text                     | NO       | Biomarker name                      |
| value           | text                     | NO       | Measured value                      |
| unit            | text                     | YES      | Unit of measurement                 |
| reference_range | text                     | YES      | Normal range                        |
| category        | text                     | YES      | Biomarker category                  |
| flag            | text                     | YES      | Flag (High, Low, Normal)            |
| in_range        | boolean                  | YES      | Whether value is in reference range |
| details         | text                     | YES      | Additional information              |
| created_at      | timestamp with time zone | YES      | Creation timestamp                  |

### Important Notes About Schema

- The application uses Supabase Row Level Security (RLS) policies to ensure users can only access their own data.
- The default schema does **not** include `summary` or `health_score` fields, which some frontend components might expect.
- The frontend calculates health scores and summaries on the client side.
- All date fields use ISO date format.

## Common Issues and Solutions

### 1. Database Schema Mismatch

**Symptoms**: 
- 500 errors when uploading files
- Errors mentioning "column not found" 
- Error messages like "column 'summary' of relation 'lab_reports' does not exist"
- Error with code 'PGRST204' mentioning "Could not find the 'summary' column of 'lab_reports' in the schema cache"

**Solution**:
- Ensure you've run the `schema.sql` script in your Supabase SQL Editor
- Check that your code only references fields that exist in the database schema (see schema tables above)
- If you need additional fields, add them to your database first
- The application has been updated to only use existing database fields
- For errors specifically mentioning the 'summary' field, this is expected behavior as the summary is generated on the frontend, not stored in the database

**If you need to add the summary field**:
```sql
ALTER TABLE lab_reports ADD COLUMN summary text;
```

### 2. Multiple GoTrueClient Instances Warning

**Symptoms**:
- Warning in console: `Multiple GoTrueClient instances detected in the same browser context`

**Solution**:
- This is caused by creating multiple Supabase client instances
- Our application now uses a singleton pattern to prevent this
- If you're seeing this warning in development, it's likely due to React's StrictMode

### 3. File Upload 500 Errors

**Symptoms**:
- 500 Internal Server Error when uploading files
- Timeout errors during upload

**Solution**:
- Check that your file is a valid PDF
- Ensure the file is under 10MB
- Verify the database schema is set up correctly
- Check server logs for more specific error details

### 4. Permission Errors in Supabase

**Symptoms**:
- SQL errors with codes like 42501 (permission denied)
- Unable to create tables or policies
- 500 errors during file uploads despite database tables existing

**Solution**:
- Remove any SQL commands that require superuser privileges (like ALTER DATABASE)
- Make sure Row Level Security (RLS) is properly configured
- Verify that your Supabase connection is using the correct credentials

### 5. Row Level Security (RLS) Issues with Uploads

**Symptoms**:
- 500 errors during file upload with "Database schema missing required columns" message
- Unable to upload files despite tables existing with the correct schema
- Error messages about missing columns that you know exist in the database

**Solution**:
- The API may not be able to detect table columns due to RLS policies
- Run the `schema_check.sql` script to verify RLS settings
- Check that your RLS policies allow the server to properly inspect the table structure
- Ensure your RLS policies allow INSERT operations for authenticated users
- Log out and log back in to refresh your authentication token

**Technical explanation**:
The application checks if required columns exist by querying a row from the table. If RLS prevents this query from returning any rows, the check fails even if the columns exist. We've added fallback strategies to handle this case, but you may still need to adjust your RLS policies for optimal performance.

Example INSERT policy that works correctly:
```sql
CREATE POLICY lab_reports_insert_policy ON lab_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 6. NOT NULL Constraint Violations

**Symptoms**:
- Error message: `null value in column "test_date" of relation "lab_reports" violates not-null constraint`
- 500 errors during file upload or database operations
- Database schema tests failing

**Solution**:
- The `test_date` column in the `lab_reports` table has a NOT NULL constraint
- Always include a value for `test_date` when inserting records
- When testing database operations, ensure all required fields are included
- If using the schema_check.sql script, make sure it includes test_date in the INSERT test
- Default value: If you don't have a specific test date, use the current timestamp as a fallback

**Example correct INSERT statement**:
```sql
INSERT INTO lab_reports (id, user_id, status, report_date, test_date) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', auth.uid(), 'processing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### 7. Row Level Security Violations When Creating Records

**Symptoms**:
- 401 (Unauthorized) errors when attempting to create a new record
- Error code `42501` in console logs
- Error message: `new row violates row-level security policy for table "lab_reports"`
- Unable to create a placeholder lab report when viewing a new report ID

**Solution**:
1. **Check your authentication status**:
   - Ensure you are properly logged in
   - Your auth token may have expired - log out and log back in
   - Verify that you have an active Supabase session by opening browser dev tools -> Application tab -> Local Storage -> [your-supabase-url] -> Check if auth tokens exist

2. **Verify RLS policies**:
   - Confirm that the correct INSERT policy exists for the lab_reports table
   - Run the schema_check.sql script to verify all RLS policies
   - The INSERT policy should allow users to create records where user_id matches auth.uid()

3. **Fix common RLS configuration issues**:
   - Make sure the user_id in the record matches the authenticated user's ID
   - Check if the RLS policy is correctly written with the proper user_id comparison
   - Temporarily disable RLS for testing (only in development): `ALTER TABLE lab_reports DISABLE ROW LEVEL SECURITY;` 

**Example of a working INSERT policy**:
```sql
CREATE POLICY lab_reports_insert_policy ON lab_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

If you continue to have issues with RLS, try adding debug logs in your application to trace the exact values being used:
```javascript
// Debug RLS issues
const { data: { user } } = await supabase.auth.getUser();
console.log("Current auth user:", user?.id);
console.log("Attempting to insert record with user_id:", user?.id);
```

Alternatively, you can create a helper function in your Supabase database to diagnose RLS issues:
```sql
CREATE OR REPLACE FUNCTION check_rls_access(table_name text) 
RETURNS TABLE(policy_name text, command text, permissive text, roles text, check_query text) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.policyname::text,
    p.cmd::text,
    CASE WHEN p.permissive THEN 'permissive' ELSE 'restrictive' END,
    p.roles::text,
    pg_get_expr(p.qual, p.tableid)::text
  FROM
    pg_policy p
  JOIN
    pg_class c ON p.tableid = c.oid
  JOIN
    pg_namespace n ON c.relnamespace = n.oid
  WHERE
    n.nspname = 'public' AND
    c.relname = table_name;
END;
$$;
```

Execute with: `SELECT * FROM check_rls_access('lab_reports');`

### Fixing Lab Reports Stuck in "Processing" State

**Symptoms:**
- Lab reports remain in "Processing" state and never complete
- The upload form indicates success, but the report status doesn't update
- Unable to view detailed lab results for reports stuck in this state

**Solutions:**

1. **For new uploads:** The issue should be fixed after applying the latest update.

2. **For existing stuck reports:** You can manually update them by running the following SQL command in the Supabase SQL Editor:

```sql
UPDATE lab_reports
SET status = 'completed', updated_at = NOW()
WHERE status = 'processing';
```

If you want to update only specific reports, add a condition on the report ID:

```sql
UPDATE lab_reports
SET status = 'completed', updated_at = NOW()
WHERE status = 'processing' AND id = 'your-report-id';
```

**Technical Details:**
The issue was caused by a missing status update in the processing workflow. The application was creating reports with a "processing" status but never updating them to "completed" after the processing finished.

## Features

- Upload medical lab reports in PDF format
- Extract biomarkers and health data automatically
- View health metrics and trends over time
- Get personalized health insights

## Project Structure

```
/app                    # Next.js app directory
  /api                  # API routes
  /dashboard            # Dashboard pages
  /auth                 # Authentication pages
/components             # Reusable components
/lib                    # Utility functions
  /supabase             # Supabase client and types
/public                 # Static assets
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
# Database Migration Instructions

This directory contains SQL migrations for the RuneHealth application. These migrations need to be applied to your Supabase project to ensure the database has the correct structure.

## Migration Contents

These migrations will:

1. Create a `profiles` table (if not already exists) with an `api_keys` JSONB column
2. Create a `biomarker_references` table with common biomarker data
3. Add necessary functions and triggers for data normalization and management

## How to Apply Migrations

### Option 1: Using the Supabase SQL Editor (Recommended)

1. Run the script to prepare the SQL chunks:
   ```
   node scripts/sql-for-editor.js
   ```

2. Go to the Supabase Dashboard SQL Editor:
   https://supabase.com/dashboard/project/renqczffpovkvkelvjvv/sql

3. For each chunk in the `supabase/sql-chunks/` directory:
   - Create a new query
   - Copy and paste the contents of the chunk file
   - Click "Run" to execute the SQL

4. Execute chunks in order from chunk-1.sql to the last chunk

5. Verify the tables were created by running:
   ```sql
   SELECT COUNT(*) FROM biomarker_references;
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'profiles' AND column_name = 'api_keys';
   ```

### Option 2: Using Supabase CLI (For Development)

If you have the Supabase CLI installed and configured:

1. Login to Supabase:
   ```
   supabase login
   ```

2. Link your project (if not already linked):
   ```
   supabase link --project-ref renqczffpovkvkelvjvv
   ```

3. Push the migrations:
   ```
   supabase db push
   ```

## Troubleshooting

If you encounter errors during migration:

- Check if tables or functions already exist
- Ensure you have proper permissions in the Supabase project
- Try running each statement individually
- Check the Supabase logs for specific error messages

## Post-Migration

After successful migration, restart your application to ensure it uses the updated database schema:

```
npm run dev
``` 
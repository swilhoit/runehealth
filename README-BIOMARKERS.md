# RuneHealth Biomarker System

This document provides instructions for setting up the biomarker validation system in your Supabase database.

## Background

The application requires a properly configured `biomarker_definitions` table to:
1. Validate biomarker names from lab reports
2. Normalize biomarker names across different sources
3. Provide reference ranges and units for biomarkers
4. Link biomarkers to their respective categories

## Current Status

Based on your logs, the application is expecting 76 biomarkers across various categories. These biomarkers need to be properly linked to your existing biomarker categories (IDs 67-75).

## Setup Instructions

### Option 1: Using the Migration Guide Script (Recommended)

Run the following command to get detailed step-by-step instructions:

```bash
node scripts/biomarker-migration-guide-with-categories.js
```

This script will provide you with:
1. The SQL to create the biomarker_definitions table
2. The SQL to add all required biomarkers with proper category IDs
3. The SQL to create the validation functions
4. Steps to verify the migration was successful

### Option 2: Manual Setup

#### Step 1: Create the table and add biomarkers

Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/renqczffpovkvkelvjvv/sql) and run:

```sql
-- Create the biomarker_definitions table if it doesn't exist
CREATE TABLE IF NOT EXISTS biomarker_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  category_id INT,
  unit TEXT,
  min_range DOUBLE PRECISION,
  max_range DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all required biomarkers with category IDs
INSERT INTO biomarker_definitions (code, name, category, category_id, unit, min_range, max_range)
VALUES 
  -- Complete Blood Count (category_id: 67)
  ('wbc', 'White Blood Cell Count', 'Complete Blood Count', 67, '10^3/μL', 3.5, 10.5),
  -- ... (and all the other biomarkers)
```

#### Step 2: Create validation functions

```sql
-- Function to normalize biomarker codes
CREATE OR REPLACE FUNCTION normalize_biomarker_code(code text) RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(regexp_replace(code, '[^a-zA-Z0-9]', '', 'g'));
END;
$$;

-- Function to check if a biomarker name is valid
CREATE OR REPLACE FUNCTION is_valid_biomarker_name(name text) RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM biomarker_definitions 
    WHERE normalize_biomarker_code(name) = normalize_biomarker_code(code)
       OR normalize_biomarker_code(name) = normalize_biomarker_code(biomarker_definitions.name)
  );
END;
$$;
```

#### Step 3: Verify Setup

Run this query to check if all biomarkers are correctly categorized:

```sql
SELECT COUNT(*), category_id FROM biomarker_definitions GROUP BY category_id;
```

Test the validation function:

```sql
SELECT is_valid_biomarker_name('Hemoglobin');
```

## Biomarker Categories

The biomarker system uses the following category IDs:

| ID | Category Name |
|----|---------------|
| 67 | complete_blood_count |
| 68 | metabolic_panel |
| 69 | lipid_panel |
| 70 | thyroid_panel |
| 71 | vitamin_panel |
| 72 | hormone_panel |
| 73 | liver_panel |
| 74 | kidney_panel |
| 75 | other |

## Troubleshooting

If you encounter issues with biomarker validation:

1. Check that the `biomarker_definitions` table exists
2. Verify all required biomarkers are present
3. Ensure the validation functions are correctly created
4. Make sure biomarkers are linked to the correct category IDs

## Important Note

The `normalize_biomarker_code` function is critical for the application's ability to match biomarker names across different formats. It ensures that variations like "Hemoglobin", "hemoglobin", or "HEMOGLOBIN" are all recognized as the same biomarker. 
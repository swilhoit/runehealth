-- Schema Inspector for RuneHealth Database
-- Run this script in Supabase SQL Editor to view your table structures

-- List all tables and their columns with data types, constraints, etc.
WITH table_list AS (
  SELECT 
    'biomarker_categories' AS table_name
  UNION SELECT 'biomarker_definitions'
  UNION SELECT 'biomarker_results'
  UNION SELECT 'biomarkers'
  UNION SELECT 'insights'
  UNION SELECT 'lab_reports'
  UNION SELECT 'profiles'
  UNION SELECT 'reference_ranges'
)

-- Main query to get column details for all tables
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.column_default,
  c.is_nullable,
  CASE WHEN pk.constraint_name IS NOT NULL THEN 'PRIMARY KEY' ELSE '' END AS constraint_type,
  CASE WHEN fk.constraint_name IS NOT NULL 
       THEN 'FOREIGN KEY REFERENCES ' || fk.ref_table || '(' || fk.ref_column || ')'
       ELSE '' 
  END AS references
FROM table_list t
JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = 'public'
LEFT JOIN (
  -- Primary key constraints
  SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu 
    ON kcu.constraint_name = tc.constraint_name 
    AND kcu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
) pk ON pk.table_name = c.table_name AND pk.column_name = c.column_name

LEFT JOIN (
  -- Foreign key constraints
  SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS ref_table,
    ccu.column_name AS ref_column
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
) fk ON fk.table_name = c.table_name AND fk.column_name = c.column_name

ORDER BY t.table_name, c.ordinal_position;

-- Check Row Level Security (RLS) policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  schemaname = 'public' AND
  tablename IN (
    'biomarker_categories',
    'biomarker_definitions',
    'biomarker_results',
    'biomarkers',
    'insights',
    'lab_reports',
    'profiles',
    'reference_ranges'
  )
ORDER BY
  tablename,
  policyname;

-- Get table indexes
SELECT
  t.relname AS table_name,
  i.relname AS index_name,
  a.attname AS column_name,
  ix.indisunique AS is_unique
FROM
  pg_index ix
  JOIN pg_class i ON i.oid = ix.indexrelid
  JOIN pg_class t ON t.oid = ix.indrelid
  JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE
  t.relkind = 'r' AND
  t.relname IN (
    'biomarker_categories',
    'biomarker_definitions',
    'biomarker_results',
    'biomarkers',
    'insights',
    'lab_reports',
    'profiles',
    'reference_ranges'
  )
ORDER BY
  t.relname,
  i.relname,
  a.attnum; 
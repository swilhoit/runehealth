-- RuneHealth Database Schema Check
-- Run this script to check if your database schema matches what the application expects

-- Check if lab_reports table exists with expected structure
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'lab_reports'
  ) AS lab_reports_table_exists;

-- Show lab_reports table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'lab_reports'
ORDER BY 
  ordinal_position;

-- Check if biomarkers table exists with expected structure
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'biomarkers'
  ) AS biomarkers_table_exists;

-- Show biomarkers table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'biomarkers'
ORDER BY 
  ordinal_position;

-- Check RLS policies for lab_reports
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM 
  pg_policies
WHERE 
  tablename = 'lab_reports';

-- Check RLS policies for biomarkers
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM 
  pg_policies
WHERE 
  tablename = 'biomarkers';

-- Check if critical fields are present in lab_reports
SELECT 
  CASE WHEN EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'id'
  ) THEN 'Present' ELSE 'Missing' END AS id_field,
  
  CASE WHEN EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'user_id'
  ) THEN 'Present' ELSE 'Missing' END AS user_id_field,
  
  CASE WHEN EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'status'
  ) THEN 'Present' ELSE 'Missing' END AS status_field,
  
  CASE WHEN EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'report_date'
  ) THEN 'Present' ELSE 'Missing' END AS report_date_field,
  
  CASE WHEN EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'summary'
  ) THEN 'Present - Not needed by default' ELSE 'Missing - Not needed by default' END AS summary_field,
  
  CASE WHEN EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'health_score'
  ) THEN 'Present - Not needed by default' ELSE 'Missing - Not needed by default' END AS health_score_field;

-- Check if RLS is enabled for lab_reports
SELECT 
  relname AS table_name, 
  relrowsecurity AS rls_enabled
FROM 
  pg_class
WHERE 
  relname = 'lab_reports';

-- Check for current user permissions
SELECT 
  current_user, 
  current_setting('role') AS current_role;

-- Check if the current user is authenticated
SELECT (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'role')::text AS auth_role;

-- Test CRUD permissions on lab_reports
DO $$
DECLARE
  can_select BOOLEAN;
  can_insert BOOLEAN;
  can_update BOOLEAN;
  can_delete BOOLEAN;
  test_uuid UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Test SELECT permission
  BEGIN
    EXECUTE 'SELECT 1 FROM lab_reports LIMIT 1';
    can_select := TRUE;
  EXCEPTION WHEN insufficient_privilege THEN
    can_select := FALSE;
  END;
  
  -- Test INSERT permission
  BEGIN
    EXECUTE 'INSERT INTO lab_reports(id, user_id, status, report_date, test_date) VALUES ($1, $1, ''test'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id' 
      USING test_uuid;
    EXECUTE 'DELETE FROM lab_reports WHERE id = $1' USING test_uuid;
    can_insert := TRUE;
  EXCEPTION WHEN insufficient_privilege THEN
    can_insert := FALSE;
  END;
  
  -- Test UPDATE permission
  BEGIN
    EXECUTE 'UPDATE lab_reports SET status = ''test'' WHERE FALSE RETURNING id';
    can_update := TRUE;
  EXCEPTION WHEN insufficient_privilege THEN
    can_update := FALSE;
  END;
  
  -- Test DELETE permission
  BEGIN
    EXECUTE 'DELETE FROM lab_reports WHERE FALSE RETURNING id';
    can_delete := TRUE;
  EXCEPTION WHEN insufficient_privilege THEN
    can_delete := FALSE;
  END;
  
  -- Output results
  RAISE NOTICE 'Permissions check: SELECT % | INSERT % | UPDATE % | DELETE %', 
    can_select, can_insert, can_update, can_delete;
END $$;

-- Additional diagnostics for most common issues with RLS

-- Check if auth.uid() function works
SELECT auth.uid() IS NOT NULL AS auth_uid_available;

-- Check if anonymous access is configured correctly
SELECT current_setting('auth.anon_role') AS anonymous_role;

-- Show example of policy with full debug info
-- (useful to see exactly what's being compared in your RLS policies)
SELECT 
  pol.polname AS policy_name,
  rel.relname AS table_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression,
  pol.polpermissive AS permissive
FROM pg_policy pol
JOIN pg_class rel ON rel.oid = pol.polrelid
WHERE rel.relname = 'lab_reports'
ORDER BY rel.relname, pol.polname;

-- Detailed explanation of RLS testing results
SELECT 
  'If the above permissions check shows FALSE for INSERT but your app needs to insert records, ' ||
  'there might be an issue with your RLS policies. Specifically, check that the INSERT policy ' ||
  'correctly uses auth.uid() with the user_id column.' AS rls_diagnostic_info;

-- ===================================================================
-- ENHANCED RLS POLICY DIAGNOSTICS FOR TROUBLESHOOTING 42501 ERRORS
-- ===================================================================

-- Check the exact user ID that auth.uid() returns for the current user
SELECT 
  'Current auth.uid():' AS check_type,
  auth.uid() AS current_user_id;

-- Verify that a user ID actually exists (if NULL, this is the problem)
SELECT 
  'Auth status check:' AS check_type,
  CASE WHEN auth.uid() IS NULL 
       THEN 'NOT AUTHENTICATED - This is likely why you are seeing 42501 errors'
       ELSE 'Authenticated as ' || auth.uid()
  END AS auth_status;

-- Show if RLS is enabled and what policies exist
SELECT 
  'RLS status for lab_reports:' AS check_type,
  CASE WHEN rel.relrowsecurity 
       THEN 'ENABLED - Policies control access'
       ELSE 'DISABLED - All operations allowed'
  END AS rls_status,
  count(pol.polname) AS policy_count
FROM pg_class rel
LEFT JOIN pg_policy pol ON rel.oid = pol.polrelid
WHERE rel.relname = 'lab_reports'
GROUP BY rel.relrowsecurity;

-- Test inserting directly with the current user
DO $$
DECLARE
  test_user_id UUID := auth.uid();
  test_report_id UUID := '22222222-2222-2222-2222-222222222222';
  can_insert BOOLEAN;
  error_message TEXT;
BEGIN
  -- Skip if not authenticated
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'INSERT TEST SKIPPED: Not authenticated';
    RETURN;
  END IF;
  
  -- Try inserting with the current user
  BEGIN
    EXECUTE 'INSERT INTO lab_reports(id, user_id, status, report_date, test_date) 
             VALUES ($1, $2, ''test_rls'', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id' 
      USING test_report_id, test_user_id;
      
    -- Clean up
    EXECUTE 'DELETE FROM lab_reports WHERE id = $1' USING test_report_id;
    RAISE NOTICE 'INSERT TEST: SUCCESS - You can insert records with your user ID';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
    RAISE NOTICE 'INSERT TEST: FAILED - %', error_message;
    RAISE NOTICE 'This indicates a problem with your RLS policies or authentication';
  END;
END $$;

-- Show example of a correct INSERT policy for reference
SELECT 
  'Example of a correct INSERT policy:' AS info_type,
  'CREATE POLICY lab_reports_insert_policy ON lab_reports' ||
  E'\n    FOR INSERT WITH CHECK (auth.uid() = user_id);' AS policy_example;

-- Provide detailed explanation for fixing 42501 errors
SELECT 
  'HOW TO FIX 42501 ERRORS:' AS solution_heading,
  '1. Verify you are authenticated (auth.uid() should return a UUID, not NULL)' ||
  E'\n2. Ensure the RLS policy allows INSERT with user_id = auth.uid()' ||
  E'\n3. Make sure your application code is setting user_id to the current user ID' ||
  E'\n4. Try logging out and back in to refresh your token' ||
  E'\n5. Check the browser console for authentication errors' AS solution_steps; 
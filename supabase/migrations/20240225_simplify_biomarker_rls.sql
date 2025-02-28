-- First, disable RLS temporarily to ensure no conflicts
ALTER TABLE biomarker_results DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own biomarker results" ON biomarker_results;
DROP POLICY IF EXISTS "Users can insert own biomarker results" ON biomarker_results;
DROP POLICY IF EXISTS "Users can update own biomarker results" ON biomarker_results;

-- Re-enable RLS
ALTER TABLE biomarker_results ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Enable read access for users based on lab report ownership"
ON biomarker_results FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM lab_reports lr
        WHERE lr.id = biomarker_results.report_id
        AND lr.user_id = auth.uid()
    )
);

-- Simplified insert policy that just checks lab report ownership
CREATE POLICY "Enable insert access for users based on lab report ownership"
ON biomarker_results FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM lab_reports lr
        WHERE lr.id = report_id
        AND lr.user_id = auth.uid()
    )
);

-- Grant necessary permissions
GRANT SELECT, INSERT ON biomarker_results TO authenticated;


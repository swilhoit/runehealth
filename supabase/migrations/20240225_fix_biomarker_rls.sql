-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own biomarker results" ON biomarker_results;
DROP POLICY IF EXISTS "Users can insert own biomarker results" ON biomarker_results;
DROP POLICY IF EXISTS "Users can update own biomarker results" ON biomarker_results;

-- Create new policies with proper checks
CREATE POLICY "Users can view own biomarker results"
ON biomarker_results FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM lab_reports
        WHERE lab_reports.id = biomarker_results.report_id
        AND lab_reports.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own biomarker results"
ON biomarker_results FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM lab_reports
        WHERE lab_reports.id = biomarker_results.report_id
        AND lab_reports.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own biomarker results"
ON biomarker_results FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM lab_reports
        WHERE lab_reports.id = biomarker_results.report_id
        AND lab_reports.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM lab_reports
        WHERE lab_reports.id = biomarker_results.report_id
        AND lab_reports.user_id = auth.uid()
    )
);

-- Verify RLS is enabled
ALTER TABLE biomarker_results ENABLE ROW LEVEL SECURITY;


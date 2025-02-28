-- Create lab_reports table
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT,
  patient_name TEXT,
  patient_id TEXT,
  patient_dob TEXT,
  patient_sex TEXT,
  patient_age TEXT,
  specimen_id TEXT,
  collection_date TEXT,
  received_date TEXT,
  reported_date TEXT,
  ordering_physician TEXT,
  account_number TEXT,
  fasting TEXT,
  summary TEXT,
  health_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create biomarkers table
CREATE TABLE IF NOT EXISTS public.biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.lab_reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  reference_range TEXT,
  category TEXT,
  flag TEXT,
  in_range BOOLEAN,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_lab_reports_user_id ON public.lab_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_report_id ON public.biomarkers(report_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_category ON public.biomarkers(category);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biomarkers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own lab reports" ON public.lab_reports;
DROP POLICY IF EXISTS "Users can insert their own lab reports" ON public.lab_reports;
DROP POLICY IF EXISTS "Users can update their own lab reports" ON public.lab_reports;
DROP POLICY IF EXISTS "Users can delete their own lab reports" ON public.lab_reports;
DROP POLICY IF EXISTS "Users can view biomarkers for their lab reports" ON public.biomarkers;
DROP POLICY IF EXISTS "Users can insert biomarkers for their lab reports" ON public.biomarkers;
DROP POLICY IF EXISTS "Users can update biomarkers for their lab reports" ON public.biomarkers;
DROP POLICY IF EXISTS "Users can delete biomarkers for their lab reports" ON public.biomarkers;

-- Create policies for lab_reports
CREATE POLICY "Users can view their own lab reports"
  ON public.lab_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab reports"
  ON public.lab_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab reports"
  ON public.lab_reports
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab reports"
  ON public.lab_reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for biomarkers
CREATE POLICY "Users can view biomarkers for their lab reports"
  ON public.biomarkers
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lab_reports
    WHERE lab_reports.id = biomarkers.report_id
    AND lab_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert biomarkers for their lab reports"
  ON public.biomarkers
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.lab_reports
    WHERE lab_reports.id = biomarkers.report_id
    AND lab_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can update biomarkers for their lab reports"
  ON public.biomarkers
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.lab_reports
    WHERE lab_reports.id = biomarkers.report_id
    AND lab_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete biomarkers for their lab reports"
  ON public.biomarkers
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.lab_reports
    WHERE lab_reports.id = biomarkers.report_id
    AND lab_reports.user_id = auth.uid()
  ));

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_lab_reports_updated_at ON public.lab_reports;

-- Create a trigger to update the updated_at column on lab_reports
CREATE TRIGGER update_lab_reports_updated_at
BEFORE UPDATE ON public.lab_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create helper functions to temporarily disable and enable RLS for testing
CREATE OR REPLACE FUNCTION disable_rls()
RETURNS void AS $$
BEGIN
  ALTER TABLE public.lab_reports DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.biomarkers DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION enable_rls()
RETURNS void AS $$
BEGIN
  ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.biomarkers ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

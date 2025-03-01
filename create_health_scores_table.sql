-- Create the health_scores table
CREATE TABLE IF NOT EXISTS public.health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.lab_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_scores_report_id ON public.health_scores(report_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_user_id ON public.health_scores(user_id);

-- Add row level security
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read only their own health scores
CREATE POLICY "Users can read their own health scores"
  ON public.health_scores
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own health scores
CREATE POLICY "Users can insert their own health scores"
  ON public.health_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own health scores
CREATE POLICY "Users can update their own health scores"
  ON public.health_scores
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own health scores
CREATE POLICY "Users can delete their own health scores"
  ON public.health_scores
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_scores TO authenticated; 
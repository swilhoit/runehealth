-- Create the survey_results table
CREATE TABLE IF NOT EXISTS public.survey_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    survey_data JSONB NOT NULL,
    recommendations JSONB NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.survey_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own survey results"
ON public.survey_results
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own survey results"
ON public.survey_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT ON public.survey_results TO authenticated; 
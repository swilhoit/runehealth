-- Create tables for the application
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    height NUMERIC,
    weight NUMERIC,
    medical_conditions TEXT[],
    medications TEXT[],
    allergies TEXT[],
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    biomarkers JSONB NOT NULL,
    insights JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    pdf_url TEXT
);

CREATE TABLE IF NOT EXISTS public.survey_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    survey_data JSONB NOT NULL,
    recommendations JSONB NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own lab results"
    ON public.lab_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab results"
    ON public.lab_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own survey results"
    ON public.survey_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survey results"
    ON public.survey_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);


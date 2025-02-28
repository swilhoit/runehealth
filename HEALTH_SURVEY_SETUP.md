# Health Survey Setup

This document provides instructions for setting up the health survey functionality in the RuneHealth application.

## Database Setup

The health survey feature requires a `survey_results` table in your Supabase database. Follow these steps to set it up:

### Option 1: Using the SQL Editor in Supabase

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor tab
3. Create a new query and paste the following SQL:

```sql
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
```

4. Run the query to create the table and configure the necessary permissions

### Option 2: Using the Migration File

If you prefer to use the migration process:

1. The file `create_survey_results_table.sql` contains the necessary SQL
2. Run this migration script as part of your deployment process
3. Verify the table was created successfully by checking the Database section in Supabase

## Environment Variables

Ensure the following environment variables are set:

- `OPENAI_API_KEY`: Required for AI-generated insights and recommendations
- `DATABASE_URL`: Your Supabase database connection URL

## Testing the Health Survey

1. Navigate to the dashboard in your application
2. Click on the "Health Survey" section in the navigation menu
3. Complete the multi-step survey
4. After submission, the system will:
   - Save your responses
   - Generate basic recommendations
   - Use OpenAI to create personalized AI insights (if API key is configured)
   - Store all this data in the `survey_results` table

## Troubleshooting

### Database Issues

If you encounter errors related to the database:

1. Verify the `survey_results` table exists in your database
2. Check that Row Level Security policies are properly configured
3. Ensure the authenticated role has appropriate permissions

### AI Recommendations Issues

If AI recommendations aren't generating:

1. Verify your OpenAI API key is valid and properly configured
2. Check the server logs for any API errors
3. The system will fall back to basic recommendations if AI generation fails

## Data Structure

The `survey_results` table stores:

- `id`: Unique identifier for each survey submission
- `created_at`: Timestamp of when the survey was submitted
- `user_id`: Reference to the authenticated user who submitted the survey
- `survey_data`: JSON object containing all survey responses
- `recommendations`: JSON object containing both basic and AI-generated recommendations

## Security Considerations

- The survey data contains personal health information and is protected by Row Level Security
- Users can only access their own survey results
- All database operations require authentication 
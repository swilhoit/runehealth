-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add API keys to profiles table
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{
  "openai": "",
  "anthropic": "",
  "groq": "",
  "deepseek": ""
}'::jsonb;

-- Comment on the column
COMMENT ON COLUMN profiles.api_keys IS 'Stores API keys for different AI providers in a secure JSON format';

-- Make sure RLS is in place
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only their own profile
DROP POLICY IF EXISTS profiles_policy ON profiles;
CREATE POLICY profiles_policy ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger to add new users to profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' AND 
          tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$; 
-- Combined migration for RuneHealth

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

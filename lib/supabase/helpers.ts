import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "./database.types";
import { supabase as globalClient } from "./client";
import { createClient } from '@supabase/supabase-js';

/**
 * Standard headers to use with all Supabase clients
 */
export const standardHeaders = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Prefer": "return=representation"
};

/**
 * Creates a client component client with standardized settings
 * Use this in client components instead of raw createClientComponentClient
 */
export function createStandardClientComponentClient() {
  return createClientComponentClient<Database>({
    options: {
      global: {
        headers: standardHeaders
      }
    }
  });
}

/**
 * Returns the global Supabase client for non-React contexts
 */
export function getGlobalClient() {
  return globalClient;
}

/**
 * Helper function to directly fetch from the Supabase API with proper headers
 * This helps bypass the 406 Not Acceptable errors
 */
export async function fetchFromSupabase<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  // Ensure proper headers are included
  const headers = {
    ...standardHeaders,
    ...(options.headers || {})
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Create a direct client with proper headers
 * Use this as a reliable way to access Supabase without 406 errors
 */
export function createDirectClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Use hardcoded headers for maximum reliability 
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Prefer": "return=representation",
        "X-Client-Info": "supabase-js/2.36.0"
      }
    },
    auth: {
      persistSession: true
    }
  });
}

/**
 * Get the latest survey result for a user
 * This is a reliable way to get survey data without 406 errors
 */
export async function getLatestSurveyResult(userId: string) {
  const supabase = createDirectClient();
  
  try {
    const { data, error } = await supabase
      .from('survey_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error fetching survey results:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching survey results:', error);
    return null;
  }
} 
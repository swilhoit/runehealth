import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getApiKey } from '@/lib/api-key-utils';

/**
 * API endpoint to verify the API key storage functionality
 */
export async function GET(request: Request) {
  try {
    // Get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication error', 
        message: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No user found', 
        message: 'Please log in to test API key storage' 
      }, { status: 401 });
    }
    
    // Check if profiles table exists with api_keys column
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      // Check if the error is about a missing table/column
      if (profileError.message.includes('does not exist')) {
        return NextResponse.json({ 
          success: false,
          databaseStatus: 'incomplete',
          error: 'Database schema issue',
          message: profileError.message,
          suggestion: 'The migration might not have been applied correctly. Please run the SQL migration.'
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Database error', 
        message: profileError.message 
      }, { status: 500 });
    }
    
    // Check if biomarker_references table exists
    const { data: biomarkerCount, error: biomarkerError } = await supabase
      .from('biomarker_references')
      .select('*', { count: 'exact', head: true });
    
    const biomarkerStatus = biomarkerError 
      ? { success: false, error: biomarkerError.message }
      : { success: true, count: biomarkerCount?.length || 0 };
    
    // Get API key for testing the priority system
    const openaiKey = await getApiKey('openai');
    const hasUserKey = profile?.api_keys?.openai && profile.api_keys.openai.length > 0;
    const hasEnvKey = !!process.env.OPENAI_API_KEY;
    
    // Provide diagnostic information
    return NextResponse.json({
      success: true,
      authStatus: {
        loggedIn: true,
        userId: user.id,
        email: user.email
      },
      profilesTable: {
        exists: true,
        hasApiKeysColumn: true,
        apiKeys: profile?.api_keys || null
      },
      biomarkerReferencesTable: biomarkerStatus,
      apiKeyPriority: {
        hasUserKey,
        hasEnvKey,
        usingUserKey: hasUserKey,
        usingEnvKey: !hasUserKey && hasEnvKey,
        keySource: hasUserKey ? 'user' : (hasEnvKey ? 'environment' : 'none')
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error', 
      message: error.message 
    }, { status: 500 });
  }
} 
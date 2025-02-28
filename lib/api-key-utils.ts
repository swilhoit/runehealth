import { supabase } from "./supabase/client";
import { toast } from "@/components/ui/use-toast";

// API key provider types
export type AIProvider = "openai" | "anthropic" | "groq" | "deepseek";

// Model settings type
export interface ModelSettings {
  provider: AIProvider;
  model: string;
  apiKeys: {
    openai: string;
    anthropic: string;
    groq: string;
    deepseek: string;
  };
}

// Default model settings
export const defaultModelSettings: ModelSettings = {
  provider: "openai",
  model: "gpt-4o",
  apiKeys: {
    openai: "",
    anthropic: "",
    groq: "",
    deepseek: ""
  }
};

/**
 * Get model settings from localStorage and database
 * Priority: 1. LocalStorage 2. Database 3. Default settings
 */
export async function getModelSettings(): Promise<ModelSettings> {
  let settings = defaultModelSettings;
  
  // First try to get from localStorage (for immediate use without waiting for db)
  if (typeof window !== "undefined") {
    const localSettings = localStorage.getItem("aiModelSettings");
    if (localSettings) {
      try {
        settings = JSON.parse(localSettings);
      } catch (error) {
        console.error("Failed to parse model settings from localStorage:", error);
      }
    }
  }
  
  // Then try to get from the database (for persistence across devices)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("api_keys")
        .eq("id", user.id)
        .single();
      
      if (profile && profile.api_keys) {
        // If we found API keys in the database, use them
        // But only update keys that are not already set in localStorage
        const dbApiKeys = profile.api_keys;
        
        Object.keys(dbApiKeys).forEach((provider) => {
          const key = provider as AIProvider;
          // Only use DB key if localStorage key is empty
          if (!settings.apiKeys[key] && dbApiKeys[key]) {
            settings.apiKeys[key] = dbApiKeys[key];
          }
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch API keys from database:", error);
  }
  
  return settings;
}

/**
 * Save model settings to both localStorage and database
 */
export async function saveModelSettings(settings: ModelSettings): Promise<boolean> {
  try {
    // Always save to localStorage for immediate access
    if (typeof window !== "undefined") {
      localStorage.setItem("aiModelSettings", JSON.stringify(settings));
    }
    
    // Then save to database for persistence across devices
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          api_keys: settings.apiKeys
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.error("Failed to save API keys to database:", error);
        toast({
          title: "Settings partially saved",
          description: "Saved to this device but not to your account. Try again later.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Settings saved",
        description: `Using ${settings.provider} with model ${settings.model}`,
      });
      return true;
    }
    
    // User is not logged in but we saved to localStorage
    toast({
      title: "Settings saved locally",
      description: "Log in to save settings to your account for use across devices.",
    });
    return true;
  } catch (error) {
    console.error("Failed to save model settings:", error);
    toast({
      title: "Failed to save settings",
      description: "Please try again later.",
      variant: "destructive"
    });
    return false;
  }
}

/**
 * Get the API key for the selected provider
 * Priority: 1. User's key 2. Environment variable
 */
export async function getApiKey(provider: AIProvider): Promise<string | null> {
  // First try to get the user's key
  const settings = await getModelSettings();
  
  if (settings.apiKeys[provider] && settings.apiKeys[provider].length > 0) {
    return settings.apiKeys[provider];
  }
  
  // Fall back to environment variables
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY || null;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY || null;
    case "groq":
      return process.env.GROQ_API_KEY || null;
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY || null;
    default:
      return null;
  }
} 
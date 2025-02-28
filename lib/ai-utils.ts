// Interface for model settings
export interface ModelSettings {
  provider: string;
  model: string;
  apiKeys: {
    openai: string;
    anthropic: string;
    groq: string;
    deepseek: string;
  };
}

// Default model settings
const defaultSettings: ModelSettings = {
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
 * Get the current AI model settings from localStorage
 * Falls back to default settings if none exist
 */
export function getModelSettings(): ModelSettings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }
  
  try {
    const savedSettings = localStorage.getItem("aiModelSettings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error("Failed to parse saved model settings:", error);
  }
  
  return defaultSettings;
}

/**
 * Get the API key for the current provider
 */
export function getCurrentApiKey(): string {
  const settings = getModelSettings();
  return settings.apiKeys[settings.provider as keyof typeof settings.apiKeys] || "";
}

/**
 * Get the current model
 */
export function getCurrentModel(): string {
  const settings = getModelSettings();
  return settings.model;
}

/**
 * Get the current provider
 */
export function getCurrentProvider(): string {
  const settings = getModelSettings();
  return settings.provider;
} 
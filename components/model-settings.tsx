"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Settings, Save, Key } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AIProvider, defaultModelSettings, getModelSettings, saveModelSettings } from "@/lib/api-key-utils"
import type { ModelSettings } from "@/lib/api-key-utils"

// Define model options for each provider
const modelOptions = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }
  ],
  anthropic: [
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
    { value: "claude-2.1", label: "Claude 2.1" }
  ],
  groq: [
    { value: "llama3-8b-8192", label: "Llama 3 8B" },
    { value: "llama3-70b-8192", label: "Llama 3 70B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    { value: "gemma-7b-it", label: "Gemma 7B" }
  ],
  deepseek: [
    { value: "deepseek-coder", label: "DeepSeek Coder" },
    { value: "deepseek-llm-67b-chat", label: "DeepSeek LLM 67B" },
  ]
}

export function ModelSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ModelSettings>(defaultModelSettings);
  const [activeProvider, setActiveProvider] = useState<AIProvider>("openai");
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage and database on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const loadedSettings = await getModelSettings();
        setSettings(loadedSettings);
        setActiveProvider(loadedSettings.provider as AIProvider);
      } catch (error) {
        console.error("Failed to load model settings:", error);
        toast({
          title: "Failed to load settings",
          description: "Using default settings instead.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [toast]);

  const handleApiKeyChange = (provider: string, apiKey: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: apiKey
      }
    }));
  };

  const handleProviderChange = (provider: AIProvider) => {
    setActiveProvider(provider);
    const defaultModel = modelOptions[provider as keyof typeof modelOptions][0].value;
    
    setSettings(prev => ({
      ...prev,
      provider,
      model: defaultModel
    }));
  };

  const handleModelChange = (model: string) => {
    setSettings(prev => ({
      ...prev,
      model
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await saveModelSettings(settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Failed to save settings",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-terra-600" />
          AI Model Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-4 text-sm text-gray-600">
            Select your preferred AI provider and model. These settings will be applied globally to all AI functionality.
          </p>
          
          <Tabs value={activeProvider} onValueChange={(value) => handleProviderChange(value as AIProvider)} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
              <TabsTrigger value="groq">Groq</TabsTrigger>
              <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
            </TabsList>
            
            {Object.keys(modelOptions).map((provider) => (
              <TabsContent key={provider} value={provider} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`${provider}-api-key`} className="flex items-center gap-1">
                      <Key className="h-4 w-4" /> API Key
                    </Label>
                    <Input 
                      id={`${provider}-api-key`} 
                      type="password"
                      placeholder={`Enter your ${provider} API key`}
                      value={settings.apiKeys[provider as keyof typeof settings.apiKeys]}
                      onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your API key will be stored in your account and on this device.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor={`${provider}-model`}>Model</Label>
                    <Select 
                      value={activeProvider === provider ? settings.model : ""} 
                      onValueChange={handleModelChange}
                    >
                      <SelectTrigger id={`${provider}-model`}>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelOptions[provider as keyof typeof modelOptions].map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          className="w-full" 
          variant="default"
          disabled={isLoading}
        >
          <Save className="mr-2 h-4 w-4" /> 
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
} 
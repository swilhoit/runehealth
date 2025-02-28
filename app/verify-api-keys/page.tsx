"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ModelSettings } from "@/components/model-settings"
import { AlertCircle, CheckCircle2, ChevronRight, RefreshCw } from "lucide-react"

export default function VerifyApiKeysPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const verifyApiKeys = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/verify-api-keys');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify API keys');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-check on load
  useEffect(() => {
    verifyApiKeys();
  }, []);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Key Storage Verification</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Settings</CardTitle>
            <CardDescription>
              Enter your API keys below, which will be stored in your user profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModelSettings />
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Verification Results</h2>
          <Button 
            onClick={verifyApiKeys} 
            variant="outline" 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!error && !result && loading && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertTitle>Checking...</AlertTitle>
            <AlertDescription>Verifying API key storage functionality...</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <div className="space-y-4">
            {/* Authentication Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.authStatus?.loggedIn ? 
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                    <AlertCircle className="h-5 w-5 text-yellow-500" />}
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.authStatus?.loggedIn ? (
                  <div>
                    <p className="text-sm text-green-600 font-medium">Logged in as {result.authStatus.email}</p>
                    <p className="text-xs text-gray-500 mt-1">User ID: {result.authStatus.userId}</p>
                  </div>
                ) : (
                  <p className="text-sm text-yellow-600">Not logged in. Please log in to test API key storage.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Profiles Table Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.profilesTable?.exists ? 
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                    <AlertCircle className="h-5 w-5 text-red-500" />}
                  Profiles Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.profilesTable?.exists ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium">Profiles table exists ✓</p>
                    
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <p className="text-sm">
                        API Keys Column: 
                        {result.profilesTable?.hasApiKeysColumn ? (
                          <span className="text-green-600 ml-1 font-medium">Available ✓</span>
                        ) : (
                          <span className="text-red-600 ml-1 font-medium">Missing ✗</span>
                        )}
                      </p>
                    </div>
                    
                    {result.profilesTable?.apiKeys && (
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm mb-1">Stored API Keys:</p>
                          <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(result.profilesTable.apiKeys, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-600">
                    Profiles table is missing or not accessible. Please run the SQL migration.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Biomarker References Table Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.biomarkerReferencesTable?.success ? 
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                    <AlertCircle className="h-5 w-5 text-red-500" />}
                  Biomarker References Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.biomarkerReferencesTable?.success ? (
                  <p className="text-sm text-green-600 font-medium">
                    Biomarker references table exists with {result.biomarkerReferencesTable.count} entries ✓
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    Biomarker references table is missing: {result.biomarkerReferencesTable?.error}
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* API Key Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  API Key Priority System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">
                      User API Key: 
                      {result.apiKeyPriority?.hasUserKey ? (
                        <span className="text-green-600 ml-1 font-medium">Available ✓</span>
                      ) : (
                        <span className="text-yellow-600 ml-1 font-medium">Not set</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">
                      Environment API Key: 
                      {result.apiKeyPriority?.hasEnvKey ? (
                        <span className="text-green-600 ml-1 font-medium">Available ✓</span>
                      ) : (
                        <span className="text-yellow-600 ml-1 font-medium">Not set</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">
                      Currently Using: 
                      <span className="ml-1 font-medium">
                        {result.apiKeyPriority?.keySource === 'user' ? (
                          <span className="text-green-600">User's API Key ✓</span>
                        ) : result.apiKeyPriority?.keySource === 'environment' ? (
                          <span className="text-blue-600">Environment API Key</span>
                        ) : (
                          <span className="text-red-600">No API Key Available ✗</span>
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 
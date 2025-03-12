/**
 * This file patches the global fetch to add proper headers when making requests to Supabase
 * It helps resolve the 406 Not Acceptable errors.
 * 
 * It should be imported at the application entry point.
 */

// Only apply this in the browser, not in SSR/Node.js context
if (typeof window !== 'undefined') {
  console.log('Setting up Supabase fetch interceptor...');
  
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Create our patched version
  const patchedFetch: typeof fetch = async (input, init) => {
    // Only modify Supabase API requests
    const url = input instanceof Request ? input.url : input.toString();
    
    if (url.includes('supabase.co')) {
      // Create a new init object with modified headers
      const newInit = { ...init };
      
      // Initialize headers object if it doesn't exist
      if (!newInit.headers) {
        newInit.headers = {};
      }
      
      // Convert headers to a plain object if it's Headers instance
      let headers: Record<string, string> = {};
      
      if (newInit.headers instanceof Headers) {
        newInit.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(newInit.headers)) {
        // Handle headers array
        for (const [key, value] of newInit.headers) {
          headers[key] = value;
        }
      } else {
        headers = { ...newInit.headers as Record<string, string> };
      }
      
      // Add or override critical headers
      headers["Accept"] = "application/json";
      headers["Content-Type"] = "application/json";
      headers["Prefer"] = "return=representation";
      
      // Set the modified headers back
      newInit.headers = headers;
      
      console.log(`Enhanced Supabase request to ${url.split('?')[0]}`);
      console.log('Headers:', JSON.stringify(headers));
      return originalFetch(input, newInit);
    }
    
    // For non-Supabase requests, use the original fetch
    return originalFetch(input, init);
  };
  
  // Override the global fetch
  window.fetch = patchedFetch;
  console.log('Supabase fetch interception activated successfully!');
}

export {}; 
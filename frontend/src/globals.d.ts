// src/globals.d.ts
interface Window {
  env: {
    REACT_APP_AZURE_AD_CLIENT_ID: string;
    REACT_APP_AZURE_AD_AUTHORITY: string;
    REACT_APP_AZURE_AD_REDIRECT_URI: string;
    REACT_APP_AZURE_AD_SCOPES: string;
    REACT_APP_API_URL: string;
  };
}

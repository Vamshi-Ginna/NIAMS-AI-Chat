// src/authConfig.ts

import { Configuration, LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: "29c99049-9afc-4aea-934d-ee15f7f3b597", // Replace with your Azure AD app's client ID
        authority: "https://login.microsoftonline.com/f210b886-c80d-441b-8aad-167940670f0e", // Replace with your tenant ID
        redirectUri: "http://localhost:3000", // Replace with your redirect URI
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
      },
      system: {
        loggerOptions: {
          loggerCallback: (level, message, containsPii) => {
            if (containsPii) {
              return;
            }
            switch (level) {
              case LogLevel.Error:
                console.error(message);
                return;
              case LogLevel.Info:
                console.info(message);
                return;
              case LogLevel.Verbose:
                console.debug(message);
                return;
              case LogLevel.Warning:
                console.warn(message);
                return;
            }
          },
        },
      },
    };
    
    // Add scopes for id token and access token
    export const loginRequest = {
      scopes: ["openid", "profile", "api://29c99049-9afc-4aea-934d-ee15f7f3b597/access_as_user"]
    };
    
    // Add scopes for access token to be used for API calls
    export const tokenRequest = {
      scopes: ["api://29c99049-9afc-4aea-934d-ee15f7f3b597/access_as_user"]
    };
import { Configuration, LogLevel } from "@azure/msal-browser";

// Check if the app is running in production or development
// Check if the app is running in production or development
const clientId =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_AZURE_AD_CLIENT_ID || ""
    : window.env.REACT_APP_AZURE_AD_CLIENT_ID || "";

const authority =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_AZURE_AD_AUTHORITY || ""
    : window.env.REACT_APP_AZURE_AD_AUTHORITY || "";

const redirectUri =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_AZURE_AD_REDIRECT_URI || ""
    : window.env.REACT_APP_AZURE_AD_REDIRECT_URI || "";

const scopes =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_AZURE_AD_SCOPES || ""
    : window.env.REACT_APP_AZURE_AD_SCOPES || "";

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: authority,
    redirectUri: redirectUri,
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
        // // Only log detailed information in development
        // if (process.env.NODE_ENV === "development") {
        //   switch (level) {
        //     case LogLevel.Error:
        //       console.error(message);
        //       return;
        //     case LogLevel.Info:
        //       console.info(message);
        //       return;
        //     case LogLevel.Verbose:
        //       console.debug(message);
        //       return;
        //     case LogLevel.Warning:
        //       console.warn(message);
        //       return;
        //   }
        // } else if (level === LogLevel.Error) {
        //   // Only log errors in production
        //   console.error(message);
        // }

        // Only log errors
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
        }
      },
    },
  },
};

// Add scopes for id token and access token
export const loginRequest = {
  scopes: ["openid", "profile", scopes],
};

// Add scopes for access token to be used for API calls
export const tokenRequest = {
  scopes: [scopes],
};

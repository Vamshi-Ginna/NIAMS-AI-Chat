#!/bin/sh

echo "Starting startup script"

# Print out environment variables (be careful with sensitive info)
echo "Environment variables:"
echo "REACT_APP_API_URL: $REACT_APP_API_URL"
echo "REACT_APP_AZURE_AD_CLIENT_ID: $REACT_APP_AZURE_AD_CLIENT_ID"
echo "REACT_APP_AZURE_AD_AUTHORITY: $REACT_APP_AZURE_AD_AUTHORITY"
echo "REACT_APP_AZURE_AD_REDIRECT_URI: $REACT_APP_AZURE_AD_REDIRECT_URI"
echo "REACT_APP_AZURE_AD_SCOPES: $REACT_APP_AZURE_AD_SCOPES"

# Replace env vars in env.js file
echo "Replacing environment variables in env.js"
envsubst < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js

echo "Contents of /usr/share/nginx/html/env.js:"
cat /usr/share/nginx/html/env.js

echo "Starting Nginx"
nginx -g 'daemon off;'
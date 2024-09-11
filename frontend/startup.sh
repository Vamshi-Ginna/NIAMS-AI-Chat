#!/bin/sh

# Replace placeholders in the config.js file with actual environment variables
sed -i "s|%%REACT_APP_API_URL%%|$REACT_APP_API_URL|g" /usr/share/nginx/html/config.js
sed -i "s|%%REACT_APP_AZURE_AD_CLIENT_ID%%|$REACT_APP_AZURE_AD_CLIENT_ID|g" /usr/share/nginx/html/config.js
sed -i "s|%%REACT_APP_AZURE_AD_AUTHORITY%%|$REACT_APP_AZURE_AD_AUTHORITY|g" /usr/share/nginx/html/config.js
sed -i "s|%%REACT_APP_AZURE_AD_REDIRECT_URI%%|$REACT_APP_AZURE_AD_REDIRECT_URI|g" /usr/share/nginx/html/config.js
sed -i "s|%%REACT_APP_AZURE_AD_SCOPES%%|$REACT_APP_AZURE_AD_SCOPES|g" /usr/share/nginx/html/config.js

# Start Nginx
nginx -g 'daemon off;'

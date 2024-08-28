#!/bin/sh

# Replace placeholders in the config file
sed -i "s|%%API_BASE_URL%%|$API_BASE_URL|g" /usr/share/nginx/html/config.js

# Start Nginx
nginx -g 'daemon off;'

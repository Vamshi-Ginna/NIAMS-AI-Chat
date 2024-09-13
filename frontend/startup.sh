#!/bin/sh

echo "Starting startup script"

# Check if the template file exists
if [ -f /usr/share/nginx/html/env.js.template ]; then
  echo "env.js.template found, proceeding with envsubst."
else
  echo "env.js.template not found!"
  exit 1
fi

# Replace environment variables and generate env.js
envsubst < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js

# Verify if env.js was created successfully
if [ -f /usr/share/nginx/html/env.js ]; then
  echo "env.js created successfully:"
  cat /usr/share/nginx/html/env.js
else
  echo "Failed to create env.js!"
  exit 1
fi

echo "Starting Nginx"
nginx -g 'daemon off;'

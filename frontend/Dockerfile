# Use an official Node runtime as the base image
FROM node:14-alpine as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy env.js.template
COPY --from=build /app/public/env.js.template /usr/share/nginx/html/env.js.template

# Copy startup script
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

# Add nginx configuration to route all requests to index.html
RUN echo $'server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

# Install envsubst
RUN apk add --no-cache gettext

# Expose port 80
EXPOSE 80

# Start nginx using the startup script
CMD ["sh", "/startup.sh"]
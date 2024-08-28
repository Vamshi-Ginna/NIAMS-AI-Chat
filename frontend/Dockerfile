# Build stage
FROM node:14 as build
WORKDIR /app
COPY package*.json ./
COPY public/config.js /usr/share/nginx/html/config.js
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

EXPOSE 80
CMD ["/startup.sh"]
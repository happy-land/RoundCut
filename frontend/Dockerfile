# ---- build stage ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- production stage (nginx serves static files) ----
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# nginx config is mounted via docker-compose
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ---- build stage ----
FROM node:18-alpine AS builder
RUN apk add --no-cache musl-locales && \
    echo "ru_RU.UTF-8 UTF-8" >> /etc/locale.gen
ENV LANG=ru_RU.UTF-8
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- production stage ----
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]

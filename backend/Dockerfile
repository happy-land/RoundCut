# ---- build stage ----
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- production stage ----
FROM node:18
RUN apt-get update && apt-get install -y locales && \
    echo "ru_RU.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen ru_RU.UTF-8
ENV LANG=ru_RU.UTF-8
ENV LC_ALL=ru_RU.UTF-8
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]

# syntax=docker/dockerfile:1
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN npm ci
COPY . .
RUN npm run build

# Final stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist/server ./dist/server
COPY --from=builder /app/dist/web ./dist/web
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/server/index.js"]

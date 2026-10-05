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
COPY --from=builder /app/server/dist ./dist/server
COPY --from=builder /app/web/dist ./dist/web
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server/index.js"]

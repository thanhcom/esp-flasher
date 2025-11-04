# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json và package-lock.json trước để cache
COPY package*.json ./

# Cài dependencies
RUN npm ci

# Copy toàn bộ code
COPY . .

# Build Next.js app
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Cài PM2 toàn cục
RUN npm install pm2 -g

# Copy package.json và node_modules production
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Tạo ecosystem file inline cho PM2
RUN echo "module.exports = { apps: [{ name: 'igame', script: 'node_modules/next/dist/bin/next', args: 'start -p 3000', watch: false }] };" > ecosystem.config.js

# CMD chạy PM2 với ecosystem
CMD ["pm2-runtime", "ecosystem.config.js"]

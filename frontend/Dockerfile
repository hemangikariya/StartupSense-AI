# Stage 1: Build the React application
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency configuration
COPY package.json ./

# Install packages with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy rest of application code
COPY . .

# Run production build
RUN npm run build

# Stage 2: Serve the production assets with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

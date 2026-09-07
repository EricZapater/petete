# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10
COPY package.json ./
RUN pnpm install --registry=https://registry.npmjs.org/ --no-frozen-lockfile
COPY . .
RUN pnpm run build

# Serve stage with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Estagio 1: Build da aplicacao React com Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependencias primeiro para aproveitar cache do Docker
COPY package*.json ./
RUN npm ci

# Copia o codigo-fonte e compila
COPY . .
RUN npm run build

# Estagio 2: Servidor web ultraleve com Nginx
FROM nginx:alpine

# Copia o build final do React para o diretorio publico do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuracao simples do Nginx para suportar SPA (Single Page Application)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

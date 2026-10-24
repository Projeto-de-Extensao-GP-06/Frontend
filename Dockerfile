# Usa a imagem leve do Nginx baseada em Alpine
FROM nginx:alpine

# Remove o arquivo de configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o nginx.conf da raiz do projeto para o diretório de configurações do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia a pasta dist gerada manualmente (npm run build) para a pasta pública do Nginx
COPY dist/ /usr/share/nginx/html/

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]

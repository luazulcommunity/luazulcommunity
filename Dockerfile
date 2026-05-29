# Site estático Luazul Community — servido pelo nginx
FROM nginx:alpine

# Copia os arquivos do site para a raiz pública do nginx
COPY . /usr/share/nginx/html

EXPOSE 80

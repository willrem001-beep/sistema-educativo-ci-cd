# Etapa 1: Construcción (Builder)
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Servidor Estático)
FROM nginx:alpine
# Copiamos los archivos de construcción (dist/) a la carpeta de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto 80
EXPOSE 80
# Iniciamos Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
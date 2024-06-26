# Usar una imagen de Node con versión 18 para construir la aplicación Angular
FROM node:18-alpine AS build

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación Angular
RUN ng build

# Usar nginx como base para el contenedor final
FROM nginx:alpine

# Copiar la carpeta de construcción al directorio correcto para nginx
COPY --from=build /app/dist/sol-coins/browser /usr/share/nginx/html

# Exponer el puerto 4200
EXPOSE 4200

# Modificar la configuración de nginx para escuchar en el puerto 4200
RUN echo "server { listen 4200; root /usr/share/nginx/html; index index.html index.htm; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]

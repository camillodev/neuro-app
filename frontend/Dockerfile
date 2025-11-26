# Dockerfile para o Frontend
FROM node:20-alpine AS base

WORKDIR /app

# Argumentos de build (variáveis de ambiente do Vite)
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL

# Definir como variáveis de ambiente para o build
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de produção com Nginx
FROM nginx:alpine AS production

# Copiar arquivos buildados
COPY --from=base /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]


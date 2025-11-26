# Dockerfile para o Backend
FROM node:20-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npm run prisma:generate

# Build da aplicação
RUN npm run build

# Stage de produção
FROM node:20-alpine AS production

# Instalar wget para healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copiar apenas arquivos necessários para produção
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package*.json ./
COPY --from=base /app/prisma ./prisma

# Expor porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"]


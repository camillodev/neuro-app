# 🐳 Guia Docker - NeuroApp

Este guia explica como usar Docker para executar a aplicação NeuroApp, garantindo compatibilidade entre diferentes ambientes.

## 📋 Pré-requisitos

- Docker Desktop instalado (ou Docker Engine + Docker Compose)
- Conta no Clerk ([clerk.com](https://clerk.com)) para autenticação

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha com suas chaves do Clerk:

```env
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
PUBLIC_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001/api
```

### 2. Executar em Produção

```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down
```

### 3. Executar em Desenvolvimento

```bash
# Usar docker-compose.dev.yml para hot reload
docker-compose -f docker-compose.dev.yml up

# Parar
docker-compose -f docker-compose.dev.yml down
```

## 📦 Serviços

A configuração Docker inclui:

1. **PostgreSQL** (porta 5432)
   - Banco de dados principal
   - Dados persistem em volume Docker

2. **Backend** (porta 3001)
   - API Express.js
   - Executa migrations do Prisma automaticamente
   - Health check em `/health`

3. **Frontend** (porta 5173)
   - Aplicação React com Vite
   - Servido via Nginx em produção
   - Hot reload em desenvolvimento

## 🔧 Comandos Úteis

### Ver logs de um serviço específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Reconstruir um serviço
```bash
docker-compose build backend
docker-compose up -d backend
```

### Acessar shell do container
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Executar comandos no backend
```bash
# Executar migrations manualmente
docker-compose exec backend npx prisma migrate deploy

# Abrir Prisma Studio
docker-compose exec backend npm run prisma:studio
```

### Limpar volumes e dados
```bash
# Parar e remover volumes (⚠️ apaga dados do banco)
docker-compose down -v
```

## 🗄️ Banco de Dados

### Acessar PostgreSQL diretamente
```bash
docker-compose exec postgres psql -U postgres -d neuroapp
```

### Backup do banco de dados
```bash
docker-compose exec postgres pg_dump -U postgres neuroapp > backup.sql
```

### Restaurar backup
```bash
docker-compose exec -T postgres psql -U postgres neuroapp < backup.sql
```

## 🔍 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se o serviço `postgres` está rodando: `docker-compose ps`
- Aguarde alguns segundos após iniciar - o PostgreSQL precisa de tempo para inicializar
- Verifique os logs: `docker-compose logs postgres`

### Erro: "Prisma Client not generated"
- Reconstrua o container do backend: `docker-compose build backend`
- Ou execute manualmente: `docker-compose exec backend npm run prisma:generate`

### Erro: "Clerk authentication failed"
- Verifique se as chaves do Clerk estão corretas no arquivo `.env`
- Certifique-se de que as chaves são do mesmo ambiente (test/production)

### Porta já em uso
- Altere as portas no `docker-compose.yml` se necessário
- Ou pare o serviço que está usando a porta

### Limpar cache do Docker
```bash
# Remover containers parados
docker-compose down

# Remover imagens não utilizadas
docker system prune -a

# Remover volumes não utilizados
docker volume prune
```

## 🌐 URLs de Acesso

Após iniciar os serviços:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **PostgreSQL**: localhost:5432

## 📝 Notas

- Os dados do PostgreSQL são persistidos em volumes Docker
- Em desenvolvimento, o código é montado como volume para hot reload
- As variáveis de ambiente do frontend precisam ser definidas no build (ARG no Dockerfile)
- O backend executa migrations automaticamente na inicialização

## 🔐 Segurança

- **Nunca** commite o arquivo `.env` no Git
- Use variáveis de ambiente diferentes para desenvolvimento e produção
- Em produção, considere usar Docker Secrets ou um gerenciador de secrets
- Mantenha as chaves do Clerk seguras e rotacione-as regularmente


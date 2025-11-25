# NeuroApp 🧠

**Aplicação para acompanhamento de rotinas e ansiedade para pessoas neurodivergentes**

NeuroApp é uma plataforma completa de acompanhamento que ajuda usuários a gerenciar suas rotinas matinais, monitorar níveis de ansiedade e gerar relatórios clínicos detalhados. Desenvolvida com foco em UX acessível para neurodivergentes.

---

## 📋 Índice

- [Stack Técnica](#-stack-técnica)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Setup](#-instalação-e-setup)
- [Configuração](#-configuração)
- [Como Rodar](#-como-rodar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Extensibilidade Futura](#-extensibilidade-futura)
- [Observações Importantes](#-observações-importantes)

---

## 🛠 Stack Técnica

### Frontend
- **React 18** com **TypeScript**
- **Vite** - Build tool moderna e rápida
- **TailwindCSS** - Estilização utility-first
- **Radix UI** - Componentes acessíveis (Slider, Dialog, etc.)
- **Recharts** - Biblioteca de gráficos
- **react-confetti** - Animações de celebração
- **Clerk** - Autenticação e gerenciamento de usuários
- **React Router** - Navegação
- **Axios** - Cliente HTTP

### Backend
- **Node.js** com **TypeScript**
- **Express** - Framework HTTP
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **PDFKit** - Geração de PDFs
- **Clerk Express** - Middleware de autenticação
- **nanoid** - Geração de tokens únicos

---

## ✨ Funcionalidades

### 1. Rotina da Manhã
- Cronômetro crescente (não regressivo)
- Checklist obrigatório de 4 itens:
  - 🚿 Tomar banho
  - 👕 Se vestir
  - ☕ Tomar café da manhã
  - 💊 Tomar remédios
- Animação de confete ao finalizar
- Tracking de melhor tempo semanal
- Design com foco em reduzir ansiedade

### 2. Registro de Ansiedade
- Escala simplificada de 0 a 10
- Slider intuitivo com descrições visuais
- Campo de notas opcional
- Histórico diário automático

### 3. Relatórios Clínicos
- **Filtros**: Última semana, último mês, período customizado
- **Estatísticas automáticas**:
  - Taxa de conclusão de rotinas
  - Duração média/melhor/pior
  - Níveis de ansiedade (média, mínimo, máximo)
  - Taxa de conclusão de cada item do checklist
  - Sequências (dias consecutivos)

- **Gráficos interativos**:
  - Ansiedade ao longo do tempo (linha)
  - Duração das rotinas (barras)
  - Conclusão do checklist (barras)

- **Insights Determinísticos** (SEM IA):
  - Correlação entre ansiedade e duração da rotina
  - Impacto dos remédios na ansiedade
  - Padrões de ansiedade alta
  - Itens mais negligenciados
  - Conquistas e recomendações

- **Exportação para PDF**
- **Links públicos compartilháveis** (somente leitura)

---

## 🏗 Arquitetura

O projeto segue uma arquitetura em camadas:

### Backend
```
backend/
├── src/
│   ├── controllers/      # Lógica de requisição/resposta HTTP
│   ├── services/         # Lógica de negócio
│   ├── repositories/     # Acesso a dados (Prisma)
│   ├── middleware/       # Autenticação, etc.
│   ├── utils/           # Utilitários (PDF generator)
│   ├── types/           # Tipos TypeScript
│   └── routes/          # Definição de rotas
└── prisma/
    └── schema.prisma    # Modelo de dados
```

### Frontend
```
frontend/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # API client
│   ├── types/          # Tipos TypeScript
│   └── hooks/          # Custom React hooks
```

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 18+)
- **npm** ou **yarn**
- **PostgreSQL** (versão 14+)
- **Conta no Clerk** ([clerk.com](https://clerk.com)) para autenticação

---

## 🚀 Instalação e Setup

### 1. Clone o repositório

```bash
cd neuro-app
```

### 2. Setup do Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de exemplo de variáveis de ambiente
cp .env.example .env
```

**Edite o arquivo `.env` com suas configurações:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/neuroapp?schema=public"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL="http://localhost:5173"

# Public URL (para links compartilhados)
PUBLIC_URL="http://localhost:3001"
```

**Configurar o Banco de Dados:**

```bash
# Gerar o Prisma Client
npm run prisma:generate

# Rodar migrations
npm run prisma:migrate
```

### 3. Setup do Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Copiar arquivo de exemplo de variáveis de ambiente
cp .env.example .env
```

**Edite o arquivo `.env` com suas configurações:**

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Backend API URL
VITE_API_URL="http://localhost:3001/api"
```

---

## ⚙️ Configuração

### Configurar Clerk

1. Acesse [clerk.com](https://clerk.com) e crie uma conta
2. Crie uma nova aplicação
3. Copie as chaves `CLERK_PUBLISHABLE_KEY` e `CLERK_SECRET_KEY`
4. Cole as chaves nos arquivos `.env` do backend e frontend
5. No dashboard do Clerk, configure:
   - Sign-in methods (Email, Google, etc.)
   - Redirects: `http://localhost:5173`

### Configurar PostgreSQL

**Opção 1: PostgreSQL Local**

```bash
# Instalar PostgreSQL
# macOS
brew install postgresql
brew services start postgresql

# Criar banco de dados
createdb neuroapp
```

**Opção 2: PostgreSQL via Docker**

```bash
docker run --name neuroapp-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=neuroapp -p 5432:5432 -d postgres
```

Atualize a `DATABASE_URL` no `.env` do backend conforme necessário.

---

## 🏃 Como Rodar

### Desenvolvimento

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Servidor rodando em: `http://localhost:3001`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Aplicação rodando em: `http://localhost:5173`

### Build para Produção

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

---

## 📁 Estrutura do Projeto

```
neuro-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── morning-routine.controller.ts
│   │   │   ├── emotional-state.controller.ts
│   │   │   └── report.controller.ts
│   │   ├── services/
│   │   │   ├── morning-routine.service.ts
│   │   │   ├── emotional-state.service.ts
│   │   │   ├── report.service.ts
│   │   │   └── insights.service.ts          # ⭐ Lógica de insights (SEM IA)
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   ├── morning-routine.repository.ts
│   │   │   ├── emotional-state.repository.ts
│   │   │   └── report-token.repository.ts
│   │   ├── middleware/
│   │   │   └── auth.ts                       # Autenticação Clerk
│   │   ├── utils/
│   │   │   └── pdf-generator.ts              # Geração de PDF
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma                     # Schema do banco de dados
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.tsx
    │   ├── pages/
    │   │   ├── MorningRoutinePage.tsx        # 🌅 Rotina da Manhã
    │   │   ├── AnxietyTrackerPage.tsx        # 😰 Registro de Ansiedade
    │   │   ├── ReportsPage.tsx               # 📊 Relatórios
    │   │   └── PublicReportPage.tsx          # 🔗 Visualização pública
    │   ├── services/
    │   │   └── api.ts                        # Cliente HTTP
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── .env.example
```

---

## 🌐 API Endpoints

### Rotina da Manhã

- **POST** `/api/morning-routine/start` - Inicia rotina
- **POST** `/api/morning-routine/finish` - Finaliza rotina (checklist obrigatório)
- **GET** `/api/morning-routine/active` - Busca sessão ativa
- **GET** `/api/morning-routine/today` - Sessões de hoje
- **GET** `/api/morning-routine/best-time-week` - Melhor tempo da semana

### Estado Emocional

- **POST** `/api/emotional-state/save` - Salva ansiedade do dia
- **GET** `/api/emotional-state/today` - Estado de hoje
- **GET** `/api/emotional-state/date/:date` - Estado de data específica

### Relatórios

- **POST** `/api/reports/summary` - Gera resumo do relatório
- **POST** `/api/reports/export` - Exporta PDF
- **POST** `/api/reports/share` - Cria link público
- **GET** `/api/reports/public/:token` - Acessa relatório público (não requer autenticação)
- **GET** `/api/reports/tokens` - Lista tokens do usuário
- **DELETE** `/api/reports/tokens/:tokenId` - Deleta token

---

## 🔮 Extensibilidade Futura

O projeto foi estruturado para permitir expansões:

### 1. Protocolos Clínicos Adicionais

O schema do Prisma já está preparado para incluir:
- **GAD-7** (Transtorno de Ansiedade Generalizada)
- **PHQ-9** (Depressão)
- **ASRS** (TDAH)
- **PCL-5** (PTSD)

Basta descomentar e adicionar os campos no modelo `DailyEmotionalState`.

### 2. Integração com Samsung Health

A arquitetura permite fácil integração com APIs externas:
- Adicionar endpoint para receber dados de sono
- Correlacionar qualidade do sono com ansiedade e duração da rotina
- Gerar insights adicionais

### 3. Outros Recursos Planejados

- Notificações push para lembrar da rotina
- Gamificação (badges, conquistas)
- Gráficos adicionais (tendências, previsões)
- Exportação para CSV
- Modo offline (PWA)

---

## ⚠️ Observações Importantes

### Sem IA

Este projeto **NÃO** utiliza nenhum serviço de IA (OpenAI, Gemini, etc.). Todos os insights e conclusões são gerados por **lógica determinística** e **estatísticas matemáticas**.

### Privacidade

- Dados sensíveis de saúde são armazenados com segurança
- Links públicos podem ser revogados a qualquer momento
- Autenticação obrigatória para acessar dados pessoais

### Acessibilidade

O design foi pensado para neurodivergentes:
- Interface limpa e sem distrações
- Textos claros e diretos
- Feedback visual em todas as ações
- Sem pressão de tempo (cronômetro crescente, não regressivo)
- Componentes Radix UI (acessíveis por padrão)

---

## 📄 Licença

Este projeto foi criado como um MVP educacional e pode ser usado livremente.

---

## 🙏 Agradecimentos

Desenvolvido com foco em ajudar pessoas neurodivergentes a gerenciar suas rotinas e ansiedade de forma saudável e sem pressão.

**Lembre-se: cada pequena vitória conta! 🚀**

---

## 🆘 Troubleshooting

### Erro ao conectar no banco de dados

```bash
# Verificar se o PostgreSQL está rodando
pg_isready

# Verificar conexão
psql -U postgres -d neuroapp
```

### Erro de autenticação do Clerk

1. Verifique se as chaves estão corretas em ambos `.env`
2. Certifique-se de que o frontend está usando `VITE_` prefix
3. Reinicie os servidores após alterar `.env`

### Erro ao rodar migrations

```bash
# Resetar banco (⚠️ apaga todos os dados)
npx prisma migrate reset

# Rodar migrations novamente
npm run prisma:migrate
```

---

**Dúvidas ou problemas? Abra uma issue!** 💬

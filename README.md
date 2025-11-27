# NeuroApp

**A neurodivergent-friendly app to track morning routines, anxiety levels, and generate clinical-ready reports.**

NeuroApp helps users build consistent morning routines, monitor daily anxiety, and share structured reports with clinicians. The product is designed with accessible UX for neurodivergent people: low pressure, clear feedback, and simple visuals.

---

## 📋 Index

- [About the Product](#-about-the-product)
- [Installation](#-quick-start-first-time-with-docker-from-root)
- [Environment](#-environment--installation)
- [Daily Run (After Setup)](#-normal-run-after-setup)
- [Architecture Overview](#-architecture-overview)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)
- [Running Without Docker](#-running-without-docker)

---

## 🧠 About the Product

NeuroApp is a full-stack application that helps neurodivergent users:

- **Build and complete a simple morning routine** with a non-stressful, counting-up timer.
- **Log daily anxiety levels** on a clear 0–10 scale with optional notes.
- **Generate structured clinical reports** with statistics, charts, and shareable read-only links.

Key ideas:

- **No AI**: all insights are deterministic and based on straightforward statistics.
- **Designed for low anxiety**: minimal UI, clear language, no countdown timers.
- **Shareable**: users can export reports as PDF or share public links with clinicians.

---

## ⚡ Installation (First Time Setup)

Follow these steps **in order** to set up NeuroApp for the first time. All commands are executed from the **repository root**.

### Step 1: Prerequisites

Make sure you have installed:

- **Docker Desktop** (for PostgreSQL)
- **Node.js** 18+ (to run npm scripts)
- **Clerk account** ([clerk.com](https://clerk.com)) with API keys

### Step 2: Install all dependencies

**Important:** This installs dependencies for root (including `concurrently`), backend, and frontend in the correct order.

```bash
npm run setup
```

This command:
1. Installs root dependencies first (including `concurrently` needed for `npm run dev`)
2. Installs backend dependencies
3. Installs frontend dependencies

**Wait for this to complete** before proceeding.

### Step 3: Configure environment files

Create `.env` files for both backend and frontend. These are **required** for the app to run.

**Backend** (`backend/.env`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neuroapp?schema=public"
CLERK_SECRET_KEY=sk_test_...
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
PUBLIC_URL="http://localhost:3001"
```

**Important:** The `DATABASE_URL` uses `postgres:postgres` because that's how PostgreSQL is configured in Docker. If you're using a local PostgreSQL instance with different credentials, update accordingly.

**Frontend** (`frontend/.env`):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001/api
```

**Note:** Replace `sk_test_...` and `pk_test_...` with your actual Clerk keys from [clerk.com](https://clerk.com).

### Step 4: Start PostgreSQL (Docker)

Start the PostgreSQL database in Docker:

```bash
npm run up
```

This starts only PostgreSQL in Docker. Wait a few seconds for it to be ready (you'll see "Container neuroapp-postgres-dev Running").

### Step 5: Set up the database (first time only)

Generate Prisma client and run migrations:

```bash
npm run db
```

This will:
1. Generate the Prisma client
2. Run database migrations to create tables

**Important:** Make sure PostgreSQL is running (`npm run up`) before running this command.

### Step 6: Start backend and frontend

Run both services together:

```bash
npm run dev
```

This starts:
- **Backend** at `http://localhost:3001` (blue logs)
- **Frontend** at `http://localhost:5173` (green logs)

Both services run with hot reload. You'll see logs from both in the same terminal.

### Step 7: Access the app

Once both services are running:

- **Frontend**: Open [http://localhost:5173](http://localhost:5173) in your browser
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

You should now be able to sign in with Clerk and use the app!

---

## ✅ Quick Reference: Daily Development

Once everything is set up, your daily workflow is:

```bash
npm run up      # Start PostgreSQL (if not running)
npm run dev     # Start backend + frontend
```

To stop:
- Press `Ctrl+C` to stop backend and frontend
- `npm run down` to stop PostgreSQL

---

## 🌍 Environment & Installation

### Environment files

Since backend and frontend run locally (not in Docker), you need `.env` files in each service directory:

- **Backend `.env`**:
  - Location: `backend/.env`
  - Contains `DATABASE_URL` (pointing to PostgreSQL in Docker), Clerk keys, ports, and URLs.
  - Example: `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neuroapp?schema=public"`

- **Frontend `.env`**:
  - Location: `frontend/.env`
  - Contains only variables starting with `VITE_` (required by Vite).
  - Example: `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL`

### Important environment variables

- **DATABASE_URL**: PostgreSQL connection string. When using Docker for PostgreSQL, use `postgresql://postgres:postgres@localhost:5432/neuroapp?schema=public`.
- **CLERK_SECRET_KEY**: backend secret key for Clerk authentication.
- **VITE_CLERK_PUBLISHABLE_KEY**: frontend publishable key for Clerk (must start with `VITE_`).
- **FRONTEND_URL / PUBLIC_URL**: base URLs used for CORS and links.
- **VITE_API_URL**: base URL used by the frontend to call the backend API (typically `http://localhost:3001/api`).

---

## ▶️ Daily Run (After Setup)

Once your `.env` files and database are configured, these are the main commands from the **root**:

### Start PostgreSQL (Docker)

```bash
npm run up
```

- Starts only PostgreSQL in Docker (using `docker-compose.dev.yml`).
- Runs in detached mode (background).
- The database will be available at `localhost:5432`.

### Start backend and frontend (local)

```bash
npm run dev
```

- Runs both backend and frontend locally with hot reload.
- Uses `concurrently` to run both services in parallel.
- Logs from both services appear in the same terminal.
- Backend runs at `http://localhost:3001`.
- Frontend runs at `http://localhost:5173`.

### Stop services

```bash
npm run down           # Stop PostgreSQL (Docker)
# Press Ctrl+C to stop backend and frontend (if running npm run dev)
```

### Production-like stack (full Docker)

If you want to run everything in Docker (production-like):

```bash
npm run start          # Build and start all services in Docker (detached)
npm run down           # Stop all containers
```

### Docker orchestration (manual control)

```bash
npm run logs:postgres  # PostgreSQL logs (follow)
npm run ps             # Containers status
npm run clean          # Remove containers + volumes (⚠️ deletes DB data)
npm run db:shell       # Open psql shell inside PostgreSQL container
```

### Prisma & database tools

```bash
npm run db             # Generate Prisma client + run migrations (local)
npm run prisma:migrate # Run Prisma migrations only (local)
npm run prisma:studio  # Open Prisma Studio (local)
```

📖 **For more Docker-specific details, see** `DOCKER.md`.

---

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend**
  - React 18 + TypeScript
  - Vite
  - TailwindCSS
  - Radix UI (accessible components)
  - Recharts (charts)
  - react-confetti (celebration animations)
  - Clerk (authentication & user management)
  - React Router
  - Axios (HTTP client)

- **Backend**
  - Node.js + TypeScript
  - Express (HTTP framework)
  - Prisma (ORM)
  - PostgreSQL (database)
  - PDFKit (PDF generation)
  - Clerk Express (auth middleware)
  - nanoid (token generation)

### Project Structure

```text
neuro-app/
├── backend/
│   ├── src/
│   │   ├── controllers/      # HTTP request/response handling
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access (Prisma)
│   │   ├── middleware/       # Auth and other middleware
│   │   ├── utils/            # Utilities (PDF generator, etc.)
│   │   ├── types/            # TypeScript types
│   │   └── routes/           # Route definitions
│   └── prisma/
│       └── schema.prisma     # Data model
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # App pages
│   │   ├── services/         # API client
│   │   └── types/            # TypeScript types
│
├── docker-compose.yml        # Docker Compose (production-like)
├── docker-compose.dev.yml    # Docker Compose (development)
└── package.json              # Root Docker and helper scripts
```

---

## 🌐 API Endpoints

Most endpoints require an authenticated Clerk user, except the public report endpoint.

### Morning Routine

- **POST** `/api/morning-routine/start` – Start a new morning routine session.
- **POST** `/api/morning-routine/finish` – Finish the current routine (requires full checklist).
- **GET** `/api/morning-routine/active` – Get the active routine session (if any).
- **GET** `/api/morning-routine/today` – List today’s routine sessions.
- **GET** `/api/morning-routine/best-time-week` – Get the best time for the current week.

### Emotional State

- **POST** `/api/emotional-state/save` – Save today’s anxiety level and optional notes.
- **GET** `/api/emotional-state/today` – Get today’s emotional state.
- **GET** `/api/emotional-state/date/:date` – Get emotional state for a specific date.

### Reports

- **POST** `/api/reports/summary` – Generate a summary report for a date range.
- **POST** `/api/reports/export` – Export a report to PDF.
- **POST** `/api/reports/share` – Create a shareable public link.
- **GET** `/api/reports/public/:token` – Access a public report (no authentication required).
- **GET** `/api/reports/tokens` – List all public tokens for the current user.
- **DELETE** `/api/reports/tokens/:tokenId` – Revoke/delete a specific token.

---

## 🆘 Troubleshooting

### "concurrently: command not found" error

**Problem:** You see `sh: concurrently: command not found` when running `npm run dev`.

**Solution:** Run `npm run setup` first. This installs root dependencies including `concurrently`.

```bash
npm run setup
```

If you've already run setup but still see this error, install root dependencies manually:

```bash
npm install
```

### Database connection errors

**Check if PostgreSQL is running:**

```bash
npm run ps
```

You should see `neuroapp-postgres-dev` in the list. If not, start it:

```bash
npm run up
```

**Check PostgreSQL logs:**

```bash
npm run logs:postgres
```

**Access PostgreSQL shell:**

```bash
npm run db:shell
```

### Clerk authentication issues

1. **Verify your `.env` files exist:**
   - `backend/.env` should have `CLERK_SECRET_KEY`
   - `frontend/.env` should have `VITE_CLERK_PUBLISHABLE_KEY`

2. **Check the keys are correct:**
   - Backend key starts with `sk_test_...` or `sk_live_...`
   - Frontend key starts with `pk_test_...` or `pk_live_...`
   - Frontend key **must** have `VITE_` prefix

3. **Restart services after changing `.env`:**
   - Stop `npm run dev` (Ctrl+C)
   - Restart: `npm run dev`

### Migration errors

**"Can't reach database server":**

Make sure PostgreSQL is running:

```bash
npm run up
```

Wait a few seconds, then try again:

```bash
npm run db
```

**"Migration failed":**

Check the error message. Common issues:
- Database doesn't exist: PostgreSQL should create it automatically
- Wrong DATABASE_URL: Check `backend/.env` has correct connection string
- Prisma client not generated: Run `npm run db` (it generates client first)

### Port already in use

If you see "port already in use" errors:

**Port 3001 (backend):**
```bash
# Find what's using the port
lsof -i :3001
# Kill the process or change PORT in backend/.env
```

**Port 5173 (frontend):**
```bash
# Find what's using the port
lsof -i :5173
# Kill the process or change Vite port in frontend/vite.config.ts
```

**Port 5432 (PostgreSQL):**
```bash
# Stop other PostgreSQL instances or change port in docker-compose.dev.yml
```

### Backend or frontend won't start

1. **Check if dependencies are installed:**
   ```bash
   # Root
   ls node_modules/concurrently
   
   # Backend
   ls backend/node_modules
   
   # Frontend
   ls frontend/node_modules
   ```

2. **Reinstall if needed:**
   ```bash
   npm run setup
   ```

3. **Check `.env` files exist and have correct values**

4. **Check logs for specific errors:**
   - Backend errors appear in blue in the terminal
   - Frontend errors appear in green in the terminal

---

## 🧪 Running Completely Without Docker

The default setup already runs backend and frontend locally. If you also want to run PostgreSQL locally (without Docker):

### 1. Install PostgreSQL locally

Install PostgreSQL 14+ on your machine and create the database:

```bash
createdb neuroapp
```

### 2. Update backend `.env`

Edit `backend/.env` to point to your local PostgreSQL:

```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/neuroapp?schema=public"
# ... rest of your env vars
```

### 3. Run setup and start services

From the project root:

```bash
npm run setup    # Install dependencies
npm run db       # Generate Prisma client and run migrations
npm run dev      # Start backend and frontend
```

**Note:** The default setup uses Docker only for PostgreSQL (`npm run up`), which is the recommended approach. Running PostgreSQL locally is optional and only needed if you prefer not to use Docker at all.

---

## 📄 License

This project was created as an educational MVP and can be used freely.

---

**Built to help neurodivergent people manage routines and anxiety in a low-pressure, supportive way.**  
**Every small win counts.**

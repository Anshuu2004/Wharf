# 🚀 Getting Started with Wharf

Welcome to **Wharf**! This guide will walk you through setting up Wharf locally for development, understanding its architecture, and running both the Cloudflare Worker backend and React-Vite frontend.

<br />

## 📋 System Requirements

Ensure your machine has the following tools installed before beginning:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v9.x` or newer
- **Git**: Installed and configured
- **Database**: PostgreSQL (v14+ recommended) or a cloud-hosted [Supabase](https://supabase.com) instance
- **Cache**: Redis or [Upstash Redis](https://upstash.com)
- **Cloudflare Account**: Free tier is sufficient (for Wrangler deployment and local Worker runtime)

<br />

## 🏗️ Project Architecture Overview

Wharf is organized into focused directories under `Wharf_/`:

```
Wharf/
├── .github/              # CI/CD workflows and issue/PR templates
├── Wharf_/
│   ├── backend/          # Cloudflare Worker Edge API (Hono, Prisma, Upstash Redis)
│   ├── frontend/         # React 18, Vite, TailwindCSS, Zustand SPA
│   └── legacy/           # Archived legacy code (do NOT use for active development)
├── CONTRIBUTING.md       # Contribution guidelines
├── CODE_OF_CONDUCT.md    # Community code of conduct
├── GETTING_STARTED.md    # This setup guide
├── LICENSE               # MIT License
└── README.md             # Project showcase and architecture overview
```

> ⚠️ **Important Note on Directories**:
> - **Active Workspaces**: `Wharf_/backend` and `Wharf_/frontend`.
> - **Legacy Code**: `Wharf_/legacy` is kept strictly for reference and is not part of the active build or deployment.

<br />

## 🛠️ Step-by-Step Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/FrostByte-49/Wharf.git
cd Wharf
```

#

### 2. Configure & Run Backend (`Wharf_/backend`)

The backend runs as a serverless Cloudflare Worker powered by **Hono** and **Prisma ORM**.

#### a. Navigate to Backend
```bash
cd Wharf_/backend
```

#### b. Install Dependencies
```bash
npm install
```

#### c. Configure Environment Variables
Create a `.dev.vars` file in `Wharf_/backend/` by referencing the template:

```bash
cp .dev.vars.example .dev.vars
```

Your `.dev.vars` file needs the following essential values:

```ini
PORT=8787
FRONTEND_URL="http://localhost:5173"

# Database Connections (PostgreSQL or Supabase connection strings)
DATABASE_URL="postgresql://postgres:<password>@<host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:<password>@<host>:5432/postgres"

# Security & Secrets
JWT_SECRET="your_development_jwt_secret_min_32_chars"
ENCRYPTION_SECRET="your_32_byte_hex_encryption_key"

# GitHub OAuth App Credentials
GITHUB_CLIENT_ID="your_github_oauth_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_client_secret"
GITHUB_CALLBACK_URL="http://127.0.0.1:8787/api/auth/github/callback"

# LLM Providers (Provide at least one API key)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AIza..."

# Upstash Redis (Optional for local dev, recommended for caching & rate limiting)
UPSTASH_REDIS_REST_URL="https://your-upstash-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

#### d. Generate Prisma Client
```bash
npx prisma generate
```

*(Optional) Push schema or seed initial data if setting up a fresh database:*
```bash
npx prisma db push
npm run seed  # runs prisma seed
```

#### e. Start Backend Development Server
```bash
npm run dev
```
The Cloudflare Worker will run locally via Wrangler at `http://localhost:8787` (or `http://127.0.0.1:8787`).

#

### 3. Configure & Run Frontend (`Wharf_/frontend`)

The frontend is a single-page application built with React, Vite, and TailwindCSS.

#### a. Open a New Terminal and Navigate to Frontend
```bash
cd Wharf_/frontend
```

#### b. Install Dependencies
```bash
npm install
```

#### c. Configure Environment Variables
Create a `.env` file in `Wharf_/frontend/`:

```bash
cp .env.example .env
```

Ensure your `.env` connects to your local backend Worker:

```ini
VITE_API_BASE_URL="http://127.0.0.1:8787/api"
VITE_APP_URL="http://localhost:5173"
```

#### d. Start Frontend Development Server
```bash
npm run dev
```
Open your browser and visit `http://localhost:5173`. You should now see the Wharf landing page!

<br />

## 🧪 Running Tests & Quality Checks

Wharf maintains high test coverage across both frontend and backend.

### Backend Tests
```bash
cd Wharf_/backend

# Run Vitest test suite
npm run test

# Type check
npx tsc --noEmit
```

### Frontend Tests
```bash
cd Wharf_/frontend

# Run unit & component tests
npm run test:run

# Run interactive Vitest UI
npm run test:ui

# Run Playwright End-to-End tests
npx playwright test

# Type check & lint
npx tsc --noEmit
npm run lint
```

<br />

## 🚢 Deploying Wharf

### Deploying the Backend to Cloudflare Workers

1. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```
2. Verify configuration in `Wharf_/backend/wrangler.toml`:
   - Set `name = "wharf"` (or your custom worker name).
   - Set environment variables and secrets via `wrangler secret put <KEY>`.
3. Deploy:
   ```bash
   cd Wharf_/backend
   npm run deploy
   ```

### Deploying the Frontend to Vercel

1. Push your changes to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Set the **Root Directory** to `Wharf_/frontend`.
4. Configure environment variables (`VITE_API_BASE_URL` pointing to your deployed Cloudflare Worker URL).
5. Deploy!

<br />

## ❓ Troubleshooting & FAQs

### Q1) Why did the folder name change from `worker-backend` to `backend`?
To simplify project structure and eliminate confusion between legacy servers and active code, the active Cloudflare Worker backend was standardized as `backend`. See the architecture notes above.

---

### Q2) Does renaming `worker-backend` to `backend` affect Cloudflare deployment?
**No!** Cloudflare Worker deployments are driven entirely by your `wrangler.toml` file (`name = "wharf"`, `main = "src/index.ts"`), not by the name of your local directory. As long as you run `wrangler deploy` from within `Wharf_/backend`, Cloudflare deploys to the exact same worker.

---

### Q3) Encountering database connection timeouts?
If using Supabase, ensure you use the Connection Pooler (`DATABASE_URL` on port `6543` with `?pgbouncer=true`) for Cloudflare Workers to avoid connection exhaustion in serverless isolates. Use `DIRECT_URL` (port `5432`) for Prisma migrations.

<br />

## 💬 Getting Help

- Join discussions or open an issue on [GitHub Issues](https://github.com/FrostByte-49/Wharf/issues).
- Review our [Contributing Guide](CONTRIBUTING.md) for how to submit bug reports and pull requests.

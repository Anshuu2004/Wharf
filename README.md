# 🧠 Wharf: AI-Powered Developer Workflow Platform

<div align="center">

[![GitHub Stars](https://img.shields.io/github/stars/FrostByte-49/Wharf?style=flat-square&color=yellow)](https://github.com/FrostByte-49/Wharf/stargazers)
[![License](https://img.shields.io/github/license/FrostByte-49/Wharf?style=flat-square&color=blue)](https://github.com/FrostByte-49/Wharf/blob/main/LICENSE)
[![Language](https://img.shields.io/badge/language-TypeScript-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Vite%20%7C%20Tailwind-61dafb?style=flat-square)](https://react.dev/)
[![Backend](https://img.shields.io/badge/backend-Hono%20%7C%20Cloudflare%20Workers%20%7C%20Prisma-F38020?style=flat-square)](https://workers.cloudflare.com/)
[![AI Integration](https://img.shields.io/badge/AI-Gemini%20%7C%20Groq%20%7C%20OpenAI%20%7C%20Anthropic-orange?style=flat-square)](https://openai.com/)
[![Last Commit](https://img.shields.io/github/last-commit/FrostByte-49/Wharf?style=flat-square&color=green)](https://github.com/FrostByte-49/Wharf/commits/main)
[![Issues](https://img.shields.io/github/issues/FrostByte-49/Wharf?style=flat-square&color=red)](https://github.com/FrostByte-49/Wharf/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/FrostByte-49/Wharf?style=flat-square&color=purple)](https://github.com/FrostByte-49/Wharf/pulls)

</div>

Wharf is an enterprise-grade, AI-powered developer workflow platform engineered to dismantle documentation debt and provide deep, automated insights into complex codebases. Developers frequently struggle with outdated README files, fragmented changelogs, missing profile summaries, and a general lack of visibility into repository health and project structure. Wharf resolves these pain points by connecting directly to version control systems, executing static analysis on codebase trees, and using state-of-the-art Large Language Models (LLMs) to synthesize production-ready documentation, interactive workspace chat logs, and deep repository health reports.

Technically, Wharf leverages a modern, distributed architecture consisting of a React-Vite single-page application and a high-performance Cloudflare Worker edge backend powered by Hono and Prisma ORM. By integrating GitHub OAuth with precise Octokit calls, Wharf securely indexes repositories, detects project frameworks through file AST heuristics, and routes code context to custom LLM prompt pipelines. The platform utilizes advanced caching via Upstash Redis, token-optimized prompt construction, and secure encryption mechanics to ensure sub-millisecond response times, absolute data privacy, and a seamless developer experience.

<br>

## Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Preview](#-preview)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Customization](#-customization)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)
- [Support](#-support)

<br>

## 🚀 Features

- **Automated README Generation** utilizing static framework detection and structural codebase analysis to generate highly stylized, professional documentation.
- **Interactive Codebase Chat** featuring persona selectors, suggested follow-ups, code blocks with syntax highlighting, and an advanced prompt context builder to query repositories in real-time.
- **Automated Changelog Generator** that aggregates git commit histories, tag definitions, and pull requests to build chronological release logs.
- **GitHub Profile Builder** supplying custom theme pickers, tech stack selectors, custom layout widgets, bio generators, and social badge integrations to form aesthetic portfolios.
- **Repository Health Auditing** computing comprehensive code health scores based on directory structures, license files, contribution patterns, and tests.
- **Advanced Admin Operations** monitoring cache hits, estimating API usage costs, identifying anomalies, tracing token distributions, and reviewing live activity feeds.
- **Secure Key Routing** supporting dual authorization modes: platform-routed subscription models or direct client-provided API key configurations (OpenAI / Anthropic).
- **Asynchronous Context Tracking** utilizing AsyncLocalStorage to guarantee correlation IDs and request context are carried throughout call chains.

<br>

## 📸 Preview

| **Landing Page** | **Features** |
| :--- | :--- |
| ![Landing Page](https://res.cloudinary.com/dhn92qb61/image/upload/q_auto,f_auto/v1786386087/Picture_1.png) | ![Features](https://res.cloudinary.com/dhn92qb61/image/upload/q_auto,f_auto/v1786386094/Pic_3.png) |

<br>

| **How It Works** | **Chat Assistant** |
| :--- | :--- |
| ![How It Works](https://res.cloudinary.com/dhn92qb61/image/upload/q_auto,f_auto/v1786386092/Pic_2.png) | ![Chat Assistant](https://res.cloudinary.com/dhn92qb61/image/upload/q_auto,f_auto/v1786386095/Pic_4.png) |

<br>

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **TypeScript** | Strongly-typed programming interface across Frontend, Backend, and Workers |
| **React (v18)** | Declarative Component-driven User Interface |
| **Vite** | Ultra-fast Frontend Bundler and Hot-Module Replacement Engine |
| **TailwindCSS** | Utility-first CSS styling framework with responsive design constructs |
| **Zustand** | Lightweight, high-performance global state management for reactive UI updates |
| **Hono** | Lightweight, ultra-fast web framework tailored for Cloudflare Workers |
| **Cloudflare Workers** | Edge serverless compute execution engine with V8 isolate performance |
| **Prisma ORM** | Type-safe database mapping, migration management, and SQL abstraction |
| **PostgreSQL** | Primary relational database (Supabase) for profiles, chat history, and metadata persistence |
| **Upstash Redis** | Serverless Redis caching layer, rate-limiter tracker, and session store |
| **Octokit API** | Programmatic interface for GitHub OAuth, repository ingestion, and commit tracking |
| **Vitest & Playwright** | Unit, integration, and E2E browser automation test suites |

<br>

## 🏛️ System Architecture

![Architecture](https://res.cloudinary.com/dhn92qb61/image/upload/f_auto,q_auto/v1786388440/Pic_5_xcpyt1.webp) 

<br>

## 📂 Project Structure

```bash
📁Wharf/                                 # Main project root directory
├── 📁.github/                           # GitHub Actions workflows & community templates
│   ├── 📁ISSUE_TEMPLATE/                # Issue templates
│   │   ├── bug_report.md                # Bug report template
│   │   ├── feature_request.md           # Feature request template
│   │   └── config.yml                   # Issue template chooser configuration
│   ├── 📁workflows/                     # CI/CD pipeline configurations
│   │   └── ci.yml                       # Continuous integration workflow
│   └── PULL_REQUEST_TEMPLATE.md         # Pull request template
│
├── 📁Wharf_/                            # Application workspaces
│   ├── 📁backend/                       # Cloudflare Worker Backend API (Active)
│   │   ├── 📁.wrangler/                 # Wrangler local runtime state
│   │   ├── 📁prisma/                    # Database ORM & migrations
│   │   │   ├── 📁migrations/            # Database schema migrations
│   │   │   ├── schema.prisma            # Database schema definition
│   │   │   └── seed.ts                  # Database seeding script
│   │   ├── 📁src/                       # Source code (Hono framework)
│   │   │   ├── 📁controllers/           # Request handlers (10 controllers)
│   │   │   ├── 📁middleware/            # Auth & security middleware
│   │   │   ├── 📁routes/                # Route definitions
│   │   │   ├── 📁services/              # Business logic & LLM pipelines
│   │   │   ├── 📁utils/                 # Encryption, token counters, helpers
│   │   │   ├── db.ts                    # Prisma PostgreSQL client
│   │   │   └── index.ts                 # Worker entry point
│   │   ├── 📁tests/                     # Worker test suite (Vitest + Miniflare)
│   │   │   ├── 📁factories/             # Test data factories
│   │   │   ├── 📁fixtures/              # Test fixtures
│   │   │   ├── 📁integration/           # API integration tests
│   │   │   ├── 📁mocks/                 # Mock implementations
│   │   │   ├── 📁unit/                  # Unit tests (controllers, services, utils)
│   │   │   └── TESTING.md               # Backend testing documentation
│   │   ├── .dev.vars                    # Local development secrets (git-ignored)
│   │   ├── .dev.vars.example            # Environment variables template
│   │   ├── package.json                 # Backend dependencies & scripts
│   │   ├── tsconfig.json                # TypeScript configuration
│   │   ├── vitest.config.ts             # Vitest configuration for Cloudflare Workers
│   │   └── wrangler.toml                # Cloudflare Worker deployment configuration
│   │
│   ├── 📁frontend/                      # React Frontend Single Page Application (Active)
│   │   ├── 📁public/                    # Static assets & SEO files
│   │   ├── 📁src/                       # Frontend source code
│   │   │   ├── 📁components/            # Modular React components
│   │   │   ├── 📁hooks/                 # Custom React hooks
│   │   │   ├── 📁lib/                   # Core libraries & analytics
│   │   │   ├── 📁pages/                 # Route page components
│   │   │   ├── 📁stores/                # Zustand global state stores
│   │   │   ├── 📁utils/                 # Frontend utilities
│   │   │   ├── App.tsx                  # Root application component
│   │   │   ├── index.css                # Global Tailwind styles
│   │   │   └── main.tsx                 # Frontend entry point
│   │   ├── 📁tests/                     # Frontend test suite
│   │   │   ├── 📁components/            # Component tests
│   │   │   ├── 📁e2e/                   # Playwright E2E browser tests
│   │   │   ├── 📁mocks/                 # MSW (Mock Service Worker) handlers
│   │   │   └── TESTING.md               # Frontend testing documentation
│   │   ├── .env                         # Frontend local environment
│   │   ├── .env.example                 # Frontend environment template
│   │   ├── eslint.config.js             # ESLint configuration
│   │   ├── package.json                 # Frontend dependencies
│   │   ├── playwright.config.ts         # Playwright configuration
│   │   ├── vercel.json                  # Vercel deployment configuration
│   │   ├── vite.config.ts               # Vite build configuration
│   │   └── vitest.config.ts             # Vitest configuration
│   │
│   └── 📁legacy/                        # Archived legacy code (Inactive - do NOT use)
│       └── 📁node-backend/              # Earlier Node.js/Express implementation
│
├── .gitattributes                       # Git attributes configuration
├── CHANGELOG.md                         # Project changelog
├── CODE_OF_CONDUCT.md                   # Contributor covenant code of conduct
├── CONTRIBUTING.md                      # Community contribution guidelines
├── GETTING_STARTED.md                   # Quickstart local development guide
├── LICENSE                              # MIT License
├── README.md                            # Project README
└── SECURITY.md                          # Vulnerability reporting policy
```

<br>

## ⚙️ Getting Started

Follow this sequence to spin up Wharf locally. Complete the environment variable configuration before initializing frontend or backend services. See [GETTING_STARTED.md](GETTING_STARTED.md) for full setup instructions.

### 1. Environment Variable Configuration

Create a `.dev.vars` file inside the `Wharf_/backend` directory using `.dev.vars.example` as a template:

```bash
# Supabase PostgreSQL Database Connections
PORT=8787
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/wharf_db"
DATABASE_URL="postgresql://postgres:postgres@localhost:6543/wharf_db?pgbouncer=true"

# Security & Sessions
JWT_SECRET="your_development_jwt_secret_min_32_characters"
FRONTEND_URL="http://localhost:5173"
ENCRYPTION_SECRET="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# GitHub OAuth Credentials
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GITHUB_CALLBACK_URL="http://127.0.0.1:8787/api/auth/github/callback"

# LLM Providers Credentials
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AIza..."
```

#

### 2. Database Migration and Seeding

Generate the Prisma client and push your schema or migrations to PostgreSQL:

```bash
# Navigate to the backend workspace
cd Wharf_/backend

# Ingest all dependency packages
npm install

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database
npx prisma db seed
```

#

### 3. Backend (Cloudflare Worker) Initialization

Start the Cloudflare Worker locally via Wrangler:

```bash
# Ensure you are in the backend directory
cd Wharf_/backend

# Run local Worker dev server on http://127.0.0.1:8787
npm run dev
```

#

### 4. Frontend Single Page Application Boot

Install dependencies and launch the frontend client server. Vite will spin up the web app locally on `http://localhost:5173`:

```bash
# Navigate to the React-Vite workspace
cd ../frontend

# Ingest required packages
npm install

# Boot development hot-reloading web page server
npm run dev
```

<br>

## 🚀 Usage

### 1) Automatically Compiling a Project README
Wharf ingests repository file structures, identifies tech stack compositions, and outputs production-grade markdown documentation.

```bash
# Call Wharf API endpoint directly to generate a project README using default settings
curl -X POST http://localhost:5000/api/generate/readme \
  -H "Authorization: Bearer <JWT_USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "repoId": "clt-12345",
    "tone": "professional",
    "includeSections": ["features", "tech-stack", "system-architecture", "api-reference"],
    "customInstructions": "Structure with clear setup commands for Docker."
  }'
```
#

### 2) Interacting with the Codebase Chat Assistant
Converse with Wharf's LLM engine while passing code structural context, directory mappings, or specific file trees directly to the conversation.

```bash
# Query the project codebase context with explicit assistant persona models
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer <JWT_USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "repoId": "clt-12345",
    "message": "Explain how the middleware rateLimiter.ts verifies Token bucket algorithms.",
    "persona": "system-architect",
    "chatHistoryId": "hist-789"
  }'
```
#

### 3) Triggering a Repository Health Audit
Evaluate codebase structure, check for standard repository layout patterns, analyze license status, trace test presence, and return a comprehensive code health score.

```bash
# Ingest and scan a repository for codebase health scoring metrics
curl -X POST http://localhost:5000/api/health/analyze \
  -H "Authorization: Bearer <JWT_USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/FrostByte-49/Wharf"
  }'
```

<br>

## 📞 API Reference

### API Summary Table

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/api/auth/github` | Redirects user agent to GitHub's OAuth login screen | No |
| POST | `/api/auth/callback` | Receives temporary OAuth code and returns valid JWT token | No |
| GET | `/api/repo/list` | Returns list of user repositories imported from GitHub | Yes |
| POST | `/api/repo/scan` | Runs framework detection parser over repository file tree | Yes |
| POST | `/api/generate/readme` | Generates detailed Markdown documentation for a repository | Yes |
| POST | `/api/chat/message` | Sends a message to the AI chat assistant with context parameters | Yes |
| POST | `/api/health/analyze` | Generates a metric analysis score and actionable recommendations | Yes |
| POST | `/api/changelog/generate` | Generates a project release changelog based on git commit history | Yes |
| POST | `/api/profile/generate` | Builds custom markdown files for personal developer profiles | Yes |
| GET | `/api/admin/stats` | Collects live operational metrics, cost estimations, and cache hits | Yes (Admin) |

#

### 1) GET /api/auth/github
Redirects the client browser session directly to GitHub to authorize the Wharf application.

**Request Query Params**
```json
// No request body parameter required.
```

**Response**
```
Status: 302 Found
Location: https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...
```

#

### 2) POST /api/auth/callback
Exchanges an authorization code for an OAuth access token, provisions a user profile in PostgreSQL, and signs a JWT.

**Request Body**
```json
{
  "code": "a93bc71d49e83f0a"
}
```

**Response (JSON)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHQ...",
  "user": {
    "id": "clt-12345",
    "username": "FrostByte-49",
    "email": "developer@frostbyte.io",
    "avatarUrl": "https://avatars.githubusercontent.com/u/12345"
  }
}
```

#

### 3) GET /api/repo/list
Retrieves the repositories belonging to the authenticated user from the local PostgreSQL database, with optional sync options.

**Request Query Params**
```json
// Header authorization check required: "Authorization: Bearer <JWT>"
```

**Response (JSON)**
```json
{
  "success": true,
  "repositories": [
    {
      "id": "repo-4819",
      "name": "Wharf",
      "owner": "FrostByte-49",
      "githubUrl": "https://github.com/FrostByte-49/Wharf",
      "framework": "TypeScript",
      "lastScannedAt": "2026-04-26T10:18:18.000Z"
    }
  ]
}
```

#

### 4) POST /api/generate/readme
Generates a structured, highly polished markdown README based on codebase structure, framework components, and configuration settings.

**Request Body**
```json
{
  "repoId": "repo-4819",
  "tone": "technical",
  "sections": ["description", "installation", "usage", "tech-stack", "system-architecture"],
  "customInstructions": "Prioritize yarn workspaces and emphasize the worker-backend setup."
}
```

**Response (JSON)**
```json
{
  "success": true,
  "readmeMarkdown": "# Wharf: Dev Workflow Engine\n\nThis codebase runs...\n## Technical Stack\n...",
  "tokensUsed": 4512,
  "costEstimate": 0.0135
}
```

#

### 5) POST /api/chat/message
Submits a message to the repository chat engine. It resolves repo-specific structures and files to build a highly targeted codebase-aware context prompt.

**Request Body**
```json
{
  "repoId": "repo-4819",
  "message": "Which file manages the encryption/decryption of the user's personal API keys?",
  "persona": "security-engineer",
  "chatHistoryId": "chat-session-001"
}
```

**Response (JSON)**
```json
{
  "success": true,
  "response": "The encryption and decryption of user API keys is managed by `Wharf_/backend/src/utils/encryption.ts`. It utilizes an AES-256-GCM symmetric-key encryption workflow...",
  "suggestedFollowups": [
    "How is the encryption key loaded securely?",
    "Can you show the exact decrypt function signature?"
  ]
}
```

#

### 6) POST /api/health/analyze
Performs a structural analysis on the repository file tree, calculating an overall repository quality score and generating actionable refactoring recommendations.

**Request Body**
```json
{
  "githubUrl": "https://github.com/FrostByte-49/Wharf"
}
```

**Response (JSON)**
```json
{
  "success": true,
  "healthReport": {
    "overallScore": 89,
    "breakdown": {
      "documentation": 95,
      "testCoverage": 78,
      "licenseCompliance": 100,
      "frameworkStructure": 83
    },
    "suggestions": [
      {
        "impact": "high",
        "category": "testCoverage",
        "message": "Add visual unit test configurations to target components inside the admin dashboard folder."
      },
      {
        "impact": "medium",
        "category": "frameworkStructure",
        "message": "Move duplicate environment check handlers into a centralized config module in backend."
      }
    ]
  }
}
```

#

### 7) POST /api/changelog/generate
Parses Git commit logs and differences between references (tags, branches, or commit hashes) to generate structured markdown release notes.

**Request Body**
```json
{
  "repoId": "repo-4819",
  "fromRef": "v1.0.0",
  "toRef": "v1.1.0",
  "style": "conventional-commits"
}
```

**Response (JSON)**
```json
{
  "success": true,
  "changelogMarkdown": "## Release v1.1.0\n\n### Features\n- **Rate Limiting**: Added Redis token-bucket middleware (#104)\n\n### Bug Fixes\n- **Token Revocation**: Resolved token expiration state mismatches...",
  "generatedAt": "2026-04-26T11:00:00.000Z"
}
```

#

### 8) POST /api/profile/generate
Synthesizes visual layouts, markdown banners, theme styles, tech stack badges, and widgets into a customized personal profile README file.

**Request Body**
```json
{
  "theme": "dracula",
  "bio": "Fullstack Cloud Engineer building automated developer systems.",
  "techStack": ["React", "TypeScript", "NodeJS", "PostgreSQL", "Docker"],
  "widgets": ["github-stats", "recent-prs"],
  "socials": {
    "linkedin": "frostbyte-49",
    "twitter": "frostbyte_49"
  }
}
```

**Response (JSON)**
```json
{
  "success": true,
  "profileMarkdown": "<div align=\"center\">\n# Hi, I am FrostByte-49! 👋\n\n![Github Stats](https://github-readme-stats.vercel.app/api...)\n</div>",
  "previewUrl": "http://localhost:5000/api/profile/preview/clt-12345"
}
```

<br>

## 🎨 Customization

You can configure and extend Wharf's default behavior in several ways:

- **Swap AI Provider**: Change the model definition parameter strings inside `Wharf_/backend/src/services/ai.service.ts` to swap OpenAI with Anthropic, or configure local LLM endpoints using Ollama.
- **Adjust Repository Health Weights**: Fine-tune weighting percentages used to calculate repository health scores inside `Wharf_/backend/src/services/healthScore.service.ts`.
- **Add Custom README Sections**: Add custom items to selection matrices in `Wharf_/frontend/src/components/generator/SectionToggler.tsx` to expand the document output scope.
- **Create Chat Assistant Personas**: Register new bot behavioral system prompts in `Wharf_/backend/src/utils/chatPromptBuilder.ts` (e.g., adding a "DevOps Architect" persona).
- **Modify Key Cryptography**: Swap out standard AES algorithms for custom hardware security module adapters inside `Wharf_/backend/src/utils/encryption.ts`.

<br>

## 🌟 Future Enhancements

- **Real-Time Git Webhooks**: Automatically trigger README updates and health score recalibrations on git push events.
- **Automated Pull Request Reviews**: Integrate a code-review pipeline that suggests documentation modifications and highlights security concerns directly inside PR threads.
- **Multilingual Localization**: Automatically translate generated documentation into target languages like Spanish, Japanese, or German.
- **Dynamic AST Construction**: Implement absolute syntax tree parsing for deeper variable tracing, interface generation, and call stack visualization.
- **Predictive Refactoring Analysis**: Run code complexity tracking algorithms to predict software components prone to regressions.
- **Team Workspace Sharing**: Enable team-wide collaborative workspaces with persistent codebase chat channels and interactive documentation previews.

<br>

## 🤝 Contributing

### How To Contribute

We welcome contributions of all kinds! Please refer to our comprehensive [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting code.

1. Fork the repository and create your feature branch:
```bash
git checkout -b feat/amazing-developer-improvement
```

#

2. Implement your changes and verify with tests:
```bash
# Backend tests
cd Wharf_/backend && npm run test

# Frontend tests
cd ../frontend && npm run test:run
```

#

3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/):
```bash
git commit -m "feat(generator): integrate AST parsing for structural code quality tracking"
```

#

4. Push your branch upstream:
```bash
git push origin feat/amazing-developer-improvement
```

#

5. Open a Pull Request targeting the `main` branch of `FrostByte-49/Wharf`. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

#

### Areas For Contribution

- **Security & Sandboxing**: Enhancing worker service constraints when checking repository dependencies.
- **UI/UX Optimization**: Creating interactive visualizations for repository directory trees and graph structures.
- **LLM Pipeline Refinement**: Streamlining token budgets and prompt engineering for higher context utilization.
- **Documentation & Walkthroughs**: Adding detailed developer guides, framework templates, and test recipes.

<br>

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/FrostByte-49/Wharf/blob/main/LICENSE) file for details.

<br>

## 👨‍💻 Author

**Pranav Khalate ( FrostByte-49 )**<br><br>
[![Email](https://img.shields.io/badge/Email-ff6f91?style=for-the-badge&logo=gmail&logoColor=white)](mailto:pranav.kh25@gmail.com) &nbsp;
[![GitHub](https://img.shields.io/badge/GitHub-1e1e2f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/FrostByte-49) &nbsp;
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pranav-kh/) &nbsp;
[![Portfolio](https://img.shields.io/badge/Portfolio-10b9?style=for-the-badge&logo=react&logoColor=white)](https://pranavkh.vercel.app/)

<br>

## 🌟 Support The Project

If Wharf made automated codebase analysis or README updates easier for you, please consider giving this repository a star and sharing it with other developers on social media!

<br>

<!-- Minimal Documentation Badge -->
<p align="right">
  <a href="https://trywharf.vercel.app/" target="_blank">
    <img src="https://res.cloudinary.com/dhn92qb61/image/upload/v1782741355/wharf_badge__qguiv.png" alt="Documented By Wharf" width="200" height="auto" />
  </a>
</p>

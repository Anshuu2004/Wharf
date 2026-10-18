# Contributing to Wharf

First off, thank you for considering contributing to **Wharf**! 🎉 

Wharf is an open-source, AI-powered developer workflow platform designed to automate codebase documentation, README creation, changelogs, and deep repository health analysis. Open source projects thrive because of community contributors like you.

Please take a moment to review this document to make the contribution process clear, transparent, and enjoyable.

<br />

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to [pranav.kh25@gmail.com](mailto:pranav.kh25@gmail.com).

<br />

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features & Enhancements](#suggesting-features--enhancements)
  - [Contributing Code](#contributing-code)
- [Development Setup](#development-setup)
- [Project Architecture & Active Workspaces](#project-architecture--active-workspaces)
- [Git Workflow & Branching Strategy](#git-workflow--branching-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style & Testing](#code-style--testing)

<br />

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing [Issues](https://github.com/FrostByte-49/Wharf/issues) to avoid duplicates.

When filing a bug:
- Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).
- Describe the expected vs. actual behavior.
- Include minimal steps to reproduce the issue.
- Provide relevant environment details (OS, Node version, browser, etc.) and error stack traces.

### Suggesting Features & Enhancements

We welcome fresh ideas! Please submit feature suggestions through [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md). Explain:
- The problem you want to solve.
- Your proposed solution or workflow.
- Any alternatives or edge cases you considered.

### Contributing Code

1. Pick an issue tagged with `good first issue` or `help wanted`, or propose an idea by opening an issue first.
2. Fork the repository and follow the development setup below.

<br />

## Project Architecture & Active Workspaces

The repository is structured as a monorepo workspace under `Wharf_/`:

- **Frontend (`Wharf_/frontend`)**:
  - React 18, Vite, TypeScript, TailwindCSS, Zustand, Radix UI.
  - Deployed on Vercel (`https://trywharf.vercel.app`).
- **Backend (`Wharf_/backend`)**:
  - Cloudflare Worker edge backend powered by Hono, Prisma (PostgreSQL adapter), Upstash Redis, and Vercel AI SDK.
  - Configured and deployed via Cloudflare Wrangler (`wrangler.toml`).
- **Legacy (`Wharf_/legacy`)**:
  - Contains archived legacy code (e.g. earlier Express backend iterations). **Do not develop new features in the legacy directory.**

<br />

## Development Setup

See our detailed [Getting Started Guide](GETTING_STARTED.md) for step-by-step instructions.

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm`
- **PostgreSQL**: PostgreSQL database (or Supabase instance)
- **Redis**: Redis instance (or Upstash Redis)
- **GitHub OAuth App**: For local authentication testing

### Quick Start

1. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/Wharf.git
   cd Wharf
   ```
---
2. **Setup Backend**:
   ```bash
   cd Wharf_/backend
   cp .dev.vars.example .dev.vars    # Fill in required credentials
   npm install
   npx prisma generate
   npm run dev                      # Runs Wrangler dev server on http://localhost:8787
   ```
---
3. **Setup Frontend**:
   ```bash
   cd ../frontend
   cp .env.example .env            # Configure VITE_API_BASE_URL
   npm install
   npm run dev                     # Runs Vite dev server on http://localhost:5173
   ```

<br />

## Git Workflow & Branching Strategy

1. **Create a descriptive branch** from `main`:
   ```bash
   git checkout -b feat/readme-streaming
   # or
   git checkout -b fix/github-oauth-callback
   ```
---
2. Branch naming guidelines:
   - `feat/<feature-name>` for new features
   - `fix/<bug-name>` for bug fixes
   - `docs/<documentation-change>` for documentation
   - `refactor/<target>` for refactoring without behavior changes
   - `test/<target>` for adding or updating tests

<br />

## Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation-only changes
- `style:` Formatting, missing semicolons, etc. (no production code change)
- `refactor:` Code restructuring without feature addition or bug fix
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Build scripts, package updates, tooling configurations

<br />

**Examples:**
```bash
feat(generator): support custom LLM temperature parameters
fix(auth): handle expired GitHub OAuth token gracefully
docs(readme): update project structure for monorepo
```

<br />

## Pull Request Process

1. Ensure the test suites and type checks pass locally before opening a PR:
   ```bash
   # In Wharf_/backend
   npx tsc --noEmit
   npm run test

   # In Wharf_/frontend
   npx tsc --noEmit
   npm run test:run
   ```
2. Keep your PR focused on a single change or issue.
3. Open a Pull Request targeting the `main` branch of `FrostByte-49/Wharf`.
4. Fill in the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
5. Link any related issues (e.g. `Resolves #12`).
6. A maintainer will review your PR and provide constructive feedback!

<br />

## Code Style & Testing

- **TypeScript**: Strict type-checking is enforced. Avoid using `any` unless absolutely necessary with explicit comments.
- **Frontend Code**: Follow component-driven architecture with clean separation of logic in custom hooks and state in Zustand stores.
- **Backend Code**: Keep route controllers thin and business logic inside `src/services/`.
- **Testing**:
  - Unit & Integration tests: Vitest (`npm run test`)
  - End-to-End tests: Playwright in `Wharf_/frontend` (`npx playwright test`)

<br />

Thank you for helping make Wharf better for developers worldwide! 🚢

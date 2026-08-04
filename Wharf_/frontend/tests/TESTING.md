# Frontend Testing

**Framework**: Vitest, React Testing Library (RTL), Mock Service Worker (MSW), Playwright

## 1. Component & Integration Testing

The frontend utilizes a blend of Unit Tests for pure UI components and Integration Tests for major Pages.

### MSW (Mock Service Worker)
Rather than painfully mocking `fetch` or `axios` layer by layer, Wharf uses MSW inside the `tests/mocks/` directory. MSW intercepts all outbound network requests at the *network level* and returns mock JSON data. This allows our Page components to render exactly as they would in production.

### Key Areas Tested
*   **UI Components**: Modals, Cards, Spinners, Badges, Header Layouts with context (`<MemoryRouter>`, `<ToastProvider>`).
*   **Page Integration**: Generator Page, Settings, Profile, Admin Dashboard, and Health Pages. 
*   **Zustand Auth Mocking**: We manipulate `useAuthStore` using `vi.mock` to simulate both Authenticated and Unauthenticated states dynamically inside tests.

### Important Commands
*   `npm run test` (Runs Vitest in watch mode)
*   `npm run test:ui` (Runs Vitest with a beautiful UI dashboard)
*   `npm run test:run` (Runs tests in CI/CD non-watch mode)

<br />

## 2. End-to-End (E2E) Testing (Playwright)

**Framework**: Playwright
**Location**: `Wharf_/frontend/tests/e2e/`

Playwright acts as an actual user navigating the Wharf platform. It launches headless browsers (Chromium), physically clicks on elements, types into inputs, and asserts that the actual DOM responds correctly.

### Core Flows
1.  **Authentication (`auth.spec.ts`)**: Flowing through login states.
2.  **Generators (`generator.spec.ts`)**: Generating a repo dynamically.
3.  **Navigation (`navigation.spec.ts`)**: Layout routing.
4.  **Settings (`settings.spec.ts`)**: Interacting with BYOK preferences.
5.  **Profile (`profile.spec.ts`)**: Viewing statistics.

*(Note: Playwright will automatically boot up the frontend `npm run dev` server in the background for you via `playwright.config.ts`. However, the Backend Dev Server or Worker Backend must be running independently if you aren't mocking the API).*

### Important Commands
*   `npx playwright test` (Runs all E2E tests headless)
*   `npx playwright show-trace` (Visually inspect why a test failed)
*   `npx playwright test --ui` (Run tests from an interactive visual UI)

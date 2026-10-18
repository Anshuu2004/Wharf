# Backend Testing

**Framework**: Vitest, Hono Testing, Miniflare (Cloudflare Workers)
**Location**: `Wharf_/backend/tests/`

The backend testing suite is built around Hono's integrated testing patterns coupled with Vitest for robust execution in the Cloudflare Workers V8 isolate environment.

### Approach
*   **Environment**: We test code designed for Cloudflare Workers by leveraging the V8 isolate environment so tests closely mirror the production edge environment.
*   **Context Mocking**: The suite utilizes a robust Hono Context mocking utility to test controllers efficiently without heavy Node.js dependencies.
*   **Authentication**: Mocking Hono JWT and auth middleware validation robustly to prevent test flakiness.

### Key Areas Tested
*   **Controllers**: Application logic (streaming, db interactions, authentication) is tested using edge-compatible tooling.
*   **Integration**: Testing the Hono router configurations directly.

### Important Commands
*   `npm run test` (Runs all worker tests via Vitest)
*   `npm run test <file_path>` (Runs tests for a specific file)

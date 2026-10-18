# Backend Testing

**Framework**: Jest, Supertest
**Location**: `Wharf_/backend/tests/`

The backend utilizes **Integration-style Unit Tests**. Instead of merely testing pure functions in isolation, we spin up the Express application and fire actual HTTP requests using `supertest`.

### Key Areas Tested
*   **Authentication**: Registration, Login, Token generation, and Protected Route middlewares.
*   **Generators**: Verifying that the Markdown generation services return properly formulated READMEs, Changelogs, and Architecture documents.
*   **User Routes**: Fetching and manipulating user profile data.
*   **Factories**: Leveraging `/tests/factories` to spin up mock Users and Payloads for safe database mocking.

### Important Commands
*   `npm run test` (Runs all Backend test suites)
*   `npx jest tests/auth.test.ts` (Run tests for specific files)
*   `npm run test:watch` (Automatically re-run tests on file change)

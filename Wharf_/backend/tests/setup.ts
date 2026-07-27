import { beforeAll, afterAll, afterEach, jest } from '@jest/globals';

// Setup File For Jest (Backend)
beforeAll(() => {
  // Global Setup Logic
});

afterAll(() => {
  // Global Cleanup Logic
});

afterEach(() => {
  jest.clearAllMocks(); // Automatically Clear Mocks After Every Test
});

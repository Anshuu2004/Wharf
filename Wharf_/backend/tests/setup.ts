import { beforeAll, afterAll, afterEach, jest } from '@jest/globals';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
process.env.ENCRYPTION_SECRET = 'thirtytwo_byte_long_secret_key12';

// Setup File For Jest (Backend)
beforeAll(() => {
});

afterAll(() => {
  // Global Cleanup Logic
});

afterEach(() => {
  jest.clearAllMocks(); // Automatically Clear Mocks After Every Test
});

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@octokit/rest$': '<rootDir>/tests/mocks/octokitStub.ts',
    '^@octokit/auth-app$': '<rootDir>/tests/mocks/octokitStub.ts',
    '^ai$': '<rootDir>/tests/mocks/aiStub.ts',
    '^@ai-sdk/(.*)$': '<rootDir>/tests/mocks/aiStub.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  globalTeardown: '<rootDir>/tests/teardown.ts',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageReporters: ['text', 'lcov', 'json-summary', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

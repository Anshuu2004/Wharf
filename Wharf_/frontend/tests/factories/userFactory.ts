export const mockUser = {
  id: 'usr_123',
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://github.com/ghost.png',
  githubCreatedAt: '2023-01-01T00:00:00Z',
  isAdmin: false,
};

export const createMockUser = (overrides = {}) => {
  return { ...mockUser, ...overrides };
};

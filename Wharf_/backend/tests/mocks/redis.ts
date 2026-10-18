export const redisMock = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  setEx: vi.fn(),
  del: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  quit: vi.fn(),
  on: vi.fn(),
};

export default redisMock;

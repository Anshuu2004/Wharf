import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatPage } from '../../src/pages/ChatPage';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../src/components/ui/ToastProvider';

// Explicitly Mock AuthStore So API Handlers Don't Crash
vi.mock('../../src/stores/authStore', () => {
  const storeState = { user: { username: 'testuser' }, token: 'fake-token' };
  return {
    useAuthStore: Object.assign(vi.fn(() => storeState), {
      getState: () => storeState,
    }),
  };
});

describe('ChatPage', () => {
  beforeEach(() => {
    // Clear LocalStorage To Prevent State Leakage Between Chat Sessions Tests
    localStorage.clear();
  });

  const renderPage = () => {
    return render(
      <ToastProvider>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders the chat interface layout', () => {
    renderPage();
    // Default Chat Interface Renders This Placeholder Instruction
    expect(screen.getByText(/Analyze a repository to see its details here/i)).toBeInTheDocument();
  });
});
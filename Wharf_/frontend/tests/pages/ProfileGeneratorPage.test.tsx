import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileGeneratorPage } from '../../src/pages/ProfileGeneratorPage';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../src/components/ui/ToastProvider';

vi.mock('../../src/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { username: 'testuser' },
  })),
}));

describe('ProfileGeneratorPage', () => {
  const renderPage = () => {
    return render(
      <ToastProvider>
        <MemoryRouter>
          <ProfileGeneratorPage />
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders the profile generator layout', () => {
    renderPage();
    expect(screen.getAllByText(/Profile/i).length).toBeGreaterThan(0);
  });
});

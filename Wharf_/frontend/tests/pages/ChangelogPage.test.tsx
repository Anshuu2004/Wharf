import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChangelogPage } from '../../src/pages/ChangelogPage';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../src/components/ui/ToastProvider';

vi.mock('../../src/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { username: 'testuser' },
  })),
}));

describe('ChangelogPage', () => {
  const renderPage = () => {
    return render(
      <ToastProvider>
        <MemoryRouter>
          <ChangelogPage />
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders the changelog generator header', () => {
    renderPage();
    // Assuming Page Has A Distinct Title Or Text 
    expect(screen.getAllByText(/Changelog/i).length).toBeGreaterThan(0);
  });
});

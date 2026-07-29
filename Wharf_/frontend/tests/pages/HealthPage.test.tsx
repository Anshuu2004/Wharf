import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HealthPage } from '../../src/pages/HealthPage';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../src/components/ui/ToastProvider';

vi.mock('../../src/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { username: 'testuser' },
  })),
}));

describe('HealthPage', () => {
  const renderPage = () => {
    return render(
      <ToastProvider>
        <MemoryRouter>
          <HealthPage />
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders the health check dashboard', () => {
    renderPage();
    // Assuming Page Has A Distinct Title
    expect(screen.getAllByText(/Health/i).length).toBeGreaterThan(0);
  });
});

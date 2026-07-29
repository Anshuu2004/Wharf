import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GeneratorPage } from '../../src/pages/GeneratorPage';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../src/components/ui/ToastProvider';

vi.mock('../../src/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { username: 'testuser' },
  })),
}));

describe('GeneratorPage', () => {
  const renderPage = () => {
    return render(
      <ToastProvider>
        <MemoryRouter>
          <GeneratorPage />
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders the README generator header', () => {
    renderPage();
    expect(screen.getAllByText(/Generate Professional/i).length).toBeGreaterThan(0);
  });
});

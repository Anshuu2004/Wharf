import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminDashboard } from '../../src/pages/AdminDashboard';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../src/components/ui/ToastProvider';

vi.mock('../../src/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { isAdmin: true, username: 'admin' },
    isAuthenticated: true,
  })),
}));

describe('AdminDashboard Page', () => {
  const renderPage = () => {
    return render(
      <ToastProvider>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders the admin dashboard header', () => {
    renderPage();
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });
});
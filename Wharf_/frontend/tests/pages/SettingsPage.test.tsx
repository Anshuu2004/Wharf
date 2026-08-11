import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsPage } from '../../src/pages/SettingsPage';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../src/components/ui/ToastProvider';

// Explicitly Mock UseAuthStore So The Component Doesn't Crash On Null Properties 
vi.mock('../../src/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'u-1', username: 'testuser', email: 'test@test.com', githubCreatedAt: '2026-01-01T00:00:00.000Z' },
    isAuthenticated: true,
  })),
}));

describe('SettingsPage', () => {
  const renderPage = () => {
    return render(
      <ToastProvider>
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders standard user settings sections', () => {
    renderPage();
    // Assuming UI Elements Map Properly
    expect(screen.getAllByText(/Settings/i).length).toBeGreaterThan(0);
  });
});
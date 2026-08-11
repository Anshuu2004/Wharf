import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { Header } from '../../../src/components/layout/Header';
import { MemoryRouter } from 'react-router-dom';
import { mockUser } from '../../factories/userFactory';
import { ToastProvider } from '../../../src/components/ui/ToastProvider';
import { useAuthStore } from '../../../src/stores/authStore';

type UseAuthStoreMock = MockedFunction<typeof useAuthStore>;

// We Explicitly Mock useAuthStore So We Govern Login State
vi.mock('../../../src/stores/authStore', () => ({
  useAuthStore: Object.assign(vi.fn(), { getState: vi.fn(() => ({ token: 'fake-token' })) })
}));

// Import The Mocked Function For Configuring Returns Per Test

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <ToastProvider>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders basic branding', () => {
    (useAuthStore as UseAuthStoreMock).mockReturnValue({ user: null, logout: vi.fn() });
    renderWithProviders(<Header />);
    expect(screen.getByText('WHARF')).toBeInTheDocument();
    expect(screen.getByText('Ship Code That Speaks')).toBeInTheDocument();
  });

  it('shows Sign In button when user is not authenticated', () => {
    (useAuthStore as UseAuthStoreMock).mockReturnValue({ user: null, logout: vi.fn() });
    renderWithProviders(<Header />);
    // There Are Actually Generic Sign In Buttons (Desktop & Mobile)
    const signInButtons = screen.getAllByText(/Sign In/i);
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it('shows User profile button and hides Sign In when authenticated', () => {
    (useAuthStore as UseAuthStoreMock).mockReturnValue({ 
      user: { ...mockUser, username: 'TestHero' }, 
      logout: vi.fn() 
    });
    
    renderWithProviders(<Header />);

    // Sign In Should Be Absent In Standard Flow (Might Be On Mobile Drawer If Not Updated Correctly But Assuming True)
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    
    // Desktop User Button Displays Username
    const userButton = screen.getAllByText('TestHero');
    expect(userButton.length).toBeGreaterThan(0);
  });
});

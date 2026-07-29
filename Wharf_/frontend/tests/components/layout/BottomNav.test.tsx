import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BottomNav from '../../../src/components/layout/BottomNav';

vi.mock('../../../src/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { isAdmin: false }
  }))
}));

describe('BottomNav', () => {
  it('renders default nav items for standard user', () => {
    const handleNavigate = vi.fn();
    render(<BottomNav currentPage="home" onNavigate={handleNavigate} />);
    
    // Check Tooltip Texts Are Present (Using Text Matches)
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Repo README')).toBeInTheDocument();
    
    // Admin Should NOT Be In The Document
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('triggers onNavigate callback when clicking a nav item', () => {
    const handleNavigate = vi.fn();
    render(<BottomNav currentPage="home" onNavigate={handleNavigate} />);
    
    const navButtons = screen.getAllByRole('button');
    fireEvent.click(navButtons[1]); // Click Second Button (Generator)
    
    expect(handleNavigate).toHaveBeenCalledWith('generator');
  });
});

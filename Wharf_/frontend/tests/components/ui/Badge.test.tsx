import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../../../src/components/ui/Badge';

describe('Badge', () => {
  it('renders correctly with given text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    render(<Badge variant="pink">Error</Badge>);
    const badge = screen.getByText('Error');
    // Check For Correct Class Application
    expect(badge.className).toContain('bg-wharf-pink');
  });
});

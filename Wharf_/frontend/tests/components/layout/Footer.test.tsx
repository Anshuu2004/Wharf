import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '../../../src/components/layout/Footer';

describe('Footer', () => {
  it('renders branding and tagline', () => {
    render(<Footer />);
    expect(screen.getByText('WHARF')).toBeInTheDocument();
  });

  it('renders all product and resource links', () => {
    render(<Footer />);
    expect(screen.getByText('README Generator')).toBeInTheDocument();
    expect(screen.getByText('Settings (BYOK)')).toBeInTheDocument();
  });

  it('renders version from props', () => {
    render(<Footer version="v2.5.0" year={2028} />);
    expect(screen.getByText('// WHARF v2.5.0')).toBeInTheDocument();
    expect(screen.getByText(/2028 WHARF \| All rights reserved/i)).toBeInTheDocument();
  });
});

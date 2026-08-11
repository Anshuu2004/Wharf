import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from '../../../src/components/ui/Spinner';

describe('Spinner', () => {
  it('renders spinner elements correctly', () => {
    const { container } = render(<Spinner />);
    const spinnerDiv = container.querySelector('.animate-spin');
    expect(spinnerDiv).toBeInTheDocument();
  });

  it('applies custom size via props', () => {
    const { container } = render(<Spinner size="lg" />);
    const spinnerDiv = container.querySelector('.animate-spin');
    expect(spinnerDiv?.className).toContain('w-12');
  });
});


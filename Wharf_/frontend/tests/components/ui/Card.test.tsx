import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../../../src/components/ui/Card';

describe('Card ecosystem', () => {
  it('renders a full card structure', () => {
    render(
      <Card
        header={<div>My Title</div>}
        footer={<div>Footer text</div>}
      >
        Body logic
      </Card>
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('Body logic')).toBeInTheDocument();
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });
});


import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Frontend Dummy Test', () => {
  test('renders successfully', () => {
    // Arrange
    render(<div>Hello Vitest</div>);

    // Act
    const textElement = screen.getByText('Hello Vitest');

    // Assert
    expect(textElement).toBeInTheDocument();
  });
});

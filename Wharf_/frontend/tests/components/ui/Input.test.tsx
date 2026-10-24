import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '../../../src/components/ui/Input';

describe('Input', () => {
  it('renders correctly with placeholder', () => {
    render(<Input placeholder="Enter username" />);
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('updates value on change', () => {
    render(<Input aria-label="username" />);
    const input = screen.getByLabelText('username') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input.value).toBe('test');
  });

  it('displays error text when error prop is provided', () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });
  it('associates the label with the input', () => {
    render(<Input label="Username" />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('applies error styling when an error is provided', () => {
    render(<Input aria-label="Email" error="Invalid email" />);

    expect(screen.getByLabelText('Email')).toHaveClass('input-error');
  });

  it('renders an icon on the right when requested', () => {
    render(
      <Input
        aria-label="Search"
        icon={<span data-testid="search-icon">Search</span>}
        iconPosition="right"
      />
    );

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toHaveClass('pr-10');
  });
});


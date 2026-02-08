/**
 * Sample React Component Test
 *
 * This test demonstrates the Testing Library setup for React components.
 * Run with: npm test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Simple Button component for testing
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

function Button({ children, onClick, disabled, variant = 'primary' }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded font-medium';
  const variantStyles =
    variant === 'primary'
      ? 'bg-blue-500 text-white hover:bg-blue-600'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <button
      className={`${baseStyles} ${variantStyles}`}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  );
}

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByTestId('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>);

    expect(screen.getByTestId('button')).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    fireEvent.click(screen.getByTestId('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render primary variant by default', () => {
    render(<Button>Primary</Button>);

    const button = screen.getByTestId('button');
    expect(button.className).toContain('bg-blue-500');
  });

  it('should render secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByTestId('button');
    expect(button.className).toContain('bg-gray-200');
  });

  it('should render children correctly', () => {
    render(
      <Button>
        <span data-testid="icon">🚀</span>
        <span>Launch</span>
      </Button>
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Launch')).toBeInTheDocument();
  });
});

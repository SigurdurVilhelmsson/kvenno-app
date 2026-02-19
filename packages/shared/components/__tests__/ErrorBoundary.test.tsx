import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws on render
function ThrowingComponent({ error }: { error: Error }): React.ReactNode {
  throw error;
}

// Suppress React error boundary console.error output during tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByText('Child content')).toBeDefined();
  });

  it('renders default fallback UI when an error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error('Test error')} />
      </ErrorBoundary>
    );

    // Default fallback contains Icelandic text
    expect(screen.getByText(/Villa kom upp/)).toBeDefined();
    expect(screen.getByText(/Eitthvað fór úrskeiðis/)).toBeDefined();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error</div>}>
        <ThrowingComponent error={new Error('Test error')} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeDefined();
    expect(screen.getByText('Custom error')).toBeDefined();
  });

  it('calls onError callback when error is caught', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent error={new Error('Callback test')} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('Callback test');
  });

  it('renders reload and retry buttons in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error('Test error')} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText(/Endurhlaða/);
    const retryButton = screen.getByText(/Reyna aftur/);

    expect(reloadButton).toBeDefined();
    expect(retryButton).toBeDefined();
    expect(reloadButton.tagName).toBe('BUTTON');
    expect(retryButton.tagName).toBe('BUTTON');
  });
});

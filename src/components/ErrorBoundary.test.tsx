import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Suppress the React-produced console.error noise for expected throws.
let consoleSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  consoleSpy.mockRestore();
});

const Boom = ({ message = 'kaboom' }: { message?: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>hello</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders a fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom message="the world is on fire" />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/the world is on fire/)).toBeInTheDocument();
  });

  it('does not swallow the original error — message reaches the fallback', () => {
    render(
      <ErrorBoundary>
        <Boom message="UNIQUE_TOKEN_9f3a" />
      </ErrorBoundary>,
    );
    // The message should appear somewhere in the rendered tree, not be silently replaced.
    expect(screen.getByText(/UNIQUE_TOKEN_9f3a/)).toBeInTheDocument();
  });
});

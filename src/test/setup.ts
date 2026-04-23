import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Isolate tests: unmount and clear after each one.
afterEach(() => {
  cleanup();
});

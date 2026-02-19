import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { MarketplaceProvider } from '../providers/marketplace';

// Custom render function that includes router only
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

// Custom render that includes router and marketplace context (for tests that need real provider)
export function renderWithAllProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <MarketplaceProvider>{children}</MarketplaceProvider>
      </BrowserRouter>
    ),
    ...options,
  });
}

// Mock fetch helper
export function mockFetch(response: unknown, ok = true, status = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as Response)
  );
}

// Mock fetch with error
export function mockFetchError(error: Error) {
  global.fetch = vi.fn(() => Promise.reject(error));
}

// Mock fetch with network error
export function mockFetchNetworkError() {
  global.fetch = vi.fn(() =>
    Promise.reject(new TypeError('Failed to fetch'))
  );
}

// Re-export testing-library for convenience; rule can't verify barrel exports
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';


import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that includes common providers
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

// Mock fetch helper
export function mockFetch(response: any, ok = true, status = 200) {
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

export * from '@testing-library/react';




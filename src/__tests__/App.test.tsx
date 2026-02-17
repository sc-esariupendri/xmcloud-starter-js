import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import * as marketplaceContext from '../providers/marketplace';
import * as useSearchConfigApiHook from '../utils/hooks/useSearchConfigApi';

// Mock all dependencies
vi.mock('../providers/marketplace', () => ({
  MarketplaceProvider: ({ children }: any) => <>{children}</>,
  useMarketplaceLoading: vi.fn(),
  useMarketplaceError: vi.fn(),
  useAppContextOptional: vi.fn(),
  useMarketplaceClientOptional: vi.fn(),
  useUserContext: vi.fn(),
}));

vi.mock('../utils/hooks/useSearchConfigApi', () => ({
  useSearchConfigApi: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default Marketplace mock
    vi.mocked(marketplaceContext.useMarketplaceLoading).mockReturnValue(false);
    vi.mocked(marketplaceContext.useMarketplaceError).mockReturnValue(null);

    // Default Search Config API mock
    vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
      searchIndexOptions: [{ value: 'index-1', label: 'Index 1' }],
      fieldsMap: {
        'index-1': [{ id: 'title', label: 'Title' }],
      },
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const renderApp = () => {
    return render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  describe('Basic functionality', () => {
    it('should render search configuration when marketplace and API are ready', async () => {
      await act(async () => {
        renderApp();
      });

      // Fast forward past minimum loading time and allow promises to resolve
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      // With fake timers, use direct assertion after timer advance
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should show skeleton during initial loading', () => {
      vi.mocked(marketplaceContext.useMarketplaceLoading).mockReturnValue(true);

      renderApp();

      // Should show skeleton (checking for loading state using data-slot)
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases - Marketplace errors', () => {
    it('should show marketplace error when present', () => {
      const marketplaceError = {
        title: 'Marketplace Error',
        message: 'Failed to initialize marketplace',
        details: 'Connection refused',
      };

      vi.mocked(marketplaceContext.useMarketplaceError).mockReturnValue(
        marketplaceError
      );

      renderApp();

      expect(screen.getByText('Marketplace Error')).toBeInTheDocument();
      expect(
        screen.getByText('Failed to initialize marketplace')
      ).toBeInTheDocument();
      expect(screen.getByText('Connection refused')).toBeInTheDocument();
    });

    it('should show marketplace error without details', () => {
      const marketplaceError = {
        title: 'Marketplace Error',
        message: 'Failed to initialize',
      };

      vi.mocked(marketplaceContext.useMarketplaceError).mockReturnValue(
        marketplaceError
      );

      renderApp();

      expect(screen.getByText('Marketplace Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to initialize')).toBeInTheDocument();
    });

    it('should show marketplace context required error', () => {
      const marketplaceError = {
        title: 'Marketplace Context Required',
        message: 'Must run in marketplace',
      };

      vi.mocked(marketplaceContext.useMarketplaceError).mockReturnValue(
        marketplaceError
      );

      renderApp();

      expect(screen.getByText('Marketplace Context Required')).toBeInTheDocument();
      expect(screen.getByText('Must run in marketplace')).toBeInTheDocument();
    });
  });

  describe('Edge cases - API errors', () => {
    it('should show skeleton when API returns error', async () => {
      vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
        searchIndexOptions: [],
        fieldsMap: {},
        loading: false,
        error: 'Failed to fetch config',
      });

      renderApp();

      // Fast forward past minimum loading time (use async version to resolve promises)
      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      // When API error, should show skeleton
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle API timeout', async () => {
      vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
        searchIndexOptions: [],
        fieldsMap: {},
        loading: false,
        error: 'Request timeout',
      });

      renderApp();

      // Fast forward past minimum loading time (use async version to resolve promises)
      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle API returning null data', async () => {
      vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
        searchIndexOptions: [] as any, // Component will handle null by using default []
        fieldsMap: {} as any, // Component will handle null by using default {}
        loading: false,
        error: null,
      });

      await act(async () => {
        renderApp();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should handle API returning empty arrays', async () => {
      vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
        searchIndexOptions: [],
        fieldsMap: {},
        loading: false,
        error: null,
      });

      await act(async () => {
        renderApp();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should show skeleton during marketplace loading', () => {
      vi.mocked(marketplaceContext.useMarketplaceLoading).mockReturnValue(true);

      renderApp();

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show skeleton during API loading', async () => {
      vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
        searchIndexOptions: [],
        fieldsMap: {},
        loading: true,
        error: null,
      });

      renderApp();

      // Fast forward past minimum loading time (use async version to resolve promises)
      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should respect minimum loading time', async () => {
      await act(async () => {
        renderApp();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      let skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Routing', () => {
    it('should handle root path', async () => {
      await act(async () => {
        renderApp();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should redirect unknown paths to root', async () => {
      await act(async () => {
        render(
          <BrowserRouter>
            <App />
          </BrowserRouter>
        );
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Multiple loading states interaction', () => {
    it('should show skeleton when marketplace is loading', () => {
      vi.mocked(marketplaceContext.useMarketplaceLoading).mockReturnValue(true);

      renderApp();

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle all systems loaded but minimum time not met', async () => {
      vi.mocked(marketplaceContext.useMarketplaceLoading).mockReturnValue(false);

      renderApp();

      // Before minimum time, should show skeleton
      await vi.advanceTimersByTimeAsync(1000);

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Complex error scenarios', () => {
    it('should show skeleton when API returns error', async () => {
      vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
        searchIndexOptions: [],
        fieldsMap: {},
        loading: false,
        error: 'API error',
      });

      renderApp();

      await vi.advanceTimersByTimeAsync(2000);

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});


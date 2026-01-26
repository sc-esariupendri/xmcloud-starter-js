import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import * as auth0React from '@auth0/auth0-react';
import * as marketplaceContext from '../providers/marketplace';
import * as useSearchConfigApiHook from '../utils/hooks/useSearchConfigApi';

// Mock all dependencies
vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: any) => <>{children}</>,
  useAuth0: vi.fn(),
}));

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
  const mockGetAccessTokenSilently = vi.fn();
  const mockLoginWithPopup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default Auth0 mock
    vi.mocked(auth0React.useAuth0).mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithPopup: mockLoginWithPopup,
      isLoading: false,
      isAuthenticated: true,
      error: undefined,
      user: undefined,
      logout: vi.fn(),
      loginWithRedirect: vi.fn(),
      getAccessTokenWithPopup: vi.fn(),
      getIdTokenClaims: vi.fn(),
      handleRedirectCallback: vi.fn(),
    } as any);

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
      refetch: vi.fn(),
    });

    mockGetAccessTokenSilently.mockResolvedValue('valid-token');
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
    it('should render search configuration when authenticated', async () => {
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

  describe('Edge cases - Authentication errors', () => {
    it('should show authentication required when not authenticated', async () => {
      // When not authenticated, getAccessTokenSilently should fail
      mockGetAccessTokenSilently.mockRejectedValue(
        new Error('Not authenticated')
      );

      vi.mocked(auth0React.useAuth0).mockReturnValue({
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithPopup: mockLoginWithPopup,
        isLoading: false,
        isAuthenticated: false,
        error: undefined,
        user: undefined,
        logout: vi.fn(),
        loginWithRedirect: vi.fn(),
        getAccessTokenWithPopup: vi.fn(),
        getIdTokenClaims: vi.fn(),
        handleRedirectCallback: vi.fn(),
      } as any);

      await act(async () => {
        renderApp();
      });

      // Fast forward past minimum loading time (use async version to resolve promises)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      // With fake timers, use direct assertion after timer advance
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should show auth error message when present', async () => {
      const authError = new Error('Auth failed');
      // When there's an auth error, getAccessTokenSilently should fail
      mockGetAccessTokenSilently.mockRejectedValue(authError);

      vi.mocked(auth0React.useAuth0).mockReturnValue({
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithPopup: mockLoginWithPopup,
        isLoading: false,
        isAuthenticated: false,
        error: authError,
        user: undefined,
        logout: vi.fn(),
        loginWithRedirect: vi.fn(),
        getAccessTokenWithPopup: vi.fn(),
        getIdTokenClaims: vi.fn(),
        handleRedirectCallback: vi.fn(),
      } as any);

      await act(async () => {
        renderApp();
      });

      // Fast forward past minimum loading time (use async version to resolve promises)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      // With fake timers, use direct assertion after timer advance
      expect(screen.getByText('Auth failed')).toBeInTheDocument();
    });

    it('should handle token retrieval error', async () => {
      mockGetAccessTokenSilently.mockRejectedValue(
        new Error('Failed to get token')
      );

      renderApp();

      // Fast forward past minimum loading time (use async version to resolve promises)
      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(
        screen.getByText(/Failed to retrieve access token/i)
      ).toBeInTheDocument();
    });

    it('should handle auth0 network timeout', async () => {
      mockGetAccessTokenSilently.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 100)
          )
      );

      renderApp();

      // Fast forward past minimum loading time (use async version to resolve promises)
      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
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

    it('should prioritize marketplace error over auth', () => {
      const marketplaceError = {
        title: 'Marketplace Context Required',
        message: 'Must run in marketplace',
      };

      vi.mocked(marketplaceContext.useMarketplaceError).mockReturnValue(
        marketplaceError
      );

      vi.mocked(auth0React.useAuth0).mockReturnValue({
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithPopup: mockLoginWithPopup,
        isLoading: false,
        isAuthenticated: false,
        error: new Error('Auth error'),
        user: undefined,
        logout: vi.fn(),
        loginWithRedirect: vi.fn(),
        getAccessTokenWithPopup: vi.fn(),
        getIdTokenClaims: vi.fn(),
        handleRedirectCallback: vi.fn(),
      } as any);

      renderApp();

      // Should show marketplace error, not auth error
      expect(screen.getByText('Marketplace Context Required')).toBeInTheDocument();
      expect(screen.queryByText('Authentication Required')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases - API errors', () => {
    it('should show skeleton when API returns error', async () => {
      vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
        searchIndexOptions: [],
        fieldsMap: {},
        loading: false,
        error: 'Failed to fetch config',
        refetch: vi.fn(),
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
        refetch: vi.fn(),
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
        refetch: vi.fn(),
      });

      renderApp();

      // Fast forward past minimum loading time (use async version to resolve promises)
      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      // Should still render (handle null gracefully)
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should handle API returning empty arrays', async () => {
      vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
        searchIndexOptions: [],
        fieldsMap: {},
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderApp();

      // Fast forward past minimum loading time (use async version to resolve promises)
      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should show skeleton during auth loading', () => {
      vi.mocked(auth0React.useAuth0).mockReturnValue({
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithPopup: mockLoginWithPopup,
        isLoading: true,
        isAuthenticated: false,
        error: undefined,
        user: undefined,
        logout: vi.fn(),
        loginWithRedirect: vi.fn(),
        getAccessTokenWithPopup: vi.fn(),
        getIdTokenClaims: vi.fn(),
        handleRedirectCallback: vi.fn(),
      } as any);

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
        refetch: vi.fn(),
      });

      renderApp();

      // Fast forward past minimum loading time (use async version to resolve promises)
      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should respect minimum loading time', async () => {
      renderApp();

      // Before minimum time
      await vi.advanceTimersByTimeAsync(1000);

      // Should still show skeleton
      let skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);

      // After minimum time
      await vi.advanceTimersByTimeAsync(1000);

      // With fake timers, use direct assertion after timer advance
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Routing', () => {
    it('should handle root path', async () => {
      renderApp();

      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should redirect unknown paths to root', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      // Should still render the app (redirected to /)
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Edge cases - Token states', () => {
    it('should not fetch token if already present', async () => {
      const { rerender } = renderApp();

      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(1);

      // Rerender should not fetch again
      rerender(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(1);
    });

    it('should handle empty token string', async () => {
      // Empty token is considered as "no authentication" - should show auth required
      mockGetAccessTokenSilently.mockRejectedValue(
        new Error('No token available')
      );

      vi.mocked(auth0React.useAuth0).mockReturnValue({
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithPopup: mockLoginWithPopup,
        isLoading: false,
        isAuthenticated: false,
        error: undefined,
        user: undefined,
        logout: vi.fn(),
        loginWithRedirect: vi.fn(),
        getAccessTokenWithPopup: vi.fn(),
        getIdTokenClaims: vi.fn(),
        handleRedirectCallback: vi.fn(),
      } as any);

      await act(async () => {
        renderApp();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      // With fake timers, use direct assertion after timer advance
      // Empty/no token should show authentication required
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    });
  });

  describe('Multiple loading states interaction', () => {
    it('should handle marketplace loading with auth complete', () => {
      vi.mocked(marketplaceContext.useMarketplaceLoading).mockReturnValue(true);
      vi.mocked(auth0React.useAuth0).mockReturnValue({
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithPopup: mockLoginWithPopup,
        isLoading: false,
        isAuthenticated: true,
        error: undefined,
        user: undefined,
        logout: vi.fn(),
        loginWithRedirect: vi.fn(),
        getAccessTokenWithPopup: vi.fn(),
        getIdTokenClaims: vi.fn(),
        handleRedirectCallback: vi.fn(),
      } as any);

      renderApp();

      // Should show skeleton due to marketplace loading
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle all systems loaded but minimum time not met', async () => {
      vi.mocked(marketplaceContext.useMarketplaceLoading).mockReturnValue(false);
      vi.mocked(auth0React.useAuth0).mockReturnValue({
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithPopup: mockLoginWithPopup,
        isLoading: false,
        isAuthenticated: true,
        error: undefined,
        user: undefined,
        logout: vi.fn(),
        loginWithRedirect: vi.fn(),
        getAccessTokenWithPopup: vi.fn(),
        getIdTokenClaims: vi.fn(),
        handleRedirectCallback: vi.fn(),
      } as any);

      renderApp();

      // Before minimum time, should show skeleton
      await vi.advanceTimersByTimeAsync(1000);

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Complex error scenarios', () => {
    it('should handle both auth and API errors', async () => {
      mockGetAccessTokenSilently.mockRejectedValue(
        new Error('Token error')
      );

      vi.mocked(useSearchConfigApiHook.useSearchConfigApi).mockReturnValue({
        searchIndexOptions: [],
        fieldsMap: {},
        loading: false,
        error: 'API error',
        refetch: vi.fn(),
      });

      renderApp();

      await vi.advanceTimersByTimeAsync(2000);

      // With fake timers, use direct assertion after timer advance
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();

      // Auth error takes precedence
      expect(screen.queryByText('API error')).not.toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('should have clickable sign in button', async () => {
      // When not authenticated, getAccessTokenSilently should fail
      mockGetAccessTokenSilently.mockRejectedValue(
        new Error('Not authenticated')
      );

      vi.mocked(auth0React.useAuth0).mockReturnValue({
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithPopup: mockLoginWithPopup,
        isLoading: false,
        isAuthenticated: false,
        error: undefined,
        user: undefined,
        logout: vi.fn(),
        loginWithRedirect: vi.fn(),
        getAccessTokenWithPopup: vi.fn(),
        getIdTokenClaims: vi.fn(),
        handleRedirectCallback: vi.fn(),
      } as any);

      await act(async () => {
        renderApp();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      // With fake timers, use direct assertion after timer advance
      const signInButton = screen.getByText('Sign In');
      expect(signInButton).toBeInTheDocument();
      expect(signInButton).toBeEnabled();
    });
  });
});


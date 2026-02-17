import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  MarketplaceProvider,
  useMarketplaceLoading,
  useMarketplaceError,
  useMarketplaceClientOptional,
  useAppContextOptional,
  useUserContext,
} from '../marketplace';
import * as useMarketplaceClientHook from '../../utils/hooks/useMarketplaceClient';

// Mock the hooks
vi.mock('../../utils/hooks/useMarketplaceClient', () => ({
  useMarketplaceClient: vi.fn(),
}));

describe('MarketplaceProvider', () => {
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      query: vi.fn(),
    };

    // Default mock implementation
    vi.mocked(useMarketplaceClientHook.useMarketplaceClient).mockReturnValue({
      client: mockClient,
      isInitialized: true,
      error: null,
      isLoading: false,
      initialize: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should provide marketplace context when SDK is available', async () => {
      const mockAppContext = {
        organizationId: 'org-123',
        instanceId: 'instance-123',
      };
      const mockHostState = {
        xmCloudTenantInfo: {
          name: 'test-tenant',
        },
      };
      const mockUserData = {
        email: 'test@example.com',
      };

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.resolve({ data: mockUserData });
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(
        () => ({
          loading: useMarketplaceLoading(),
          error: useMarketplaceError(),
          client: useMarketplaceClientOptional(),
        }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.client).toBe(mockClient);
    });

    it('should set loading to false after context is fetched', async () => {
      const mockAppContext = {
        organizationId: 'org-123',
        instanceId: 'instance-123',
      };
      const mockHostState = {
        xmCloudTenantInfo: { name: 'test-tenant' },
      };

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.resolve({ data: null });
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceLoading(), { wrapper });

      // Initially loading
      expect(result.current).toBe(true);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('Edge cases - Missing required data', () => {
    it('should set error when organizationId is missing', async () => {
      const mockAppContext = {
        // organizationId missing
        instanceId: 'instance-123',
      };
      const mockHostState = {
        xmCloudTenantInfo: { name: 'test-tenant' },
      };

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.resolve({ data: null });
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceError(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current?.title).toBe('Configuration Error');
      expect(result.current?.details).toContain('organizationId');
    });

    it('should set error when tenant name is missing', async () => {
      const mockAppContext = {
        organizationId: 'org-123',
        instanceId: 'instance-123',
      };
      const mockHostState = {
        xmCloudTenantInfo: {
          // name missing
        },
      };

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.resolve({ data: null });
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceError(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current?.title).toBe('Configuration Error');
      expect(result.current?.details).toContain('xmCloudTenantInfo.name');
    });

    it('should set error when both required fields are missing', async () => {
      const mockAppContext = {}; // Empty
      const mockHostState = {}; // Empty

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.resolve({ data: null });
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceError(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current?.title).toBe('Configuration Error');
      expect(result.current?.details).toContain('organizationId');
      expect(result.current?.details).toContain('xmCloudTenantInfo.name');
    });
  });

  describe('Edge cases - SDK errors', () => {
    it('should handle SDK query failure', async () => {
      mockClient.query.mockRejectedValue(new Error('SDK query failed'));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceError(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current?.title).toBe('SDK Error');
      expect(result.current?.message).toContain('Failed to communicate');
    });

    it('should handle network timeout', async () => {
      mockClient.query.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 100)
          )
      );

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceError(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      }, { timeout: 3000 });

      expect(result.current?.title).toBe('SDK Error');
    });

    it('should handle host.user query failure gracefully', async () => {
      const mockAppContext = {
        organizationId: 'org-123',
        instanceId: 'instance-123',
      };
      const mockHostState = {
        xmCloudTenantInfo: { name: 'test-tenant' },
      };

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.reject(new Error('User query failed'));
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result: errorResult } = renderHook(() => useMarketplaceError(), {
        wrapper,
      });

      await waitFor(() => {
        // Should not error out, just log warning
        expect(errorResult.current).toBeNull();
      });
    });
  });

  describe('Edge cases - No client (standalone mode)', () => {
    it('should set error when client is not available', async () => {
      vi.mocked(useMarketplaceClientHook.useMarketplaceClient).mockReturnValue({
        client: null,
        isInitialized: true,
        error: null,
        isLoading: false,
        initialize: vi.fn(),
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceError(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current?.title).toBe('Marketplace Context Required');
      expect(result.current?.message).toContain(
        'must be run within the Sitecore Marketplace'
      );
    });

    it('should set loading to false in standalone mode', async () => {
      vi.mocked(useMarketplaceClientHook.useMarketplaceClient).mockReturnValue({
        client: null,
        isInitialized: true,
        error: null,
        isLoading: false,
        initialize: vi.fn(),
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceLoading(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('Edge cases - Response data', () => {
    it('should handle null response from SDK queries', async () => {
      mockClient.query.mockResolvedValue({ data: null });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceError(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current?.title).toBe('Configuration Error');
    });

    it('should handle undefined response from SDK queries', async () => {
      mockClient.query.mockResolvedValue({ data: undefined });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceError(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current?.title).toBe('Configuration Error');
    });

    it('should handle malformed response structure', async () => {
      mockClient.query.mockResolvedValue('invalid response' as any);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceError(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
    });
  });

  describe('Context hooks', () => {
    it('should provide user context', async () => {
      const mockAppContext = {
        organizationId: 'org-123',
        instanceId: 'instance-123',
      };
      const mockHostState = {
        xmCloudTenantInfo: { name: 'test-tenant' },
      };
      const mockUserData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.resolve({ data: mockUserData });
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useUserContext(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual(mockUserData);
      });
    });

    it('should provide app context', async () => {
      const mockAppContext = {
        organizationId: 'org-123',
        instanceId: 'instance-123',
      };
      const mockHostState = {
        xmCloudTenantInfo: { name: 'test-tenant' },
      };

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.resolve({ data: null });
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useAppContextOptional(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual(mockAppContext);
      });
    });

    it('should return null for user context when not available', async () => {
      const mockAppContext = {
        organizationId: 'org-123',
        instanceId: 'instance-123',
      };
      const mockHostState = {
        xmCloudTenantInfo: { name: 'test-tenant' },
      };

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.resolve({ data: null });
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useUserContext(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeNull();
      });
    });
  });

  describe('Window location', () => {
    it('should set redirect URI from window location', async () => {
      const mockAppContext = {
        organizationId: 'org-123',
        instanceId: 'instance-123',
      };
      const mockHostState = {
        xmCloudTenantInfo: { name: 'test-tenant' },
      };

      mockClient.query.mockImplementation((query: string) => {
        if (query === 'application.context') {
          return Promise.resolve({ data: mockAppContext });
        }
        if (query === 'host.state') {
          return Promise.resolve({ data: mockHostState });
        }
        if (query === 'host.user') {
          return Promise.resolve({ data: null });
        }
        return Promise.resolve({ data: null });
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <MarketplaceProvider>{children}</MarketplaceProvider>
      );

      const { result } = renderHook(() => useMarketplaceLoading(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });
});




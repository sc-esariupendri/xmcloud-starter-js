import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSearchConfigApi } from '../useSearchConfigApi';
import * as searchConfigApi from '../../search-config-api';

// Mock the search-config-api module
vi.mock('../../search-config-api', () => ({
  fetchSearchConfig: vi.fn(),
  transformToSearchIndexOptions: vi.fn(),
  transformToFieldsMap: vi.fn(),
}));

describe('useSearchConfigApi', () => {
  const mockToken = 'test-token';
  const mockConfigs = [
    {
      id: 'index-1',
      name: 'Index 1',
      fields: [{ name: 'title', displayName: 'Title' }],
    },
  ];
  const mockOptions = [{ value: 'index-1', label: 'Index 1' }];
  const mockFieldsMap = {
    'index-1': [{ id: 'title', label: 'Title' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should fetch and transform data successfully', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockResolvedValue(
        mockConfigs
      );
      vi.mocked(searchConfigApi.transformToSearchIndexOptions).mockReturnValue(
        mockOptions
      );
      vi.mocked(searchConfigApi.transformToFieldsMap).mockReturnValue(
        mockFieldsMap
      );

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      // Initially loading should be true
      expect(result.current.loading).toBe(true);
      expect(result.current.searchIndexOptions).toEqual([]);
      expect(result.current.fieldsMap).toEqual({});
      expect(result.current.error).toBeNull();

      // Wait for the hook to finish
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.searchIndexOptions).toEqual(mockOptions);
      expect(result.current.fieldsMap).toEqual(mockFieldsMap);
      expect(result.current.error).toBeNull();
      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledWith(mockToken);
    });

    it('should provide refetch function', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockResolvedValue(
        mockConfigs
      );
      vi.mocked(searchConfigApi.transformToSearchIndexOptions).mockReturnValue(
        mockOptions
      );
      vi.mocked(searchConfigApi.transformToFieldsMap).mockReturnValue(
        mockFieldsMap
      );

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledTimes(1);

      // Call refetch
      await result.current.refetch();

      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases - No token', () => {
    it('should not fetch when token is null', async () => {
      const { result } = renderHook(() => useSearchConfigApi(null));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('No authentication token available');
      expect(searchConfigApi.fetchSearchConfig).not.toHaveBeenCalled();
    });

    it('should not fetch when token is undefined', async () => {
      const { result } = renderHook(() => useSearchConfigApi(undefined));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('No authentication token available');
      expect(searchConfigApi.fetchSearchConfig).not.toHaveBeenCalled();
    });

    it('should not fetch when token is empty string', async () => {
      const { result } = renderHook(() => useSearchConfigApi(''));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('No authentication token available');
      expect(searchConfigApi.fetchSearchConfig).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases - API errors', () => {
    it('should handle fetch error', async () => {
      const errorMessage = 'Network error';
      vi.mocked(searchConfigApi.fetchSearchConfig).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.searchIndexOptions).toEqual([]);
      expect(result.current.fieldsMap).toEqual({});
    });

    it('should handle authentication error', async () => {
      const errorMessage = 'Authentication failed (401)';
      vi.mocked(searchConfigApi.fetchSearchConfig).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle non-Error rejection', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockRejectedValue(
        'String error'
      );

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch search config');
    });

    it('should handle timeout error', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockRejectedValue(
        new Error('Request timeout')
      );

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Request timeout');
    });
  });

  describe('Edge cases - Invalid response data', () => {
    it('should handle null response from API', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockResolvedValue(
        null as any
      );
      vi.mocked(searchConfigApi.transformToSearchIndexOptions).mockReturnValue(
        []
      );
      vi.mocked(searchConfigApi.transformToFieldsMap).mockReturnValue({});

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.searchIndexOptions).toEqual([]);
      expect(result.current.fieldsMap).toEqual({});
      expect(result.current.error).toBeNull();
    });

    it('should handle empty array response from API', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockResolvedValue([]);
      vi.mocked(searchConfigApi.transformToSearchIndexOptions).mockReturnValue(
        []
      );
      vi.mocked(searchConfigApi.transformToFieldsMap).mockReturnValue({});

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.searchIndexOptions).toEqual([]);
      expect(result.current.fieldsMap).toEqual({});
      expect(result.current.error).toBeNull();
    });

    it('should handle transform function throwing error', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockResolvedValue(
        mockConfigs
      );
      vi.mocked(
        searchConfigApi.transformToSearchIndexOptions
      ).mockImplementation(() => {
        throw new Error('Transform error');
      });

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Transform error');
    });
  });

  describe('Token change behavior', () => {
    it('should refetch when token changes', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockResolvedValue(
        mockConfigs
      );
      vi.mocked(searchConfigApi.transformToSearchIndexOptions).mockReturnValue(
        mockOptions
      );
      vi.mocked(searchConfigApi.transformToFieldsMap).mockReturnValue(
        mockFieldsMap
      );

      const { result, rerender } = renderHook(
        ({ token }: { token: string | null }) => useSearchConfigApi(token),
        { initialProps: { token: mockToken as string | null } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledTimes(1);

      // Change token
      const newToken = 'new-token';
      rerender({ token: newToken });

      await waitFor(() => {
        expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledTimes(2);
      });

      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledWith(newToken);
    });

    it('should not fetch when token changes to null', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockResolvedValue(
        mockConfigs
      );
      vi.mocked(searchConfigApi.transformToSearchIndexOptions).mockReturnValue(
        mockOptions
      );
      vi.mocked(searchConfigApi.transformToFieldsMap).mockReturnValue(
        mockFieldsMap
      );

      const { result, rerender } = renderHook(
        ({ token }: { token: string | null }) => useSearchConfigApi(token),
        { initialProps: { token: mockToken as string | null } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledTimes(1);

      // Change token to null
      rerender({ token: null as string | null });

      // Should not call fetch again
      await waitFor(() => {
        expect(result.current.error).toBe('No authentication token available');
      });

      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledTimes(1);
    });

    it('should fetch when token changes from null to valid', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockResolvedValue(
        mockConfigs
      );
      vi.mocked(searchConfigApi.transformToSearchIndexOptions).mockReturnValue(
        mockOptions
      );
      vi.mocked(searchConfigApi.transformToFieldsMap).mockReturnValue(
        mockFieldsMap
      );

      const { result, rerender } = renderHook(
        ({ token }: { token: string | null }) => useSearchConfigApi(token),
        { initialProps: { token: null as string | null } }
      );

      // Wait for initial state to settle
      await waitFor(() => {
        expect(result.current.error).toBe('No authentication token available');
      });
      expect(searchConfigApi.fetchSearchConfig).not.toHaveBeenCalled();

      // Change token to valid
      rerender({ token: mockToken as string | null });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledTimes(1);
      expect(result.current.searchIndexOptions).toEqual(mockOptions);
    });
  });

  describe('Multiple concurrent requests', () => {
    it('should handle multiple hooks with different tokens', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig).mockResolvedValue(
        mockConfigs
      );
      vi.mocked(searchConfigApi.transformToSearchIndexOptions).mockReturnValue(
        mockOptions
      );
      vi.mocked(searchConfigApi.transformToFieldsMap).mockReturnValue(
        mockFieldsMap
      );

      const { result: result1 } = renderHook(() =>
        useSearchConfigApi('token-1')
      );
      const { result: result2 } = renderHook(() =>
        useSearchConfigApi('token-2')
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
        expect(result2.current.loading).toBe(false);
      });

      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledWith('token-1');
      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledWith('token-2');
      expect(searchConfigApi.fetchSearchConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error recovery', () => {
    it('should recover from error on refetch', async () => {
      vi.mocked(searchConfigApi.fetchSearchConfig)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockConfigs);

      vi.mocked(searchConfigApi.transformToSearchIndexOptions).mockReturnValue(
        mockOptions
      );
      vi.mocked(searchConfigApi.transformToFieldsMap).mockReturnValue(
        mockFieldsMap
      );

      const { result } = renderHook(() => useSearchConfigApi(mockToken));

      // First fetch fails
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');

      // Refetch succeeds
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.searchIndexOptions).toEqual(mockOptions);
    });
  });
});



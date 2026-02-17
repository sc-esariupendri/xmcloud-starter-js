import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSearchConfigApi } from '../useSearchConfigApi';

describe('useSearchConfigApi', () => {
  const mockContextId = 'context-123';
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

  const createMockClient = (queryImpl: (q: string, opts?: any) => Promise<any>) => ({
    query: vi.fn(queryImpl),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should fetch and transform data successfully via SDK', async () => {
      const mockClient = createMockClient((query: string, _opts?: any) => {
        if (query === 'xmc.search.getConfigs') {
          return Promise.resolve({
            data: { data: mockConfigs },
          });
        }
        return Promise.resolve({ data: null });
      });

      const { result } = renderHook(() =>
        useSearchConfigApi(mockClient as any, mockContextId)
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.searchIndexOptions).toEqual([]);
      expect(result.current.fieldsMap).toEqual({});
      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.searchIndexOptions).toEqual(mockOptions);
      expect(result.current.fieldsMap).toEqual(mockFieldsMap);
      expect(result.current.error).toBeNull();
      expect(mockClient.query).toHaveBeenCalledWith('xmc.search.getConfigs', {
        params: { query: { sitecoreContextId: mockContextId } },
      });
    });
  });

  describe('Edge cases - No client or context', () => {
    it('should not fetch when client is null', async () => {
      const { result } = renderHook(() =>
        useSearchConfigApi(null, mockContextId)
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.searchIndexOptions).toEqual([]);
      expect(result.current.fieldsMap).toEqual({});
      expect(result.current.error).toBeNull();
    });

    it('should not fetch when sitecoreContextId is null', async () => {
      const mockClient = createMockClient(() => Promise.resolve({ data: {} }));

      const { result } = renderHook(() =>
        useSearchConfigApi(mockClient as any, null)
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.searchIndexOptions).toEqual([]);
      expect(mockClient.query).not.toHaveBeenCalled();
    });

    it('should not fetch when both client and context are null', async () => {
      const { result } = renderHook(() => useSearchConfigApi(null, null));

      expect(result.current.loading).toBe(false);
      expect(result.current.searchIndexOptions).toEqual([]);
    });
  });

  describe('Edge cases - API errors', () => {
    it('should handle query error', async () => {
      const errorMessage = 'Network error';
      const mockClient = createMockClient(() =>
        Promise.reject(new Error(errorMessage))
      );

      const { result } = renderHook(() =>
        useSearchConfigApi(mockClient as any, mockContextId)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.searchIndexOptions).toEqual([]);
      expect(result.current.fieldsMap).toEqual({});
    });

    it('should handle non-Error rejection', async () => {
      const mockClient = createMockClient(() =>
        Promise.reject('String error')
      );

      const { result } = renderHook(() =>
        useSearchConfigApi(mockClient as any, mockContextId)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('String error');
    });
  });

  describe('Edge cases - Response data', () => {
    it('should handle empty array from SDK', async () => {
      const mockClient = createMockClient(() =>
        Promise.resolve({ data: { data: [] } })
      );

      const { result } = renderHook(() =>
        useSearchConfigApi(mockClient as any, mockContextId)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.searchIndexOptions).toEqual([]);
      expect(result.current.fieldsMap).toEqual({});
      expect(result.current.error).toBeNull();
    });

    it('should handle response where data.data is not array', async () => {
      const mockClient = createMockClient(() =>
        Promise.resolve({ data: { data: null } })
      );

      const { result } = renderHook(() =>
        useSearchConfigApi(mockClient as any, mockContextId)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.searchIndexOptions).toEqual([]);
      expect(result.current.fieldsMap).toEqual({});
    });
  });

  describe('Context change behavior', () => {
    it('should refetch when sitecoreContextId changes', async () => {
      const mockClient = createMockClient((query: string, _opts?: any) => {
        if (query === 'xmc.search.getConfigs') {
          return Promise.resolve({ data: { data: mockConfigs } });
        }
        return Promise.resolve({ data: null });
      });

      const { result, rerender } = renderHook(
        ({
          client,
          contextId,
        }: {
          client: any;
          contextId: string | null;
        }) => useSearchConfigApi(client, contextId),
        {
          initialProps: {
            client: mockClient,
            contextId: mockContextId,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('xmc.search.getConfigs', {
        params: { query: { sitecoreContextId: mockContextId } },
      });

      rerender({ client: mockClient, contextId: 'context-456' });

      await waitFor(() => {
        expect(mockClient.query).toHaveBeenCalledWith('xmc.search.getConfigs', {
          params: { query: { sitecoreContextId: 'context-456' } },
        });
      });

      expect(mockClient.query).toHaveBeenCalledTimes(2);
    });
  });
});

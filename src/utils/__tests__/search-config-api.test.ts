import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  fetchSearchConfig,
  transformToSearchIndexOptions,
  transformToFieldsMap,
  type SearchIndexConfig,
} from '../search-config-api';

describe('search-config-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchSearchConfig', () => {
    const validToken = 'valid-bearer-token';
    const mockResponse: SearchIndexConfig[] = [
      {
        id: 'index-1',
        name: 'Search Index 1',
        description: 'Test index',
        fields: [
          { name: 'title', type: 'text', displayName: 'Title' },
          { name: 'content', type: 'text', displayName: 'Content' },
        ],
      },
    ];

    describe('Basic functionality', () => {
      it('should fetch search config successfully with valid token', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: async () => mockResponse,
          } as Response)
        );

        const result = await fetchSearchConfig(validToken);

        expect(result).toEqual(mockResponse);
        expect(fetch).toHaveBeenCalledWith(
          'https://api-euw-cdpp.sitecorecloud.io/search-config/v1/config',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              authorization: `Bearer ${validToken}`,
            }),
          })
        );
      });

      it('should clean token by removing quotes and whitespace', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: async () => mockResponse,
          } as Response)
        );

        const tokenWithQuotes = '"  token-with-quotes  "';
        await fetchSearchConfig(tokenWithQuotes);

        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              authorization: 'Bearer token-with-quotes',
            }),
          })
        );
      });
    });

    describe('Edge cases - Invalid tokens', () => {
      it('should throw error when token is empty string', async () => {
        await expect(fetchSearchConfig('')).rejects.toThrow(
          'Bearer token is required for API authentication.'
        );
      });

      it('should throw error when token is undefined', async () => {
        await expect(fetchSearchConfig(undefined as any)).rejects.toThrow(
          'Bearer token is required for API authentication.'
        );
      });

      it('should throw error when token is null', async () => {
        await expect(fetchSearchConfig(null as any)).rejects.toThrow(
          'Bearer token is required for API authentication.'
        );
      });

      it('should throw error when token is only whitespace', async () => {
        await expect(fetchSearchConfig('   ')).rejects.toThrow(
          'Invalid bearer token provided.'
        );
      });

      it('should throw error when token is only quotes', async () => {
        await expect(fetchSearchConfig('""')).rejects.toThrow(
          'Invalid bearer token provided.'
        );
      });
    });

    describe('Edge cases - API errors', () => {
      it('should handle 401 unauthorized error', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: async () => 'Invalid token',
          } as Response)
        );

        await expect(fetchSearchConfig(validToken)).rejects.toThrow(
          /Authentication failed \(401\)/
        );
        await expect(fetchSearchConfig(validToken)).rejects.toThrow(
          /Token may be invalid or expired/
        );
      });

      it('should handle 403 forbidden error', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 403,
            statusText: 'Forbidden',
            text: async () => 'Access denied',
          } as Response)
        );

        await expect(fetchSearchConfig(validToken)).rejects.toThrow(
          /Failed to fetch config.*403 Forbidden/
        );
      });

      it('should handle 404 not found error', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            text: async () => 'Endpoint not found',
          } as Response)
        );

        await expect(fetchSearchConfig(validToken)).rejects.toThrow(
          /Failed to fetch config.*404 Not Found/
        );
      });

      it('should handle 500 server error', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            text: async () => 'Server error',
          } as Response)
        );

        await expect(fetchSearchConfig(validToken)).rejects.toThrow(
          /Failed to fetch config.*500 Internal Server Error/
        );
      });

      it('should handle network error (fetch rejection)', async () => {
        global.fetch = vi.fn(() =>
          Promise.reject(new TypeError('Network request failed'))
        );

        await expect(fetchSearchConfig(validToken)).rejects.toThrow(
          'Network request failed'
        );
      });

      it('should handle timeout error', async () => {
        global.fetch = vi.fn(() =>
          Promise.reject(new Error('Request timeout'))
        );

        await expect(fetchSearchConfig(validToken)).rejects.toThrow(
          'Request timeout'
        );
      });
    });

    describe('Edge cases - Response data', () => {
      it('should handle empty response array', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [],
          } as Response)
        );

        const result = await fetchSearchConfig(validToken);
        expect(result).toEqual([]);
      });

      it('should handle null response', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: async () => null,
          } as Response)
        );

        const result = await fetchSearchConfig(validToken);
        expect(result).toBeNull();
      });

      it('should handle malformed JSON response', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: async () => {
              throw new SyntaxError('Unexpected token');
            },
          } as unknown as Response)
        );

        await expect(fetchSearchConfig(validToken)).rejects.toThrow(
          'Unexpected token'
        );
      });

      it('should handle response with missing required fields', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [{ name: 'Index without ID' }],
          } as Response)
        );

        const result = await fetchSearchConfig(validToken);
        expect(result).toEqual([{ name: 'Index without ID' }]);
      });

      it('should handle response with unexpected data types', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ not: 'an array' }),
          } as Response)
        );

        const result = await fetchSearchConfig(validToken);
        expect(result).toEqual({ not: 'an array' });
      });

      it('should handle response with string instead of object', async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: async () => 'string response',
          } as Response)
        );

        const result = await fetchSearchConfig(validToken);
        expect(result).toEqual('string response');
      });
    });
  });

  describe('transformToSearchIndexOptions', () => {
    describe('Basic functionality', () => {
      it('should transform configs to search index options', () => {
        const configs: SearchIndexConfig[] = [
          { id: 'index-1', name: 'Search Index 1' },
          { id: 'index-2', name: 'Search Index 2' },
        ];

        const result = transformToSearchIndexOptions(configs);

        expect(result).toEqual([
          { value: 'index-1', label: 'Search Index 1' },
          { value: 'index-2', label: 'Search Index 2' },
        ]);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty array', () => {
        const result = transformToSearchIndexOptions([]);
        expect(result).toEqual([]);
      });

      it('should handle configs with missing fields', () => {
        const configs: any = [
          { id: 'index-1' },
          { name: 'Index without ID' },
        ];

        const result = transformToSearchIndexOptions(configs);

        expect(result).toEqual([
          { value: 'index-1', label: undefined },
          { value: undefined, label: 'Index without ID' },
        ]);
      });

      it('should handle null config object', () => {
        const configs: any = [null];
        expect(() => transformToSearchIndexOptions(configs)).toThrow();
      });

      it('should handle undefined config object', () => {
        const configs: any = [undefined];
        expect(() => transformToSearchIndexOptions(configs)).toThrow();
      });

      it('should handle config with special characters', () => {
        const configs: SearchIndexConfig[] = [
          { id: 'index-1', name: 'Index with <>&"' },
        ];

        const result = transformToSearchIndexOptions(configs);

        expect(result).toEqual([
          { value: 'index-1', label: 'Index with <>&"' },
        ]);
      });

      it('should handle config with empty strings', () => {
        const configs: SearchIndexConfig[] = [
          { id: '', name: '' },
        ];

        const result = transformToSearchIndexOptions(configs);

        expect(result).toEqual([{ value: '', label: '' }]);
      });
    });
  });

  describe('transformToFieldsMap', () => {
    describe('Basic functionality', () => {
      it('should transform configs to fields map', () => {
        const configs: SearchIndexConfig[] = [
          {
            id: 'index-1',
            name: 'Index 1',
            fields: [
              { name: 'title', displayName: 'Title' },
              { name: 'content', displayName: 'Content' },
            ],
          },
          {
            id: 'index-2',
            name: 'Index 2',
            fields: [{ name: 'description', displayName: 'Description' }],
          },
        ];

        const result = transformToFieldsMap(configs);

        expect(result).toEqual({
          'index-1': [
            { id: 'title', label: 'Title' },
            { id: 'content', label: 'Content' },
          ],
          'index-2': [{ id: 'description', label: 'Description' }],
        });
      });

      it('should use field name as label when displayName is missing', () => {
        const configs: SearchIndexConfig[] = [
          {
            id: 'index-1',
            name: 'Index 1',
            fields: [{ name: 'title' }],
          },
        ];

        const result = transformToFieldsMap(configs);

        expect(result).toEqual({
          'index-1': [{ id: 'title', label: 'title' }],
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle empty configs array', () => {
        const result = transformToFieldsMap([]);
        expect(result).toEqual({});
      });

      it('should skip configs without id', () => {
        const configs: any = [
          {
            name: 'Index without ID',
            fields: [{ name: 'title', displayName: 'Title' }],
          },
        ];

        const result = transformToFieldsMap(configs);
        expect(result).toEqual({});
      });

      it('should skip configs without fields', () => {
        const configs: SearchIndexConfig[] = [
          { id: 'index-1', name: 'Index 1' },
        ];

        const result = transformToFieldsMap(configs);
        expect(result).toEqual({});
      });

      it('should skip configs with empty fields array', () => {
        const configs: SearchIndexConfig[] = [
          { id: 'index-1', name: 'Index 1', fields: [] },
        ];

        const result = transformToFieldsMap(configs);
        expect(result).toEqual({});
      });

      it('should handle configs with null fields', () => {
        const configs: any = [
          { id: 'index-1', name: 'Index 1', fields: null },
        ];

        const result = transformToFieldsMap(configs);
        expect(result).toEqual({});
      });

      it('should handle fields with missing name', () => {
        const configs: any = [
          {
            id: 'index-1',
            name: 'Index 1',
            fields: [{ displayName: 'No Name Field' }],
          },
        ];

        const result = transformToFieldsMap(configs);

        // When name is missing, displayName is used as label
        expect(result).toEqual({
          'index-1': [{ id: undefined, label: 'No Name Field' }],
        });
      });

      it('should handle multiple configs with same id (last wins)', () => {
        const configs: SearchIndexConfig[] = [
          {
            id: 'index-1',
            name: 'Index 1',
            fields: [{ name: 'title', displayName: 'Title' }],
          },
          {
            id: 'index-1',
            name: 'Index 1 Duplicate',
            fields: [{ name: 'content', displayName: 'Content' }],
          },
        ];

        const result = transformToFieldsMap(configs);

        expect(result['index-1']).toEqual([
          { id: 'content', label: 'Content' },
        ]);
      });

      it('should handle fields with empty strings', () => {
        const configs: SearchIndexConfig[] = [
          {
            id: 'index-1',
            name: 'Index 1',
            fields: [{ name: '', displayName: '' }],
          },
        ];

        const result = transformToFieldsMap(configs);

        expect(result).toEqual({
          'index-1': [{ id: '', label: '' }],
        });
      });
    });
  });
});




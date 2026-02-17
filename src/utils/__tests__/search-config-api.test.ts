import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
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




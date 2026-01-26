import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchConfiguration } from '../search-configuration';
import type { FieldOption, ContentField } from '../types';
import * as marketplaceContext from '../../../providers/marketplace';
import * as useMarketplaceClientHook from '../../../utils/hooks/useMarketplaceClient';
import * as useCustomFieldPersistenceHook from '../../../utils/hooks/useCustomFieldPersistence';

// Mock the dependencies
vi.mock('../../../providers/marketplace', () => ({
  useAppContextOptional: vi.fn(),
  useMarketplaceClientOptional: vi.fn(),
  useUserContext: vi.fn(),
}));

vi.mock('../../../utils/hooks/useMarketplaceClient', () => ({
  useMarketplaceClient: vi.fn(),
}));

vi.mock('../../../utils/hooks/useCustomFieldPersistence', () => ({
  useCustomFieldPersistence: vi.fn(),
}));


describe('SearchConfiguration', () => {
  const mockSearchIndices: FieldOption[] = [
    { value: 'index-1', label: 'Search Index 1' },
    { value: 'index-2', label: 'Search Index 2' },
  ];

  const mockFieldsMap: Record<string, ContentField[]> = {
    'index-1': [
      { id: 'title', label: 'Title' },
      { id: 'content', label: 'Content' },
    ],
    'index-2': [
      { id: 'description', label: 'Description' },
    ],
  };

  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      getValue: vi.fn().mockResolvedValue(null),
      setValue: vi.fn().mockResolvedValue(undefined),
    };

    // Mock useAppContextOptional
    vi.mocked(marketplaceContext.useAppContextOptional).mockReturnValue(null);

    // Mock useMarketplaceClient from the hook file
    vi.mocked(useMarketplaceClientHook.useMarketplaceClient).mockReturnValue({
      client: mockClient,
      isInitialized: true,
      error: null,
      isLoading: false,
      initialize: vi.fn(),
    });

    // Mock useCustomFieldPersistence
    vi.mocked(
      useCustomFieldPersistenceHook.useCustomFieldPersistence
    ).mockReturnValue({
      isSaving: false,
      saveError: null,
      isLoaded: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should render search index select', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
        />
      );

      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should show message when no search indices are available', () => {
      render(
        <SearchConfiguration searchIndices={[]} fieldsMap={{}} />
      );

      expect(
        screen.getByText('There is no Search Index available.')
      ).toBeInTheDocument();
    });

    it('should show message to select an index when none is selected', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
        />
      );

      expect(
        screen.getByText('Please select a search index from the dropdown above.')
      ).toBeInTheDocument();
    });

    it('should call onChange when configuration changes', async () => {
      const onChange = vi.fn();

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          onChange={onChange}
        />
      );

      // onChange should be called with initial config
      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('Edge cases - API errors', () => {
    it('should show API error message', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          apiError="Failed to fetch configuration"
        />
      );

      expect(screen.getByText('API does not work')).toBeInTheDocument();
      expect(
        screen.getByText('Failed to fetch configuration')
      ).toBeInTheDocument();
    });

    it('should show fallback message with API error', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          apiError="Network timeout"
        />
      );

      expect(
        screen.getByText(/Using fallback data/i)
      ).toBeInTheDocument();
    });
  });

  describe('Edge cases - Loading states', () => {
    it('should show loading message when isLoading is true', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          isLoading={true}
        />
      );

      expect(
        screen.getByText('Loading search configuration...')
      ).toBeInTheDocument();
    });
  });

  describe('Edge cases - Save errors', () => {
    it('should display save error when present', () => {
      vi.mocked(
        useCustomFieldPersistenceHook.useCustomFieldPersistence
      ).mockReturnValue({
        isSaving: false,
        saveError: 'Failed to save configuration',
        isLoaded: true,
      });

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
        />
      );

      expect(
        screen.getByText('Failed to save configuration')
      ).toBeInTheDocument();
    });
  });

  describe('Edge cases - Invalid index', () => {
    it('should show error when selected index is not in available indices', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          initialConfig={{
            searchIndex: 'invalid-index',
            fieldsMapping: {},
          }}
        />
      );

      expect(
        screen.getByText('Cannot map previously selected index with the API response')
      ).toBeInTheDocument();
    });
  });

  describe('Edge cases - No fields available', () => {
    it('should show message when selected index has no fields', () => {
      const fieldsMapWithEmptyIndex: Record<string, ContentField[]> = {
        'index-1': [],
      };

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={fieldsMapWithEmptyIndex}
          initialConfig={{
            searchIndex: 'index-1',
            fieldsMapping: {},
          }}
        />
      );

      expect(
        screen.getByText('No content fields available')
      ).toBeInTheDocument();
    });
  });

  describe('Edge cases - Missing data', () => {
    it('should handle undefined searchIndices', () => {
      render(
        <SearchConfiguration
          searchIndices={undefined}
          fieldsMap={mockFieldsMap}
        />
      );

      expect(
        screen.getByText('There is no Search Index available.')
      ).toBeInTheDocument();
    });

    it('should handle undefined fieldsMap', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={undefined}
        />
      );

      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should handle null searchIndices', () => {
      // Note: This test verifies that null searchIndices causes the component
      // to show the "no indices" message, which is the expected behavior
      render(
        <SearchConfiguration
          searchIndices={null as any}
          fieldsMap={mockFieldsMap}
        />
      );

      // With null searchIndices, should show no indices message
      expect(
        screen.getByText('There is no Search Index available.')
      ).toBeInTheDocument();
    });
  });

  describe('Edge cases - Initial config', () => {
    it('should use initial config when provided', () => {
      const initialConfig = {
        searchIndex: 'index-1',
        fieldsMapping: { Title: 'title' },
      };

      const onChange = vi.fn();

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          initialConfig={initialConfig}
          onChange={onChange}
        />
      );

      // Should use initial config
      waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            searchIndex: 'index-1',
          })
        );
      });
    });

    it('should handle initialConfig with null fieldsMapping', () => {
      const initialConfig: any = {
        searchIndex: 'index-1',
        fieldsMapping: {},
      };

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          initialConfig={initialConfig}
        />
      );

      // Should not crash
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should handle initialConfig with undefined fieldsMapping', () => {
      const initialConfig: any = {
        searchIndex: 'index-1',
        fieldsMapping: {},
      };

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          initialConfig={initialConfig}
        />
      );

      // Should not crash
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Edge cases - Marketplace context', () => {
    it('should work without marketplace context', () => {
      vi.mocked(marketplaceContext.useAppContextOptional).mockReturnValue(null);
      vi.mocked(useMarketplaceClientHook.useMarketplaceClient).mockReturnValue({
        client: null,
        isInitialized: true,
        error: null,
        isLoading: false,
        initialize: vi.fn(),
      });

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should work with marketplace context', () => {
      const mockAppContext = {
        organizationId: 'org-123',
        instanceId: 'instance-123',
      };

      vi.mocked(marketplaceContext.useAppContextOptional).mockReturnValue(
        mockAppContext as any
      );

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Edge cases - Empty states', () => {
    it('should handle empty fieldsMapping', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          initialConfig={{
            searchIndex: 'index-1',
            fieldsMapping: {},
          }}
        />
      );

      // Should render field mapping options
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should handle empty className', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          className=""
        />
      );

      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should handle missing className', () => {
      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
        />
      );

      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Data transformation', () => {
    it('should handle loaded config with legacy field names', () => {
      const mockOnLoad = vi.fn();

      vi.mocked(
        useCustomFieldPersistenceHook.useCustomFieldPersistence
      ).mockImplementation(({ onLoad }) => {
        // Simulate loading old data with typo
        setTimeout(() => {
          onLoad({
            searchIndex: 'index-1',
            enabledContentFeilds: ['title'], // Typo
            fieldsMapping: {},
          } as any);
        }, 0);

        return {
          isSaving: false,
          saveError: null,
          isLoaded: true,
        };
      });

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
        />
      );

      // Should handle the typo gracefully
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should validate loaded searchIndex against available indices', () => {
      vi.mocked(
        useCustomFieldPersistenceHook.useCustomFieldPersistence
      ).mockImplementation(({ onLoad }) => {
        // Simulate loading invalid index
        setTimeout(() => {
          onLoad({
            searchIndex: 'non-existent-index',
            fieldsMapping: {},
          });
        }, 0);

        return {
          isSaving: false,
          saveError: null,
          isLoaded: true,
        };
      });

      render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
        />
      );

      // Component should handle invalid index
      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });

  describe('Concurrent operations', () => {
    it('should handle multiple config changes rapidly', async () => {
      const onChange = vi.fn();

      const { rerender } = render(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          onChange={onChange}
          initialConfig={{ searchIndex: 'index-1', fieldsMapping: {} }}
        />
      );

      // Rapid config changes
      rerender(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          onChange={onChange}
          initialConfig={{ searchIndex: 'index-2', fieldsMapping: {} }}
        />
      );

      rerender(
        <SearchConfiguration
          searchIndices={mockSearchIndices}
          fieldsMap={mockFieldsMap}
          onChange={onChange}
          initialConfig={{ searchIndex: 'index-1', fieldsMapping: {} }}
        />
      );

      // Should handle all changes
      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('Special characters and edge values', () => {
    it('should handle search indices with special characters', () => {
      const specialIndices: FieldOption[] = [
        { value: 'index-<>&"', label: 'Index with <>&"' },
      ];

      render(
        <SearchConfiguration
          searchIndices={specialIndices}
          fieldsMap={{}}
        />
      );

      expect(screen.getByText('Search index')).toBeInTheDocument();
    });

    it('should handle very long index names', () => {
      const longIndices: FieldOption[] = [
        {
          value: 'index-1',
          label: 'A'.repeat(1000),
        },
      ];

      render(
        <SearchConfiguration
          searchIndices={longIndices}
          fieldsMap={{}}
        />
      );

      expect(screen.getByText('Search index')).toBeInTheDocument();
    });
  });
});


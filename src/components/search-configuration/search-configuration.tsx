import * as React from "react";
import { useAppContextOptional } from "@/providers/marketplace";
import { SearchIndexSelect } from "./search-index-select";
import { FieldMappingCheckbox } from "./field-mapping-checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCustomFieldPersistence, useMarketplaceClient } from "@/utils";

import {
  FIELD_MAPPING_FIELDS,
  DEFAULT_CONFIG,
  transformFieldsMappingToCamelCase,
  transformFieldsMappingToPascalCase,
} from "./constants";

import type { SearchConfigurationProps, SearchConfigState } from "./types";

export function SearchConfiguration({
  searchIndices = [],
  fieldsMap = {},
  initialConfig,
  onChange,
  className,
  apiError,
  isLoading = false,
}: SearchConfigurationProps = {}) {
  // Ensure searchIndices and fieldsMap are always arrays/objects, never null/undefined
  const safeSearchIndices = searchIndices || [];
  const safeFieldsMap = fieldsMap || {};
  // Get Marketplace client and app context for custom field operations
  const { client } = useMarketplaceClient({ autoInit: true });
  const appContext = useAppContextOptional();

  // Initialize state with defaults or initial config
  const [config, setConfig] = React.useState<SearchConfigState>(() => {
    return {
      ...DEFAULT_CONFIG,
      ...initialConfig,
    };
  });

  // Set default search index from API data when available
  React.useEffect(() => {
    // We intentionally do NOT auto-select the first index.
    // The user must explicitly select an index.
    // if (safeSearchIndices.length > 0 && !config.searchIndex) {
    //   setConfig((prev) => ({
    //     ...prev,
    //     searchIndex: safeSearchIndices[0].value,
    //   }));
    // }
  }, [safeSearchIndices, config.searchIndex]);

  // Track last saved time for UI feedback
  const prevIsSavingRef = React.useRef(false);

  // Handle loaded data from custom field
  const handleCustomFieldLoad = React.useCallback(
    (
      loadedConfig: Partial<SearchConfigState> & {
        enabledContentFields?: unknown;
        enabledContentFeilds?: unknown;
      }
    ) => {
      setConfig((prev) => {
        // Remove enabledContentFields and enabledContentFeilds (typo) if they exist in old data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { enabledContentFields, enabledContentFeilds, ...cleanConfig } =
          loadedConfig;

        // Check if loaded searchIndex exists in available indices
        let validatedSearchIndex = cleanConfig.searchIndex;
        if (validatedSearchIndex) {
          const indexExists = safeSearchIndices.some(
            (idx) => idx.value === validatedSearchIndex
          );
          if (!indexExists) {
            console.warn(
              `⚠️ Cannot map previously selected index "${validatedSearchIndex}" with the API response. Available indices:`,
              safeSearchIndices.map((idx) => idx.value)
            );
            // Reset to default or first available index
            validatedSearchIndex =
              safeSearchIndices.length > 0
                ? safeSearchIndices[0].value
                : prev.searchIndex || DEFAULT_CONFIG.searchIndex;
          }
        }

        const loadedFieldsMapping = cleanConfig.fieldsMapping || {};
        const transformedFieldsMapping =
          transformFieldsMappingToPascalCase(loadedFieldsMapping);

        return {
          ...prev,
          ...cleanConfig,
          searchIndex: validatedSearchIndex || prev.searchIndex,
          fieldsMapping: transformedFieldsMapping,
        };
      });
    },
    [safeSearchIndices]
  );

  const cleanConfigForSave = React.useMemo<SearchConfigState>(() => {
    return {
      searchIndex: config.searchIndex,
      fieldsMapping: transformFieldsMappingToCamelCase(config.fieldsMapping),
    };
  }, [config.searchIndex, config.fieldsMapping]);

  // Use custom hook for Sitecore custom field persistence
  const { isSaving, saveError } = useCustomFieldPersistence<SearchConfigState>({
    client,
    data: cleanConfigForSave,
    onLoad: handleCustomFieldLoad,
    debounceMs: 500,
  });

  // Track save state changes
  React.useEffect(() => {
    prevIsSavingRef.current = isSaving;
  }, [isSaving]);

  // Check if selected index exists in available indices
  const isValidIndex = React.useMemo(() => {
    if (!config.searchIndex) return false;
    return safeSearchIndices.some((idx) => idx.value === config.searchIndex);
  }, [config.searchIndex, safeSearchIndices]);

  // Get available fields for the selected search index
  const availableFields = React.useMemo(() => {
    if (!config.searchIndex || !isValidIndex) return [];
    return safeFieldsMap[config.searchIndex] || [];
  }, [config.searchIndex, safeFieldsMap, isValidIndex]);

  // Handlers for UI changes
  const handleSearchIndexChange = React.useCallback((value: string) => {
    setConfig((prev) => {
      const newFieldsMapping: Record<string, string> = {};
      FIELD_MAPPING_FIELDS.forEach((fieldName) => {
        newFieldsMapping[fieldName] = "";
      });

      return {
        ...prev,
        searchIndex: value,
        fieldsMapping: newFieldsMapping,
      };
    });
  }, []);

  const handleFieldToggle = React.useCallback(
    (fieldName: string, checked: boolean) => {
      setConfig((prev) => {
        const newFieldsMapping = { ...prev.fieldsMapping };
        if (checked) {
          // When checked, add to mapping with empty value (user will select)
          if (!newFieldsMapping[fieldName]) {
            newFieldsMapping[fieldName] = "";
          }
        } else {
          // When unchecked, remove from mapping
          delete newFieldsMapping[fieldName];
        }
        return {
          ...prev,
          fieldsMapping: newFieldsMapping,
        };
      });
    },
    []
  );

  const handleMappingChange = React.useCallback(
    (fieldName: string, mappingValue: string) => {
      setConfig((prev) => ({
        ...prev,
        fieldsMapping: {
          ...prev.fieldsMapping,
          [fieldName]: mappingValue,
        },
      }));
    },
    []
  );

  // Notify parent of changes
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    if (onChangeRef.current) {
      onChangeRef.current(config);
    }
  }, [config]);

  return (
    <div className={`w-full space-y-3 ${className || ""}`}>
      {/* Save error message */}
      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-2 text-red-800 dark:text-red-200 text-sm">
          {saveError}
        </div>
      )}

      {/* API Error Fallback */}
      {apiError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-red-800 dark:text-red-200 text-sm">
          <p className="font-medium">API does not work</p>
          <p className="text-xs mt-1 opacity-90">{apiError}</p>
          <p className="text-xs mt-1 opacity-75">
            Using fallback data. Please check your API connection and try again.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-3 text-blue-800 dark:text-blue-200 text-sm">
          <p className="font-medium">Loading search configuration...</p>
        </div>
      )}

      {/* Search Index - Always visible */}
      <SearchIndexSelect
        value={config.searchIndex}
        onValueChange={handleSearchIndexChange}
        options={safeSearchIndices}
      />

      {/* No Indexes Available Fallback */}
      {safeSearchIndices.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-amber-800 dark:text-amber-200 text-sm">
          <p className="font-medium">There is no Search Index available.</p>
          <p className="text-xs mt-1 opacity-90">
            Please go and create your first one.
          </p>
        </div>
      )}

      {/* No Selected Index Fallback */}
      {safeSearchIndices.length > 0 && !config.searchIndex && (
        <Alert variant="warning">
          <AlertDescription>
            Please select a search index from the dropdown above.
          </AlertDescription>
        </Alert>
      )}

      {/* Invalid Index Fallback */}
      {config.searchIndex && !isValidIndex && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-3 text-orange-800 dark:text-orange-200 text-sm">
          <p className="font-medium">
            Cannot map previously selected index with the API response
          </p>
          <p className="text-xs mt-1 opacity-90">
            The selected index &quot;{config.searchIndex}&quot; is not
            available. Please select a valid index.
          </p>
        </div>
      )}

      {/* Field Mappings */}
      {config.searchIndex && isValidIndex && availableFields.length > 0 ? (
        <div className="space-y-4">
          {FIELD_MAPPING_FIELDS.map((fieldName) => {
            const isChecked = fieldName in config.fieldsMapping;
            const mappingValue = config.fieldsMapping[fieldName] || "";

            return (
              <FieldMappingCheckbox
                key={`${config.searchIndex}-${fieldName}`}
                fieldName={fieldName}
                checked={isChecked}
                mappingValue={mappingValue}
                availableFields={availableFields}
                onCheckedChange={(checked) =>
                  handleFieldToggle(fieldName, checked)
                }
                onMappingChange={(value) =>
                  handleMappingChange(fieldName, value)
                }
              />
            );
          })}
        </div>
      ) : config.searchIndex && isValidIndex && availableFields.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800/30 dark:border-gray-700 p-3 text-gray-600 dark:text-gray-400 text-sm">
          <p className="font-medium">No content fields available</p>
          <p className="text-xs mt-1 opacity-90">
            No content fields are configured for the selected search index.
          </p>
        </div>
      ) : null}
    </div>
  );
}

import type { FieldOption, ContentField } from "../components/search-configuration/types";

export interface SearchIndexConfig {
  id: string;
  name: string;
  description?: string;
  fields?: Array<{
    id?: string;
    name: string;
    type?: string;
    displayName?: string;
    description?: string;
  }>;
}

/**
 * Transforms API response to search index options (for dropdown)
 */
export function transformToSearchIndexOptions(
  configs: SearchIndexConfig[]
): FieldOption[] {
  return configs.map((config) => ({
    value: config.id,
    label: config.name,
  }));
}

/**
 * Transforms API response to fields map (index ID -> content fields)
 */
export function transformToFieldsMap(
  configs: SearchIndexConfig[]
): Record<string, ContentField[]> {
  const fieldsMap: Record<string, ContentField[]> = {};

  configs.forEach((config) => {
    if (config.id && config.fields && config.fields.length > 0) {
      fieldsMap[config.id] = config.fields.map((field) => ({
        id: field.name,
        label: field.displayName || field.name,
      }));
    }
  });

  return fieldsMap;
}

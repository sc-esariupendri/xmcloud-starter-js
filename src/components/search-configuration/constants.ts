export const FIELD_MAPPING_FIELDS = [
  "Tags",
  "Images",
  "Description",
  "Title",
  "Type",
  "Link",
] as const;

export type FieldMappingField = (typeof FIELD_MAPPING_FIELDS)[number];

/** Set for O(1) lookup when validating field names in transformFieldsMappingToPascalCase */
export const FIELD_MAPPING_SET = new Set<string>(FIELD_MAPPING_FIELDS);

export const DEFAULT_CONFIG = {
  searchIndex: "", // Will be set from API data
  fieldsMapping: {} as Record<string, string>,
};

/** Shared Tailwind classes for message banners (error, loading, warning, etc.) */
export const MESSAGE_BANNER_CLASSES = {
  error:
    "rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-2 text-red-800 dark:text-red-200 text-sm",
  errorPadded:
    "rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-red-800 dark:text-red-200 text-sm",
  loading:
    "rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-3 text-blue-800 dark:text-blue-200 text-sm",
  warning:
    "rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-amber-800 dark:text-amber-200 text-sm",
  invalid:
    "rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-3 text-orange-800 dark:text-orange-200 text-sm",
  muted:
    "rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800/30 dark:border-gray-700 p-3 text-gray-600 dark:text-gray-400 text-sm",
} as const;

export function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}


export function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function transformFieldsMappingToCamelCase(
  fieldsMapping: Record<string, string>
): Record<string, string> {
  const transformed: Record<string, string> = {};
  for (const [key, value] of Object.entries(fieldsMapping)) {
    transformed[toCamelCase(key)] = value;
  }
  return transformed;
}


export function transformFieldsMappingToPascalCase(
  fieldsMapping: Record<string, string>
): Record<string, string> {
  const transformed: Record<string, string> = {};
  for (const [key, value] of Object.entries(fieldsMapping)) {
    const pascalKey = toPascalCase(key);
    if (FIELD_MAPPING_SET.has(pascalKey)) {
      transformed[pascalKey] = value;
    } else {
      transformed[key] = value;
    }
  }
  return transformed;
}

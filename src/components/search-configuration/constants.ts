export const FIELD_MAPPING_FIELDS = [
  "Tags",
  "Images",
  "Description",
  "Title",
  "Type",
  "Link",
] as const;

export type FieldMappingField = typeof FIELD_MAPPING_FIELDS[number];

export const DEFAULT_CONFIG = {
  searchIndex: "", // Will be set from API data
  fieldsMapping: {} as Record<string, string>,
};

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
    if (FIELD_MAPPING_FIELDS.includes(pascalKey as FieldMappingField)) {
      transformed[pascalKey] = value;
    } else {
      transformed[key] = value;
    }
  }
  return transformed;
}

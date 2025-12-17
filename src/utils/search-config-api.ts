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
 * Fetches search configuration from the API
 * @param token - Required bearer token from OAuth authentication.
 */
export async function fetchSearchConfig(
  token: string
): Promise<SearchIndexConfig[]> {
  if (!token) {
    throw new Error("Bearer token is required for API authentication.");
  }

  // Clean the token - remove any quotes and whitespace
  const bearerToken = token.replace(/^["']|["']$/g, "").trim();

  if (!bearerToken) {
    throw new Error("Invalid bearer token provided.");
  }

  // Debug log in development
  // if (process.env.NODE_ENV === "development") {
  //   console.log("🔐 Making API request with token:", bearerToken.substring(0, 20) + "...");
  // }

  const response = await fetch(
    "https://api-euw-cdpp.sitecorecloud.io/search-config/v1/config",
    {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7",
        authorization: `Bearer ${bearerToken}`,
        referer: "https://searchconfig-staging.sitecore-staging.cloud/",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
    }
  );

  if (!response.ok) {
    // Get error details from response if available
    let errorDetails = `${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.text();
      if (errorBody) {
        errorDetails += ` - ${errorBody.substring(0, 200)}`;
      }
    } catch {
      // Ignore parsing errors
    }

    // Check if it's an auth error
    if (response.status === 401) {
      throw new Error(
        `Authentication failed (401): Token may be invalid or expired. ${errorDetails}`
      );
    }

    throw new Error(`Failed to fetch config: ${errorDetails}`);
  }

  return response.json();
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


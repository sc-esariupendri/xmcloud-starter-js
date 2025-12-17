import * as React from "react";
import {
  fetchSearchConfig,
  transformToSearchIndexOptions,
  transformToFieldsMap,
} from "../../utils";
import type {
  FieldOption,
  ContentField,
} from "../../components/search-configuration/types";

interface UseSearchConfigApiReturn {
  searchIndexOptions: FieldOption[];
  fieldsMap: Record<string, ContentField[]>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch search configuration from API
 */
export function useSearchConfigApi(
  token: string | null | undefined
): UseSearchConfigApiReturn {
  const [searchIndexOptions, setSearchIndexOptions] = React.useState<
    FieldOption[]
  >([]);
  const [fieldsMap, setFieldsMap] = React.useState<
    Record<string, ContentField[]>
  >({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    // Only fetch if we have a token from OAuth
    if (!token) {
      setError("No authentication token available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the OAuth token to fetch search config
      const configs = await fetchSearchConfig(token);
      const options = transformToSearchIndexOptions(configs);
      const map = transformToFieldsMap(configs);

      setSearchIndexOptions(options);
      setFieldsMap(map);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch search config";
      setError(errorMessage);
      console.error("Error fetching search config:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    // Only fetch when we have a token from OAuth
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  return {
    searchIndexOptions,
    fieldsMap,
    loading,
    error,
    refetch: fetchData,
  };
}


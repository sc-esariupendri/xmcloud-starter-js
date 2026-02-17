import { useCallback, useEffect, useState } from "react";
import type { ClientSDK } from "@sitecore-marketplace-sdk/client";
import {
  type SearchIndexConfig,
  transformToSearchIndexOptions,
  transformToFieldsMap,
} from "../search-config-api";

export interface UseSearchConfigApiResult {
  searchIndexOptions: ReturnType<typeof transformToSearchIndexOptions>;
  fieldsMap: ReturnType<typeof transformToFieldsMap>;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches search configuration via the Sitecore Marketplace SDK (xmc.search.getConfigs).
 * Uses the SDK client so auth and context are handled by the marketplace.
 *
 * @param client - Marketplace ClientSDK instance (from useMarketplaceClient / MarketplaceProvider).
 * @param sitecoreContextId - Sitecore context ID from application context (e.g. appContext?.id).
 */
export function useSearchConfigApi(
  client: ClientSDK | null,
  sitecoreContextId: string | null
): UseSearchConfigApiResult {
  const [configs, setConfigs] = useState<SearchIndexConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!client || !sitecoreContextId) {
      setLoading(false);
      setConfigs([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await client.query("xmc.search.getConfigs", {
        params: {
          query: {
            sitecoreContextId,
          },
        },
      });


      const data = response?.data?.data;
      const list = Array.isArray(data) ? data : [];
      setConfigs(list as SearchIndexConfig[]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      setError(message);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, [client, sitecoreContextId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const searchIndexOptions = transformToSearchIndexOptions(configs);
  const fieldsMap = transformToFieldsMap(configs);

  return {
    searchIndexOptions,
    fieldsMap,
    loading,
    error: error ?? null,
  };
}
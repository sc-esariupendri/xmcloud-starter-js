import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  SearchConfiguration,
  SearchConfigSkeleton,
} from "@/components/search-configuration";
import { useSearchConfigApi } from "@/utils";
import {
  MarketplaceProvider,
  useMarketplaceLoading,
  useMarketplaceError,
  useAppContextOptional,
  useMarketplaceClientOptional,
} from "@/providers/marketplace";
import { MarketplaceErrorScreen } from "@/app/MarketplaceErrorScreen";
import {
  MIN_LOADING_DELAY_MS,
  CONTENT_LAYOUT_CLASS,
  APP_MESSAGES,
} from "@/app/constants";

function SearchApp() {
  const isMarketplaceLoading = useMarketplaceLoading();
  const marketplaceError = useMarketplaceError();
  const appContext = useAppContextOptional();
  const client = useMarketplaceClientOptional();
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  // Sitecore context ID for search config (used by xmc.search.getConfigs)
  // Prefer resourceAccess[0].context.live, fallback to resource[0].context.live, else null
  const sitecoreContextId = appContext?.resourceAccess?.[0]?.context.live ?? appContext?.resources?.[0]?.context.live ?? null;

  const {
    searchIndexOptions,
    fieldsMap,
    loading: apiLoading,
    error: apiError,
  } = useSearchConfigApi(client, sitecoreContextId);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingComplete(true), MIN_LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (marketplaceError) {
    return <MarketplaceErrorScreen error={marketplaceError} />;
  }

  const shouldShowSkeleton =
    isMarketplaceLoading || !minLoadingComplete || apiLoading;
  if (shouldShowSkeleton) {
    return (
      <div className={CONTENT_LAYOUT_CLASS}>
        <SearchConfigSkeleton />
      </div>
    );
  }

  if (apiError) {
    return (
      <div className={`${CONTENT_LAYOUT_CLASS} flex flex-col items-center justify-center space-y-4`}>
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-red-600">
            {APP_MESSAGES.searchConfigErrorTitle}
          </h3>
          <p className="text-sm text-gray-500 mt-2">{apiError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={CONTENT_LAYOUT_CLASS}>
      <SearchConfiguration
        searchIndices={searchIndexOptions}
        fieldsMap={fieldsMap}
      />
    </div>
  );
}

function App() {
  return (
    <MarketplaceProvider>
      <Routes>
        <Route path="/" element={<SearchApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MarketplaceProvider>
  );
}

export default App;

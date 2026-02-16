import * as React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { 
  SearchConfiguration, 
  SearchConfigSkeleton 
} from "@/components/search-configuration";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useSearchConfigApi } from "@/utils";
import { MarketplaceProvider, useMarketplaceLoading, useMarketplaceError } from "@/providers/marketplace";

function SearchApp() {
  const { getAccessTokenSilently, loginWithPopup, isLoading: authLoading, isAuthenticated, error: authError } = useAuth0();
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const isMarketplaceLoading = useMarketplaceLoading();
  const marketplaceError = useMarketplaceError();
  const [isInitializing, setIsInitializing] = useState(true);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  // Fetch search config from API using the token
  const {
    searchIndexOptions,
    fieldsMap,
    loading: apiLoading,
    error: apiError,
  } = useSearchConfigApi(token);

  // Minimum loading time to prevent flash (2 seconds)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Check token expiration if token exists
  React.useEffect(() => {
    // Don't run if Auth0 is still loading
    if (authLoading) {
      return;
    }

    // Don't try to get token if already have one
    if (token) {
      setIsInitializing(false);
      return;
    }

    (async () => {
      try {
        const apiToken = await getAccessTokenSilently();
        setToken(apiToken);
        setTokenError(null);
        setIsInitializing(false);
      } catch (error) {
        console.error("Failed to get access token:", error);
        setTokenError("Failed to retrieve access token. Interaction required.");
        setIsInitializing(false);
      }
    })();
  }, [authLoading, getAccessTokenSilently, token]);

  const handleLogin = () => {
    loginWithPopup();
  };

  // Show marketplace error if it exists
  if (marketplaceError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {marketplaceError.title}
          </h2>
          <p className="text-gray-600 text-center mb-4">
            {marketplaceError.message}
          </p>
          {marketplaceError.details && (
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <p className="text-sm text-gray-700 font-mono break-words">
                {marketplaceError.details}
              </p>
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              If this problem persists, please contact your system administrator or check the browser console for more details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine if we should show skeleton
  const shouldShowSkeleton = 
    isMarketplaceLoading || 
    !minLoadingComplete || 
    isInitializing || 
    authLoading || 
    (!token && !tokenError && isAuthenticated);

  // Show skeleton during all loading states
  if (shouldShowSkeleton) {
    return (
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
         <SearchConfigSkeleton />
      </div>
    );
  }

  // Only show sign-in UI if ALL loading is complete AND there's an error OR user is not authenticated
  if (!token && (tokenError || !isAuthenticated)) {
    return (
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-4">
        <div className="text-center">
           <h3 className="text-lg font-medium text-red-600">Authentication Required</h3>
           <p className="text-sm text-gray-500 mt-2">
             {tokenError || "Please sign in to access the configuration."}
           </p>
           {authError && (
             <p className="text-xs text-red-500 mt-1">{authError.message}</p>
           )}
        </div>
        <button
          onClick={handleLogin}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (apiLoading) {
    return (
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <SearchConfigSkeleton />
      </div>
    );
  }

  if (apiError) {
    const isUnavailable =
      apiError.includes("returned no data") ||
      apiError.includes("Search configuration is not available") ||
      apiError.includes("search client key");
    const isBadRequest = apiError.startsWith("Bad request (400):");

    return (
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-4">
        <div className="text-center max-w-md">
          <h3
            className={
              isUnavailable || isBadRequest
                ? "text-lg font-medium text-amber-600"
                : "text-lg font-medium text-red-600"
            }
          >
            {isUnavailable || isBadRequest
              ? "Search config unavailable"
              : "Unable to load search config"}
          </h3>
          <p className="text-sm text-gray-500 mt-2">{apiError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
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


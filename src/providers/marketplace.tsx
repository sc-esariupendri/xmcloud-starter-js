import React, { useEffect, useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import type { ApplicationContext } from "@sitecore-marketplace-sdk/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { useMarketplaceClient as useMarketplaceClientHook } from "../utils/hooks/useMarketplaceClient";

interface ClientSDKProviderProps {
  children: ReactNode;
}

const ClientSDKContext = createContext<ClientSDK | null>(null);
const AppContextContext = createContext<ApplicationContext | null>(null);
const UserContextContext = createContext<any | null>(null);
const MarketplaceLoadingContext = createContext<boolean>(true);
const MarketplaceErrorContext = createContext<{
  title: string;
  message: string;
  details?: string;
} | null>(null);

export const MarketplaceProvider: React.FC<ClientSDKProviderProps> = ({
  children,
}) => {
  const [redirectUri, setRedirectUri] = useState<string | null>(null);
  const { client, isInitialized } = useMarketplaceClientHook();
  const [appContext, setAppContext] = useState<ApplicationContext | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [authConfig, setAuthConfig] = useState<{
    organization_id: string;
    tenant_name: string;
  } | null>(null);
  const [error, setError] = useState<{
    title: string;
    message: string;
    details?: string;
  } | null>(null);
  const [isMarketplaceLoading, setIsMarketplaceLoading] =
    useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectUri(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (client) {
      const fetchContext = async () => {
        try {
          const [appContextRes, hostStateRes, hostUserRes] = await Promise.all([
            client.query("application.context"),
            client.query("host.state"),
            client.query("host.user").catch((err) => {
              console.warn("Failed to fetch host.user:", err);
              return { data: null };
            }),
          ]);

          const appContextData = appContextRes?.data;
          const hostState = hostStateRes?.data;
          const userData = hostUserRes?.data;

          if (appContextData) {
            setAppContext(appContextData);
          }

          if (userData) {
            setUserInfo(userData);
          }

          if (
            appContextData?.organizationId &&
            hostState?.xmCloudTenantInfo?.name
          ) {
            setAuthConfig({
              organization_id: appContextData.organizationId,
              tenant_name: hostState.xmCloudTenantInfo.name,
            });
            setError(null); // Clear any previous errors
            setIsMarketplaceLoading(false); // Marketplace ready
          } else {
            const missingFields = [];
            if (!appContextData?.organizationId)
              missingFields.push("organizationId");
            if (!hostState?.xmCloudTenantInfo?.name)
              missingFields.push("xmCloudTenantInfo.name");

            console.error("⚠️ Missing required data from SDK:", missingFields);
            setError({
              title: "Configuration Error",
              message:
                "Unable to retrieve required Sitecore Marketplace context.",
              details: `Missing fields: ${missingFields.join(
                ", "
              )}. Please ensure the app is properly configured in the Marketplace.`,
            });
            setIsMarketplaceLoading(false); // Stop loading even on error
          }
        } catch (error) {
          console.error("❌ Failed to fetch Marketplace context:", error);
          setError({
            title: "SDK Error",
            message: "Failed to communicate with Sitecore Marketplace SDK.",
            details: error instanceof Error ? error.message : String(error),
          });
          setIsMarketplaceLoading(false); // Stop loading even on error
        }
      };

      fetchContext();
    } else if (isInitialized && !client) {
      console.warn(
        "ℹ️ Standalone mode detected - app requires Marketplace context to function"
      );
      setError({
        title: "Marketplace Context Required",
        message: "This app must be run within the Sitecore Marketplace.",
        details:
          "The app cannot operate in standalone mode. Please access it through your Sitecore XM Cloud instance.",
      });
      setIsMarketplaceLoading(false); // Stop loading even on error
    }
  }, [client, isInitialized]);

  // If we have authConfig, render with Auth0Provider
  // Otherwise, render without it (but still provide contexts)
  if (redirectUri && authConfig) {
    return (
      <Auth0Provider
        domain="https://auth.sitecorecloud.io"
        clientId="fNgQatuiFS87Luw7BhkfKIzNOqHFU6UN"
        authorizationParams={{
          redirect_uri: redirectUri,
          scope: "openid profile email offline_access",
          audience: "https://api-webapp.sitecorecloud.io",
          system_id: "5907637C-CDDF-48E9-ACEF-BD06F1A6BAB8",
          organization_id: authConfig.organization_id,
          tenant_name: authConfig.tenant_name,
          auth0Client:
            "eyJuYW1lIjoiYXV0aDAtcmVhY3QiLCJ2ZXJzaW9uIjoiMi41LjAifQ==",
        }}
      >
        <MarketplaceLoadingContext.Provider value={isMarketplaceLoading}>
          <MarketplaceErrorContext.Provider value={error}>
            <ClientSDKContext.Provider value={client}>
              <AppContextContext.Provider value={appContext}>
                <UserContextContext.Provider value={userInfo}>
                  {children}
                </UserContextContext.Provider>
              </AppContextContext.Provider>
            </ClientSDKContext.Provider>
          </MarketplaceErrorContext.Provider>
        </MarketplaceLoadingContext.Provider>
      </Auth0Provider>
    );
  }

  // Still initializing or have error - render without Auth0Provider
  // Let the children (App.tsx) handle the loading/error UI
  return (
    <MarketplaceLoadingContext.Provider value={isMarketplaceLoading}>
      <MarketplaceErrorContext.Provider value={error}>
        <ClientSDKContext.Provider value={client}>
          <AppContextContext.Provider value={appContext}>
            <UserContextContext.Provider value={userInfo}>
              {children}
            </UserContextContext.Provider>
          </AppContextContext.Provider>
        </ClientSDKContext.Provider>
      </MarketplaceErrorContext.Provider>
    </MarketplaceLoadingContext.Provider>
  );
};

export const useMarketplaceClient = () => {
  const context = useContext(ClientSDKContext);
  if (!context) {
    throw new Error(
      "useMarketplaceClient must be used within a ClientSDKProvider"
    );
  }
  return context;
};

export const useAppContext = () => {
  const context = useContext(AppContextContext);
  if (!context) {
    throw new Error("useAppContext must be used within a ClientSDKProvider");
  }
  return context;
};

export const useMarketplaceClientOptional = () => {
  return useContext(ClientSDKContext);
};

export const useUserContext = () => {
  return useContext(UserContextContext);
};

export const useAppContextOptional = () => {
  return useContext(AppContextContext);
};

export const useMarketplaceLoading = () => {
  return useContext(MarketplaceLoadingContext);
};

export const useMarketplaceError = () => {
  return useContext(MarketplaceErrorContext);
};

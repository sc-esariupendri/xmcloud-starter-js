import React, {
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import type { ReactNode } from "react";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import type { ApplicationContext } from "@sitecore-marketplace-sdk/client";
import { useMarketplaceClient as useMarketplaceClientHook } from "../utils/hooks/useMarketplaceClient";
import type { MarketplaceError, UserInfo } from "./marketplace-types";
import {
  ERROR_CONFIGURATION,
  ERROR_SDK,
  ERROR_MARKETPLACE_REQUIRED,
  getConfigurationErrorDetails,
} from "./marketplace-constants";

interface ClientSDKProviderProps {
  children: ReactNode;
}

const ClientSDKContext = createContext<ClientSDK | null>(null);
const AppContextContext = createContext<ApplicationContext | null>(null);
const UserContextContext = createContext<UserInfo>(null);
const MarketplaceLoadingContext = createContext<boolean>(true);
const MarketplaceErrorContext = createContext<MarketplaceError | null>(null);

export const MarketplaceProvider: React.FC<ClientSDKProviderProps> = ({
  children,
}) => {
  const { client, isInitialized } = useMarketplaceClientHook();
  const [appContext, setAppContext] = useState<ApplicationContext | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [error, setError] = useState<MarketplaceError | null>(null);
  const [isMarketplaceLoading, setIsMarketplaceLoading] = useState<boolean>(true);

  useEffect(() => {
    if (client) {
      const fetchContext = async () => {
        try {
          const [appContextRes, hostStateRes, hostUserRes] = await Promise.all([
            client.query("application.context"),
            client.query("host.state"),
            client.query("host.user").catch((_err) => {
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
            setUserInfo(userData as unknown as UserInfo);
          }

          if (appContextData?.organizationId && hostState?.xmCloudTenantInfo?.name) {
            setError(null);
            setIsMarketplaceLoading(false);
          } else {
            const missingFields = [];
            if (!appContextData?.organizationId) {
              missingFields.push("organizationId");
            }
            if (!hostState?.xmCloudTenantInfo?.name)
            { 
              missingFields.push("xmCloudTenantInfo.name");
            }

            setError({
              ...ERROR_CONFIGURATION,
              details: getConfigurationErrorDetails(missingFields),
            });
            setIsMarketplaceLoading(false);
          }
        } catch (err) {
          setError({
            ...ERROR_SDK,
            details: err instanceof Error ? err.message : String(err),
          });
          setIsMarketplaceLoading(false);
        }
      };

      fetchContext();
    }
  }, [client, isInitialized]);

  // When SDK is initialized but no client (e.g. not in marketplace), set error after commit
  useEffect(() => {
    if (isInitialized && !client) {
      setError(ERROR_MARKETPLACE_REQUIRED);
      setIsMarketplaceLoading(false);
    }
  }, [isInitialized, client]);

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

export type { MarketplaceError, UserInfo } from "./marketplace-types";
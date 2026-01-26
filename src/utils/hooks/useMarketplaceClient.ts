import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { XMC } from "@sitecore-marketplace-sdk/xmc";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";

export interface MarketplaceClientState {
  client: ClientSDK | null;
  error: Error | null;
  isLoading: boolean;
  isInitialized: boolean;
}

export interface UseMarketplaceClientOptions {
  retryAttempts?: number;
  retryDelay?: number;
  autoInit?: boolean;
  timeout?: number;
}

const DEFAULT_OPTIONS: Required<UseMarketplaceClientOptions> = {
  retryAttempts: 1,
  retryDelay: 500,
  autoInit: true,
  timeout: 2000,
};

let client: ClientSDK | undefined = undefined;
let initializationPromise: Promise<ClientSDK> | null = null;

// Test-only function to reset module state
export function __resetModuleState() {
  client = undefined;
  initializationPromise = null;
}

function isInMarketplaceContext(): boolean {
  try {
    if (typeof window === "undefined") return false;

    const isInIframe = window.self !== window.top;
    const hasParent = window.parent && window.parent !== window;

    if (!isInIframe && !hasParent) {
      return false;
    }

    try {
      const parentOrigin = document.referrer;
      if (
        parentOrigin &&
        (parentOrigin.includes("sitecorecloud.io") ||
          parentOrigin.includes("marketplace") ||
          parentOrigin.includes("sitecore"))
      ) {
        return true;
      }
    } catch (e) {
      // Silently handle parent origin check errors
    }

    return isInIframe;
  } catch {
    return false;
  }
}

async function getMarketplaceClient(timeout: number): Promise<ClientSDK> {
  if (client) {
    return client;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  if (!isInMarketplaceContext()) {
    throw new Error("Not in Marketplace context");
  }

  initializationPromise = Promise.race([
    ClientSDK.init({ target: window.parent, modules: [XMC] }),
    new Promise<ClientSDK>((_, reject) =>
      setTimeout(
        () => reject(new Error("Client initialization timed out")),
        timeout
      )
    ),
  ]);

  try {
    client = await initializationPromise;
    return client;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
}

export function useMarketplaceClient(
  options: UseMarketplaceClientOptions = {}
) {
  const opts = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [
      options.retryAttempts,
      options.retryDelay,
      options.autoInit,
      options.timeout,
    ]
  );

  const [state, setState] = useState<MarketplaceClientState>({
    client: null,
    error: null,
    isLoading: false,
    isInitialized: false,
  });

  const isInitializingRef = useRef(false);
  const hasAttemptedRef = useRef(false);

  const initializeClient = useCallback(
    async (attempt = 1): Promise<void> => {
      let shouldProceed = false;
      setState((prev) => {
        // Allow retry attempts (attempt > 1) to proceed even if isLoading is true
        if (prev.isInitialized || (attempt === 1 && isInitializingRef.current)) {
          return prev;
        }
        shouldProceed = true;
        isInitializingRef.current = true;
        return { ...prev, isLoading: true, error: null };
      });

      if (!shouldProceed) return;

      if (!isInMarketplaceContext()) {
        setState({
          client: null,
          error: null,
          isLoading: false,
          isInitialized: true,
        });
        isInitializingRef.current = false;
        hasAttemptedRef.current = true;
        return;
      }

      try {
        const client = await getMarketplaceClient(opts.timeout);
        setState({
          client,
          error: null,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("Not in Marketplace context")) {
          setState({
            client: null,
            error: null,
            isLoading: false,
            isInitialized: true,
          });
        } else if (attempt < opts.retryAttempts) {
          // Reset flags and state before retry to allow the recursive call to proceed
          isInitializingRef.current = false;
          setState((prev) => ({ ...prev, isLoading: false }));
          await new Promise((resolve) => setTimeout(resolve, opts.retryDelay));
          return initializeClient(attempt + 1);
        } else {
          console.warn(
            "Could not initialize Marketplace client:",
            errorMessage
          );
          setState({
            client: null,
            error: null,
            isLoading: false,
            isInitialized: true,
          });
        }
      } finally {
        isInitializingRef.current = false;
        hasAttemptedRef.current = true;
      }
    },
    [opts.retryAttempts, opts.retryDelay, opts.timeout]
  );

  useEffect(() => {
    if (opts.autoInit && !hasAttemptedRef.current) {
      initializeClient();
    }

    return () => {
      isInitializingRef.current = false;
    };
  }, [opts.autoInit, initializeClient]);

  return useMemo(
    () => ({
      ...state,
      initialize: initializeClient,
    }),
    [state, initializeClient]
  );
}

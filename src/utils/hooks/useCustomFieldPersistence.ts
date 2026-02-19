import { useEffect, useRef, useState } from "react";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";

interface CustomFieldClient extends ClientSDK {
  getValue: () => Promise<string | Record<string, unknown> | null>;
  setValue: (value: string, canvasReload: boolean) => Promise<void>;
}

interface UseCustomFieldPersistenceProps<T> {
  client: ClientSDK | null;
  data: T;
  onLoad: (loadedData: Partial<T>) => void;
  debounceMs?: number;
}

interface UseCustomFieldPersistenceReturn {
  isSaving: boolean;
  saveError: string | null;
  isLoaded: boolean;
}

/** Delay (ms) after initial load before allowing writes, so the client is ready. */
const CLIENT_READY_DELAY_MS = 300;

function isCustomFieldClient(
  client: ClientSDK | null
): client is CustomFieldClient {
  return client !== null && "getValue" in client && "setValue" in client;
}

export function useCustomFieldPersistence<T>({
  client,
  data,
  onLoad,
  debounceMs = 500,
}: UseCustomFieldPersistenceProps<T>): UseCustomFieldPersistenceReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const clientReadyRef = useRef(false);
  const lastSavedDataRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isCustomFieldClient(client)) {
      return;
    }

    const fetchValue = async () => {
      try {
        const latest = await client.getValue();

        if (latest) {
          let parsedData: Partial<T> | undefined;

          if (typeof latest === "string") {
            try {
              parsedData = JSON.parse(latest) as Partial<T>;
            } catch {
              setIsLoaded(true);
              return;
            }
          } else if (typeof latest === "object" && latest !== null) {
            parsedData = latest as Partial<T>;
          }

          if (parsedData) {
            onLoad(parsedData);
          }
        }
      } catch {
        // Custom field methods may not be available if extension point is not enabled
      } finally {
        isInitialLoadRef.current = false;
        setIsLoaded(true);
        // Wait a bit after load to ensure client is fully ready for writes
        setTimeout(() => {
          clientReadyRef.current = true;
        }, CLIENT_READY_DELAY_MS);
      }
    };

    fetchValue();
  }, [client, onLoad]);

  useEffect(() => {
    if (
      isInitialLoadRef.current ||
      !isCustomFieldClient(client) ||
      !clientReadyRef.current
    )
      return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setSaveError(null);

        // Use compact JSON (no pretty printing) to reduce size
        const jsonData = JSON.stringify(data);

        // Skip if data hasn't changed
        if (lastSavedDataRef.current === jsonData) {
          setIsSaving(false);
          return;
        }

        // Try to save with a single retry on timeout
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            await client.setValue(jsonData, false);
            lastSavedDataRef.current = jsonData;
            setIsSaving(false);
            return;
          } catch (err: unknown) {
            lastError = err instanceof Error ? err : new Error(String(err));
            const errorMessage = lastError.message;

            // Don't retry on "not implemented" errors
            if (errorMessage?.includes("not implemented")) {
              throw lastError;
            }

            // Only retry on timeout errors
            if (errorMessage?.includes("timed out") && attempt < 2) {
              // Wait a bit before retry
              await new Promise((resolve) => setTimeout(resolve, 500));
              continue;
            }

            throw lastError;
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage?.includes("not implemented")) {
          setIsSaving(false);
        } else {
          setSaveError(`Failed to save: ${errorMessage || "Unknown error"}`);
          setIsSaving(false);
        }
      }
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, client, debounceMs]);

  return {
    isSaving,
    saveError,
    isLoaded,
  };
}

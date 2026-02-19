import type { MarketplaceError } from "@/providers/marketplace";
import { APP_MESSAGES } from "./constants";

interface MarketplaceErrorScreenProps {
  error: MarketplaceError;
}

/** Full-page screen shown when marketplace context is invalid or unavailable */
export function MarketplaceErrorScreen({ error }: MarketplaceErrorScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          {error.title}
        </h2>
        <p className="text-gray-600 text-center mb-4">{error.message}</p>
        {error.details && (
          <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
            <p className="text-sm text-gray-700 font-mono break-words">
              {error.details}
            </p>
          </div>
        )}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {APP_MESSAGES.errorFooter}
          </p>
        </div>
      </div>
    </div>
  );
}

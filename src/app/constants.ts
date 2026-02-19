/** Minimum time (ms) to show loading skeleton to prevent flash */
export const MIN_LOADING_DELAY_MS = 2000;

/** Layout class for main content area (search config and skeleton) */
export const CONTENT_LAYOUT_CLASS = "w-full px-4 py-6 sm:px-6 lg:px-8";

/** User-facing copy for App-level screens */
export const APP_MESSAGES = {
  searchConfigErrorTitle: "Search configuration error",
  errorFooter:
    "If this problem persists, please contact your system administrator or check the browser console for more details.",
} as const;

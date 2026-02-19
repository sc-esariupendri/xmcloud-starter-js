import type { MarketplaceError } from "./marketplace-types";

export const ERROR_CONFIGURATION: Omit<MarketplaceError, "details"> = {
  title: "Configuration Error",
  message: "Unable to retrieve required Sitecore Marketplace context.",
};

export const ERROR_SDK: Omit<MarketplaceError, "details"> = {
  title: "SDK Error",
  message: "Failed to communicate with Sitecore Marketplace SDK.",
};

export const ERROR_MARKETPLACE_REQUIRED: MarketplaceError = {
  title: "Marketplace Context Required",
  message: "This app must be run within the Sitecore Marketplace.",
  details:
    "The app cannot operate in standalone mode. Please access it through your Sitecore XM Cloud instance.",
};

export function getConfigurationErrorDetails(missingFields: string[]): string {
  return `Missing fields: ${missingFields.join(", ")}. Please ensure the app is properly configured in the Marketplace.`;
}

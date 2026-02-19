/** Error state exposed by the marketplace provider */
export interface MarketplaceError {
  title: string;
  message: string;
  details?: string;
}

/** User info returned from host.user query; shape is host-defined */
export type UserInfo = Record<string, unknown> | null;

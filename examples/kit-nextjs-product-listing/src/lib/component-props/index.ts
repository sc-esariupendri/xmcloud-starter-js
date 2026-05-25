import {
  ComponentParams,
  ComponentRendering,
  Field,
  ImageField,
  LinkField,
  Page,
  RichTextField,
} from '@sitecore-content-sdk/nextjs';

export type ComponentProps = {
  rendering: ComponentRendering;
  params: ComponentParams & {
    RenderingIdentifier?: string;
    styles?: string;
    EnabledPlaceholders?: string;
  };
  page: Page;
};

export type ComponentWithContextProps = ComponentProps & {
  page: Page;
};

export type GraphQLField<T> = {
  jsonValue: T;
};

export type GraphQLTextField = GraphQLField<Field<string>>;
export type GraphQLImageField = GraphQLField<ImageField>;
export type GraphQLLinkField = GraphQLField<LinkField>;
export type GraphQLRichTextField = GraphQLField<RichTextField>;

// Deprecated aliases kept for incremental migration from legacy IGQL naming.
export type IGQLTextField = GraphQLTextField;
export type IGQLImageField = GraphQLImageField;
export type IGQLLinkField = GraphQLLinkField;
export type IGQLRichTextField = GraphQLRichTextField;

export type GraphQLDatasource<T> = {
  data: {
    datasource: T;
  };
};

export const getDatasource = <T>(
  fields: GraphQLDatasource<T> | T | null | undefined
): T | undefined => {
  if (!fields) return undefined;

  const graphFields = fields as GraphQLDatasource<T>;
  return graphFields?.data?.datasource ?? (fields as T);
};

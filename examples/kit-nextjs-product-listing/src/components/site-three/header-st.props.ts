import type { ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from '@/lib/component-props';

export interface HeaderSTFields {
  Logo: ImageField;
  SupportLink: LinkField;
  SearchLink: LinkField;
  CartLink: LinkField;
}

export type HeaderSTProps = ComponentProps & {
  params: { [key: string]: string };
  fields: HeaderSTFields;
};
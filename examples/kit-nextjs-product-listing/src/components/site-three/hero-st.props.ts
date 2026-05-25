import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

export interface HeroSTFields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Image1: ImageField;
  Image2: ImageField;
  Link1: LinkField;
  Link2: LinkField;
}

export type PageHeaderSTProps = {
  params: { [key: string]: string };
  fields: HeroSTFields;
};
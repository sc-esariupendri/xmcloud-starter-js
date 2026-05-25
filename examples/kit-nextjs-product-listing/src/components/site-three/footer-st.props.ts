import type { Field, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from '@/lib/component-props';

export interface FooterSTFields {
  Title: Field<string>;
  CopyrightText: RichTextField;
  FacebookLink: LinkField;
  InstagramLink: LinkField;
  LinkedinLink: LinkField;
}

export type FooterSTProps = ComponentProps & {
  params: { [key: string]: string };
  fields: FooterSTFields;
};

export type SocialLinksProps = {
  fields: FooterSTFields;
};
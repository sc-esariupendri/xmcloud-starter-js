import type { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';

export interface SignupBannerFields {
  Heading: Field<string>;
  Subheading: RichTextField;
  Image: ImageField;
  Image2: ImageField;
}

export type SignupBannerProps = {
  params: { [key: string]: string };
  fields: SignupBannerFields;
};
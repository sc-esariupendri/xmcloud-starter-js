import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import type { OptionalComponentProps } from '@/lib/component-props';

/**
 * Model used for Sitecore Component integration
 */
export type ImageProps = OptionalComponentProps & ImageFields;

export type ImageFields = {
  fields: {
    image: ImageField; // Sitecore editable image field
    caption?: Field<string>;
  };
};


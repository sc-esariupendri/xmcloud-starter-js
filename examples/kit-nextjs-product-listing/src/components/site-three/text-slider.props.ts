import type { Field } from '@sitecore-content-sdk/nextjs';

export interface TextSliderFields {
  Text: Field<string>;
}

export type TextSliderProps = {
  params: { [key: string]: string };
  fields: TextSliderFields;
};
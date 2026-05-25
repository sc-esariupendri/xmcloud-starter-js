import type { IGQLImageField, IGQLLinkField, IGQLTextField } from '@/lib/component-props';

export interface SimplePromoFields {
  id: string;
  heading: IGQLTextField;
  description: IGQLTextField;
  image: IGQLImageField;
  link: IGQLLinkField;
}

export interface MultiPromoDatasourceFields {
  data: {
    datasource: {
      title?: IGQLTextField;
      description?: IGQLTextField;
      children: {
        results: SimplePromoFields[];
      };
    };
  };
}

export type MultiPromoProps = {
  params: { [key: string]: string };
  fields: MultiPromoDatasourceFields;
};

export type PromoItemProps = SimplePromoFields & {
  isHorizontal?: boolean;
};
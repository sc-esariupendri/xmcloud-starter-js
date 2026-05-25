import type { IGQLImageField, IGQLLinkField, IGQLTextField } from '@/lib/component-props';

export interface FeatureItemFields {
  id: string;
  image: IGQLImageField;
  heading: IGQLTextField;
}

export interface FeatureBannerDatasourceFields {
  data: {
    datasource: {
      title: IGQLTextField;
      link: IGQLLinkField;
      children: {
        results: FeatureItemFields[];
      };
    };
  };
}

export type FeatureBannerProps = {
  params: { [key: string]: string };
  fields: FeatureBannerDatasourceFields;
};
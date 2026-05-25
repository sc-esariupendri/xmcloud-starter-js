import type { IGQLImageField, IGQLLinkField, IGQLTextField } from '@/lib/component-props';

export interface CarouselFields {
  id: string;
  callToAction: IGQLLinkField;
  title: IGQLTextField;
  bodyText: IGQLTextField;
  slideImage: IGQLImageField;
}

export interface CarouselDatasourceFields {
  data: {
    datasource: {
      children: {
        results: CarouselFields[];
      };
      title: IGQLTextField;
      tagLine: IGQLTextField;
    };
  };
}

export type CarouselsProps = {
  params: { [key: string]: string };
  fields: CarouselDatasourceFields;
};

import type {
  IGQLImageField,
  IGQLLinkField,
  IGQLRichTextField,
  IGQLTextField,
} from '@/lib/component-props';

export interface QuestionFields {
  id: string;
  question: IGQLTextField;
  answer: IGQLRichTextField;
  image: IGQLImageField;
}

export interface FAQDatasourceFields {
  data: {
    datasource: {
      children: {
        results: QuestionFields[];
      };
      heading: IGQLTextField;
      text: IGQLRichTextField;
      heading2: IGQLTextField;
      text2: IGQLRichTextField;
      link: IGQLLinkField;
    };
  };
}

export type FAQProps = {
  params: { [key: string]: string };
  fields: FAQDatasourceFields;
};

export type QuestionAccordionItemProps = {
  q: QuestionFields;
  type: 'simple' | 'bordered' | 'boxed';
  className?: string;
};

export type QuestionItemProps = {
  q: QuestionFields;
  type: 'simple' | 'bordered' | 'centered';
  showIcon?: boolean;
};

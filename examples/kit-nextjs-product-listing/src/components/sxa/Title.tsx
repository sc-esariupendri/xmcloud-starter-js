import { LinkField, Text, TextField } from '@sitecore-content-sdk/nextjs';
import NextLink from 'next/link';
import React, { type JSX } from 'react';
import type { ComponentContentProps, TitleProps } from './sxa-title.props';

const ComponentContent = (props: ComponentContentProps) => {
  const id = props.id;
  return (
    <div className={`component title ${props.styles}`} id={id ? id : undefined}>
      <div className="component-content">
        <div className="field-title">{props.children}</div>
      </div>
    </div>
  );
};

export const Default = (props: TitleProps): JSX.Element => {
  const datasource = props.fields?.data?.datasource || props.fields?.data?.contextItem;
  const { page } = props;
  const { mode } = page;
  const datasourceField: TextField = datasource?.field?.jsonValue as TextField;
  const contextField: TextField = page.layout.sitecore.route?.fields?.pageTitle as TextField;
  const titleField: TextField = datasourceField || contextField;
  const link: LinkField = {
    value: {
      href: datasource?.url?.path,
      title: titleField?.value ? String(titleField.value) : datasource?.field?.jsonValue?.value,
    },
  };
  if (!mode.isNormal) {
    link.value.querystring = `sc_site=${datasource?.url?.siteName}`;
    if (!titleField?.value) {
      titleField.value = 'Title field';
      link.value.href = '#';
    }
  }

  return (
    <ComponentContent
      styles={props.params.styles || ''}
      id={props.params.RenderingIdentifier || ''}
    >
      <>
        {mode.isEditing ? (
          <Text field={titleField} />
        ) : (
          link?.value?.href ? (
            <NextLink href={link.value.href}>
              <Text field={titleField} />
            </NextLink>
          ) : (
            <Text field={titleField} />
          )
        )}
      </>
    </ComponentContent>
  );
};

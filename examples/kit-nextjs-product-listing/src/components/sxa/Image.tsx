import {
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  Text,
} from '@sitecore-content-sdk/nextjs';
import React, { type JSX } from 'react';
import type { BackgroundStyle, ImageProps } from './sxa-image.props';

const ImageDefault = (props: ImageProps): JSX.Element => (
  <div className={`component image ${props.params.styles}`.trimEnd()}>
    <div className="component-content">
      <span className="is-empty-hint">Image</span>
    </div>
  </div>
);

export const Banner = (props: ImageProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = props;
  const isPageEditing = page.mode.isEditing;
  const classHeroBannerEmpty =
    isPageEditing && props.fields?.Image?.value?.class === 'scEmptyImage'
      ? 'hero-banner-empty'
      : '';
  const backgroundStyle = (props?.fields?.Image?.value?.src && {
    backgroundImage: `url('${props.fields.Image.value.src}')`,
  }) as BackgroundStyle;

  if (!props.fields?.Image) {
    return <ImageDefault {...props} />;
  }

  const modifyImageProps = {
    ...props.fields.Image,
    value: {
      ...props.fields.Image.value,
      style: { objectFit: 'cover', width: '100%', height: '100%' },
    },
  };

  return (
    <div
      className={`component hero-banner ${props.params.styles} ${classHeroBannerEmpty}`}
      id={id ? id : undefined}
    >
      <div className="component-content sc-sxa-image-hero-banner" style={backgroundStyle}>
        {isPageEditing ? (
          <ContentSdkImage field={modifyImageProps} loading="eager" fetchPriority="high" />
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export const Default = (props: ImageProps): JSX.Element => {
  const { page } = props;
  const isPageEditing = page.mode.isEditing;

  if (props.fields) {
    const Image = () => <ContentSdkImage field={props.fields.Image} />;
    const id = props.params.RenderingIdentifier;

    return (
      <div className={`component image ${props.params.styles}`} id={id ? id : undefined}>
        <div className="component-content">
          {isPageEditing || !props.fields.TargetUrl?.value?.href ? (
            <Image />
          ) : (
            <ContentSdkLink field={props.fields.TargetUrl}>
              <Image />
            </ContentSdkLink>
          )}
          <Text
            tag="span"
            className="image-caption field-imagecaption"
            field={props.fields.ImageCaption}
          />
        </div>
      </div>
    );
  }

  return <ImageDefault {...props} />;
};

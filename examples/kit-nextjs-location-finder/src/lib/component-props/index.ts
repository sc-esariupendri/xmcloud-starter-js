import {
  ComponentParams,
  ComponentRendering,
  NextjsContentSdkComponent,
  Page,
} from '@sitecore-content-sdk/nextjs';

/**
 * Shared Sitecore component props (layout service shape).
 * Component-specific `fields` belong in each component's `*.props.ts(x)` file.
 */
export type ComponentProps = {
  rendering: ComponentRendering;
  params: SitecoreLayoutParams;
  page: Page;
  componentMap: Map<string, NextjsContentSdkComponent>;
};

/** Common rendering parameter keys used across SXA-style components. */
export type SitecoreLayoutParams = ComponentParams & {
  RenderingIdentifier?: string;
  styles?: string;
  EnabledPlaceholders?: string;
};

/** Props for components that render nested placeholders via AppPlaceholder. */
export type PlaceholderComponentProps = ComponentProps & {
  componentMap: Map<string, NextjsContentSdkComponent>;
};

export type OptionalComponentProps = Omit<ComponentProps, 'componentMap'> & {
  componentMap?: Map<string, NextjsContentSdkComponent>;
};

export type ComponentWithContextProps = OptionalComponentProps & {
  page: Page;
};

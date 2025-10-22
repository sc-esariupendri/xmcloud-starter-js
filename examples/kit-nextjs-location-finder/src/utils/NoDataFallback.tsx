import { kebabCase } from 'change-case';

import type { JSX } from 'react';

interface ComponentName {
  componentName: string;
}

// Helper function to convert string to capital case (e.g., "componentName" -> "Component Name")
const capitalCase = (str: string): string => {
  return kebabCase(str)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const NoDataFallback = (props: ComponentName): JSX.Element => {
  const { componentName } = props;

  return (
    <div className={`component ${kebabCase(componentName)}`}>
      <div className="component-content">
        <span className="is-empty-hint">
          {capitalCase(componentName)} requires a datasource item assigned. Please assign a
          datasource item to edit the content.
        </span>
      </div>
    </div>
  );
};

export { NoDataFallback };

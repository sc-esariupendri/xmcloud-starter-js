// Simple mock props for Container6321 component (6 column layout)
export const mockContainer6321Props = {
  rendering: {
    componentName: 'Container6321',
    placeholders: {
      'container-sixty-thirty-one-main': [{ componentName: 'Col1Component' }],
      'container-sixty-thirty-two-main': [{ componentName: 'Col2Component' }],
      'container-sixty-thirty-three-main': [{ componentName: 'Col3Component' }],
      'container-sixty-thirty-four-main': [{ componentName: 'Col4Component' }],
      'container-sixty-thirty-five-main': [{ componentName: 'Col5Component' }],
      'container-sixty-thirty-six-main': [{ componentName: 'Col6Component' }],
    },
  },
  params: {
    DynamicPlaceholderId: 'main',
    styles: 'custom-6321-styles',
  },
  children: document.createElement('div') as unknown as Element,
};

// Mock props with exclude top margin
export const mockContainer6321PropsNoMargin = {
  rendering: {
    componentName: 'Container6321',
    placeholders: {
      'container-sixty-thirty-one-test': [{ componentName: 'Col1Component' }],
      'container-sixty-thirty-two-test': [{ componentName: 'Col2Component' }],
      'container-sixty-thirty-three-test': [{ componentName: 'Col3Component' }],
      'container-sixty-thirty-four-test': [{ componentName: 'Col4Component' }],
      'container-sixty-thirty-five-test': [{ componentName: 'Col5Component' }],
      'container-sixty-thirty-six-test': [{ componentName: 'Col6Component' }],
    },
  },
  params: {
    DynamicPlaceholderId: 'test',
    excludeTopMargin: '1',
    styles: 'no-margin-6321',
  },
  children: document.createElement('div') as unknown as Element,
};

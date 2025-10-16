import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as RichTextBlock } from '@/components/rich-text-block/RichTextBlock';

// Sitecore SDK components and NoDataFallback are already mocked globally in jest.setup.js

// Component-specific mock for RichText to handle empty states in tests
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  ...jest.requireActual('@sitecore-content-sdk/nextjs'),
  RichText: ({ field }: { field?: { value?: string } }) => {
    if (!field?.value) {
      return <span className="is-empty-hint">Rich text</span>;
    }
    return <div data-testid="richtext">{field.value}</div>;
  },
}));

// Test props will be handled with proper type safety

describe('RichTextBlock Component', () => {
  const mockFields = {
    text: { value: 'This is rich text content' },
  };

  const mockParams = {
    styles: 'custom-style',
    RenderingIdentifier: 'rich-text-id',
  };

  const mockRendering = {
    componentName: 'RichTextBlock',
    dataSource: '/mock-datasource',
    uid: 'mock-uid',
  };

  it('renders rich text content when fields are provided', () => {
    render(<RichTextBlock fields={mockFields} params={mockParams} rendering={mockRendering} />);

    expect(screen.getByTestId('richtext')).toHaveTextContent('This is rich text content');
    const container = screen.getByTestId('richtext').closest('.component.rich-text');
    expect(container).toHaveAttribute('id', 'rich-text-id');
    expect(container).toHaveClass('component rich-text');
  });

  it('renders empty hint when text field is empty', () => {
    const emptyFields = {
      text: { value: '' },
    };

    render(<RichTextBlock fields={emptyFields} params={{}} rendering={mockRendering} />);
    expect(screen.getByText('Rich text')).toBeInTheDocument();
  });

  it('renders fallback when fields are missing', () => {
    // Testing edge case with undefined fields - using type assertion for test scenario
    const props = {
      fields: undefined,
      params: {},
      rendering: mockRendering,
    } as const;

    render(<RichTextBlock {...props} />);
    expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
  });
});

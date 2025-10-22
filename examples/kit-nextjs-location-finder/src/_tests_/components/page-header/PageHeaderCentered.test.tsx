import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PageHeaderCentered } from '@/components/page-header/PageHeaderCentered.dev';
import { mockPageHeaderProps } from './page-header.mock.props';

// Mock dependencies
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: jest.fn(({ field, tag = 'span', className }) => {
    const Tag = tag as keyof JSX.IntrinsicElements;
    return React.createElement(Tag, { className, 'data-testid': 'text-component' }, field?.value);
  }),
  RichText: jest.fn(({ field, className }) => (
    <div
      className={className}
      data-testid="richtext-component"
      dangerouslySetInnerHTML={{ __html: field?.value }}
    />
  )),
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: jest.fn(({ componentName }) => (
    <div data-testid="no-data-fallback">No Data: {componentName}</div>
  )),
}));

jest.mock('@/components/animated-section/AnimatedSection.dev', () => ({
  Default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-section">{children}</div>
  ),
}));

jest.mock('@/components/button-component/ButtonComponent', () => ({
  EditableButton: ({
    buttonLink,
    variant,
  }: {
    buttonLink: { value: { text: string; href: string } };
    variant: string;
  }) => (
    <button data-testid={`button-${variant}`} data-href={buttonLink.value.href}>
      {buttonLink.value.text}
    </button>
  ),
}));

jest.mock('@/components/image/ImageWrapper.dev', () => ({
  Default: ({ image }: { image: { value: { src: string; alt: string } } }) => (
    <img data-testid="image-wrapper" src={image.value.src} alt={image.value.alt} />
  ),
}));

describe('PageHeaderCentered', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('renders centered page header with title and image', () => {
    render(<PageHeaderCentered {...mockPageHeaderProps} isPageEditing={false} />);

    expect(screen.getByText('Advanced Emergency Response Vehicles')).toBeInTheDocument();
    expect(screen.getByTestId('richtext-component')).toBeInTheDocument();
    expect(screen.getByTestId('image-wrapper')).toHaveAttribute(
      'src',
      '/images/alaris-ambulance-fleet.jpg'
    );
  });

  it('renders buttons when links are provided', () => {
    render(<PageHeaderCentered {...mockPageHeaderProps} isPageEditing={false} />);

    expect(screen.getByTestId('button-default')).toHaveTextContent('Explore Our Fleet');
    expect(screen.getByTestId('button-secondary')).toHaveTextContent('Contact Sales');
  });

  it('renders NoDataFallback when fields are not provided', () => {
    const propsWithoutFields = { ...mockPageHeaderProps, fields: null as never };
    render(<PageHeaderCentered {...propsWithoutFields} isPageEditing={false} />);

    expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
    expect(screen.getByText('No Data: PageHeader')).toBeInTheDocument();
  });
});

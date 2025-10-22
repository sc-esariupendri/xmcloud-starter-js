import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PageHeaderDefault } from '@/components/page-header/PageHeaderDefault.dev';
import { mockPageHeaderProps, mockPageHeaderPropsWithoutLinks } from './page-header.mock.props';

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

jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...args) => args.filter(Boolean).flat().join(' ')),
}));

describe('PageHeaderDefault', () => {
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

  it('renders page header with title, subtitle and buttons', () => {
    render(<PageHeaderDefault {...mockPageHeaderProps} isPageEditing={false} />);

    expect(screen.getByText('Advanced Emergency Response Vehicles')).toBeInTheDocument();
    expect(screen.getByTestId('richtext-component')).toBeInTheDocument();
    expect(screen.getByTestId('button-default')).toHaveTextContent('Explore Our Fleet');
    expect(screen.getByTestId('button-secondary')).toHaveTextContent('Contact Sales');
    expect(screen.getByTestId('image-wrapper')).toHaveAttribute(
      'src',
      '/images/alaris-ambulance-fleet.jpg'
    );
  });

  it('uses pageTitle when pageHeaderTitle is empty', () => {
    render(<PageHeaderDefault {...mockPageHeaderPropsWithoutLinks} isPageEditing={false} />);

    expect(screen.getByText('Fire & Rescue Equipment')).toBeInTheDocument();
  });

  it('does not render buttons when links are empty and not in edit mode', () => {
    render(<PageHeaderDefault {...mockPageHeaderPropsWithoutLinks} isPageEditing={false} />);

    expect(screen.queryByTestId('button-default')).not.toBeInTheDocument();
    expect(screen.queryByTestId('button-secondary')).not.toBeInTheDocument();
  });
});

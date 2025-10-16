import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as PromoBlock, TextLink } from '@/components/promo-block/PromoBlock';
import { Orientation } from '@/enumerations/Orientation.enum';
import { Variation } from '@/enumerations/Variation.enum';

// Mock Sitecore Content SDK components used inside PromoBlock
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag: Tag = 'span' }: { field?: { value?: string }; tag?: any }) => (
    <Tag>{field?.value}</Tag>
  ),
  RichText: ({ field }: { field?: { value?: string } }) => <div>{field?.value}</div>,
  Link: ({ field }: { field?: { value?: { href?: string; text?: string } } }) => (
    <a href={field?.value?.href}>{field?.value?.text}</a>
  ),
}));

// Mock internal components used by PromoBlock
jest.mock('@/components/flex/Flex.dev', () => ({
  Flex: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div data-testid="flex" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/image/ImageWrapper.dev', () => ({
  Default: ({ image, className }: { image?: any; className?: string }) => (
    <img data-testid="image" src={image?.value?.src || ''} alt={image?.value?.alt || ''} className={className} />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: React.PropsWithChildren) => <button>{children}</button>,
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div>No data for {componentName}</div>
  ),
}));

const baseFields = {
  heading: { value: 'Promo Title' },
  description: { value: 'Promo Description' },
  image: { value: { src: '/test.jpg', alt: 'alt' } },
  link: { value: { href: '/promo', text: 'Learn more' } },
};

const renderPromo = (override: Partial<any> = {}) => {
  const props: any = {
    fields: baseFields,
    params: { orientation: Orientation.IMAGE_LEFT, variation: Variation.DEFAULT },
    ...override,
  };
  return render(<PromoBlock {...props} />);
};

describe('PromoBlock', () => {
  it('renders heading, description, image and link', () => {
    renderPromo();

    expect(screen.getByText('Promo Title')).toBeInTheDocument();
    expect(screen.getByText('Promo Description')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/promo');
    expect(screen.getByTestId('image')).toHaveAttribute('src', '/test.jpg');
  });

  it('renders fallback when fields are missing', () => {
    render(<PromoBlock /> as any);
    expect(screen.getByText('No data for Promo Block')).toBeInTheDocument();
  });

  it('applies orientation classes for image left', () => {
    const { container } = renderPromo({ params: { orientation: Orientation.IMAGE_LEFT, variation: Variation.DEFAULT } });

    // container wrapper should include grid classes
    const root = container.querySelector('.component.promo-block');
    expect(root).toBeInTheDocument();

    // copy area uses class string depending on orientation
    // We check presence of a known class used in IMAGE_LEFT branch
    const copy = container.querySelector('.px-4.pb-6');
    expect(copy).toBeInTheDocument();
  });

  it('applies orientation classes for image right', () => {
    const { container } = renderPromo({ params: { orientation: Orientation.IMAGE_RIGHT, variation: Variation.DEFAULT } });

    // the image container should exist
    const imageContainer = container.querySelector('[data-testid="image"]').parentElement;
    expect(imageContainer).toBeInTheDocument();
  });

  it('uses variation two class names when variation != default', () => {
    const { container } = renderPromo({ params: { orientation: Orientation.IMAGE_LEFT, variation: Variation.VERSION_TWO } });

    // Variation two sets container to include 'row-[1_/_4]'
    const containerDiv = container.querySelector('.row-\[1_\/_4\]');
    expect(containerDiv).toBeInTheDocument();
  });

  it('TextLink forces variation two and outline button', () => {
    const props: any = { fields: baseFields, params: { orientation: Orientation.IMAGE_RIGHT } };
    render(<TextLink {...props} />);

    // Variation two adds extra class on copy (relative p-6 bg-white)
    const copy = screen.getByText('Promo Description').parentElement as HTMLElement; // RichText in copy section
    expect(copy.className).toMatch(/bg-white/);
  });

  it('does not render link button when link is absent', () => {
    const fieldsWithoutLink = { ...baseFields } as any;
    delete fieldsWithoutLink.link;
    renderPromo({ fields: fieldsWithoutLink });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

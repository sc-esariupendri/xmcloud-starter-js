import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageGalleryFeaturedImage } from '@/components/image-gallery/ImageGalleryFeaturedImage.dev';
import { mockImageGalleryProps } from './image-gallery.mock.props';

// Mock Sitecore SDK
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span', className }: Record<string, unknown>) => {
    const TextTag = tag as keyof JSX.IntrinsicElements;
    const fieldValue = (field as { value?: string })?.value || '';
    return React.createElement(TextTag, { className: className as string }, fieldValue);
  },
}));

// Mock child components
jest.mock('@/components/image/ImageWrapper.dev', () => ({
  Default: ({ image, className }: Record<string, unknown>) => (
    <img
      src={(image as { value?: { src?: string } })?.value?.src}
      className={className as string}
      data-testid="image-wrapper"
      alt="gallery"
    />
  ),
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div data-testid="no-data-fallback">{componentName}</div>
  ),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/hooks/use-parallax-enhanced-optimized', () => ({
  useParallaxEnhancedOptimized: jest.fn(() => ({
    isParallaxActive: false,
  })),
}));

jest.mock('@/hooks/use-match-media', () => ({
  useMatchMedia: jest.fn(() => false),
}));

jest.mock('@/hooks/use-container-query', () => ({
  useContainerQuery: jest.fn(() => false),
}));

describe('ImageGalleryFeaturedImage Component', () => {
  it('renders with featured image layout', () => {
    const { container } = render(<ImageGalleryFeaturedImage {...mockImageGalleryProps} />);
    expect(container).toBeInTheDocument();

    const images = screen.getAllByTestId('image-wrapper');
    expect(images).toHaveLength(4);
  });

  it('displays centered header with title and description', () => {
    render(<ImageGalleryFeaturedImage {...mockImageGalleryProps} />);

    expect(screen.getByText('Our Amazing Gallery')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Explore our collection of stunning images showcasing design and innovation.'
      )
    ).toBeInTheDocument();
  });

  it('disables parallax when reduced motion is preferred', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useMatchMedia } = require('@/hooks/use-match-media');
    useMatchMedia.mockReturnValue(true);

    render(<ImageGalleryFeaturedImage {...mockImageGalleryProps} />);

    expect(screen.getByText(/Parallax effects have been disabled/)).toBeInTheDocument();
  });
});

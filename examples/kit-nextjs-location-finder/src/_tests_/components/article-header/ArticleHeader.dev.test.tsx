// src/_tests_/components/article-header/ArticleHeader.dev.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as ArticleHeader } from '../../../components/article-header/ArticleHeader';

// ✅ Fix ESLint error for missing display name
jest.mock('@/components/image/ImageWrapper.dev', () => ({
  Default: React.forwardRef<HTMLImageElement, any>(({ image, alt }, ref) => {
    const Component = () => (
      <img ref={ref} data-testid="image-wrapper" src={image?.value?.src} alt={alt} />
    );
    Component.displayName = 'MockedImageWrapper';
    return <Component />;
  }),
}));

// ✅ Define mock props safely
const mockProps = {
  fields: {
    imageRequired: { value: { src: '/test-image.jpg' } },
    eyebrowOptional: { value: 'Tech News' },
  },
  externalFields: {
    pageHeaderTitle: 'Sample Article',
    pageReadTime: '5 min read',
    pageDisplayDate: 'Oct 13, 2025',
    pageAuthor: {
      value: {
        name: 'John Doe',
        role: 'Senior Developer',
        image: { value: { src: '/author.jpg' } },
      },
    },
  },
};

describe('ArticleHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header with image and details', () => {
    render(<ArticleHeader {...mockProps} />);

    expect(screen.getByText('Sample Article')).toBeInTheDocument();
    expect(screen.getByText('Tech News')).toBeInTheDocument();
    expect(screen.getByTestId('image-wrapper')).toHaveAttribute('src', '/test-image.jpg');
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles share button clicks correctly', () => {
    window.open = jest.fn();
    render(<ArticleHeader {...mockProps} />);

    const fbButton = screen.getByTestId('share-Share on Facebook');
    fireEvent.click(fbButton);

    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('facebook.com'), '_blank');
  });

  it('renders share buttons', () => {
    render(<ArticleHeader {...mockProps} />);
    expect(screen.getByTestId('share-Share on LinkedIn')).toBeInTheDocument();
    expect(screen.getByTestId('share-Copy link')).toBeInTheDocument();
  });

  it('renders fallback safely when fields are missing', () => {
    const safeProps = { fields: null, externalFields: null };
    render(<ArticleHeader {...safeProps} />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('renders author section correctly', () => {
    render(<ArticleHeader {...mockProps} />);
    expect(screen.getByTestId('avatar-img')).toHaveAttribute('src', '/author.jpg');
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
  });
});

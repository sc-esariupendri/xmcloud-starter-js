import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as CtaBanner } from '@/components/cta-banner/CtaBanner';
import { TextProps } from 'recharts';
import { LinkProps } from '@sitecore-content-sdk/nextjs';

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag: Tag = 'div', ...props }: TextProps) => <Tag {...props}>{field?.value}</Tag>,
  Link: ({ field }: LinkProps) => <a href={field?.value?.href}>{field?.value?.text}</a>,
}));

// 🧪 Mock other components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: React.PropsWithChildren) => <button>{children}</button>,
}));

jest.mock('@/components/animated-section/AnimatedSection.dev', () => ({
  Default: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div>No data for {componentName}</div>
  ),
}));

describe('CtaBanner Component', () => {
  const mockProps = {
    fields: {
      titleRequired: { value: 'CTA Title' },
      descriptionOptional: { value: 'CTA Description' },
      linkOptional: { value: { href: '/cta-link', text: 'Click Here' } },
    },
    params: {
      colorScheme: 'primary',
    },
  };

  it('renders title, description, and link correctly', () => {
    render(<CtaBanner {...mockProps} />);
    expect(screen.getByText('CTA Title')).toBeInTheDocument();
    expect(screen.getByText('CTA Description')).toBeInTheDocument();
    expect(screen.getByText('Click Here')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/cta-link');
  });

  it('renders fallback when no fields are provided', () => {
    render(<CtaBanner />);
    expect(screen.getByText('No data for CTA Banner')).toBeInTheDocument();
  });

  it('does not render link if linkOptional is missing', () => {
    const { linkOptional, ...restFields } = mockProps.fields;
    render(<CtaBanner fields={restFields} params={mockProps.params} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

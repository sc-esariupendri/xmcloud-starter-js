import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as PageContent, TitleAndBody } from '@/components/sxa/PageContent';

// Mock Sitecore SDK
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: jest.fn(() => ({
    page: {
      layout: {
        sitecore: {
          route: {
            fields: {
              Content: {
                value:
                  '<p>Alaris manufactures advanced emergency vehicles including Type I and Type III ambulances.</p>',
              },
              Title: {
                value: 'About Alaris Emergency Vehicles',
              },
            },
          },
        },
      },
    },
  })),
  RichText: jest.fn(({ field }) => (
    <div data-testid="richtext-content" dangerouslySetInnerHTML={{ __html: field?.value }} />
  )),
  Text: jest.fn(({ field }) => <span data-testid="text-content">{field?.value}</span>),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className} data-testid="link">
      {children}
    </a>
  ),
}));

describe('SXA PageContent', () => {
  it('renders page content with rich text', () => {
    const mockFields = {
      Title: { value: '' },
      Content: {
        value:
          '<h2>Emergency Vehicle Fleet</h2><p>Our comprehensive line of ambulances and fire trucks serve communities nationwide.</p>',
      },
      MainLink: { value: { href: '', text: '' } },
    };

    render(
      <PageContent
        params={{ RenderingIdentifier: 'content-1', styles: 'vehicle-content' }}
        fields={mockFields}
      />
    );

    const content = screen.getByTestId('richtext-content');
    expect(content).toBeInTheDocument();
    expect(content.innerHTML).toContain('Emergency Vehicle Fleet');
  });

  it('renders TitleAndBody variant with CTA', () => {
    const mockFields = {
      Title: {
        value: 'Explore Our Emergency Vehicle Solutions',
      },
      Content: {
        value:
          '<p>From ambulances to fire trucks, we provide comprehensive emergency response vehicles.</p>',
      },
      MainLink: { value: { href: '', text: '' } },
    };

    render(
      <TitleAndBody
        params={{ RenderingIdentifier: 'title-body', styles: '' }}
        fields={mockFields}
      />
    );

    expect(screen.getByTestId('text-content')).toHaveTextContent(
      'Explore Our Emergency Vehicle Solutions'
    );
    expect(screen.getByTestId('link')).toHaveAttribute('href', '#components');
    expect(screen.getByTestId('link')).toHaveTextContent('Explore Components');
  });
});

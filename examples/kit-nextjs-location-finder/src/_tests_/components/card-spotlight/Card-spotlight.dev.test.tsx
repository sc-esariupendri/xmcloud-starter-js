import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardSpotlight } from '@/components/card-spotlight/card-spotlight.dev';

describe('CardSpotlight Component', () => {
  it('renders children correctly', () => {
    render(
      <CardSpotlight>
        <p>Test Content</p>
      </CardSpotlight>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows spotlight on hover when prefersReducedMotion is false', () => {
    const { container } = render(
      <CardSpotlight>
        <p>Hover Test</p>
      </CardSpotlight>
    );
    const spotlightContainer = screen.getByText('Hover Test').closest('div');
    // Simulate hover
    fireEvent.mouseEnter(spotlightContainer!);

    // Check if the spotlight effect is rendered
    const spotlightEffect = container.querySelector('.pointer-events-none');
    expect(spotlightEffect).toBeInTheDocument();
  });

  it('does not show spotlight when prefersReducedMotion is true', () => {
    const { container } = render(
      <CardSpotlight prefersReducedMotion>
        <p>Reduced Motion Test</p>
      </CardSpotlight>
    );
    const spotlightEffect = container.querySelector('.pointer-events-none');
    expect(spotlightEffect).not.toBeInTheDocument();
  });
});

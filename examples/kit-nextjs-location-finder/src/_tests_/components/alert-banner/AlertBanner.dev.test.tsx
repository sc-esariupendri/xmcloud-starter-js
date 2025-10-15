import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as AlertBanner } from '../../../components/alert-banner/AlertBanner.dev';

const mockProps = {
  fields: {
    title: { value: 'Test Alert Title' },
    description: { value: 'Test alert description.' },
    link: {
      value: {
        href: 'https://example.com',
        text: 'Learn More',
      },
    },
  },
  params: {},
  externalFields: {
    mock_external_data: { value: 'External Data' },
  },
  rendering: { componentName: 'AlertBanner' },
};

describe('AlertBanner', () => {
  it('renders title and description', () => {
    render(<AlertBanner {...mockProps} />);
    expect(screen.getByText('Test Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Test alert description.')).toBeInTheDocument();
  });

  it('renders the link button if link is provided', () => {
    render(<AlertBanner {...mockProps} />);
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('hides the alert when close button is clicked', () => {
    render(<AlertBanner {...mockProps} />);
    const closeButton = screen.getAllByRole('button')[1];
    fireEvent.click(closeButton);
    expect(screen.getByRole('alert')).toHaveClass('hidden');
  });

  it('renders fallback when fields are missing', () => {
    render(
      <AlertBanner
        fields={undefined as any}
        params={{}}
        externalFields={{ mock_external_data: { value: '' } }}
        rendering={{ componentName: 'Alert Banner' }}
      />
    );
    expect(screen.getByText(/Alert Banner/i)).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as ZipcodeSearchForm } from '@/components/forms/zipcode/ZipcodeSearchForm.dev';

describe('ZipcodeSearchForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default placeholder and button text', () => {
    render(<ZipcodeSearchForm onSubmit={mockOnSubmit} />);

    // Check for default placeholder and button text
    expect(screen.getByPlaceholderText('Enter your zip code')).toBeInTheDocument();
    expect(screen.getByText('Find Availability')).toBeInTheDocument();
  });

  it('renders with custom placeholder and button text', () => {
    render(
      <ZipcodeSearchForm onSubmit={mockOnSubmit} placeholder="Enter ZIP" buttonText="Check" />
    );

    expect(screen.getByPlaceholderText('Enter ZIP')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
  });

  it('calls onSubmit with valid zipcode', async () => {
    render(<ZipcodeSearchForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('Enter your zip code') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /find availability/i });

    // Enter valid ZIP code
    fireEvent.change(input, { target: { value: '12345' } });
    fireEvent.click(button);

    // Wait for form submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ zipcode: '12345' });
    });
  });
});

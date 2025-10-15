import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as EmailSignupForm } from '@/components/forms/email/EmailSignupForm.dev';
import { ButtonVariants } from '@/enumerations/ButtonStyle.enum';

// 🧪 Mock Sitecore SDK Text component
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field }: { field?: { value?: string } }) => <>{field?.value}</>,
}));

// 🧪 Mock SuccessCompact component
jest.mock('@/components/forms/success/success-compact.dev', () => ({
  SuccessCompact: ({ successMessage }: { successMessage: string }) => <div>{successMessage}</div>,
}));

describe('EmailSignupForm Component', () => {
  const mockFields = {
    emailPlaceholder: { value: 'Your email here' },
    emailErrorMessage: { value: 'Custom error message' },
    emailSubmitLabel: { value: 'Join Now' },
    emailSuccessMessage: { value: 'Subscribed successfully!' },
    buttonVariant: ButtonVariants.DEFAULT,
  };

  it('renders input and button with provided labels', () => {
    render(<EmailSignupForm fields={mockFields} />);
    expect(screen.getByPlaceholderText('Your email here')).toBeInTheDocument();
    expect(screen.getByText('Join Now')).toBeInTheDocument();
  });

  it('shows success message on valid email submission', async () => {
    render(<EmailSignupForm fields={mockFields} />);
    const input = screen.getByPlaceholderText('Your email here');
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Subscribed successfully!')).toBeInTheDocument();
    });
  });
});

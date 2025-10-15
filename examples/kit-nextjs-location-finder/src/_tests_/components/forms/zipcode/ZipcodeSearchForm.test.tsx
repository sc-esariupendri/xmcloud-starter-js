import React, { ReactNode, ComponentProps } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as ZipcodeSearchForm } from '@/components/forms/zipcode/ZipcodeSearchForm.dev';

//  Mock UI components used in the form
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: ComponentProps<'button'> & { children?: ReactNode }) => (
    <button {...props} data-testid="mock-button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: ComponentProps<'input'>) => <input {...props} data-testid="mock-input" />,
}));

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children?: ReactNode }) => <>{children}</>,

  FormField: ({
    render,
  }: {
    render: (arg: { field: { onChange: () => void; value: string } }) => ReactNode;
  }) => render({ field: { onChange: jest.fn(), value: '' } }),

  FormItem: ({ children }: { children?: ReactNode }) => (
    <div data-testid="form-item">{children}</div>
  ),

  FormLabel: ({ children }: { children?: ReactNode }) => <label>{children}</label>,

  FormControl: ({ children }: { children?: ReactNode }) => <div>{children}</div>,

  FormMessage: ({ children }: { children?: ReactNode }) => (
    <div data-testid="form-message">{children}</div>
  ),
}));

// ---------------------------
//  TEST SUITE
// ---------------------------
describe('ZipcodeSearchForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default placeholder and button text', () => {
    render(<ZipcodeSearchForm onSubmit={mockOnSubmit} />);

    // ✅ Input + Button presence
    expect(screen.getByTestId('mock-input')).toBeInTheDocument();
    expect(screen.getByText('Find Availability')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your zip code')).toBeInTheDocument();
  });

  it('renders with custom placeholder and button text', () => {
    render(
      <ZipcodeSearchForm onSubmit={mockOnSubmit} placeholder="Enter ZIP" buttonText="Check" />
    );

    expect(screen.getByPlaceholderText('Enter ZIP')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
  });

  it('shows validation error for invalid zipcode', async () => {
    render(<ZipcodeSearchForm onSubmit={mockOnSubmit} />);

    const input = screen.getByTestId('mock-input');
    const button = screen.getByTestId('mock-button');

    //  Invalid ZIP
    fireEvent.change(input, { target: { value: 'abcde' } });
    fireEvent.click(button);

    //  Expect error text
    await waitFor(() => {
      expect(screen.getByTestId('form-message')).toBeInTheDocument();
    });

    //  Ensure submit not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});

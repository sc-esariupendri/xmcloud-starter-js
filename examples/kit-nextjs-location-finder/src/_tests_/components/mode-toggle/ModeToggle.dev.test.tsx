import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModeToggle } from '@/components/mode-toggle/mode-toggle.dev';
import { useTheme } from 'next-themes';

// 🧪 Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ModeToggle Component', () => {
  const setThemeMock = jest.fn();

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: setThemeMock,
    });
  });

  it('renders the toggle button with icons', () => {
    render(<ModeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
  });

  it('opens dropdown and selects Light theme', () => {
    render(<ModeToggle />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Light'));
    expect(setThemeMock).toHaveBeenCalledWith('light');
  });

  it('opens dropdown and selects Dark theme', () => {
    render(<ModeToggle />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Dark'));
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('opens dropdown and selects System theme', () => {
    render(<ModeToggle />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('System'));
    expect(setThemeMock).toHaveBeenCalledWith('system');
  });
});
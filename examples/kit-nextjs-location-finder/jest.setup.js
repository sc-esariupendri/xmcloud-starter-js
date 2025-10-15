require('@testing-library/jest-dom');
const React = require('react');

// ---------------------------
// 🧩 Mock Sitecore Components
// ---------------------------
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag: Tag = 'span' }) => {
    if (!field || !field.value) return null;
    return React.createElement(Tag, {}, field.value);
  },
  RichText: ({ field }) => {
    if (!field || !field.value) return null;
    return React.createElement('div', { dangerouslySetInnerHTML: { __html: field.value } });
  },
  Link: ({ field, children }) => {
    if (!field || !field.value) return React.createElement(React.Fragment, {}, children);
    const linkText = field?.value?.text || children;
    return React.createElement('a', { href: field.value.href }, linkText);
  },
}));

// ---------------------------
// 🧩 Mock IntersectionObserver
// ---------------------------
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ---------------------------
// 🧩 Mock lucide-react Icons
// ---------------------------
jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return {
    Facebook: MockIcon,
    Linkedin: MockIcon,
    Twitter: MockIcon,
    Link: MockIcon,
    Check: MockIcon,
    Mail: MockIcon,
  };
});

// ---------------------------
// 🧩 Mock window.matchMedia
// ---------------------------
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated but still used by some libs
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ---------------------------
// 🧩 Mock Clipboard API
// ---------------------------
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// ---------------------------
// 🧩 Mock window.open
// ---------------------------
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

// ---------------------------
// 🧩 Suppress noisy React warnings globally
// ---------------------------
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((message, ...args) => {
    if (
      typeof message === 'string' &&
      (
        message.includes('Each child in a list should have a unique "key" prop') ||
        message.includes('Warning: ReactDOM.render') ||
        message.includes('Warning:') // generic React warnings
      )
    ) {
      return;
    }
    originalConsoleError(message, ...args);
  });

  console.warn = jest.fn((message, ...args) => {
    if (
      typeof message === 'string' &&
      (
        message.includes('React does not recognize the') ||
        message.includes('componentWillReceiveProps') ||
        message.includes('deprecated') ||
        message.includes('Warning:')
      )
    ) {
      return;
    }
    originalConsoleWarn(message, ...args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

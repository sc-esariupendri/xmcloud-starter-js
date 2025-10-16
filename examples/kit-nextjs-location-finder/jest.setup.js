require('@testing-library/jest-dom');
const React = require('react');

// ---------------------------
//  Mock Sitecore Components
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
  useSitecore: () => ({
    page: {
      mode: {
        isEditing: false,
        isPreview: false,
        isNormal: true,
      },
      database: 'web',
      language: 'en',
      layoutId: 'mock-layout-id',
    },
    sitecoreContext: {
      language: 'en',
      site: {
        name: 'mock-site',
      },
    },
  }),
}));

// ---------------------------
//  Mock IntersectionObserver
// ---------------------------
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ---------------------------
//  Mock lucide-react Icons (Comprehensive)
// ---------------------------
jest.mock('lucide-react', () => {
  // Create a generic mock icon component with display name
  const createMockIcon = (name) => {
    const MockIcon = ({ className, size, strokeWidth, absoluteStrokeWidth, ...props }) => 
      React.createElement('span', {
        'data-testid': `${name.toLowerCase()}-icon`,
        className,
        'data-size': size?.toString(),
        'data-stroke-width': strokeWidth?.toString(),
        'data-absolute-stroke-width': absoluteStrokeWidth?.toString(),
        ...props,
      }, name.charAt(0)); // Show first letter as icon content
    
    MockIcon.displayName = `Mock${name}`;
    return MockIcon;
  };

  return {
    // Common icons used across components
    Facebook: createMockIcon('Facebook'),
    Linkedin: createMockIcon('Linkedin'),
    Twitter: createMockIcon('Twitter'),
    Link: createMockIcon('Link'),
    Check: createMockIcon('Check'),
    Mail: createMockIcon('Mail'),
    Sun: createMockIcon('Sun'),
    Moon: createMockIcon('Moon'),
    X: createMockIcon('X'),
    ArrowLeft: createMockIcon('ArrowLeft'),
    ArrowRight: createMockIcon('ArrowRight'),
    Search: createMockIcon('Search'),
    Menu: createMockIcon('Menu'),
    Home: createMockIcon('Home'),
    User: createMockIcon('User'),
    Settings: createMockIcon('Settings'),
    Bell: createMockIcon('Bell'),
    Heart: createMockIcon('Heart'),
    Star: createMockIcon('Star'),
    Download: createMockIcon('Download'),
    Upload: createMockIcon('Upload'),
    Edit: createMockIcon('Edit'),
    Delete: createMockIcon('Delete'),
    Plus: createMockIcon('Plus'),
    Minus: createMockIcon('Minus'),
    // Add more icons as needed by your components
  };
});

// ---------------------------
//  Mock window.matchMedia
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
//  Mock Clipboard API
// ---------------------------
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// ---------------------------
//  Mock window.open
// ---------------------------
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

// ---------------------------
//  Mock Common UI Components
// ---------------------------
jest.mock('@/components/ui/avatar', () => {
  const Avatar = ({ children }) => React.createElement('div', { 'data-testid': 'avatar' }, children);
  Avatar.displayName = 'MockAvatar';
  
  const AvatarImage = ({ src, alt }) => React.createElement('img', { 
    'data-testid': 'avatar-img', 
    src, 
    alt 
  });
  AvatarImage.displayName = 'MockAvatarImage';
  
  const AvatarFallback = ({ children }) => React.createElement('div', { 
    'data-testid': 'avatar-fallback' 
  }, children);
  AvatarFallback.displayName = 'MockAvatarFallback';
  
  return { Avatar, AvatarImage, AvatarFallback };
});

jest.mock('@/components/ui/button', () => {
  const Button = ({ children, variant, size, onClick, ...props }) => 
    React.createElement('button', {
      'data-testid': 'ui-button',
      'data-variant': variant,
      'data-size': size,
      onClick,
      ...props
    }, children);
  Button.displayName = 'MockButton';
  return { Button };
});

jest.mock('@/components/ui/badge', () => {
  const Badge = ({ children, className }) => React.createElement('span', {
    'data-testid': 'badge',
    className
  }, children);
  Badge.displayName = 'MockBadge';
  return { Badge };
});

jest.mock('@/components/ui/toaster', () => {
  const Toaster = () => React.createElement('div', { 'data-testid': 'toaster' });
  Toaster.displayName = 'MockToaster';
  return { Toaster };
});

// ---------------------------
//  Mock Utility Functions
// ---------------------------
jest.mock('@/lib/utils', () => ({
  cn: (...classes) => {
    return classes
      .map(cls => {
        if (typeof cls === 'string') return cls;
        if (typeof cls === 'object' && cls !== null) {
          return Object.entries(cls)
            .filter(([, value]) => Boolean(value))
            .map(([key]) => key)
            .join(' ');
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  },
}));

jest.mock('@/utils/NoDataFallback', () => {
  const NoDataFallback = ({ componentName }) => React.createElement('div', {
    'data-testid': 'no-data-fallback'
  }, `No data for ${componentName}`);
  NoDataFallback.displayName = 'MockNoDataFallback';
  return { NoDataFallback };
});

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// ---------------------------
//  Suppress noisy React warnings globally
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

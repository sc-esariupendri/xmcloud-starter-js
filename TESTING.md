# Testing Guide - MKP Search App

## 📊 Overview

The test suite covers the Marketplace Search Configuration app with focus on:

- **Marketplace SDK & Edge API** – search config via `xmc.search.getConfigs` (client + context), no in-app Auth0
- **Search configuration UI** – indices, field mappings, persistence
- **Loading and error states** – marketplace errors, API errors, skeletons

Run the full suite:

```bash
npm run test:run
```

---

## 🚀 Quick Start

### Run Tests

```bash
# Run all tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test:run -- src/__tests__/App.test.tsx
```

---

## 📁 Test Structure

```
src/
├── __tests__/
│   └── App.test.tsx                                   (App flow, marketplace/API mocks)
├── components/
│   └── search-configuration/
│       └── __tests__/
│           └── search-configuration.test.tsx          (Search config UI)
├── providers/
│   └── __tests__/
│       └── marketplace.test.tsx                       (Marketplace provider & context)
└── utils/
    ├── __tests__/
    │   └── search-config-api.test.ts                  (Transform helpers only)
    └── hooks/
        └── __tests__/
            ├── useSearchConfigApi.test.ts             (SDK xmc.search.getConfigs)
            ├── useCustomFieldPersistence.test.ts      (Custom field save/load)
            └── useMarketplaceClient.test.ts           (Marketplace SDK client)
```

---

## ✅ Requirements Coverage

### 1. Basic Functionality

**Search config (Edge API)**
- ✅ Fetch search config via SDK `xmc.search.getConfigs` (client + sitecoreContextId)
- ✅ No token in app; auth/context from Marketplace
- ✅ Transform configs to search index options and fields map
- ✅ Refetch when client or sitecoreContextId changes

**Search Index Management**
- ✅ Display search index dropdown
- ✅ Select and update search index
- ✅ Empty state handling

**Field Mapping**
- ✅ Display available fields
- ✅ Toggle field selections
- ✅ Required field validation
- ✅ Field mapping persistence

**Data Persistence**
- ✅ Load configuration from custom field
- ✅ Save with debounce (1000ms)
- ✅ Retry logic (3 attempts)
- ✅ Error recovery

**Loading & Error States**
- ✅ Loading skeletons (marketplace + min loading time)
- ✅ Marketplace error UI (title, message, details)
- ✅ Search config API error UI (message from hook)
- ✅ Minimum loading time (2s)

### 2. Connection & Failure Scenarios

**Search config (Edge API)**
```
❌ No client / no sitecoreContextId  → No fetch, clear state
❌ SDK query error                   → Set error, show error UI
❌ Malformed / non-array response    → Safe handling
```

**SDK / Marketplace**
```
❌ SDK init timeout            → Fall back to standalone
❌ SDK init failure            → Graceful degradation
❌ Not in marketplace          → Standalone mode / error UI
❌ Custom field not supported  → Skip save operations
```

**Persistence**
```
❌ Save failure                → Retry up to 3 times
❌ Max retries exceeded        → Show error state
❌ Invalid custom field data   → Parse with fallback
```

### 3. Data Edge Cases

**Null / Missing context**
```
✅ null client                 → No fetch, no error
✅ null sitecoreContextId       → No fetch, no error
✅ null searchIndices          → Safe rendering
✅ null fieldsMap               → Safe access
✅ null custom field data       → Load with defaults
```

**Invalid / malformed data**
```
✅ Invalid JSON string         → Parse error handling
✅ Non-array API response      → Type validation / safe list
✅ Missing required fields     → Field validation
✅ Empty configuration        → Empty state UI
```

---

## 📝 Test File Details

### 1. `App.test.tsx`

**Integration tests for main application flow**

- **Basic functionality** – Renders search configuration when marketplace and API are ready; shows skeleton during loading
- **Marketplace errors** – Shows marketplace error UI (title, message, details) when provider reports error
- **API / search config** – Uses mocked `useSearchConfigApi` (no Auth0); tests API loading and error states
- **User flow** – Minimum loading time, navigation, error recovery

### 2. `search-configuration.test.tsx` (26 tests)

**Component tests for search configuration UI**

#### Test Categories:
- **Rendering** (8 tests)
  - Search index dropdown
  - Field checkboxes
  - Required field indicators
  - Empty states
  - Loading skeletons

- **User Interactions** (10 tests)
  - Select search index
  - Toggle field checkboxes
  - Required field validation
  - Configuration updates

- **Edge Cases** (8 tests)
  - Null props
  - Undefined props
  - Empty data
  - Missing fields
  - Disabled states

### 3. `useCustomFieldPersistence.test.ts` (20 tests)

**Hook tests for custom field save/load logic**

#### Test Categories:
- **Basic Functionality** (7 tests)
  - Load on mount
  - Save with debounce
  - Client ready detection
  - Data change detection

- **Retry Logic** (6 tests)
  - Retry on failure
  - Max retries
  - Exponential backoff
  - No retry on "not implemented"

- **Edge Cases** (7 tests)
  - Invalid JSON
  - Null/undefined data
  - Empty data
  - Save errors

### 4. `useSearchConfigApi.test.ts`

**Hook tests for search config via Marketplace SDK Edge API**

- **Basic functionality** – Fetches via `client.query('xmc.search.getConfigs', { params: { query: { sitecoreContextId } } })`, transforms to options and fieldsMap
- **No client or context** – When client is null or sitecoreContextId is null: no fetch, loading false, empty data, no error
- **Error handling** – SDK query errors set error state; loading and data reset correctly
- **Context change** – Refetches when client or sitecoreContextId changes

### 5. `useMarketplaceClient.test.ts` (12 tests)

**Hook tests for Marketplace SDK client**

#### Test Categories:
- **Initialization** (4 tests)
  - Success in marketplace
  - Standalone mode
  - Timeout errors
  - Init failures

- **Configuration** (4 tests)
  - Custom timeout
  - Auto init
  - Manual init
  - Retry attempts

- **Edge Cases** (4 tests)
  - Multiple instances
  - Rapid rerenders
  - Context detection

### 6. `search-config-api.test.ts`

**Utility tests for search config transforms (no HTTP/API calls)**

- **transformToSearchIndexOptions** – Converts configs to dropdown options (value, label)
- **transformToFieldsMap** – Builds fields map from configs; handles empty/missing fields and normalization
- **Edge cases** – Empty arrays, missing fields, wrong types

*Note: Search config is now fetched via the SDK (`xmc.search.getConfigs`); this file only tests the transform helpers.*

### 7. `marketplace.test.tsx`

**Provider tests for marketplace context**

#### Test Categories:
- **Provider** (6 tests)
  - Initialization
  - Client state
  - Loading states
  - Error states

- **Context Consumption** (9 tests)
  - Hook usage
  - State updates
  - Error propagation

---

## 🧪 Testing Patterns

### Async Testing with Timers

```typescript
import { vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('debounced save', async () => {
  // Trigger action
  rerender({ data: newData });
  
  // Advance timers
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  
  // Assert
  expect(mockSave).toHaveBeenCalled();
});
```

### Component Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('user interaction', async () => {
  const user = userEvent.setup();
  
  render(<SearchConfiguration {...props} />);
  
  // Find element
  const dropdown = screen.getByLabelText('Search index');
  
  // Interact
  await user.selectOptions(dropdown, 'my-index');
  
  // Assert
  expect(mockOnChange).toHaveBeenCalledWith(
    expect.objectContaining({ searchIndex: 'my-index' })
  );
});
```

### Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';

test('fetches search config via SDK', async () => {
  const mockClient = {
    query: vi.fn().mockResolvedValue({ data: { data: mockConfigs } }),
  };
  const { result } = renderHook(() =>
    useSearchConfigApi(mockClient as any, 'context-123')
  );

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.searchIndexOptions).toHaveLength(1);
  expect(mockClient.query).toHaveBeenCalledWith('xmc.search.getConfigs', {
    params: { query: { sitecoreContextId: 'context-123' } },
  });
});
```

### Mocking

```typescript
// Mock Marketplace provider / hooks
vi.mock('../providers/marketplace', () => ({
  MarketplaceProvider: ({ children }: any) => <>{children}</>,
  useMarketplaceLoading: vi.fn(),
  useMarketplaceError: vi.fn(),
  useAppContextOptional: vi.fn(),
  useMarketplaceClientOptional: vi.fn(),
}));

// Mock useSearchConfigApi (e.g. in App tests)
vi.mock('../utils/hooks/useSearchConfigApi', () => ({
  useSearchConfigApi: vi.fn().mockReturnValue({
    searchIndexOptions: [],
    fieldsMap: {},
    loading: false,
    error: null,
  }),
}));
```

---

## 🔧 Configuration

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

### `src/test/setup.ts`

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});

// Global mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

---

## 📊 Coverage Report

Run coverage report:

```bash
npm run test:coverage
```

This generates a detailed HTML report in `coverage/` directory showing:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

---

## 🐛 Debugging Tests

### Run Specific Test

```bash
# Run single test file
npm run test:run -- src/__tests__/App.test.tsx

# Run tests matching pattern
npm run test:run -- -t "should handle authentication"

# Run in watch mode for specific file
npm test -- src/__tests__/App.test.tsx
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal"
}
```

### View Test UI

```bash
npm run test:ui
```

Opens interactive UI at `http://localhost:51204/__vitest__/`

---

## ✅ Best Practices

### 1. Test Naming
```typescript
// ✅ Good - Descriptive
test('should show error message when API fails', () => {});

// ❌ Bad - Vague
test('error handling', () => {});
```

### 2. Arrange-Act-Assert Pattern
```typescript
test('should update field mapping', async () => {
  // Arrange
  const props = { ... };
  render(<Component {...props} />);
  
  // Act
  await user.click(screen.getByText('Field 1'));
  
  // Assert
  expect(mockOnChange).toHaveBeenCalled();
});
```

### 3. Test One Thing
```typescript
// ✅ Good - Single responsibility
test('should display error message', () => {});
test('should retry on failure', () => {});

// ❌ Bad - Multiple concerns
test('should display error and retry', () => {});
```

### 4. Avoid Implementation Details
```typescript
// ✅ Good - Test behavior
expect(screen.getByText('Error occurred')).toBeInTheDocument();

// ❌ Bad - Test implementation
expect(component.state.error).toBe('Error occurred');
```

---

## 🚨 Common Issues

### Issue: Tests Timeout

**Cause:** Using `waitFor` with fake timers

**Solution:**
```typescript
// ❌ Don't use waitFor with fake timers
await waitFor(() => {
  expect(result).toBe(true);
});

// ✅ Use act + advanceTimers
await act(async () => {
  await vi.advanceTimersByTimeAsync(1000);
});
expect(result).toBe(true);
```

### Issue: "Not wrapped in act(...)"

**Cause:** State updates outside `act()`

**Solution:**
```typescript
// ❌ Missing act
rerender({ newProp: value });

// ✅ Wrapped in act
await act(async () => {
  rerender({ newProp: value });
});
```

### Issue: Module Not Found

**Cause:** Missing path alias in vitest.config.ts

**Solution:**
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## 📚 Resources

### Documentation
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

### Internal Links
- Main README: [README.md](./README.md)
- Project Structure: [README.md#project-structure](./README.md#project-structure)

---

## 🎯 Summary

✅ **Coverage**
- Search config via Marketplace SDK Edge API (`xmc.search.getConfigs`) – client + sitecoreContextId, no in-app token
- Marketplace provider, loading and error states
- Search configuration UI, field persistence, and edge cases

✅ **Fast & reliable**
- No flaky tests
- CI/CD ready

✅ **Maintainable**
- Clear test organization
- Consistent patterns (mocks for provider and `useSearchConfigApi`)

**The test suite ensures the MKP app works correctly with the Edge API and Marketplace context and protects against regressions.**

---

*Last Updated: 2026-02-16*

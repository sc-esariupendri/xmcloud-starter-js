# MKP Search App

Marketplace Search Configuration App for Sitecore Marketplace.

## Overview

This app lets users configure search indices and field mappings for Sitecore Marketplace applications. It runs inside the Sitecore Marketplace and uses the **Sitecore Marketplace SDK** for context and for loading search configuration via the **Edge API** (`xmc.search.getConfigs`). Authentication and tenant context are provided by the Marketplace host; the app does not implement its own auth (e.g. no Auth0 in the app).

## Features

- 🔍 Search index configuration (loaded via Marketplace SDK Edge API)
- 📋 Field mapping management
- 💾 Custom field persistence with auto-save
- 🎨 Modern UI with Tailwind CSS
- ⚡ Built with React, TypeScript, and Vite

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Testing

Comprehensive test suite covering search config (Edge API), marketplace provider, and UI flows.

📖 **[See Testing Guide](./TESTING.md)** for detailed information.

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# View test UI
npm run test:ui

# Generate coverage
npm run test:coverage
```

## Deployment

1. Build app locally
2. Log into Cloudflare using MyApps (make sure you have access to it)
3. Open Cloudflare project: Sitecore SaaS - Staging > Workers & Pages > Find search-mkp-app
4. Create a new deployment
   https://dash.cloudflare.com/dbfc301dee0ee3640018e15cf82e3e4b/pages/view/search-mkp-app/deployments/new
5. Select "folder" option and point prompt to the dist folder
6. Click "Save and Deploy".

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Sitecore Marketplace SDK** - Context and Edge API (e.g. `xmc.search.getConfigs` for search config)
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

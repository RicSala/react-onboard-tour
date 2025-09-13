# Installation

This guide will help you install Tourista in your React application.

## Prerequisites

Before installing Tourista, ensure you have:

- **React** version 18.0.0 or higher
- **React DOM** version 18.0.0 or higher
- **Next.js** version 14.0.0 or higher

## Package Installation

Install the package using your preferred package manager:

```bash
# Using npm
npm install Tourista

# Using pnpm (recommended)
pnpm add Tourista

# Using yarn
yarn add Tourista
```

## Peer Dependencies

The library requires these peer dependencies:

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "next": ">=14.0.0"
  }
```

All three dependencies are required for the library to function properly.

## Runtime Dependencies

Tourista includes these runtime dependencies:

- **@tinystack/machine** (^0.1.0) - State machine implementation
- **@floating-ui/react** (^0.27.16) - Positioning engine for tour cards
- **motion** (^12.23.12) - Animation library for smooth transitions

## Tailwind CSS Configuration (Optional)

**Note**: Tailwind CSS v4 is only required if you plan to use the **DefaultCard** or **DebugPanel** components. If you're using a custom card component, Tailwind is not necessary.

If you want to use the default components with proper styling:

1. Ensure you have Tailwind CSS v4 installed
2. Add the tourista package to your Tailwind CSS sources in your CSS file:

```css
/* In your global CSS file */
@source '../../node_modules/Tourista/dist/**/*.{js,mjs}';
```

This ensures Tailwind can detect and compile the classes used in the library's default components.

## Next.js Configuration

Since Tourista uses client-side features, components must be marked with the `'use client'` directive when used in Next.js App Router.

No additional Next.js configuration is required. The library works out of the box with the App Router.

## Verify Installation

After installation, you can verify it's working by importing the main components:

```tsx
import { TourProvider, TourMachine } from 'Tourista';

// If TypeScript shows no errors, the installation was successful
```

## Troubleshooting

### Module Resolution Issues

If you encounter module resolution errors:

1. Clear your node_modules and reinstall:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Ensure you're using a compatible Node.js version (16+)

### Next.js Hydration Errors

If you see hydration errors in Next.js:

1. Ensure components using Tourista are marked with `'use client'`
2. Wrap dynamic content in a client-only boundary if needed

### TypeScript Errors

If TypeScript can't find the types:

1. Ensure `skipLibCheck` is set to `true` in your tsconfig.json
2. Restart your TypeScript server in your IDE

## Next Steps

Once installed, proceed to the [Quick Start](./quick-start.md) guide to create your first tour.

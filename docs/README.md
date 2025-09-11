# Touring

A flexible onboarding tour library for React applications.

## Development Setup

### Quick Start

1. **In this library directory** (`/react-onboard-tour`):

```bash
pnpm run dev:setup
```

This will install dependencies, build, link globally, and start watch mode.

2. **In your Next.js app directory** (NOT in this library):

```bash
cd /path/to/your/nextjs-app
pnpm link touring    # Note: NO --global flag here!
# or with npm:
npm link touring
```

That's it! The library will rebuild automatically when you make changes.

### Scripts

- `pnpm run build` - Build the library
- `pnpm run dev` - Watch mode (rebuilds on changes)
- `pnpm run dev:setup` - Full setup: install, build, link, and watch
- `pnpm run link` - Create global link
- `pnpm run unlink` - Remove global link
- `pnpm run typecheck` - Run TypeScript type checking

### Unlinking

When done with local development:

```bash
# In your app
pnpm unlink touring

# In this library
pnpm run unlink
```

## Usage

```tsx
import { TourProvider, useTour } from 'touring';

function App() {
  return (
    <TourProvider
      steps={[
        {
          title: 'Welcome!',
          content: 'This is your first tour step',
          selector: '#my-button',
        },
      ]}
    >
      <YourApp />
    </TourProvider>
  );
}
```

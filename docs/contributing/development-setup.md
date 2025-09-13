# Development Setup

This guide will help you set up a local development environment for contributing to Tourista.

## Prerequisites

- **Node.js** 16.0 or higher
- **pnpm** 10.6.2 or higher (package manager)
- **Git** for version control
- A Next.js test project (your own or the demo app)

## Library Repository Setup

### 1. Clone the Library Repository

```bash
git clone [library-repo-url]
cd react-onboard-tour
```

### 2. Quick Development Setup

The easiest way to get started:

```bash
pnpm run dev:setup
```

This script (`scripts/setup-dev.sh`) will:

1. Install dependencies
2. Build the library once
3. Create a global pnpm link
4. Start watch mode for auto-rebuilding

### 3. Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Install dependencies
pnpm install

# Build the library
pnpm run build

# Create global link
pnpm run link

# Start watch mode
pnpm run dev
```

## Linking to Your Test Project

### In Your Next.js Application

After setting up the library, link it in your test project:

```bash
# Navigate to your Next.js app
cd ../your-nextjs-app

# Link the library (note: it's "tourista" not "Tourista" for local link)
pnpm link tourista --global
```

### Using the Demo Application

If you're using the tourista-demo repository:

```bash
# Clone the demo
cd ..
git clone [demo-repo-url] tourista-demo
cd tourista-demo

# Use the demo's link script
pnpm run dev:link
```

The demo's `dev:link` script handles cleanup and linking automatically.

## Available Scripts in Library

| Script                   | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `pnpm run build`         | Build library with tsup (cjs, esm, dts)        |
| `pnpm run dev`           | Watch mode - rebuilds on changes               |
| `pnpm run dev:setup`     | Run setup script (install, build, link, watch) |
| `pnpm run type:check`    | TypeScript type checking                       |
| `pnpm run lint`          | Run ESLint                                     |
| `pnpm run lint:fix`      | Auto-fix ESLint issues                         |
| `pnpm run link`          | Create global pnpm link                        |
| `pnpm run unlink`        | Remove global pnpm link                        |
| `pnpm run version:patch` | Bump patch version                             |
| `pnpm run version:minor` | Bump minor version                             |
| `pnpm run version:major` | Bump major version                             |

## Build Configuration

The library uses `tsup` for building with the following configuration:

```bash
tsup src/index.ts --format cjs,esm --dts --clean --no-splitting
```

- **Formats**: CommonJS and ESM modules
- **Type Definitions**: Generated automatically
- **Clean Build**: Removes previous build artifacts
- **No Code Splitting**: Single bundle output

## Type Checking

Always run type checking before committing:

```bash
pnpm run type:check
```

This ensures no TypeScript errors are introduced.

## Linting

The project uses ESLint with TypeScript support:

```bash
# Check for issues
pnpm run lint

# Auto-fix issues
pnpm run lint:fix
```

## Project Structure

```
react-onboard-tour/           # Library repository
├── src/                      # Source code
│   ├── components/           # React components
│   │   ├── TourProvider.tsx
│   │   ├── TourMachineReact.tsx
│   │   ├── TourOverlay.tsx
│   │   ├── DefaultCard.tsx
│   │   ├── DebugPanel.tsx
│   │   └── TourConfigViewer.tsx
│   ├── helpers/              # Utility functions
│   │   └── tourMachineGenerator.ts
│   ├── hooks/                # React hooks
│   │   └── useTour.ts
│   ├── types/                # TypeScript definitions
│   │   └── index.ts
│   ├── const.ts              # Constants
│   └── index.ts              # Main exports
├── dist/                     # Built files (git-ignored)
├── docs/                     # GitBook documentation
├── scripts/                  # Build scripts
│   └── setup-dev.sh
├── .learnings/               # Development notes
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Link Not Working

If the linked package isn't recognized:

1. Verify global link exists:

   ```bash
   pnpm list -g --depth=0
   ```

2. Unlink and relink:

   ```bash
   # In library (react-onboard-tour)
   pnpm run unlink
   pnpm run link

   # In test project
   pnpm unlink tourista --global
   pnpm link tourista --global
   ```

3. Note the package name difference:
   - Published package: `Tourista`
   - Local development link: `tourista`

### Build Errors

If build fails:

1. Clear the dist folder:

   ```bash
   rm -rf dist
   ```

2. Rebuild:
   ```bash
   pnpm run build
   ```

### Type Errors in Test Project

Ensure TypeScript server is restarted in your IDE after linking.

### Hot Reload Not Working

If changes aren't reflected:

1. Ensure dev mode is running: `pnpm run dev`
2. Check that the link is active
3. Restart your Next.js dev server

## Git Hooks

The project uses Husky for Git hooks. Run `pnpm run prepare` to set them up.

## Next Steps

- Read the [Architecture](./architecture.md) guide to understand the codebase
- Check [Code Style](./code-style.md) for coding standards
- See [Pull Requests](./pull-requests.md) for contribution guidelines

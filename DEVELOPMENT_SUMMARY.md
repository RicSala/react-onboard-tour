# Touring Library Development Summary

## What We Built

A React onboarding tour library called "touring" with the following setup:

### 1. **Project Structure**
```
react-onboard-tour/
├── src/
│   ├── index.ts              # Main exports
│   ├── components/
│   │   └── TourProvider.tsx  # Basic tour component
│   ├── hooks/
│   │   └── useTour.ts        # Tour control hook
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── dist/                     # Built files (gitignored)
├── .learnings/              # Personal learning notes (gitignored)
├── scripts/
│   └── setup-dev.sh         # Development setup script
└── Configuration files
```

### 2. **Technology Stack**
- **TypeScript** for type safety
- **React 18+** as peer dependency
- **Motion** (Framer Motion) for animations
- **Tailwind CSS** for styling (to be configured)
- **tsup** for building (uses esbuild internally, much faster than tsc)
- **pnpm** as package manager

### 3. **Build Configuration**

#### TypeScript (`tsconfig.json`)
- Target: ES2020 (modern JS features)
- Strict mode enabled for type safety
- React JSX transform (no need to import React)
- Module resolution: bundler mode

#### Build Tool (tsup)
- Outputs both CommonJS and ESM formats
- Generates TypeScript declarations
- Inline configuration in package.json scripts (no config file needed)

### 4. **Development Workflow**

#### Local Development Setup
1. **Library setup**: `pnpm run dev:setup` (installs, builds, links, watches)
2. **In consuming app**: `pnpm link touring` (creates local symlink)
3. **Auto-rebuild**: Changes in library automatically rebuild

#### Scripts
- `pnpm run build` - Production build
- `pnpm run dev` - Watch mode
- `pnpm run link` - Create global link
- `pnpm run typecheck` - Type checking

### 5. **Type Definitions**

```typescript
interface Step {
  icon: ReactNode | string | null
  title: string
  content: ReactNode
  selector?: string
  side?: 'top' | 'bottom' | 'left' | 'right' | ...
  showControls?: boolean
  showSkip?: boolean
  pointerPadding?: number
  // ... navigation and viewport options
}

interface Tour {
  tour: string
  steps: Step[]
}
```

## Key Learnings

### 1. **pnpm Link Issues**
- **Problem**: Confusion with `pnpm link --global` syntax
- **Solution**: 
  - Library: `pnpm link --global` (creates global link)
  - App: `pnpm link touring` (NO --global flag!)
  
### 2. **Next.js + Turbopack Issue**
- **Problem**: Turbopack doesn't follow symlinks properly
- **Solution**: Use webpack (remove `--turbopack`) or use `file:` protocol
- **Root cause**: Turbopack is still beta and has symlink limitations

### 3. **Module Resolution**
- **Symlink chain**: app/node_modules → pnpm global → library
- **Peer dependencies**: React resolves from app, not library
- **TypeScript vs Runtime**: IDE uses TS resolution (works), bundler uses its own (may fail)

### 4. **Build Tools Decision**
- **Why tsup over tsc**: 10-100x faster, but we still use tsc for type checking
- **Dual role**: TypeScript defines rules, tsup does the work

### 5. **Package Configuration**
- **exports field order matters**: types must come before import/require
- **Peer dependencies**: React/React-DOM as peers, not dependencies
- **Version**: Started at 0.1.0 (pre-1.0 for initial development)

## Project Status

### ✅ Completed
- Basic project structure
- TypeScript configuration
- Build tooling (tsup)
- Minimal component structure
- Local development workflow
- Git initialization
- Documentation

### 🚧 Next Steps
1. Implement actual tour functionality
2. Add positioning logic
3. Style with Tailwind
4. Add Motion animations
5. Create examples
6. Write tests
7. Publish to npm

## Common Commands

```bash
# Development
pnpm run dev:setup    # Full setup
pnpm run dev          # Watch mode

# In consuming app
pnpm link touring     # Link library
pnpm unlink touring   # Unlink

# If using Turbopack, either:
# 1. Remove --turbopack from package.json dev script
# 2. Or use: pnpm add file:../react-onboard-tour
```

## Troubleshooting

1. **"Module not found" in Next.js**: Check if using Turbopack
2. **Symlink issues**: Use `file:` protocol as alternative
3. **Type errors**: Run `pnpm run typecheck`
4. **Changes not reflecting**: Ensure `pnpm run dev` is running
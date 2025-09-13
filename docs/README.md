# Tourista Documentation

Welcome to the documentation for **Tourista** - a state-machine-driven onboarding tour library for React applications with Next.js support.

## What is Tourista?

Tourista is a React library that creates interactive product tours and onboarding flows. It uses a state machine architecture (built on @tinystack/machine) to manage tour progression, handle multi-page navigation, and support both synchronous and asynchronous tour steps.

### Key Characteristics

- **🎯 State Machine Based**: Uses finite state machines for predictable tour flow management
- **🚀 Next.js Optimized**: Built specifically for Next.js App Router with client-side navigation support
- **📝 TypeScript First**: Full TypeScript support with type inference for tour configurations
- **🎨 Customizable UI**: Replace default components with custom React components
- **📍 Element Targeting**: Highlight specific DOM elements with overlay spotlight effects
- **🔄 Async Step Support**: Handle loading states and asynchronous operations during tours

## Quick Example

```tsx
import { TourProvider, TourMachine } from 'Tourista';

function App() {
  const tourConfig = {
    id: 'welcome-tour',
    steps: [
      {
        id: 'welcome',
        page: '/',
        targetElement: '#hero-section',
        title: 'Welcome to Our App!',
        content: 'Let us show you around the key features.',
        canSkip: true,
        canPrev: true,
      },
      {
        id: 'dashboard',
        page: '/dashboard',
        targetElement: '#stats-panel',
        title: 'Your Dashboard',
        content: 'Track your progress and analytics here.',
      },
    ],
    allowPageNavigation: true, // enable multi-page tours
    allowSkip: true, // allow users to skip the tour
  };

  return (
    <TourProvider tours={[tourConfig]}>
      <TourMachine />
      <YourApplication />
    </TourProvider>
  );
}
```

## Features

### Core Functionality

- **Multi-Page Tours**: Navigate users across different pages using Next.js routing
- **Async Steps**: Support for steps with pending, processing, and success states
- **Auto-Advance**: Steps can automatically progress after a specified duration
- **Element Highlighting**: Overlay with spotlight effect to focus on specific DOM elements
- **Navigation Control**: Configure which steps allow forward/backward navigation

### Customization

- **Custom Card Components**: Provide your own React component for tour cards
- **Overlay Styling**: Configure overlay opacity, color, padding, and border radius
- **Card Positioning**: Control card placement relative to target elements (top, bottom, left, right)
- **Event Handlers**: Hook into tour lifecycle events (onComplete, onSkip, onNext, onPrev)

### Developer Tools

- **TypeScript Support**: Full type safety with inferred types from tour configuration
- **Debug Panel**: Built-in component for debugging tour state during development
- **Tour Helpers**: Utility functions for generating and managing tour machines
- **Global Actor Access**: Direct access to the state machine actor for advanced control

## Core Concepts

### State Machine Architecture

Every tour in Tourista is powered by a finite state machine, ensuring predictable behavior and easy debugging:

```typescript
// Tours are composed of states and transitions
const tourMachine = generateTourMachine({
  id: 'product-tour',
  steps: [{ id: 'step1' /* ... */ }, { id: 'step2' /* ... */ }],
});
```

### Tour Configuration

Tours are defined using a simple, declarative configuration:

```typescript
interface TourConfig {
  id: string; // Unique tour identifier
  steps: TourStep[]; // Array of tour steps
  allowPageNavigation?: boolean; // Enable multi-page tours
  allowSkip?: boolean; // Allow users to skip the tour
}
```

### Step Types

Tourista supports two types of steps:

1. **Synchronous Steps**: Simple, sequential tour steps
2. **Asynchronous Steps**: Steps with loading states for async operations

```typescript
// Sync step
{
  id: 'simple-step',
  type: 'sync',
  title: 'Click here',
  content: 'This is a button',
}

// Async step
{
  id: 'api-step',
  type: 'async',
  content: {
    pending: { title: 'Loading...', content: 'Fetching data' },
    processing: { title: 'Processing', content: 'Almost there' },
    success: { title: 'Complete!', content: 'Data loaded' },
  },
}
```

## Getting Started

### Installation

```bash
npm install Tourista
# or
pnpm add Tourista
# or
yarn add Tourista
```

### Requirements

- React 18.0.0 or higher
- React DOM 18.0.0 or higher
- Next.js 14.0.0 or higher (for multi-page tours)

### Quick Start Guide

1. **Wrap your app with TourProvider**
2. **Add the TourMachine component**
3. **Define your tour configuration**
4. **Start the tour programmatically**

See the [Quick Start](getting-started/quick-start.md) guide for detailed setup instructions.

## Dependencies

The library has minimal dependencies:

- `@floating-ui/react` - For intelligent card positioning
- `@tinystack/machine` - State machine implementation
- `motion` - For smooth animations

## Current Limitations

- Currently optimized for Next.js App Router (other frameworks coming soon)
- No built-in accessibility features yet (planned for future releases)
- No state persistence across page reloads (in development)

## License

Tourista is [MIT licensed](https://opensource.org/licenses/MIT).

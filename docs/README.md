# @tinystack/touring Documentation

Welcome to the official documentation for **@tinystack/touring** - a flexible, state-machine-driven onboarding tour library for React applications.

## What is @tinystack/touring?

@tinystack/touring is a powerful React library that helps you create interactive product tours and onboarding experiences. Built on a robust state machine architecture, it provides a declarative and type-safe way to guide users through your application's features.

### Why Choose @tinystack/touring?

- **🎯 Predictable State Management**: Built on finite state machines for reliable, debuggable tour flows
- **⚡ Performance First**: Minimal bundle size with zero unnecessary dependencies
- **🔧 Developer Friendly**: Full TypeScript support with excellent IDE integration
- **🎨 Highly Customizable**: Every aspect can be styled and customized to match your brand
- **📱 Framework Agnostic**: Works seamlessly with Next.js, Remix, Vite, and more
- **♿ Accessible**: Built with accessibility in mind from the ground up

## Quick Example

```tsx
import { TourProvider, TourMachine } from '@tinystack/touring';

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
      },
      {
        id: 'dashboard',
        page: '/dashboard',
        targetElement: '#stats-panel',
        title: 'Your Dashboard',
        content: 'Track your progress and analytics here.',
      },
    ],
  };

  return (
    <TourProvider tours={[tourConfig]}>
      <TourMachine />
      <YourApplication />
    </TourProvider>
  );
}
```

## Key Features

### 🚀 Advanced Tour Capabilities

- **Multi-Page Tours**: Guide users across different routes and pages
- **Async Steps**: Handle loading states and async operations within tours
- **Auto-Advance**: Configure steps to progress automatically
- **Smart Positioning**: Intelligent card placement with collision detection
- **Spotlight Effect**: Beautiful overlay highlighting with customizable styles

### 🛠 Developer Experience

- **TypeScript First**: Complete type safety with advanced type inference
- **Debug Panel**: Built-in debugging tools for development
- **Event System**: Comprehensive event hooks for analytics and custom logic
- **State Persistence**: Save and restore tour progress
- **Testing Utilities**: Helpers for testing tour flows

### 🎨 Customization Options

- **Custom Components**: Replace any default component with your own
- **Theming System**: Complete control over colors, spacing, and animations
- **Overlay Styles**: Customize spotlight effects and overlays
- **Card Templates**: Create reusable card designs for different tour types

## Core Concepts

### State Machine Architecture

Every tour in @tinystack/touring is powered by a finite state machine, ensuring predictable behavior and easy debugging:

```typescript
// Tours are composed of states and transitions
const tourMachine = generateTourMachine({
  id: 'product-tour',
  steps: [
    { id: 'step1', /* ... */ },
    { id: 'step2', /* ... */ },
  ],
});
```

### Tour Configuration

Tours are defined using a simple, declarative configuration:

```typescript
interface TourConfig {
  id: string;                      // Unique tour identifier
  steps: TourStep[];                // Array of tour steps
  allowPageNavigation?: boolean;    // Enable multi-page tours
  allowSkip?: boolean;              // Allow users to skip the tour
}
```

### Step Types

@tinystack/touring supports two types of steps:

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

Ready to add tours to your application?

<div style="display: flex; gap: 20px; margin-top: 30px;">
  <a href="getting-started/installation.md" style="flex: 1; padding: 20px; background: #007acc; color: white; text-decoration: none; border-radius: 8px; text-align: center;">
    <strong>Installation →</strong>
    <div style="margin-top: 8px; opacity: 0.9;">Get started in 2 minutes</div>
  </a>
  
  <a href="getting-started/quick-start.md" style="flex: 1; padding: 20px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; text-align: center;">
    <strong>Quick Start →</strong>
    <div style="margin-top: 8px; opacity: 0.9;">Build your first tour</div>
  </a>
  
  <a href="examples/basic-tour.md" style="flex: 1; padding: 20px; background: #6f42c1; color: white; text-decoration: none; border-radius: 8px; text-align: center;">
    <strong>Examples →</strong>
    <div style="margin-top: 8px; opacity: 0.9;">See it in action</div>
  </a>
</div>

## Browser Support

@tinystack/touring supports all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Community & Support

- **GitHub**: [Report issues and contribute](https://github.com/tinystack/touring)
- **Discord**: [Join our community](https://discord.gg/tinystack)
- **Twitter**: [@tinystack](https://twitter.com/tinystack)

## License

@tinystack/touring is [MIT licensed](https://opensource.org/licenses/MIT).

---

<div style="text-align: center; margin-top: 50px; opacity: 0.7;">
  Built with ❤️ by the TinyStack team
</div>
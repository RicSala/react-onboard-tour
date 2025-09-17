# Quick Start

This guide will help you create your first tour in under 2 minutes.

## Prerequisites

### Tailwind CSS Setup (Optional)

If you're using the default `DefaultCard` or `DebugPanel` components, you'll need Tailwind CSS v4 configured:

```css
/* In your global.css or app.css */
@source '../../node_modules/Tourista/dist/**/*.{js,mjs}';
```

**Note**: This is NOT required if you're using a custom card component.

## Basic Setup

### 1. Create Your Tour Configuration

First, define your tour steps:

```tsx
const tourConfig = {
  id: 'welcome-tour',
  steps: [
    {
      id: 'step1',
      page: '/',
      targetElement: '#welcome-button',
      title: 'Welcome!',
      content: 'Click this button to get started',
      canSkip: false,
    },
    {
      id: 'step2',
      page: '/',
      targetElement: '#feature-section',
      title: 'Key Features',
      content: 'Here are the main features of our app',
      canSkip: true,
      canPrev: false,
    },
  ],
  allowPageNavigation: true,
  allowSkip: true,
};
```

### 2. Create Tour Provider Component

Create a custom client component that wraps `TourProvider` and `TourMachine`:

```tsx
// components/TourProvider.tsx
'use client';

import { TourProvider as TourProviderComponent, TourMachine } from 'Tourista';

const tours = [tourConfig]; // Array of tour configurations

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <TourProviderComponent tours={tours}>
      <TourMachine />
      {children}
    </TourProviderComponent>
  );
}
```

### 3. Add to Your App Layout

```tsx
// app/layout.tsx
import { TourProvider } from '@/components/TourProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <TourProvider>{children}</TourProvider>
      </body>
    </html>
  );
}
```

### 4. Start the Tour

Use the `useTourContext` hook to start tours programmatically:

```tsx
'use client';

import { useTourContext } from 'Tourista';

export function StartTourButton() {
  const { startTour } = useTourContext();

  return <button onClick={() => startTour('welcome-tour')}>Start Tour</button>;
}
```

## Complete Example

Here's a minimal working example:

```tsx
// components/TourProvider.tsx
'use client';

import { TourProvider as TourProviderComponent, TourMachine } from 'Tourista';

const tourConfig = {
  id: 'demo-tour',
  steps: [
    {
      id: 'welcome',
      page: '/tour-demo',
      targetElement: '#start-btn',
      title: 'Welcome to the Demo',
      content: 'This button starts the tour',
      canSkip: true,
      canPrev: true,
    },
    {
      id: 'feature',
      page: '/tour-demo',
      targetElement: '#feature-box',
      title: 'Main Feature',
      content: 'This is our main feature area',
    },
  ],
  allowPageNavigation: true,
  allowSkip: true,
};

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <TourProviderComponent tours={[tourConfig]}>
      <TourMachine />
      {children}
    </TourProviderComponent>
  );
}

// app/tour-demo/page.tsx
('use client');

import { useTourContext } from 'Tourista';
import { TourProvider } from '@/components/TourProvider';

function TourContent() {
  const { startTour } = useTourContext();

  return (
    <div className='p-8'>
      <button
        id='start-btn'
        onClick={() => startTour('demo-tour')}
        className='px-4 py-2 bg-blue-500 text-white rounded'
      >
        Start Tour
      </button>

      <div id='feature-box' className='mt-8 p-4 border rounded'>
        <h2>Feature Area</h2>
        <p>This is the feature that will be highlighted</p>
      </div>
    </div>
  );
}

export default function TourDemoPage() {
  return (
    <TourProvider>
      <TourContent />
    </TourProvider>
  );
}
```

## How It Works

1. **TourProvider** manages which tour is active and provides context to child components
2. **TourMachine** is only initialized when a tour starts (keeping the library non-invasive for users not taking tours)
3. **useTourContext** hook provides methods to start/end tours from the provider context
4. **useTour** hook (requires a tourId parameter) gives detailed control over a specific active tour
5. Tour steps are shown sequentially, highlighting the specified DOM elements

## Navigation Controls

Users can navigate through the tour using:

### UI Controls

- **Next button**: Advance to the next step
- **Previous button**: Go back (if enabled for the step)
- **Skip button**: Exit the tour
- **Click outside**: Close the tour (enabled by default)

### Keyboard Navigation

- **Arrow Right**: Next step
- **Arrow Left**: Previous step
- **Escape**: Skip/exit the tour

## Important Notes

### Client Components

All components using Tourista must be client components (use `'use client'` directive in Next.js App Router).

### Element Targeting

- Elements are targeted using CSS selectors (ID or class)
- Ensure target elements exist in the DOM when the step is shown
- If an element isn't found, the tour card appears in the center

### Page Navigation

For multi-page tours, the library provides two navigation modes:

1. **Auto-Navigation**: When a step requires a different page, the tour automatically navigates using Next.js router
2. **Navigation Detection**: If users manually navigate to the correct page for the next step, the tour detects this and continues from the appropriate step

The tour uses the `page` property in each step to determine where it should be displayed. If the current page doesn't match the step's page, the tour will either navigate automatically or wait for the user to reach the correct page.

## Project Structure

When working with Tourista, here's what gets imported:

```tsx
import {
  // Components
  TourProvider, // Context provider for tours
  TourMachine, // Core tour component
  TourOverlay, // Overlay component (usually not needed directly)
  DefaultCard, // Default card component
  DebugPanel, // Debug panel for development

  // Hooks
  useTourContext, // Access tour context (start/stop tours)
  useTour, // Control specific tour (navigation, state)

  // Helpers
  generateTourMachine, // Generate state machine from config
  createTourHelpers, // Create tour helper functions

  // Types
  TourConfig, // Tour configuration type
  TourStep, // Tour step type
  CardProps, // Props for custom cards
} from 'Tourista';
```

## Troubleshooting

### Common Issues

**Tour not starting?**

- Ensure TourProvider wraps your application
- Check that the tour ID matches exactly
- Verify components are marked with `'use client'` directive

**Elements not highlighting?**

- Verify target element selector is correct
- Ensure element exists in DOM when step is active
- Check that element is visible (not `display: none`)

**TypeScript errors?**

- Restart TypeScript server in your IDE
- Use `as const satisfies TourConfig` for better type inference
- Check that all required properties are present

## Next Steps

- Check the [Basic Example](./basic-example.md) for more detailed patterns
- Learn about [TypeScript Setup](./typescript-setup.md) for better type safety
- Explore [Tour Configuration](../core-concepts/tour-configuration.md) options

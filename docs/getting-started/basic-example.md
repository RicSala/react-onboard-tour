# Basic Example

This guide demonstrates a complete, production-ready tour implementation.

## Full Application Example

### Project Structure

```
app/
├── layout.tsx          # Root layout with TourProvider
├── page.tsx            # Home page with tour triggers
├── dashboard/
│   └── page.tsx        # Dashboard page (multi-page tour)
└── components/
    ├── TourSetup.tsx  # Tour initialization and setup
    └── TourButtons.tsx # Tour control buttons
```

### 1. Tour Configuration

```tsx
// app/components/tour-config.ts
import { TourConfig } from 'Tourista';

export const appTours: TourConfig[] = [
  {
    id: 'onboarding',
    steps: [
      {
        id: 'welcome',
        page: '/',
        targetElement: '#logo',
        title: 'Welcome to Our App',
        content: "Let's take a quick tour to get you started.",
        canSkip: true,
      },
      {
        id: 'navigation',
        page: '/',
        targetElement: '#main-nav',
        title: 'Navigation Menu',
        content: 'Access all features from here.',
        canPrev: true,
        canSkip: true,
      },
      {
        id: 'dashboard-redirect',
        page: '/',
        title: 'Going to Dashboard',
        content: "Let's check out your dashboard...",
        autoAdvance: 2000, // Auto-advance after 2 seconds
      },
      {
        id: 'dashboard-overview',
        page: '/dashboard',
        targetElement: '#stats-widget',
        title: 'Your Statistics',
        content: 'Track your progress and metrics here.',
        canPrev: false, // Disable back button for this step
      },
      {
        id: 'complete',
        page: '/dashboard',
        title: 'Tour Complete!',
        content: "You're all set. Enjoy using the app!",
        targetElement: '#user-profile',
      },
    ],
  },
  {
    id: 'feature-tour',
    steps: [
      {
        id: 'new-feature',
        page: '/dashboard',
        targetElement: '#new-feature',
        title: 'New Feature Alert!',
        content: 'Check out our latest addition.',
      },
    ],
  },
];
```

### 2. Root Layout Setup

```tsx
// app/layout.tsx
'use client';

import { TourProvider } from 'Tourista';
import { appTours } from './components/tour-config';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <TourProvider tours={appTours}>{children}</TourProvider>
      </body>
    </html>
  );
}
```

### 3. Tour Setup Component

```tsx
// app/components/TourSetup.tsx
'use client';

import { TourMachine } from 'Tourista';
import { useEffect } from 'react';
import { useTourContext } from 'Tourista';

export function TourSetup() {
  const { startTour } = useTourContext();

  useEffect(() => {
    // Check if user is new (you'd implement this logic)
    const isNewUser = localStorage.getItem('hasSeenTour') !== 'true';

    if (isNewUser) {
      // Start tour after a short delay
      setTimeout(() => {
        startTour('onboarding');
      }, 1000);
    }
  }, [startTour]);

  const handleTourComplete = () => {
    localStorage.setItem('hasSeenTour', 'true');
    console.log('Tour completed!');
  };

  const handleTourSkip = () => {
    localStorage.setItem('hasSeenTour', 'true');
    console.log('Tour skipped');
  };

  return (
    <TourMachine
      onComplete={handleTourComplete}
      onSkip={handleTourSkip}
      closeOnClickOutside={true}
      overlayStyles={{
        opacity: 0.7,
        colorRgb: '0, 0, 0',
        padding: 8,
        radius: 8,
      }}
      cardPositioning={{
        floating: true,
        side: 'bottom',
        distancePx: 10,
      }}
    />
  );
}
```

### 4. Home Page Implementation

```tsx
// app/page.tsx
'use client';

import { useTourContext } from 'Tourista';
import { TourSetup } from './components/TourSetup';

export default function HomePage() {
  const { startTour, isActive } = useTourContext();

  return (
    <>
      <TourSetup />

      <nav id='main-nav' className='bg-gray-800 text-white p-4'>
        <div className='flex items-center justify-between'>
          <h1 id='logo' className='text-2xl font-bold'>
            My App
          </h1>
          <button
            onClick={() => startTour('onboarding')}
            disabled={isActive}
            className='px-4 py-2 bg-blue-500 rounded disabled:opacity-50'
          >
            {isActive ? 'Tour Active' : 'Start Tour'}
          </button>
        </div>
      </nav>

      <main className='p-8'>
        <h2>Welcome to the Application</h2>
        <p>Click "Start Tour" to begin the onboarding process.</p>
      </main>
    </>
  );
}
```

### 5. Dashboard Page

```tsx
// app/dashboard/page.tsx
'use client';

import { useTourContext } from 'Tourista';
import { TourSetup } from '../components/TourSetup';

export default function DashboardPage() {
  const { startTour } = useTourContext();

  return (
    <>
      <TourSetup />

      <div className='p-8'>
        <div id='stats-widget' className='bg-white rounded-lg shadow p-6 mb-4'>
          <h2 className='text-xl font-bold mb-4'>Statistics</h2>
          <div className='grid grid-cols-3 gap-4'>
            <div>Total Users: 1,234</div>
            <div>Active: 456</div>
            <div>Growth: +12%</div>
          </div>
        </div>

        <div
          id='new-feature'
          className='bg-green-50 border border-green-200 rounded p-4 mb-4'
        >
          <h3>New Feature: Advanced Analytics</h3>
          <button
            onClick={() => startTour('feature-tour')}
            className='mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm'
          >
            Learn More
          </button>
        </div>

        <div id='user-profile' className='flex items-center space-x-4'>
          <div className='w-12 h-12 bg-gray-300 rounded-full'></div>
          <div>
            <div className='font-semibold'>John Doe</div>
            <div className='text-sm text-gray-600'>john@example.com</div>
          </div>
        </div>
      </div>
    </>
  );
}
```

## Hook Usage

### useTourContext vs useTour

The library provides two hooks with different purposes:

**`useTourContext()`** - For managing tours:

- Start a tour: `startTour(tourId)`
- End the current tour: `endTour()`
- Check if any tour is active: `isActive`
- Get current tour config: `tourConfig`

**`useTour(tourId)`** - For controlling a specific active tour:

- Requires a tourId parameter
- Returns detailed state and controls for that specific tour
- Access to step navigation: `nextStep()`, `prevStep()`
- Send custom events: `sendEvent()`
- Get current step data and progress

```tsx
// Starting tours - use useTourContext
const { startTour } = useTourContext();
startTour('onboarding');

// Controlling active tour - use useTour
const tourControls = useTour('onboarding');
if (tourControls) {
  tourControls.nextStep();
  console.log(tourControls.currentStepIndex);
}
```

## Advanced Patterns

### Custom Tour Card

```tsx
// app/components/CustomTourCard.tsx
'use client';

import { CardProps } from 'Tourista';

export function CustomTourCard({
  title,
  content,
  currentStepIndex,
  totalSteps,
  canGoNext,
  canGoPrev,
  nextStep,
  prevStep,
  skipTour,
  canSkip = true,
}: CardProps) {
  return (
    <div className='bg-white rounded-lg shadow-xl p-6 max-w-sm'>
      {/* Progress indicator */}
      <div className='flex space-x-1 mb-4'>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${
              i <= currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <h3 className='text-lg font-semibold mb-2'>{title}</h3>
      <p className='text-gray-600 mb-4'>{content}</p>

      {/* Navigation */}
      <div className='flex justify-between items-center'>
        <div>
          {canSkip && (
            <button
              onClick={skipTour}
              className='text-gray-500 hover:text-gray-700'
            >
              Skip
            </button>
          )}
        </div>

        <div className='flex space-x-2'>
          {canGoPrev && (
            <button
              onClick={prevStep}
              className='px-3 py-1 border rounded hover:bg-gray-50'
            >
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            {canGoNext ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Usage
<TourMachine customCard={CustomTourCard} />;
```

### Async Step Example

```tsx
const asyncTourConfig: TourConfig = {
  id: 'async-demo',
  steps: [
    {
      id: 'data-fetch',
      type: 'async',
      page: '/',
      content: {
        pending: {
          title: 'Loading Data',
          content: 'Fetching your information...',
        },
        processing: {
          title: 'Processing',
          content: 'Analyzing your data...',
        },
        success: {
          title: 'Data Ready!',
          content: 'Your data has been loaded successfully.',
          targetElement: '#data-display',
        },
      },
      events: {
        start: 'FETCH_USER_DATA',
        success: 'DATA_LOADED',
      },
    },
  ],
};
```

## Best Practices

1. **Check First-Time Users**: Use localStorage or a database flag to determine if a user needs onboarding
2. **Provide Skip Options**: Always allow users to exit tours
3. **Keep Steps Concise**: Each step should focus on one feature or action
4. **Use Step Options**: Configure `canPrev` and `canSkip` per step for fine control
5. **Test Element Selectors**: Ensure target elements exist before tour activation
6. **Handle Page Transitions**: For multi-page tours, ensure smooth transitions
7. **Visual Progress**: Show progress indicators to help users understand tour length

## Next Steps

- Explore [TypeScript Setup](./typescript-setup.md) for better type safety
- Learn about [Async Steps](../core-concepts/tour-steps/async-steps.md)
- Customize appearance with [Custom Cards](../customization/custom-cards.md)

# Callbacks

Tourista provides callback functions that allow you to hook into tour lifecycle events and track user interactions. These callbacks are useful for analytics, logging, and triggering side effects based on tour progress.

## Available Callbacks

The `TourMachine` component accepts the following callback props:

### onStart

Triggered when a tour begins.

```tsx
<TourMachine
  onStart={(tourId) => {
    console.log(`Tour ${tourId} started`);
  }}
/>
```

**Parameters:**

- `tourId: string` - The ID of the tour that started

**Use cases:**

- Track tour engagement in analytics
- Initialize tour-specific resources
- Update UI state

### onStepChange

Called whenever the tour progresses to a different step.

```tsx
<TourMachine
  onStepChange={(stepIndex, stepId, tourId) => {
    console.log(`Tour ${tourId}: Step ${stepIndex} (${stepId})`);
  }}
/>
```

**Parameters:**

- `stepIndex: number` - The index of the current step (0-based)
- `stepId: string` - The ID of the current step
- `tourId: string` - The ID of the active tour

**Important notes:**

- Only triggered when the step index actually changes
- Not called for async sub-state transitions (pending → processing → success)
- Not called during navigation states

### onComplete

Fired when a tour completes successfully.

```tsx
<TourMachine
  onComplete={(tourId) => {
    console.log(`Tour ${tourId} completed`);
  }}
/>
```

**Parameters:**

- `tourId: string` - The ID of the completed tour

**Use cases:**

- Mark user as onboarded
- Unlock features
- Send completion analytics

### onSkip

Called when a user skips or exits the tour.

```tsx
<TourMachine
  onSkip={(stepIndex, stepId, tourId) => {
    console.log(`Tour ${tourId} skipped at step ${stepIndex} (${stepId})`);
  }}
/>
```

**Parameters:**

- `stepIndex: number` - The step index where the tour was skipped
- `stepId: string` - The ID of the step where skipping occurred
- `tourId: string` - The ID of the skipped tour

**Triggers:**

- User clicks skip button
- User presses Escape key
- User clicks outside the tour (if `closeOnClickOutside` is true)
- Browser back button is pressed

## Complete Example

Here's how to use all callbacks together:

```tsx
// components/TourProvider.tsx
'use client';

import { TourProvider as TourProviderComponent, TourMachine } from 'tourista';

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <TourProviderComponent tours={tours}>
      <TourMachine
        onStart={(tourId) => {
          // Track tour start
          analytics.track('Tour Started', {
            tourId,
            timestamp: new Date().toISOString(),
          });
        }}
        onStepChange={(stepIndex, stepId, tourId) => {
          // Track progress
          analytics.track('Tour Step Changed', {
            tourId,
            stepIndex,
            stepId,
            progress: `${stepIndex + 1}/${totalSteps}`,
          });

          // Update progress bar
          setProgress(((stepIndex + 1) / totalSteps) * 100);
        }}
        onComplete={(tourId) => {
          // Mark as complete
          localStorage.setItem(`tour_${tourId}_completed`, 'true');

          // Track completion
          analytics.track('Tour Completed', {
            tourId,
            completedAt: new Date().toISOString(),
          });

          // Show success message
          toast.success('Tour completed! 🎉');
        }}
        onSkip={(stepIndex, stepId, tourId) => {
          // Track skip event
          analytics.track('Tour Skipped', {
            tourId,
            skippedAt: stepIndex,
            stepId,
          });

          // Offer to resume
          if (stepIndex > 0) {
            showResumePrompt(tourId, stepIndex);
          }
        }}
      />
      {children}
    </TourProviderComponent>
  );
}

// app/layout.tsx
import { TourProvider } from '@/components/TourProvider';

function App() {
  return <TourProvider>{/* Your app content */}</TourProvider>;
}
```

## Analytics Integration

A common pattern is to integrate callbacks with your analytics service:

```tsx
const tourCallbacks = {
  onStart: (tourId: string) => {
    // Google Analytics
    gtag('event', 'tour_start', {
      tour_id: tourId,
    });

    // Mixpanel
    mixpanel.track('Tour Started', { tourId });

    // Amplitude
    amplitude.track('Tour Started', { tourId });
  },

  onStepChange: (stepIndex: number, stepId: string, tourId: string) => {
    // Track each step
    gtag('event', 'tour_progress', {
      tour_id: tourId,
      step_index: stepIndex,
      step_id: stepId,
    });
  },

  onComplete: (tourId: string) => {
    // Track completion
    gtag('event', 'tour_complete', {
      tour_id: tourId,
    });

    // Set user property
    mixpanel.people.set({
      [`completed_${tourId}`]: true,
    });
  },

  onSkip: (stepIndex: number, stepId: string, tourId: string) => {
    // Track abandonment
    gtag('event', 'tour_skip', {
      tour_id: tourId,
      abandon_step: stepIndex,
      abandon_step_id: stepId,
    });
  },
};

// Use the callbacks in your TourProvider component
export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <TourProviderComponent tours={tours}>
      <TourMachine {...tourCallbacks} />
      {children}
    </TourProviderComponent>
  );
}
```

## Conditional Logic

Use callbacks to implement conditional behavior:

```tsx
// components/TourProvider.tsx
'use client';

import { TourProvider as TourProviderComponent, TourMachine } from 'tourista';

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <TourProviderComponent tours={tours}>
      <TourMachine
        onStepChange={(stepIndex, stepId, tourId) => {
          // Unlock features as user progresses
          if (stepId === 'dashboard-intro') {
            unlockDashboard();
          }

          if (stepId === 'advanced-features') {
            enableAdvancedMode();
          }
        }}
        onComplete={(tourId) => {
          // Different actions for different tours
          switch (tourId) {
            case 'onboarding':
              markUserAsOnboarded();
              redirectToDashboard();
              break;
            case 'new-feature':
              enableFeature();
              showSuccessNotification();
              break;
          }
        }}
      />
      {children}
    </TourProviderComponent>
  );
}
```

## Debugging

Use callbacks for debugging during development:

```tsx
// components/TourProvider.tsx
'use client';

import { TourProvider as TourProviderComponent, TourMachine } from 'tourista';

const debugCallbacks =
  process.env.NODE_ENV === 'development'
    ? {
        onStart: (tourId) => {
          console.group(`🚀 Tour Started: ${tourId}`);
          console.log('Timestamp:', new Date().toISOString());
          console.groupEnd();
        },

        onStepChange: (stepIndex, stepId, tourId) => {
          console.log(`📍 Step ${stepIndex}: ${stepId} (Tour: ${tourId})`);
        },

        onComplete: (tourId) => {
          console.log(`✅ Tour Completed: ${tourId}`);
        },

        onSkip: (stepIndex, stepId, tourId) => {
          console.warn(`⏭️ Tour Skipped at step ${stepIndex} (${stepId})`);
        },
      }
    : {};

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <TourProviderComponent tours={tours}>
      <TourMachine {...debugCallbacks} />
      {children}
    </TourProviderComponent>
  );
}
```

## Important Notes

1. **Callback execution order**: Callbacks are called after the state change has occurred
2. **Performance**: Keep callbacks lightweight to avoid impacting tour performance
3. **Step changes only**: `onStepChange` only fires when moving between different steps, not for async sub-states

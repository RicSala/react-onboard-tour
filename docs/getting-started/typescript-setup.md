# TypeScript Setup

@tinystack/touring is built with TypeScript and provides comprehensive type definitions. This guide shows how to leverage TypeScript for better developer experience and type safety.

## Basic Type Usage

### Importing Types

```tsx
import {
  TourConfig,
  TourStep,
  CardProps,
  TourContext,
  BaseTourEvent,
  OverlayStyles,
  CardPositioning,
} from '@tinystack/touring';
```

### Typing Tour Configurations

```tsx
import { TourConfig } from '@tinystack/touring';

// Method 1: Basic typing (less type inference)
const basicTour: TourConfig = {
  id: 'welcome-tour',
  steps: [
    {
      id: 'step1',
      page: '/',
      targetElement: '#button',
      title: 'Welcome',
      content: 'Get started here',
    },
  ],
  allowPageNavigation: true,
  allowSkip: true,
};

// Method 2: Using 'as const satisfies' (recommended)
// Provides both type checking AND literal type inference
const advancedTour = {
  id: 'welcome-tour',
  steps: [
    {
      id: 'step1',
      page: '/',
      targetElement: '#button',
      title: 'Welcome',
      content: 'Get started here',
    },
  ],
  allowPageNavigation: true,
  allowSkip: true,
} as const satisfies TourConfig;

// With 'as const satisfies', TypeScript knows:
// - The exact tour ID is 'welcome-tour' (not just string)
// - The exact step IDs are literals
// - Better type inference for ExtractStates and other utilities
```

### Typing Tour Steps

```tsx
import { TourStep } from '@tinystack/touring';

// Synchronous step
const syncStep: TourStep = {
  id: 'welcome',
  type: 'sync', // Optional, 'sync' is default
  page: '/',
  targetElement: '#hero',
  title: 'Welcome!',
  content: 'This is the hero section',
  autoAdvance: 3000,
  canPrev: true,
  canSkip: true,
};

// Asynchronous step
const asyncStep: TourStep = {
  id: 'data-load',
  type: 'async',
  page: '/dashboard',
  content: {
    pending: {
      title: 'Loading...',
      content: 'Fetching your data',
    },
    processing: {
      title: 'Processing',
      content: 'Almost there...',
    },
    success: {
      title: 'Ready!',
      content: 'Data loaded successfully',
      targetElement: '#data-grid',
    },
  },
  events: {
    start: 'FETCH_DATA',
    success: 'DATA_READY',
    failed: 'DATA_ERROR',
  },
};
```

## Real-World Usage Pattern

Here's how to set up a fully type-safe tour with helpers and exports:

```tsx
// tours/product-tour.ts
import { 
  TourConfig, 
  TourContext, 
  BaseTourEvent,
  ExtractStates,
  createTourHelpers,
  generateTourMachine,
  useTour
} from '@tinystack/touring';

// Define your tour configuration with 'as const satisfies'
// This gives you both literal types AND type checking
export const tourConfig = {
  id: 'product-tour',
  steps: [
    {
      id: 'welcome',
      page: '/',
      targetElement: '#hero',
      title: 'Welcome to Our Store',
      content: 'Let us show you around our amazing products!',
      canSkip: true,
    },
    {
      id: 'review-submission',
      type: 'async',
      page: '/demo/review',
      content: {
        pending: {
          title: 'Rate Your Experience',
          content: 'Please rate your experience and click "Submit Review" to share your feedback.',
          targetElement: '#star-rating',
        },
        processing: {
          title: '⏳ Submitting Review',
          content: 'Submitting your review... Thank you for your feedback!',
          targetElement: '#review-spinner',
        },
        success: {
          title: '✅ Review Submitted!',
          content: 'Thank you for your feedback! Click Next to complete the tour.',
          targetElement: '#review-success',
        },
      },
      canPrev: false,
    },
    {
      id: 'thank-you',
      page: '/demo/complete',
      targetElement: '#order-complete',
      title: '🎊 Thank You for Your Purchase!',
      content: 'Your order is complete and will be delivered soon. Thank you for shopping with us!',
      autoAdvance: 5000,
    },
  ],
  allowPageNavigation: true,
  allowSkip: true,
} as const satisfies TourConfig;

// Export tour helpers for use throughout your app
export const productTourHelpers = createTourHelpers<typeof tourConfig>(tourConfig);

// Export a typed version of useTour for this specific tour
export const useProductTour = () => useTour<typeof tourConfig>('product-tour');

// Export the tour states type for use in components
export type ProductTourStates = ExtractStates<typeof tourConfig>;

// Generate and export the machine configuration if needed
export const productTourMachine = generateTourMachine<TourContext, BaseTourEvent>(tourConfig);
```

### Using the Typed Tour

```tsx
// components/ProductPage.tsx
import { useProductTour, ProductTourStates } from '../tours/product-tour';

export function ProductPage() {
  const tour = useProductTour();
  
  if (!tour) return null;
  
  // TypeScript knows all possible states
  const handleStateChange = (state: ProductTourStates) => {
    switch (state) {
      case 'welcome':
        console.log('On welcome step');
        break;
      case 'review-submission_pending':
        // Start loading review form
        break;
      case 'review-submission_success':
        // Show success message
        break;
      case 'completed':
        // Tour finished
        break;
    }
  };
  
  return (
    <div>
      <p>Current step: {tour.currentStepIndex + 1} of {tour.totalSteps}</p>
      <button onClick={tour.nextStep}>Next</button>
    </div>
  );
}
```

## Advanced Type Patterns

### Custom Card Component Types

```tsx
import { CardProps } from '@tinystack/touring';
import { FC } from 'react';

// Properly typed custom card component
const CustomCard: FC<CardProps> = ({
  title,
  content,
  currentStepIndex,
  totalSteps,
  canGoNext,
  canGoPrev,
  nextStep,
  prevStep,
  skipTour,
  endTour,
  className,
  style,
  showControls = true,
  canSkip = true,
}) => {
  return (
    <div className={className} style={style}>
      <h3>{title}</h3>
      <p>{content}</p>
      {/* Navigation buttons */}
      {showControls && (
        <div>
          {canGoPrev && <button onClick={prevStep}>Back</button>}
          <button onClick={canGoNext ? nextStep : endTour}>
            {canGoNext ? 'Next' : 'Finish'}
          </button>
          {canSkip && <button onClick={skipTour}>Skip</button>}
        </div>
      )}
    </div>
  );
};
```

### Typing Configuration Options

```tsx
import { OverlayStyles, CardPositioning } from '@tinystack/touring';

const overlayStyles: OverlayStyles = {
  radius: 10,
  padding: 12,
  opacity: 0.75,
  colorRgb: '0, 0, 0',
};

const cardPositioning: CardPositioning = {
  floating: true,
  side: 'bottom', // 'top' | 'bottom' | 'left' | 'right'
  distancePx: 10,
};
```

### Type-Safe Event Handling

```tsx
import { TourConfig, ExtractTourEvents } from '@tinystack/touring';

const tourConfig = {
  id: 'my-tour',
  steps: [
    {
      id: 'async-step',
      type: 'async' as const,
      page: '/',
      content: {
        pending: { title: 'Loading', content: 'Wait...' },
        processing: { title: 'Processing', content: 'Working...' },
        success: { title: 'Done', content: 'Complete!' },
      },
    },
  ],
} as const;

// Extract event types for this specific tour
type MyTourEvents = ExtractTourEvents<typeof tourConfig>;
```

## Type Inference

### Extracting State Types

```tsx
import { ExtractStates } from '@tinystack/touring';

const tourConfig = {
  id: 'example',
  steps: [
    { id: 'welcome', page: '/', title: 'Hi', content: 'Hello' },
    {
      id: 'load',
      type: 'async' as const,
      page: '/',
      content: {
        pending: { title: 'Loading', content: '...' },
        processing: { title: 'Processing', content: '...' },
        success: { title: 'Done', content: '...' },
      },
    },
  ],
} as const;

// Automatically inferred states:
// 'idle' | 'completed' | 'skipped' | 'welcome' |
// 'load_pending' | 'load_processing' | 'load_success' |
// 'navigatingTo_welcome' | 'navigatingTo_load_pending' | etc.
type TourStates = ExtractStates<typeof tourConfig>;
```

### Extracting Tour IDs

```tsx
import { ExtractTourIds } from '@tinystack/touring';

const tours = [
  { id: 'onboarding', steps: [] },
  { id: 'feature-tour', steps: [] },
  { id: 'help-tour', steps: [] },
] as const;

// Type: 'onboarding' | 'feature-tour' | 'help-tour'
type AvailableTourIds = ExtractTourIds<typeof tours>;

// Type-safe tour starting
function startSpecificTour(tourId: AvailableTourIds) {
  // tourId is constrained to valid tour IDs
}
```

## Best Practices

1. **Use `as const satisfies TourConfig`**: This pattern gives you both type checking and literal type inference
2. **Export typed hooks**: Create tour-specific versions of `useTour` for better DX
3. **Export state types**: Make `ExtractStates<typeof tourConfig>` available for components
4. **Organize tours in separate files**: Keep each tour configuration in its own module
5. **Use step-level options**: Configure `canPrev`, `canSkip` at the step level for fine control

## Common Patterns

### Creating a Tour Module

```tsx
// tours/onboarding/config.ts
export const onboardingTour = {
  id: 'onboarding',
  steps: [...],
} as const satisfies TourConfig;

// tours/onboarding/hooks.ts
export const useOnboardingTour = () => useTour<typeof onboardingTour>('onboarding');

// tours/onboarding/types.ts
export type OnboardingStates = ExtractStates<typeof onboardingTour>;
export type OnboardingEvents = ExtractTourEvents<typeof onboardingTour>;

// tours/onboarding/index.ts
export * from './config';
export * from './hooks';
export * from './types';
```

## Next Steps

- Explore [Core Concepts](../core-concepts/tour-configuration.md) for deeper understanding
- Check [API Reference](../api/types.md) for all available types
- See [Examples](../examples/basic-tour.md) for real-world TypeScript usage

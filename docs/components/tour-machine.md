# TourMachine

The `TourMachine` component is the core tour engine that handles state management, navigation, and rendering of tour UI. It only initializes when a tour is active, keeping the library non-invasive.

## Usage

The TourMachine component should be included within your custom TourProvider wrapper:

```tsx
// components/TourProvider.tsx
'use client';

import { TourProvider as TourProviderComponent, TourMachine } from 'Tourista';

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <TourProviderComponent tours={tours}>
      <TourMachine
        closeOnClickOutside={true}
        onComplete={() => console.log('Tour completed')}
      />
      {children}
    </TourProviderComponent>
  );
}

// app/layout.tsx
import { TourProvider } from '@/components/TourProvider';

function App() {
  return <TourProvider>{/* Your app */}</TourProvider>;
}
```

Note: TourMachine internally uses 'isActive' to conditionally render the component.

## Props

### customCard

A custom React component to replace the default tour card.

- **Type**: `ComponentType<CardProps>`
- **Required**: No
- **Default**: Built-in `DefaultCard` component

```tsx
import { CustomCard } from './CustomCard';

<TourMachine customCard={CustomCard} />;
```

### closeOnClickOutside

Whether clicking outside the tour card should close the tour.

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`

```tsx
<TourMachine closeOnClickOutside={false} />
```

### onComplete

Callback function triggered when the tour is completed successfully.

- **Type**: `() => void`
- **Required**: No
- **Default**: None

```tsx
<TourMachine
  onComplete={() => {
    console.log('Tour finished!');
    trackEvent('tour_completed');
  }}
/>
```

### onSkip

Callback function triggered when the tour is skipped.

- **Type**: `() => void`
- **Required**: No
- **Default**: None

```tsx
<TourMachine
  onSkip={() => {
    console.log('Tour skipped');
    trackEvent('tour_skipped');
  }}
/>
```

### onNext

Callback function triggered when moving to the next step.

- **Type**: `() => void`
- **Required**: No
- **Default**: None

```tsx
<TourMachine
  onNext={() => {
    console.log('Next step');
  }}
/>
```

### onPrev

Callback function triggered when moving to the previous step.

- **Type**: `() => void`
- **Required**: No
- **Default**: None

```tsx
<TourMachine
  onPrev={() => {
    console.log('Previous step');
  }}
/>
```

### cardPositioning

Configuration for how the tour card is positioned relative to target elements.

- **Type**: `CardPositioning`
- **Required**: No
- **Default**:
  ```tsx
  {
    floating: true,
    side: 'top',
    distancePx: 0
  }
  ```

#### CardPositioning Type

```tsx
type CardPositioning = {
  floating?: boolean; // Enable Floating UI positioning
  side?: 'top' | 'bottom' | 'left' | 'right'; // Preferred side
  distancePx?: number; // Distance from target element
};
```

Example:

```tsx
<TourMachine
  cardPositioning={{
    floating: true,
    side: 'bottom',
    distancePx: 10,
  }}
/>
```

### overlayStyles

Styling configuration for the overlay spotlight effect.

- **Type**: `OverlayStyles`
- **Required**: No
- **Default**:
  ```tsx
  {
    radius: 10,
    padding: 10,
    opacity: 0.2,
    colorRgb: '0, 0, 0'
  }
  ```

#### OverlayStyles Type

```tsx
type OverlayStyles = {
  radius?: number; // Border radius of spotlight
  padding?: number; // Padding around target element
  opacity?: number; // Overlay opacity (0-1)
  colorRgb?: string; // RGB color (e.g., '0, 0, 0')
};
```

Example:

```tsx
<TourMachine
  overlayStyles={{
    radius: 15,
    padding: 12,
    opacity: 0.7,
    colorRgb: '0, 0, 50',
  }}
/>
```

## Features

### Lazy Initialization

The component only creates the state machine when a tour starts, minimizing performance impact when tours aren't active.

### Keyboard Navigation

Built-in keyboard support:

- **Arrow Right**: Next step
- **Arrow Left**: Previous step
- **Escape**: Skip/exit tour

### Page Navigation

Handles multi-page tours automatically:

- Auto-navigates to required pages
- Detects manual navigation
- Maintains tour state across page changes

### Browser Navigation

Handles browser back button - skips the tour if user navigates back.

## Complete Example

```tsx
// components/TourProvider.tsx
'use client';

import { TourProvider as TourProviderComponent, TourMachine } from 'Tourista';
import { CustomTourCard } from './CustomTourCard';

const tours = [
  {
    id: 'onboarding',
    steps: [
      /* ... */
    ],
  },
];

export function TourProvider({ children }: { children: React.ReactNode }) {
  const handleComplete = () => {
    localStorage.setItem('tourCompleted', 'true');
    console.log('Tour completed');
  };

  const handleSkip = () => {
    localStorage.setItem('tourSkipped', 'true');
    console.log('Tour skipped');
  };

  return (
    <TourProviderComponent tours={tours}>
      <TourMachine
        customCard={CustomTourCard}
        closeOnClickOutside={true}
        onComplete={handleComplete}
        onSkip={handleSkip}
        cardPositioning={{
          floating: true,
          side: 'bottom',
          distancePx: 10,
        }}
        overlayStyles={{
          radius: 12,
          padding: 8,
          opacity: 0.5,
          colorRgb: '0, 0, 0',
        }}
      />
      {children}
    </TourProviderComponent>
  );
}

// app/layout.tsx
import { TourProvider } from '@/components/TourProvider';

export function App() {
  return <TourProvider>{/* Your app content */}</TourProvider>;
}
```

## Important Notes

1. **Required Context**: Must be used inside `TourProvider`
2. **Single Instance**: Only one `TourMachine` should be rendered per app
3. **Client Component**: Must be used in client components (`'use client'`)
4. **Conditional Rendering**: Only renders when a tour is active

## Props Summary Table

| Prop                  | Type                       | Required | Default       | Description              |
| --------------------- | -------------------------- | -------- | ------------- | ------------------------ |
| `customCard`          | `ComponentType<CardProps>` | No       | `DefaultCard` | Custom card component    |
| `closeOnClickOutside` | `boolean`                  | No       | `true`        | Click outside to close   |
| `onComplete`          | `() => void`               | No       | -             | Tour completion callback |
| `onSkip`              | `() => void`               | No       | -             | Tour skip callback       |
| `onNext`              | `() => void`               | No       | -             | Next step callback       |
| `onPrev`              | `() => void`               | No       | -             | Previous step callback   |
| `cardPositioning`     | `CardPositioning`          | No       | See defaults  | Card position config     |
| `overlayStyles`       | `OverlayStyles`            | No       | See defaults  | Overlay styling config   |

## Default Values Table

| Configuration       | Property     | Default Value |
| ------------------- | ------------ | ------------- |
| **cardPositioning** | `floating`   | `true`        |
|                     | `side`       | `'top'`       |
|                     | `distancePx` | `0`           |
| **overlayStyles**   | `radius`     | `10`          |
|                     | `padding`    | `10`          |
|                     | `opacity`    | `0.2`         |
|                     | `colorRgb`   | `'0, 0, 0'`   |

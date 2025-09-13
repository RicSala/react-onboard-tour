# TourProvider

The `TourProvider` component is a React context provider that manages tour state and provides tour functionality to child components. It must wrap any components that use tour features.

## Usage

```tsx
import { TourProvider } from 'Tourista';

const tours = [
  {
    id: 'onboarding',
    steps: [...],
  },
  {
    id: 'feature-tour',
    steps: [...],
  },
];

function App() {
  return (
    <TourProvider tours={tours}>
      {/* Your app components */}
    </TourProvider>
  );
}
```

## Props

### tours

An array of tour configurations. Each tour must have a unique ID.

- **Type**: `TourConfig[]`
- **Required**: Yes
- **Default**: None

```tsx
const tours = [
  {
    id: 'welcome',
    steps: [
      {
        id: 'step1',
        page: '/',
        title: 'Welcome',
        content: 'Welcome to our app',
      },
    ],
    allowPageNavigation: true,
    allowSkip: true,
  },
];
```

### children

The child components that will have access to the tour context.

- **Type**: `ReactNode`
- **Required**: Yes
- **Default**: None

## Context Value

The `TourProvider` makes the following values available through context:

### startTour

Starts a tour by its ID. Only one tour can be active at a time.

- **Type**: `(tourId: string) => void`
- **Note**: If a tour is already active, this call is ignored

```tsx
const { startTour } = useTourContext();
startTour('onboarding');
```

### endTour

Ends the currently active tour.

- **Type**: `() => void`

```tsx
const { endTour } = useTourContext();
endTour();
```

### isActive

Indicates whether any tour is currently active.

- **Type**: `boolean`

```tsx
const { isActive } = useTourContext();
if (isActive) {
  console.log('A tour is running');
}
```

### tourConfig

The configuration of the currently active tour, or `undefined` if no tour is active.

- **Type**: `TourConfig | undefined`

```tsx
const { tourConfig } = useTourContext();
if (tourConfig) {
  console.log(`Running tour: ${tourConfig.id}`);
}
```

### handleSkip

Internal handler for skipping tours. Generally not used directly.

- **Type**: `() => void`

### handleComplete

Internal handler for completing tours. Generally not used directly.

- **Type**: `() => void`

## Hook Usage

### useTourContext

Access the tour context from any child component.

```tsx
import { useTourContext } from 'Tourista';

function MyComponent() {
  const { startTour, endTour, isActive, tourConfig } = useTourContext();

  return (
    <button onClick={() => startTour('welcome')} disabled={isActive}>
      {isActive ? 'Tour Active' : 'Start Tour'}
    </button>
  );
}
```

**Note**: This hook will throw an error if used outside of a `TourProvider`.

## Important Notes

1. **Single Active Tour**: Only one tour can be active at a time
2. **Client Component**: Must be used in client components (`'use client'`)
3. **Required Wrapper**: All components using tour features must be wrapped by `TourProvider`
4. **Tour Lifecycle**: Tours are managed at the provider level, not by individual components

## Example with Multiple Tours

```tsx
'use client';

import { TourProvider, TourMachine } from 'Tourista';

const tours = [
  {
    id: 'onboarding',
    steps: [
      /* ... */
    ],
  },
  {
    id: 'feature-highlight',
    steps: [
      /* ... */
    ],
  },
  {
    id: 'help-tour',
    steps: [
      /* ... */
    ],
  },
];

export function RootLayout({ children }) {
  return (
    <TourProvider tours={tours}>
      <TourMachine />
      {children}
    </TourProvider>
  );
}
```

## Props Summary Table

| Prop       | Type           | Required | Default | Description                            |
| ---------- | -------------- | -------- | ------- | -------------------------------------- |
| `tours`    | `TourConfig[]` | Yes      | -       | Array of tour configurations           |
| `children` | `ReactNode`    | Yes      | -       | Child components that need tour access |

## Context API Table

| Property         | Type                       | Description               |
| ---------------- | -------------------------- | ------------------------- |
| `startTour`      | `(tourId: string) => void` | Starts a tour by ID       |
| `endTour`        | `() => void`               | Ends the active tour      |
| `isActive`       | `boolean`                  | Whether a tour is active  |
| `tourConfig`     | `TourConfig \| undefined`  | Active tour configuration |
| `handleSkip`     | `() => void`               | Internal skip handler     |
| `handleComplete` | `() => void`               | Internal complete handler |

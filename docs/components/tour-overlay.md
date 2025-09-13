# TourOverlay

The `TourOverlay` component handles the visual presentation of tours, including the spotlight effect, card positioning, and animations. It's typically used internally by `TourMachine`.

You are not expected to use this component directly, and this docs are here just to help you understand the internals of the library so you can get a better understanding of it.

## Usage

```tsx
import { TourOverlay } from 'Tourista';

// Usually used internally by TourMachine
<TourOverlay
  tourId='onboarding'
  overlayStyles={{
    radius: 10,
    padding: 10,
    opacity: 0.2,
    colorRgb: '0, 0, 0',
  }}
  cardPositioning={{
    floating: true,
    side: 'top',
    distancePx: 0,
  }}
/>;
```

## Props

### tourId

The ID of the tour to display overlay for.

- **Type**: `string`
- **Required**: Yes
- **Default**: None

```tsx
<TourOverlay tourId='welcome-tour' />
```

### customCard

A custom React component to replace the default tour card.

- **Type**: `ComponentType<CardProps>`
- **Required**: No
- **Default**: `DefaultCard` component

```tsx
import { CustomCard } from './CustomCard';

<TourOverlay tourId='tour' customCard={CustomCard} />;
```

### onOverlayClick

Callback function triggered when the overlay backdrop is clicked.

- **Type**: `() => void`
- **Required**: No
- **Default**: None

```tsx
<TourOverlay
  tourId='tour'
  onOverlayClick={() => {
    console.log('Overlay clicked');
    // Usually used to skip/close tour
  }}
/>
```

### backdropPointerEvents

Controls whether the backdrop captures pointer events.

- **Type**: `'auto' | 'none'`
- **Required**: No
- **Default**: `'auto'`

```tsx
<TourOverlay
  tourId='tour'
  backdropPointerEvents='none' // Allow clicking through overlay
/>
```

### overlayStyles

Styling configuration for the overlay and spotlight effect.

- **Type**: `Required<OverlayStyles>` (all properties required)
- **Required**: Yes
- **Default**: None (must be provided)

```tsx
type OverlayStyles = {
  radius: number; // Border radius of spotlight (px)
  padding: number; // Padding around target element (px)
  opacity: number; // Overlay opacity (0-1)
  colorRgb: string; // RGB color string (e.g., '0, 0, 0')
};
```

Example:

```tsx
<TourOverlay
  tourId='tour'
  overlayStyles={{
    radius: 10,
    padding: 10,
    opacity: 0.2,
    colorRgb: '0, 0, 0',
  }}
/>
```

### cardPositioning

Configuration for card positioning relative to target elements.

- **Type**: `Required<CardPositioning>` (all properties required)
- **Required**: Yes
- **Default**: None (must be provided)

```tsx
type CardPositioning = {
  floating: boolean; // Enable Floating UI smart positioning
  side: 'top' | 'bottom' | 'left' | 'right'; // Preferred side
  distancePx: number; // Distance from target element (px)
};
```

Example:

```tsx
<TourOverlay
  tourId='tour'
  cardPositioning={{
    floating: true,
    side: 'bottom',
    distancePx: 10,
  }}
/>
```

## Features

### Smart Positioning

Uses Floating UI to ensure cards are always visible:

- **Auto-flip**: Flips to opposite side if no space
- **Shift**: Moves along axis to stay in viewport
- **Collision prevention**: Never renders off-screen

### Spotlight Effect

Creates a darkened overlay with a highlighted area around the target element:

- Customizable opacity for overlay darkness
- Adjustable padding around highlighted element
- Smooth border radius for spotlight

### Animations

Smooth transitions powered by Framer Motion:

- Fade in/out effects
- Smooth spotlight position changes
- Card entrance animations

### Auto-Scrolling

Automatically scrolls target elements into view when needed.

## Internal Behavior

### Element Detection

1. Finds target element using CSS selector
2. Calculates element position and dimensions
3. Updates spotlight position
4. Positions card using Floating UI

### Resize Handling

Automatically updates positioning when:

- Window resizes
- Element position changes
- Content reflows

## Example with Custom Card

```tsx
'use client';

import { TourOverlay } from 'Tourista';
import { MyCustomCard } from './MyCustomCard';

export function CustomTourOverlay() {
  return (
    <TourOverlay
      tourId='my-tour'
      customCard={MyCustomCard}
      onOverlayClick={() => {
        // Handle overlay click (usually skip tour)
        tourActor?.send({ type: 'SKIP_TOUR', tourId: 'my-tour' });
      }}
      backdropPointerEvents='auto'
      overlayStyles={{
        radius: 12,
        padding: 8,
        opacity: 0.5,
        colorRgb: '0, 0, 0',
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

## Important Notes

1. **Internal Component**: Usually used internally by `TourMachine`
2. **Required Props**: Both `overlayStyles` and `cardPositioning` must have all properties
3. **Tour Context**: Requires active tour context to function
4. **Client Component**: Must be used in client components (`'use client'`)

## Props Summary Table

| Prop                    | Type                        | Required | Default       | Description                            |
| ----------------------- | --------------------------- | -------- | ------------- | -------------------------------------- |
| `tourId`                | `string`                    | Yes      | -             | ID of the tour to display              |
| `customCard`            | `ComponentType<CardProps>`  | No       | `DefaultCard` | Custom card component                  |
| `onOverlayClick`        | `() => void`                | No       | -             | Overlay click handler                  |
| `backdropPointerEvents` | `'auto' \| 'none'`          | No       | `'auto'`      | Backdrop pointer events                |
| `overlayStyles`         | `Required<OverlayStyles>`   | Yes      | -             | Overlay styling (all fields required)  |
| `cardPositioning`       | `Required<CardPositioning>` | Yes      | -             | Card positioning (all fields required) |

## Style Properties Table

| Property                       | Type      | Description                  | Example     |
| ------------------------------ | --------- | ---------------------------- | ----------- |
| **overlayStyles.radius**       | `number`  | Spotlight border radius (px) | `10`        |
| **overlayStyles.padding**      | `number`  | Padding around target (px)   | `10`        |
| **overlayStyles.opacity**      | `number`  | Overlay darkness (0-1)       | `0.2`       |
| **overlayStyles.colorRgb**     | `string`  | RGB color values             | `'0, 0, 0'` |
| **cardPositioning.floating**   | `boolean` | Enable smart positioning     | `true`      |
| **cardPositioning.side**       | `string`  | Preferred card position      | `'top'`     |
| **cardPositioning.distancePx** | `number`  | Distance from target (px)    | `10`        |

# Keyboard Navigation

Tourista provides built-in keyboard support for navigating through tours, making them accessible and providing power users with quick navigation options.

## Supported Keys

### Arrow Right (→)

Advances to the next step in the tour.

- **Action**: Sends `NEXT` event
- **Equivalent to**: Clicking the "Next" button
- **Respects**: Step's `canNext` setting

### Arrow Left (←)

Goes back to the previous step.

- **Action**: Sends `PREV` event
- **Equivalent to**: Clicking the "Previous" button
- **Respects**: Step's `canPrev` setting

### Escape (Esc)

Skips/exits the tour entirely.

- **Action**: Sends `SKIP_TOUR` event
- **Equivalent to**: Clicking the "Skip" button
- **Triggers**: `onSkip` callback

## How It Works

The keyboard navigation is automatically enabled when a tour is active. The implementation listens for keydown events on the document:

```tsx
// This is handled automatically by TourMachine
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight')
      return tourActor?.send({ type: 'NEXT', tourId: tourConfig.id });
    if (event.key === 'ArrowLeft')
      return tourActor?.send({ type: 'PREV', tourId: tourConfig.id });
    if (event.key === 'Escape')
      return tourActor?.send({ type: 'SKIP_TOUR', tourId: tourConfig.id });
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [tourConfig.id]);
```

## Usage

Keyboard navigation works automatically - no configuration needed:

```tsx
// components/TourProvider.tsx
'use client';

import { TourProvider as TourProviderComponent, TourMachine } from 'tourista';

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <TourProviderComponent tours={tours}>
      <TourMachine />
      {/* Keyboard navigation is enabled by default */}
      {children}
    </TourProviderComponent>
  );
}
```

## Interaction with Other Features

### With Auto-Advance

Keyboard navigation works alongside auto-advance:

```tsx
{
  id: 'auto-step',
  targetElement: '#element',
  title: 'Auto-advancing',
  content: 'This will auto-advance in 5 seconds, or press → now',
  autoAdvance: 5000,
}
```

Users can:

- Wait for auto-advance
- Press `→` to advance immediately
- Press `←` to go back (cancels auto-advance)
- Press `Esc` to skip

### With Async Steps

Keyboard navigation respects async step states:

```tsx
{
  id: 'async-step',
  type: 'async',
  page: '/form',
  content: {
    pending: {
      title: 'Waiting',
      content: 'Complete the form to continue',
      // Arrow right won't work until form is submitted
    },
    processing: {
      title: 'Processing',
      content: 'Please wait...',
      // No keyboard navigation during processing
    },
    success: {
      title: 'Success!',
      content: 'Press → to continue',
      // Arrow right now works
    },
  },
}
```

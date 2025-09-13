# DebugPanel

The `DebugPanel` component is a development tool that displays real-time tour state information. It helps developers debug tour configurations and understand the current state of the tour machine.

## Tailwind CSS Requirement

**Important**: The DebugPanel component requires Tailwind CSS v4 for styling. Add this to your global CSS file:

```css
/* In your global.css or app.css */
@source '../../node_modules/@tinystack/touring/dist/**/*.{js,mjs}';
```

Since this is a development tool, you might not need to configure this in production builds.

## Usage

```tsx
import { TourProvider, TourMachine, DebugPanel } from '@tinystack/touring';

function App() {
  return (
    <TourProvider tours={tours}>
      <TourMachine />
      <DebugPanel tourId="onboarding" />
      {/* Your app */}
    </TourProvider>
  );
}
```

## Props

### tourId

The ID of the tour to debug.

- **Type**: `string`
- **Required**: Yes
- **Default**: None

```tsx
<DebugPanel tourId="welcome-tour" />
```

## Features

### Displayed Information

The debug panel shows:

1. **Tour ID**: The identifier of the active tour
2. **Current State**: The current state in the state machine
3. **Is Active**: Whether the tour is currently active
4. **Target Element**: The CSS selector of the currently targeted element
5. **Context**: Full state machine context (JSON formatted)
6. **Navigation Status**: Can go next/previous indicators
7. **Auto-advance Timer**: Shows if auto-advance is active
8. **Async Status**: Special indicators for async step states

### Visual Design

- **Position**: Fixed at bottom-left of viewport
- **Collapsible**: Can be minimized to save screen space
- **Color Coding**: 
  - Green for active/normal states
  - Yellow for auto-advance
  - Purple for async operations
  - Gray for inactive state

### State Detection

Automatically detects and displays:
- Pending states (`*_pending`)
- Processing states (`*_processing`)
- Success states (`*_success`)

## Example Usage

### Basic Debug Setup

```tsx
'use client';

import { TourProvider, TourMachine, DebugPanel } from '@tinystack/touring';

export function AppWithDebug() {
  const tours = [
    {
      id: 'debug-tour',
      steps: [
        {
          id: 'step1',
          page: '/',
          title: 'First Step',
          content: 'Debug me!',
        },
      ],
    },
  ];

  return (
    <TourProvider tours={tours}>
      <TourMachine />
      {/* Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel tourId="debug-tour" />
      )}
      {/* Your app */}
    </TourProvider>
  );
}
```

### Multiple Tours Debug

```tsx
// Debug different tours by changing tourId
function DebugControls() {
  const [debugTourId, setDebugTourId] = useState('onboarding');

  return (
    <>
      <select onChange={(e) => setDebugTourId(e.target.value)}>
        <option value="onboarding">Onboarding Tour</option>
        <option value="feature">Feature Tour</option>
        <option value="help">Help Tour</option>
      </select>
      <DebugPanel tourId={debugTourId} />
    </>
  );
}
```

## Panel States

### Active Tour State

When a tour is active, displays:
- All tour information
- Green color scheme
- Collapsible interface

### Inactive State

When no tour is active or tour ID doesn't match:
- Shows "No active tour" message
- Gray color scheme
- Minimal interface

### Collapsed State

When minimized:
- Shows "Show Debug Info" button
- Preserves state when expanded again

## Information Details

### Context Display

Shows the full state machine context including:
- `tourId`: Current tour identifier
- `currentPage`: Current page path
- `targetElement`: Target CSS selector
- `title`: Current step title
- `content`: Current step content
- `autoAdvanceTimer`: Timer ID if active

### Navigation Indicators

- **Next**: ✅ (can navigate) or ❌ (cannot navigate)
- **Prev**: ✅ (can navigate) or ❌ (cannot navigate)

### Async State Indicators

For async steps, shows custom messages:
- **Pending**: "⏸️ Waiting for payment"
- **Processing**: "⏳ Processing payment..."
- **Success**: "✅ Payment complete!"

## Styling

The component uses Tailwind CSS classes by default:
- Fixed positioning with `z-[9998]` to stay above most content
- Responsive width of `w-80` (20rem)
- Border and shadow for visibility
- Color-coded sections for different information types

## Important Notes

1. **Development Tool**: Intended for development, not production
2. **Performance**: May impact performance if left visible in production
3. **Z-Index**: Uses high z-index (9998) to stay visible
4. **Dependencies**: Requires Tailwind CSS for default styling
5. **Client Component**: Must be used in client components (`'use client'`)

## Conditional Rendering

Best practice for production:

```tsx
{process.env.NODE_ENV === 'development' && (
  <DebugPanel tourId="my-tour" />
)}
```

Or with a feature flag:

```tsx
{debugMode && <DebugPanel tourId="my-tour" />}
```

## Props Summary Table

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tourId` | `string` | Yes | - | ID of the tour to debug |

## Display Information Table

| Information | Description | Visual Indicator |
|-------------|-------------|------------------|
| Tour ID | Active tour identifier | Green background |
| Current State | State machine state | Green text |
| Is Active | Tour activity status | Green (Yes) / Red (No) |
| Target Element | CSS selector | Green text |
| Context | Full state context | Gray background, monospace |
| Navigation | Can go next/prev | ✅ or ❌ icons |
| Auto-advance | Timer status | Yellow background |
| Async Status | Async step state | Purple background |
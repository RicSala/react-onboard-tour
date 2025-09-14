# API Reference

Detailed information about Tourista's components, props, and hooks.

## TourMachine Props

The TourMachine component is the main component that wraps your application and provides the tour functionality.

| Prop | Type | Description |
|------|------|-------------|
| `customCard` | `ComponentType<CardProps>` | Custom card component to replace the default one |
| `closeOnClickOutside` | `boolean` | Controls whether clicking outside closes the tour (default: `true`) |
| `onComplete` | `(tourId: string) => void` | Callback function triggered when the tour completes |
| `onStart` | `(tourId: string) => void` | Callback function triggered when the tour starts |
| `onSkip` | `(stepIndex: number, stepId: string, tourId: string) => void` | Callback function triggered when the user skips the tour |
| `onStepChange` | `(stepIndex: number, stepId: string, tourId: string) => void` | Callback function triggered when the tour progresses to a different step |
| `cardPositioning` | `CardPositioning` | Configuration for card positioning relative to target element |
| `overlayStyles` | `OverlayStyles` | Configuration for overlay appearance |

## Step Object

Each step in a tour is defined by a Step object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the step |
| `type` | `'sync' \| 'async'` | Step type (default: `'sync'`) |
| `page` | `string` | The URL path where this step should be shown |
| `targetElement` | `string` | CSS selector for the element to highlight |
| `title` | `string` | Title of the step (for sync steps) |
| `content` | `string \| AsyncContent` | Content of the step. String for sync steps, object for async steps |
| `autoAdvance` | `number` | Milliseconds to wait before auto-advancing to next step |
| `canNext` | `boolean` | Whether to allow forward navigation (default: `true`) |
| `canPrev` | `boolean` | Whether to allow backward navigation (default: `true`) |
| `canSkip` | `boolean` | Whether to allow skipping this step (default: `true`) |

### Async Step Content

For async steps, the content property is an object:

| Property | Type | Description |
|----------|------|-------------|
| `content.pending` | `StepContent` | Content shown while waiting for user action |
| `content.processing` | `StepContent` | Content shown while processing |
| `content.success` | `StepContent` | Content shown when action completes |
| `events` | `AsyncEvents` | Optional custom event names |

## Tour Object

Tour configuration object that defines a complete tour:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the tour |
| `steps` | `TourStep[]` | Array of step objects defining the tour flow |
| `allowPageNavigation` | `boolean` | Whether to allow navigation between pages |
| `allowSkip` | `boolean` | Whether to allow skipping the entire tour |

## useTourContext Hook

Hook to access the tour context and management functions:

| Return Property | Type | Description |
|-----------------|------|-------------|
| `startTour` | `(tourId: string) => void` | Starts the specified tour |
| `endTour` | `() => void` | Ends the current tour |
| `isActive` | `boolean` | Whether a tour is currently active |
| `tourConfig` | `TourConfig \| undefined` | Current tour configuration |
| `handleSkip` | `() => void` | Internal skip handler |
| `handleComplete` | `() => void` | Internal complete handler |

## useTour Hook

Hook to control and access state of a specific tour:

| Return Property | Type | Description |
|-----------------|------|-------------|
| `isActive` | `boolean` | Whether this specific tour is active |
| `currentState` | `string \| null` | Current state of the tour state machine |
| `currentStepData` | `StepData \| null` | Data for the current step |
| `currentStepIndex` | `number` | Index of the current step (0-based) |
| `totalSteps` | `number` | Total number of steps in the tour |
| `canGoNext` | `boolean` | Whether next navigation is allowed |
| `canGoPrev` | `boolean` | Whether previous navigation is allowed |
| `canSkip` | `boolean` | Whether skipping is allowed |
| `nextStep` | `() => void` | Navigate to next step |
| `prevStep` | `() => void` | Navigate to previous step |
| `skipTour` | `() => void` | Skip the tour |
| `endTour` | `() => void` | End the tour |
| `sendEvent` | `(event: TourEvent) => void` | Send custom events (for async steps) |

## Type Definitions

### CardPositioning

| Property | Type | Description |
|----------|------|-------------|
| `floating` | `boolean` | Whether to use floating UI positioning |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | Side of target element to position card |
| `distancePx` | `number` | Distance from target element in pixels |

### OverlayStyles

| Property | Type | Description |
|----------|------|-------------|
| `radius` | `number` | Border radius of the highlight cutout |
| `padding` | `number` | Padding around the highlighted element |
| `opacity` | `number` | Opacity of the overlay (0-1) |
| `colorRgb` | `string` | RGB color of the overlay (e.g., "0, 0, 0") |

### StepContent

| Property | Type | Description |
|----------|------|-------------|
| `targetElement` | `string` | CSS selector for the element to highlight |
| `title` | `string` | Title for this state |
| `content` | `string` | Content/description for this state |

### CardProps

Props passed to custom card components:

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string \| undefined` | Current step title |
| `content` | `string \| undefined` | Current step content |
| `currentStepIndex` | `number` | Current step index |
| `totalSteps` | `number` | Total number of steps |
| `canGoNext` | `boolean` | Whether next is allowed |
| `canGoPrev` | `boolean` | Whether previous is allowed |
| `canSkip` | `boolean` | Whether skip is allowed |
| `nextStep` | `() => void` | Function to go to next step |
| `prevStep` | `() => void` | Function to go to previous step |
| `skipTour` | `() => void` | Function to skip tour |
| `endTour` | `() => void` | Function to end tour |
| `className` | `string \| undefined` | CSS class name |
| `style` | `React.CSSProperties \| undefined` | Inline styles |
| `showControls` | `boolean \| undefined` | Whether to show navigation controls |
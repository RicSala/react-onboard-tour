# DefaultCard

The `DefaultCard` component is the built-in tour card UI that displays tour content, navigation controls, and progress indicator. It can be replaced with a custom component via the `customCard` prop in `TourMachine`.

## Tailwind CSS Requirement

**Important**: The DefaultCard component requires Tailwind CSS v4 to render properly. Add this to your global CSS file:

```css
/* In your global.css or app.css */
@source '../../node_modules/@tinystack/touring/dist/**/*.{js,mjs}';
```

If you don't want to use Tailwind CSS, you should provide a custom card component instead.

## Usage

The DefaultCard is used automatically by TourMachine. To use a custom card instead:

```tsx
import { TourMachine } from '@tinystack/touring';
import { CustomCard } from './CustomCard';

<TourMachine customCard={CustomCard} />
```

## Props (CardProps Interface)

All props are passed automatically by the tour system to any card component (default or custom).

### title

The title text for the current tour step.

- **Type**: `string | undefined`
- **Required**: No
- **Default**: None

### content

The content/description text for the current tour step.

- **Type**: `string | undefined`
- **Required**: No
- **Default**: None

### currentStepIndex

The zero-based index of the current step.

- **Type**: `number`
- **Required**: Yes
- **Default**: None

### totalSteps

The total number of steps in the tour.

- **Type**: `number`
- **Required**: Yes
- **Default**: None

### canGoNext

Whether the user can navigate to the next step.

- **Type**: `boolean`
- **Required**: Yes
- **Default**: None

### canGoPrev

Whether the user can navigate to the previous step.

- **Type**: `boolean`
- **Required**: Yes
- **Default**: None

### canSkip

Whether the user can skip the tour at this step.

- **Type**: `boolean | undefined`
- **Required**: No
- **Default**: `undefined`

### nextStep

Function to navigate to the next step.

- **Type**: `() => void`
- **Required**: Yes
- **Default**: None

### prevStep

Function to navigate to the previous step.

- **Type**: `() => void`
- **Required**: Yes
- **Default**: None

### skipTour

Function to skip/exit the tour.

- **Type**: `() => void`
- **Required**: Yes
- **Default**: None

### endTour

Function to properly end the tour (used on last step).

- **Type**: `() => void`
- **Required**: Yes
- **Default**: None

### className

Optional CSS class name for custom styling.

- **Type**: `string | undefined`
- **Required**: No
- **Default**: None

### style

Optional inline styles to apply to the card container.

- **Type**: `React.CSSProperties | undefined`
- **Required**: No
- **Default**: None

### showControls

Whether to show navigation controls (prev/next buttons).

- **Type**: `boolean | undefined`
- **Required**: No
- **Default**: `true`

## Default Card Features

### Progress Bar

Visual indicator showing tour progress:
- Blue fill indicates completed percentage
- Smooth animation between steps
- Shows `(current step) of (total steps)` text

### Navigation Buttons

- **Previous**: Disabled when `canGoPrev` is false
- **Next**: Shows when not on the last step or when can still go forward
- **Finish**: Shows on the last step when `canGoNext` is false
- **Skip Tour**: Shows when `canSkip` is true and not on last step

### Styling

Default styles include:
- White background with rounded corners
- Shadow for depth
- Responsive padding
- Min width: 16rem (256px)
- Max width: 32rem (512px)

## Creating a Custom Card

To create a custom card component, implement the `CardProps` interface:

```tsx
import { CardProps } from '@tinystack/touring';
import { forwardRef } from 'react';

const CustomCard = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      content,
      currentStepIndex,
      totalSteps,
      canGoNext,
      canGoPrev,
      canSkip,
      nextStep,
      prevStep,
      skipTour,
      endTour,
      className,
      style,
      showControls = true,
    },
    ref
  ) => {
    const isLastStep = currentStepIndex === totalSteps - 1;

    return (
      <div ref={ref} className={className} style={style}>
        <h3>{title}</h3>
        <p>{content}</p>
        
        {/* Progress */}
        <div>
          Step {currentStepIndex + 1} of {totalSteps}
        </div>
        
        {/* Navigation */}
        {showControls && (
          <div>
            <button onClick={prevStep} disabled={!canGoPrev}>
              Back
            </button>
            
            {!canGoNext && isLastStep ? (
              <button onClick={endTour}>Finish</button>
            ) : (
              <button onClick={nextStep} disabled={!canGoNext}>
                Next
              </button>
            )}
            
            {canSkip && !isLastStep && (
              <button onClick={skipTour}>Skip</button>
            )}
          </div>
        )}
      </div>
    );
  }
);

CustomCard.displayName = 'CustomCard';

export default CustomCard;
```

## Important Notes

1. **ForwardRef**: Cards should use `forwardRef` for proper positioning
2. **Last Step Logic**: Check both `isLastStep` and `canGoNext` for finish button
3. **Conditional Rendering**: Respect `showControls` and `canSkip` props
4. **Styling Override**: Custom `style` prop should merge with default styles

## Props Summary Table

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string \| undefined` | No | - | Step title text |
| `content` | `string \| undefined` | No | - | Step content text |
| `currentStepIndex` | `number` | Yes | - | Current step index (0-based) |
| `totalSteps` | `number` | Yes | - | Total number of steps |
| `canGoNext` | `boolean` | Yes | - | Can navigate forward |
| `canGoPrev` | `boolean` | Yes | - | Can navigate backward |
| `canSkip` | `boolean \| undefined` | No | - | Can skip tour |
| `nextStep` | `() => void` | Yes | - | Navigate to next step |
| `prevStep` | `() => void` | Yes | - | Navigate to previous step |
| `skipTour` | `() => void` | Yes | - | Skip/exit tour |
| `endTour` | `() => void` | Yes | - | End tour properly |
| `className` | `string \| undefined` | No | - | CSS class name |
| `style` | `React.CSSProperties \| undefined` | No | - | Inline styles |
| `showControls` | `boolean \| undefined` | No | `true` | Show nav controls |

## Default Styling Values

| Element | Style | Value |
|---------|-------|-------|
| **Container** | Background | `white` |
| | Border Radius | `0.5rem` |
| | Padding | `1rem` |
| | Min Width | `16rem` |
| | Max Width | `32rem` |
| **Title** | Font Size | `1.125rem` |
| | Font Weight | `bold` |
| **Content** | Font Size | `0.875rem` |
| **Progress Bar** | Height | `0.625rem` |
| | Background | `#E5E7EB` |
| | Fill Color | `#2563EB` |
| **Buttons** | Padding | `0.5rem 1rem` |
| | Border Radius | `0.375rem` |
| | Next Color | `#2563EB` |
| | Finish Color | `#10B981` |
| | Skip/Prev Color | `#F3F4F6` |
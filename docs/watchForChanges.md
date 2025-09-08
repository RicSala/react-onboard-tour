# watchForChanges Feature Documentation

The `watchForChanges` feature allows tours to automatically advance when specific DOM changes occur, enabling more natural user interactions where the tour progresses based on user actions rather than clicking "Next".

## How It Works

When a step has `watchForChanges` configured, the library uses a `MutationObserver` to monitor DOM changes. When the expected change is detected (e.g., a new element appears after a button click), the tour automatically advances to the next step.

## Configuration

Add the `watchForChanges` object to any step in your tour:

```typescript
interface WatchForChanges {
  target?: string;        // CSS selector for element to observe (defaults to step.selector)
  lookFor: string;        // CSS selector for element that indicates action completion
  childList?: boolean;    // Watch for added/removed child nodes (default: true)
  attributes?: boolean;   // Watch for attribute changes (default: false)
  characterData?: boolean;// Watch for text content changes (default: false)
  timeout?: number;       // Stop watching after X milliseconds (default: 10000)
  debounce?: number;      // Wait X ms after detection before advancing (default: 100)
}
```

## Examples

### Example 1: Watch for Modal Opening

When user clicks "Add Item" button, wait for the modal to appear:

```typescript
{
  title: "Add a New Item",
  content: "Click the 'Add Item' button to create a new item",
  selector: "#add-item-button",
  watchForChanges: {
    lookFor: ".modal-dialog",  // Wait for modal to appear
    timeout: 5000,              // Give up after 5 seconds
    debounce: 200               // Wait 200ms after modal appears
  }
}
```

### Example 2: Watch for Form Submission Result

Monitor a form container for success message after submission:

```typescript
{
  title: "Submit the Form",
  content: "Fill out the form and click Submit",
  selector: "#contact-form",
  watchForChanges: {
    target: "#form-container",     // Watch the container, not the form
    lookFor: ".success-message",   // Wait for success message
    timeout: 15000,                 // Forms might take longer
    debounce: 500                   // Wait half second after success
  }
}
```

### Example 3: Watch for Dropdown Menu Opening

Auto-advance when user opens a dropdown menu:

```typescript
{
  title: "Open Settings",
  content: "Click on the settings dropdown",
  selector: "#settings-button",
  watchForChanges: {
    lookFor: "[role='menu']",      // Wait for dropdown menu
    attributes: true,               // Also watch for aria-expanded changes
    timeout: 3000,
    debounce: 50                    // Quick advance for menus
  }
}
```

### Example 4: Watch for Data Loading

Wait for data to load after user triggers a fetch:

```typescript
{
  title: "Load Reports",
  content: "Click 'Load Reports' to fetch your data",
  selector: "#load-reports-btn",
  watchForChanges: {
    target: "#reports-container",
    lookFor: ".report-item",        // Wait for first report item
    timeout: 20000,                  // API calls might be slow
    debounce: 300
  }
}
```

### Example 5: Watch for Tab Switch

Detect when user switches to a specific tab:

```typescript
{
  title: "Go to Analytics Tab",
  content: "Click on the Analytics tab to view your metrics",
  selector: "[data-tab='analytics']",
  watchForChanges: {
    target: ".tab-content",
    lookFor: "#analytics-panel.active",  // Wait for panel to become active
    attributes: true,                    // Watch for class changes
    timeout: 5000,
    debounce: 100
  }
}
```

## Best Practices

1. **Always provide manual fallback**: The "Next" button remains available even when `watchForChanges` is configured, allowing users to advance manually if needed.

2. **Set appropriate timeouts**: Don't make timeouts too long (users might get confused) or too short (action might not complete).

3. **Use specific selectors**: Make `lookFor` selectors as specific as possible to avoid false positives.

4. **Consider debouncing**: Fast DOM changes might trigger multiple times; use debounce to wait for stability.

5. **Target the right container**: Sometimes you need to watch a parent container rather than the clicked element itself.

## Fallback Behavior

If the expected change doesn't occur within the timeout period:
- The MutationObserver stops watching
- The tour remains on the current step
- Users can still click "Next" to advance manually
- No error is thrown (unless `disableConsoleLogs` is false, then a console message appears)

## Performance Considerations

- MutationObservers are automatically disconnected when:
  - The expected element is found
  - The timeout is reached
  - The step changes
  - The tour ends
  
- Only one observer runs per step
- Observers are properly cleaned up to prevent memory leaks

## Debugging

Enable console logs to see MutationObserver activity:

```typescript
<TouringReact
  tours={tours}
  disableConsoleLogs={false}  // See observer setup and detection logs
>
  {children}
</TouringReact>
```

This will log:
- When observers are set up
- When expected elements are found
- When timeouts are reached
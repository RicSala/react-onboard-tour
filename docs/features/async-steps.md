# Async Steps

Async steps allow tours to wait for user actions or external events before proceeding. Unlike regular steps that users can navigate immediately, async steps require something to happen first - like submitting a form, clicking a specific button, or waiting for data to load.

## How It Works

Async steps have three states:

1. **Pending** - Waiting for the user to start an action
2. **Processing** - The action is in progress
3. **Success** - The action is complete, can now continue

## Basic Example

```tsx
const tour: TourConfig = {
  id: 'form-tour',
  steps: [
    {
      id: 'fill-form',
      type: 'async',
      page: '/signup',
      content: {
        pending: {
          targetElement: '#email-input',
          title: 'Enter Your Email',
          content: 'Type your email address and click Submit',
        },
        processing: {
          targetElement: '#submit-button',
          title: 'Processing...',
          content: 'Validating your email',
        },
        success: {
          targetElement: '#success-message',
          title: 'Email Verified!',
          content: 'Great! Now you can continue',
        },
      },
    },
  ],
};
```

## Controlling Async Steps

### Using Tour Helpers (Recommended)

The easiest way to control async steps is using tour helpers, which provide the correct event names automatically:

```tsx
import { useTour, createTourHelpers } from 'tourista';
import { tourConfig } from './tour-config';

// Create helpers once
const tourHelpers = createTourHelpers(tourConfig);

function SignupForm() {
  const tour = useTour('form-tour');

  const handleSubmit = async (email: string) => {
    // Get the async task info for this step
    const signupTask = tourHelpers.getAsyncTask('fill-form');
    if (!signupTask) return;

    // Move from pending → processing (using helper-provided event name)
    tour.sendEvent({ type: signupTask.events.start });

    try {
      await validateEmail(email);
      // Move from processing → success
      tour.sendEvent({ type: signupTask.events.success });
    } catch (error) {
      // Go back to pending on failure
      tour.sendEvent({ type: signupTask.events.failed });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input id='email-input' type='email' />
      <button id='submit-button'>Submit</button>
    </form>
  );
}
```

### Manual Event Names

Alternatively, you can send events directly, the library is completely typed and should provide you with the correct event names.

```tsx
// Move from pending → processing
tour.sendEvent({ type: 'START_FILL-FORM' });

// Move from processing → success
tour.sendEvent({ type: 'FILL-FORM_SUCCESS' });

// Go back to pending on failure
tour.sendEvent({ type: 'FILL-FORM_FAILED' });
```

## Custom Event Names

You can customize the event names for better readability:

```tsx
{
  id: 'user-action',
  type: 'async',
  page: '/dashboard',
  content: {
    pending: { /* ... */ },
    processing: { /* ... */ },
    success: { /* ... */ },
  },
  events: {
    start: 'CLICK_BUTTON',
    success: 'BUTTON_CLICKED',
    failed: 'BUTTON_ERROR',
  },
}

// Usage
tour.sendEvent({ type: 'CLICK_BUTTON' });
tour.sendEvent({ type: 'BUTTON_CLICKED' });
```

## Common Use Cases

### Waiting for Button Click

```tsx
{
  id: 'click-continue',
  type: 'async',
  page: '/welcome',
  content: {
    pending: {
      targetElement: '#continue-btn',
      title: 'Click to Continue',
      content: 'Click the Continue button when ready',
    },
    processing: {
      targetElement: '#continue-btn',
      title: 'Loading...',
      content: 'Setting up your workspace',
    },
    success: {
      targetElement: '#workspace',
      title: 'Workspace Ready!',
      content: 'Your workspace is set up',
    },
  },
}
```

### Form Submission

```tsx
{
  id: 'submit-form',
  type: 'async',
  page: '/profile',
  content: {
    pending: {
      targetElement: '#profile-form',
      title: 'Complete Your Profile',
      content: 'Fill out the form and submit',
    },
    processing: {
      targetElement: '#profile-form',
      title: 'Saving...',
      content: 'Saving your profile',
    },
    success: {
      targetElement: '#profile-complete',
      title: 'Profile Saved!',
      content: 'Your profile is complete',
    },
  },
}
```

### Data Loading

```tsx
{
  id: 'load-data',
  type: 'async',
  page: '/reports',
  content: {
    pending: {
      targetElement: '#load-button',
      title: 'Load Your Reports',
      content: 'Click to load your data',
    },
    processing: {
      targetElement: '#loading-spinner',
      title: 'Fetching Data...',
      content: 'This may take a moment',
    },
    success: {
      targetElement: '#data-table',
      title: 'Data Loaded!',
      content: 'Here are your reports',
    },
  },
}
```

## Navigation Behavior

- **During pending**: Users can go back (if `canPrev` isn't false)
- **During processing**: Navigation is typically disabled
- **During success**: Users can continue to the next step

## Default Event Names

If you don't specify custom event names, Tourista generates them based on the step ID:

- Start: `START_[STEP_ID]` (e.g., `START_LOGIN`)
- Success: `[STEP_ID]_SUCCESS` (e.g., `LOGIN_SUCCESS`)
- Failed: `[STEP_ID]_FAILED` (e.g., `LOGIN_FAILED`)

## Complete Example

```tsx
// Tour configuration
const onboardingTour: TourConfig = {
  id: 'onboarding',
  steps: [
    // Regular step
    {
      id: 'welcome',
      page: '/',
      targetElement: '#hero',
      title: 'Welcome!',
      content: "Let's set up your account",
    },
    // Async step - wait for user action
    {
      id: 'create-project',
      type: 'async',
      page: '/projects',
      content: {
        pending: {
          targetElement: '#new-project-btn',
          title: 'Create Your First Project',
          content: 'Click the "New Project" button',
        },
        processing: {
          targetElement: '#project-modal',
          title: 'Creating Project...',
          content: 'Setting up your project',
        },
        success: {
          targetElement: '#project-list',
          title: 'Project Created!',
          content: "Great! You've created your first project",
        },
      },
    },
    // Another regular step
    {
      id: 'complete',
      page: '/projects',
      targetElement: '#next-steps',
      title: 'All Done!',
      content: "You're ready to start",
    },
  ],
};

// Component handling the async step
function ProjectsPage() {
  const tour = useTour('onboarding');

  const handleNewProject = async () => {
    // Start the async action
    tour.sendEvent({ type: 'START_CREATE-PROJECT' });

    try {
      // Do the actual work
      await createProject();

      // Mark as successful
      tour.sendEvent({ type: 'CREATE-PROJECT_SUCCESS' });
    } catch (error) {
      // Handle failure
      tour.sendEvent({ type: 'CREATE-PROJECT_FAILED' });
      showError(error);
    }
  };

  return (
    <button id='new-project-btn' onClick={handleNewProject}>
      New Project
    </button>
  );
}
```

## Best Practices

1. **Clear instructions**: Tell users exactly what action to take
2. **Show progress**: Use the processing state to show something is happening
3. **Handle failures**: Always implement the failed event to handle errors gracefully
4. **Keep it simple**: Don't overuse async steps - only when you really need to wait for user actions

## Related Features

- [Navigation](./navigation.md) - Multi-page tours with async steps
- [Callbacks](./callbacks.md) - Track async step transitions
- [Auto-Advance](./auto-advance.md) - Combine with async steps for complex flows

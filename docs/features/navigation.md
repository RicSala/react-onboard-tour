# Navigation & Multi-Page Tours

Tourista provides powerful navigation capabilities that allow you to create tours spanning multiple pages or routes in your application. The library automatically handles page transitions, waits for elements to load, and maintains tour state across navigation.

## Overview

Multi-page tours enable you to guide users through different sections of your application seamlessly. Whether you're onboarding new users, showcasing features, or providing contextual help, Tourista ensures a smooth experience across page boundaries.

## How It Works

Tourista uses a state machine pattern with special "navigation states" that:

1. **Detect when navigation is needed** - When a step targets a different page
2. **Trigger automatic navigation** - Programmatically navigate to the required page
3. **Wait for page changes** - Listen for route changes and element availability
4. **Resume the tour** - Continue from where it left off once the page loads

## Basic Multi-Page Tour

Here's a simple example of a tour that spans multiple pages:

```tsx
const multiPageTour: TourConfig = {
  id: 'app-tour',
  steps: [
    {
      id: 'welcome',
      page: '/',
      targetElement: '#hero-section',
      title: 'Welcome to Our App',
      content: "Let's take a quick tour of the main features.",
    },
    {
      id: 'dashboard',
      page: '/dashboard', // Different page
      targetElement: '#stats-panel',
      title: 'Your Dashboard',
      content: 'Here you can see all your important metrics.',
    },
    {
      id: 'settings',
      page: '/settings', // Another page
      targetElement: '#profile-section',
      title: 'Manage Your Profile',
      content: 'Customize your experience in the settings.',
    },
  ],
};
```

## Automatic Navigation

When the user clicks "Next" on the welcome step, Tourista will:

1. Create a `navigatingTo_dashboard` state
2. Automatically navigate to `/dashboard`
3. Wait for the page to load
4. Look for the `#stats-panel` element
5. Continue the tour once the element is found

```tsx
// This happens automatically - no manual navigation needed!
// User clicks "Next" on step 1 (page: '/')
// → Tour enters 'navigatingTo_dashboard' state
// → Router navigates to '/dashboard'
// → Tour detects page change
// → Tour transitions to 'dashboard' step
// → Tour highlights '#stats-panel'
```

## Navigation States

During page transitions, Tourista creates special navigation states:

- `navigatingTo_[stepId]` - For regular steps
- `navigatingTo_[stepId]_pending` - For async steps

These states ensure the tour doesn't get stuck or lost during navigation.

## Page Change Detection

Tourista automatically detects page changes using Next.js hooks:

```tsx
// Internal implementation (handled automatically)
useEffect(() => {
  if (snapshot.value !== 'idle' && snapshot.value !== 'completed') {
    tourActor.send({
      type: 'PAGE_CHANGED',
      page: pathname,
      tourId: tourConfig.id,
    });
  }
}, [pathname]);
```

## Handling Dynamic Content

For pages with dynamic content that loads after navigation:

### Retry Mechanism

Tourista automatically retries finding target elements:

```tsx
const dynamicContentTour: TourConfig = {
  id: 'dynamic-tour',
  steps: [
    {
      id: 'async-content',
      page: '/data',
      targetElement: '[data-tour="chart"]', // Element that loads async
      title: 'Data Visualization',
      content: 'This chart loads after the API call completes.',
    },
  ],
};
```

The library will:

1. Navigate to the page
2. Retry finding the element every 200ms
3. Continue after finding it (max 10 retries)
4. Scroll the element into view automatically

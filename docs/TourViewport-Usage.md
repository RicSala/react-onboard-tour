# TourViewport Component Usage Guide

## Overview

The `TourViewport` component is a wrapper that creates a clean boundary for tour overlays when you need to constrain the tour within a specific scrollable area. It solves the common problem of overlays not properly covering viewport edges that have borders, rounded corners, or scrollbars.

## Why Use TourViewport?

When using custom viewports (via `viewportId` in tour steps), the overlay system needs to:
1. Block clicks outside the viewport
2. Allow scrolling within the viewport
3. Handle borders, rounded corners, and scrollbars properly

The `TourViewport` component provides a clean, borderless container that ensures perfect overlay coverage.

## Basic Usage

### 1. Import the Component

```tsx
import { TourViewport } from 'tourista';
```

### 2. Wrap Your Scrollable Content

Replace your existing scrollable container:

**Before (problematic with tours):**
```tsx
<div 
  className="border-2 rounded-lg overflow-auto h-96"
  id="content-area"
>
  <YourContent />
</div>
```

**After (works perfectly with tours):**
```tsx
<div className="border-2 rounded-lg h-96">
  <TourViewport id="content-area">
    <YourContent />
  </TourViewport>
</div>
```

### 3. Reference in Tour Steps

```tsx
const tourSteps = [
  {
    id: 'step1',
    type: 'sync',
    page: '/dashboard',
    viewportId: 'content-area', // References the TourViewport id
    targetElement: '.some-element',
    title: 'Welcome to the Dashboard',
    content: 'This element is inside the constrained viewport'
  },
  // ... more steps
];
```

## Advanced Examples

### Example 1: Sidebar with Custom Styling

```tsx
// Sidebar component with tour viewport
<aside className="w-64 h-screen border-r bg-gray-50">
  <TourViewport 
    id="sidebar-viewport"
    className="h-full"
    style={{ backgroundColor: 'transparent' }}
  >
    <nav className="p-4">
      <h2 className="font-bold mb-4">Navigation</h2>
      <ul>
        <li className="nav-item">Dashboard</li>
        <li className="nav-item">Settings</li>
        <li className="nav-item">Profile</li>
      </ul>
    </nav>
  </TourViewport>
</aside>
```

### Example 2: Modal with Scrollable Content

```tsx
function Modal({ isOpen, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-96 h-96">
        <TourViewport id="modal-viewport">
          <div className="p-6">
            {children}
          </div>
        </TourViewport>
      </div>
    </div>
  );
}
```

### Example 3: Complex Layout with Multiple Viewports

```tsx
function ComplexDashboard() {
  return (
    <div className="flex h-screen">
      {/* Sidebar with its own viewport */}
      <div className="w-64 border-r">
        <TourViewport id="sidebar">
          <SidebarContent />
        </TourViewport>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header - no viewport needed */}
        <header className="h-16 border-b">
          <HeaderContent />
        </header>
        
        {/* Main scrollable area with viewport */}
        <div className="flex-1">
          <TourViewport id="main-content">
            <MainContent />
          </TourViewport>
        </div>
      </div>
    </div>
  );
}

// Tour configuration for complex layout
const tourSteps = [
  {
    id: 'sidebar-step',
    viewportId: 'sidebar',
    targetElement: '.nav-item:first-child',
    title: 'Navigation',
    content: 'Access main sections from here'
  },
  {
    id: 'main-step',
    viewportId: 'main-content',
    targetElement: '.data-table',
    title: 'Your Data',
    content: 'View and manage your data here'
  },
  {
    id: 'header-step',
    // No viewportId - uses document body
    targetElement: '.user-menu',
    title: 'User Menu',
    content: 'Access your profile and settings'
  }
];
```

## Important Notes

### Styling Considerations

1. **Apply decorative styles to the parent**: Borders, rounded corners, shadows, etc. should be on the parent element, not the TourViewport.

2. **TourViewport handles scrolling**: The component creates its own scrollable container internally.

3. **Minimum dimensions**: The component sets `minHeight: 100%` and `minWidth: 100%` to fill its parent.

### When to Use TourViewport

✅ **Use TourViewport when:**
- You have scrollable areas that need tour overlays
- Your container has borders or rounded corners
- You want to constrain the tour to a specific section
- You have multiple independent scrollable areas

❌ **Don't use TourViewport when:**
- The tour should cover the entire page (use default behavior)
- The container doesn't need scrolling
- You need special scroll behavior (virtual scrolling, etc.)

## Migration Guide

### From Regular Scrollable Container

```tsx
// Old approach - problematic
<div 
  id="content"
  style={{
    border: '2px solid #ccc',
    borderRadius: '8px',
    overflow: 'auto',
    height: '400px',
    padding: '16px'
  }}
>
  <Content />
</div>

// New approach - works perfectly
<div 
  style={{
    border: '2px solid #ccc',
    borderRadius: '8px',
    height: '400px',
  }}
>
  <TourViewport id="content">
    <div style={{ padding: '16px' }}>
      <Content />
    </div>
  </TourViewport>
</div>
```

Note: Move padding to an inner div to maintain proper spacing.

## Troubleshooting

### Issue: Content doesn't scroll
**Solution**: Ensure the parent element has a defined height.

### Issue: Viewport doesn't fill parent
**Solution**: Check that the parent has proper dimensions and isn't using `display: flex` without proper flex properties.

### Issue: Tour overlay doesn't appear
**Solution**: Verify the `id` matches exactly in both TourViewport and tour step configuration.

## TypeScript Interface

```typescript
interface TourViewportProps {
  children: React.ReactNode;    // Content to render
  id: string;                   // Unique identifier for tour targeting
  className?: string;           // Optional CSS classes
  style?: React.CSSProperties; // Optional inline styles
}
```
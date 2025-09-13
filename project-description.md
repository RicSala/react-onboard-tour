# @tinystack/touring

## Project Overview

@tinystack/touring is a state-machine-driven onboarding tour library for React applications, specifically designed for Next.js. Built on top of the @tinystack/machine state management library, it provides a declarative API for creating interactive product tours with support for both synchronous and asynchronous steps.

## Key Features

### 🎯 Core Capabilities
- **State Machine Architecture**: Uses finite state machines for predictable, debuggable tour flows
- **Async Step Support**: Handles asynchronous operations with pending, processing, and success states
- **Multi-Page Tours**: Navigate users across different routes using Next.js App Router
- **Element Targeting**: Highlight specific DOM elements with overlay spotlight effects
- **Auto-Advance Steps**: Configure steps to automatically progress after a specified duration
- **Navigation Control**: Configure forward/backward navigation permissions per step

### 🎨 Customization
- **Custom Card Components**: Replace default tour cards with your own React components
- **Overlay Styling**: Customize overlay appearance (opacity, color, padding, border radius)
- **Card Positioning**: Control card placement relative to target elements (top, bottom, left, right)
- **Event Handlers**: Hook into tour lifecycle events for custom behaviors

### 🔧 Developer Experience
- **TypeScript Support**: Full TypeScript support with type inference for tour configurations
- **Next.js Integration**: Built for Next.js App Router with client-side navigation
- **Debug Panel**: Built-in debugging component for development
- **Minimal Dependencies**: Only three runtime dependencies (@floating-ui/react, @tinystack/machine, motion)

## Technical Architecture

### State Management
The library uses a finite state machine approach where each tour is composed of:
- **Sync Steps**: Simple sequential states
- **Async Steps**: Complex states with pending → processing → success substates
- **Navigation States**: Intermediate states for page transitions

### Component Structure
- `TourProvider`: Context provider for managing multiple tours
- `TourMachine`: Core state machine component handling tour logic
- `TourOverlay`: Visual overlay component with spotlight effect
- `DefaultCard`: Customizable tour card component
- `DebugPanel`: Development tool for inspecting tour state

### Event System
Tours communicate through a typed event system:
- Base events: `START_TOUR`, `NEXT`, `PREV`, `END_TOUR`, `SKIP_TOUR`
- Custom events: Configurable per async step for external integrations
- Page navigation: `PAGE_CHANGED` events for route-based transitions

## Use Cases

1. **User Onboarding**: Guide new users through application features
2. **Feature Announcements**: Highlight new functionality after updates
3. **Interactive Tutorials**: Step-by-step walkthroughs of workflows
4. **Form Assistance**: Guide users through complex multi-step forms
5. **Dashboard Tours**: Explain different sections and metrics

## Technical Requirements

- **React**: 18.0.0 or higher (peer dependency)
- **React DOM**: 18.0.0 or higher (peer dependency)
- **Next.js**: 14.0.0 or higher (optional peer dependency, required for multi-page tours)
- **TypeScript**: 5.0.0 or higher (for development)

## Current Limitations

- **Framework Support**: Currently optimized for Next.js App Router only
- **Accessibility**: No built-in accessibility features (screen reader support, keyboard navigation)
- **State Persistence**: Tour progress is not saved across page reloads
- **Mobile Support**: Limited testing on mobile devices
- **Animation Control**: Limited control over animation timing and easing

## Development Status

Version 0.1.10 - The library is in early development. Current focus areas:
- Core stability and bug fixes
- API refinement based on usage patterns
- Documentation and examples
- Testing coverage

The project uses semantic versioning but API changes may occur in minor versions during the 0.x phase.
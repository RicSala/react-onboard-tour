# @tinystack/touring

## Project Overview

@tinystack/touring is a flexible, state-machine-driven onboarding tour library for React applications. Built on top of the @tinystack/machine state management library, it provides a declarative API for creating interactive product tours with support for both synchronous and asynchronous steps.

## Key Features

### 🎯 Core Capabilities
- **State Machine Architecture**: Built on XState-inspired state machines for predictable, debuggable tour flows
- **Async Step Support**: Native support for asynchronous operations during tours (API calls, animations, etc.)
- **Multi-Page Tours**: Seamlessly navigate users across different pages/routes during a tour
- **Smart Element Targeting**: Highlight specific DOM elements with customizable overlays
- **Auto-Advance Steps**: Configure steps to automatically progress after a specified duration
- **Flexible Navigation**: Full control over forward/backward navigation with configurable permissions

### 🎨 Customization
- **Custom Card Components**: Replace default tour cards with your own React components
- **Overlay Styling**: Customize overlay appearance (opacity, color, padding, border radius)
- **Card Positioning**: Control floating behavior and positioning relative to target elements
- **Event Tracking**: Built-in event system for analytics and custom behaviors

### 🔧 Developer Experience
- **TypeScript First**: Full TypeScript support with advanced type inference
- **Framework Integration**: Optimized for Next.js with App Router support
- **Debug Panel**: Built-in debugging tools for development
- **Zero Dependencies**: Minimal bundle size with only essential dependencies

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

1. **User Onboarding**: Guide new users through key features
2. **Feature Announcements**: Highlight new functionality after updates
3. **Interactive Tutorials**: Step-by-step walkthroughs of complex workflows
4. **Progressive Disclosure**: Reveal advanced features as users progress
5. **Context-Sensitive Help**: Provide guided assistance based on user actions

## Integration

The library integrates seamlessly with:
- **Next.js 14+**: Full App Router and Server Component support
- **React 18+**: Leverages concurrent features and Suspense
- **TypeScript 5+**: Advanced type inference and safety
- **Motion**: Smooth animations via Framer Motion
- **Floating UI**: Smart positioning for tour cards

## Development Status

Currently at version 0.1.10, the library is in active development with a focus on:
- Stability and performance optimizations
- Enhanced accessibility features
- Extended customization options
- Improved developer tooling

The project follows semantic versioning and maintains backward compatibility within major versions.
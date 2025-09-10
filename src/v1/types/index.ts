import { Transition } from 'motion/react';
import { ReactNode } from 'react';

export interface WatchForChanges {
  target?: string; // Selector for where to watch (defaults to the highlighted element)
  lookFor: string; // Selector for what change indicates completion
  childList?: boolean; // Watch for added/removed nodes (default: true)
  attributes?: boolean; // Watch for attribute changes
  characterData?: boolean; // Watch for text content changes
  timeout?: number; // Stop watching after X ms (default: 10000)
  debounce?: number; // Wait X ms after change before advancing (default: 100)
}

export interface Step {
  icon: ReactNode | string | null;
  title: string;
  content: ReactNode;
  selector?: string;
  side?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'left-top'
    | 'left-bottom'
    | 'right-top'
    | 'right-bottom';
  showControls?: boolean;
  showSkip?: boolean;
  blockKeyboardControl?: boolean;
  pointerPadding?: number;
  pointerRadius?: number;
  nextRoute?: string;
  prevRoute?: string;
  viewportID?: string;
  watchForChanges?: WatchForChanges; // New field for mutation observer config
  validate?: () => Promise<
    { isValid: true } | { isValid: false; error: string }
  >;
}

export interface Tour {
  tour: string;
  steps: Step[];
}

export interface TouringContext {
  currentStep: number;
  currentTour: string | null;
  setCurrentStep: (step: number, delay?: number) => void;
  closeTour: () => void;
  startTour: (tourName: string) => void;
  isTourActive: boolean;
}

export interface TouringReactProps {
  // children: React.ReactNode;
  tours: Tour[];
  showNextStep?: boolean;
  shadowRgb?: string;
  shadowOpacity?: string;
  cardTransition?: Transition;
  cardComponent?: React.ComponentType<CardComponentProps>;
  onStart?: (tourName: string | null) => void;
  onStepChange?: (step: number, tourName: string | null) => void;
  onComplete?: (tourName: string | null) => void;
  onSkip?: (step: number, tourName: string | null) => void;
  displayArrow?: boolean;
  clickThroughOverlay?: boolean;
  navigationAdapter?: () => NavigationAdapter;
  disableConsoleLogs?: boolean;
  scrollToTop?: boolean;
  noInViewScroll?: boolean;
  closeOnClickOutside?: boolean;
  toastFn?: (message: string) => void;
  debug?: boolean;
}

export interface TourProviderProps extends TouringReactProps {
  children: React.ReactNode;
}

export interface CardComponentProps {
  step: Step;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipTour?: () => void;
  arrow: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isValidating?: boolean;
}

export interface NavigationAdapter {
  push: (path: string) => void;
  getCurrentPath: () => string;
}

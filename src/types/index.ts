import { StateMachine } from '@tinystack/machine';

// Context type for the tour
export type TourContext = {
  tourId: string;
  currentPage: string;
  targetElement?: string;
  title: string;
  content: string;
  autoAdvanceTimer?: any;
};

// Event types
export type BaseTourEvent =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'PAGE_CHANGED'; page: string }
  | { type: 'START_TOUR'; tourId: string }
  | { type: 'END_TOUR' }
  | { type: 'SKIP_TOUR' }
  | { type: 'AUTO_ADVANCE' };

export type TourActor = ReturnType<
  StateMachine<TourContext, BaseTourEvent>['createActor']
>;

export type TourMachine = StateMachine<TourContext, BaseTourEvent>;

export interface CardProps {
  title?: string;
  content?: string;
  currentStepIndex: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  className?: string;
  style?: React.CSSProperties;
  showControls?: boolean;
  showSkip?: boolean;
}

// Step content for each async state
export interface StepContent {
  targetElement?: string;
  title: string;
  content: string;
}

// Tour step configuration - now with discriminated union for sync/async
export type TourStep =
  | {
      id: string;
      type?: 'sync'; // Default type
      page: string;
      targetElement?: string;
      title: string;
      content: string;
      autoAdvance?: number; // milliseconds
      canPrev?: boolean; // Whether to allow backward navigation
      canSkip?: boolean; // Whether to allow skipping this step
    }
  | {
      id: string;
      type: 'async';
      page: string;
      content: {
        pending: StepContent;
        processing: StepContent;
        success: StepContent;
      };
      events?: {
        start?: string;
        success?: string;
        failed?: string;
      };
      canPrev?: boolean; // Whether to allow backward navigation
      canSkip?: boolean; // Whether to allow skipping this step
    };

export interface TourConfig {
  id: string;
  steps: TourStep[];
  allowPageNavigation?: boolean;
  allowSkip?: boolean;
}

// Type helper to extract all possible state values from a tour config
export type ExtractStates<T extends TourConfig> =
  | 'idle'
  | 'completed'
  | 'skipped'
  | ExtractStepStates<T['steps'][number]>
  | ExtractNavigationStates<T['steps'][number]>;

type ExtractStepStates<Step extends TourStep> = Step extends {
  type: 'async';
  id: infer Id;
}
  ?
      | `${Id & string}_pending`
      | `${Id & string}_processing`
      | `${Id & string}_success`
  : Step extends { id: infer Id }
  ? Id & string
  : never;

type ExtractNavigationStates<Step extends TourStep> = Step extends {
  id: infer Id;
}
  ?
      | `navigatingTo_${Id & string}`
      | (Step extends { type: 'async' }
          ?
              | `navigatingTo_${Id & string}_pending`
              | `navigatingTo_${Id & string}_processing`
              | `navigatingTo_${Id & string}_success`
          : never)
  : never;

export type OverlayStyles = {
  radius?: number;
  padding?: number;
  opacity?: number;
  colorRgb?: string;
};
type CardPosition = 'top' | 'bottom' | 'left' | 'right';

export type CardPositioning = {
  floating?: boolean;
  side?: CardPosition;
  distancePx?: number;
};

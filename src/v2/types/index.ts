import { StateMachine } from '@tinystack/machine';

// Context type for the tour
export type TourContext = {
  tourId: string;
  currentPage: string;
  targetElement: string;
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

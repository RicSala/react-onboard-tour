// V2 exports - new implementation
export const version = '2.0.0';

// Components
export { TourProvider, useTour } from './components/TourProvider';
export { TourMachine, useTourState } from './components/TourMachineReact';
export { TourOverlay } from './components/TourOverlay';
export { TourConfigViewer } from './components/TourConfigViewer';
export { DebugPanel } from './components/DebugPanel';
export { default as DefaultCard } from './components/DefaultCard';

// Helpers
export { 
  generateTourMachine,
  getAsyncTaskInfo,
  getAsyncTaskInfoById,
  addEventTrackingToMachine,
  createTourHelpers,
} from './helpers/tourMachineGenerator';

// Helper Types
export type {
  TourStep,
  TourConfig,
  ExtractStates,
} from './helpers/tourMachineGenerator';

// Types
export type {
  TourContext,
  BaseTourEvent,
  TourActor,
  TourMachine as TourMachineType,
  CardProps,
} from './types';
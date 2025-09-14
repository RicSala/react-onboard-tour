import { useMemo, useSyncExternalStore } from 'react';
import { useTourContext } from '../components/TourProvider';
import {
  createMockHelpers,
  createTourHelpers,
} from '../helpers/tourMachineGenerator';
import { TourConfig, ExtractStates, ExtractTourEvents } from '../types';
import { tourActor } from '../components/TourMachineReact';

export const useTour = <TConfig extends TourConfig>(tourId: string) => {
  const { tourConfig } = useTourContext();

  const tourHelpers = useMemo(() => {
    if (!tourConfig) return createMockHelpers();
    return createTourHelpers(tourConfig);
  }, [tourConfig]);

  const snapshot = useSyncExternalStore(
    (callback) => tourActor?.subscribe(callback) || (() => {}),
    () => tourActor?.getSnapshot() || null,
    () => null
  );

  const currentState = useMemo(() => {
    return snapshot?.value as ExtractStates<TConfig>;
  }, [snapshot]);

  // Get current step data from context
  const currentStepData = useMemo(
    () =>
      snapshot?.context
        ? {
            targetElement: snapshot.context.targetElement,
            title: snapshot.context.title,
            content: snapshot.context.content,
            page: snapshot.context.currentPage,
          }
        : null,
    [snapshot]
  );

  if (!snapshot || !tourActor || tourConfig?.id !== tourId)
    return inactiveReturn();

  const isActive =
    !snapshot?.value ||
    !['idle', 'completed', 'skipped'].includes(snapshot?.value);

  return {
    isActive,
    currentState,
    currentStepData,
    currentStepIndex: isActive ? tourHelpers?.getStepIndex(currentState) : -1,
    totalSteps: tourHelpers?.getTotalSteps() || 0,
    canGoNext: tourConfig
      ? tourActor.can({ type: 'NEXT', tourId: tourConfig.id })
      : false,
    canGoPrev: tourConfig
      ? tourActor.can({ type: 'PREV', tourId: tourConfig.id })
      : false,
    canSkip: tourConfig
      ? tourActor.can({ type: 'SKIP_TOUR', tourId: tourConfig.id })
      : false,
    snapshot,
    nextStep: () =>
      tourConfig
        ? tourActor?.send({ type: 'NEXT', tourId: tourConfig.id })
        : () => {},
    prevStep: () =>
      tourConfig
        ? tourActor?.send({ type: 'PREV', tourId: tourConfig.id })
        : () => {},
    endTour: () =>
      tourConfig
        ? tourActor?.send({ type: 'END_TOUR', tourId: tourConfig.id })
        : () => {},
    skipTour: () =>
      tourConfig
        ? tourActor?.send({ type: 'SKIP_TOUR', tourId: tourConfig.id })
        : () => {},
    sendEvent: (event: Omit<ExtractTourEvents<TConfig>, 'tourId'>) => {
      console.log('sendEvent', event);
      // @ts-expect-error - we want to send any event
      return tourActor?.send({ ...event, tourId: tourConfig.id });
    },
  };
};

export const inactiveReturn = () => {
  return {
    isActive: false,
    currentState: null,
    currentStepData: null,
    currentStepIndex: -1,
    totalSteps: 0,
    canGoNext: false,
    canGoPrev: false,
    canSkip: false,
    snapshot: null,
    nextStep: () => () => {},
    prevStep: () => () => {},
    endTour: () => () => {},
    skipTour: () => () => {},
    sendEvent: (event: any) => () => {},
  };
};

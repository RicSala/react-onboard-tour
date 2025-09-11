'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TourOverlay } from './TourOverlay';
import {
  createTourHelpers,
  generateTourMachine,
} from '../helpers/tourMachineGenerator';
import { StateMachine } from '@tinystack/machine';
import {
  TourContext,
  BaseTourEvent,
  TourActor,
  type TourMachine as TTourMachine,
  TourConfig,
  ExtractStates,
} from '../types';
import { CardProps } from '../types';
import { ComponentType } from 'react';
import { useTour } from './TourProvider';

interface TourMachineReactProps {
  tourConfig: TourConfig;
  customCard?: ComponentType<CardProps>;
  onComplete?: () => void;
  onSkip?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

// Global actor reference - only exists when tour is active
let tourActor: TourActor | null = null;
let tourMachine: TTourMachine | null = null;

// Subscribers for actor availability changes
const actorSubscribers = new Set<() => void>();

const notifyActorChange = () => {
  actorSubscribers.forEach((callback) => callback());
};

export const TourMachine: React.FC<TourMachineReactProps> = ({
  customCard,
  tourConfig,
  onComplete,
  onSkip,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // Initialize actor on mount
  useEffect(() => {
    console.log('[TourMachineReact] tourConfig:', tourConfig);
    if (!tourMachine || tourMachine.config.id !== tourConfig.id) {
      const machineConfig = generateTourMachine<TourContext, BaseTourEvent>(
        tourConfig
      );
      tourMachine = new StateMachine<TourContext, BaseTourEvent>(machineConfig);
      console.log(
        '[TourMachineReact] Machine generated for config:',
        tourConfig.id
      );
    }

    console.log(
      '[TourMachineReact] Initializing actor for tour:',
      tourConfig.id
    );

    // Create and start the actor
    tourActor = tourMachine.createActor();
    console.log('[TourMachineReact] Actor created:', !!tourActor);

    // Notify all subscribers that actor is now available
    notifyActorChange();

    // Subscribe to check for completion or skip
    const unsubscribe = tourActor.subscribe((snapshot) => {
      console.log('[TourMachineReact] State changed:', {
        state: snapshot.value,
        context: snapshot.context,
      });

      // Check if tour completed normally
      if (snapshot.value === 'completed') {
        console.log('[TourMachineReact] Tour completed normally');
        onComplete?.();
      }

      // Check if tour was skipped
      if (snapshot.value === 'skipped') {
        console.log('[TourMachineReact] Tour was skipped');
        onSkip?.();
      }
    });

    tourActor.start();
    tourActor.send({ type: 'START_TOUR', tourId: tourConfig.id });

    // Cleanup on unmount
    return () => {
      console.log('[TourMachineReact] Cleaning up actor');
      unsubscribe();
      tourActor?.stop();
      tourActor = null;

      // Notify subscribers that actor is gone
      notifyActorChange();
    };
  }, [tourConfig?.id]);

  // Use the actor's snapshot directly with useSyncExternalStore
  const snapshot = useSyncExternalStore(
    (callback) => tourActor?.subscribe(callback) || (() => {}),
    () => tourActor?.getSnapshot() || null,
    () => null
  );

  // Auto-navigation logic
  useEffect(() => {
    if (!snapshot || !tourActor) return;

    const targetPage = snapshot.context.currentPage;
    if (targetPage && targetPage !== pathname) {
      // For navigating states, always navigate
      if (snapshot.value.includes('navigatingTo')) {
        console.log(
          '[TourMachineReact] Navigation state - going to:',
          targetPage
        );
        router.push(targetPage);
      }
      // For step states, navigate if needed
      else if (snapshot.value.startsWith('step')) {
        console.log(
          '[TourMachineReact] In step state - may need to navigate to:',
          targetPage
        );
        router.push(targetPage);
      }
    }
  }, [snapshot, pathname, router]);

  // Detect page changes and notify the state machine
  useEffect(() => {
    if (!snapshot || !tourActor) return;

    // Send PAGE_CHANGED for any active state (not idle or completed)
    if (snapshot.value !== 'idle' && snapshot.value !== 'completed') {
      console.log(
        '[TourMachineReact] Page changed to:',
        pathname,
        'in state:',
        snapshot.value
      );
      tourActor.send({ type: 'PAGE_CHANGED', page: pathname });
    }
  }, [pathname, snapshot?.value]);

  return <TourOverlay tourConfig={tourConfig} customCard={customCard} />;
};

// Generic hook for backwards compatibility
export const useTourState = <TConfig extends TourConfig>() => {
  const { tourConfig } = useTour();

  // Always call hooks in the same order - move useMemo before any conditional returns
  const tourHelpers = useMemo(() => {
    return createTourHelpers(tourConfig);
  }, [tourConfig]);

  const snapshot = useSyncExternalStore(
    (callback) => {
      actorSubscribers.add(callback);
      const unsubscribeFromActor = tourActor?.subscribe(callback) || (() => {});
      return () => {
        actorSubscribers.delete(callback);
        unsubscribeFromActor();
      };
    },
    () => tourActor?.getSnapshot() || null,
    () => null
  );

  if (!snapshot || !tourActor) return null;

  const isActive = !['idle', 'completed', 'skipped'].includes(snapshot.value);

  // Get current step data from context
  const currentStepData = snapshot.context.targetElement
    ? {
        targetElement: snapshot.context.targetElement,
        title: snapshot.context.title,
        content: snapshot.context.content,
        page: snapshot.context.currentPage,
      }
    : null;

  return {
    isActive,
    currentState: snapshot.value as ExtractStates<TConfig>,
    currentStepData,
    currentStepIndex: isActive ? tourHelpers?.getStepIndex(snapshot.value) : -1,
    totalSteps: tourHelpers?.getTotalSteps() || 0,
    canGoNext: tourActor.can({ type: 'NEXT' }),
    canGoPrev: tourActor.can({ type: 'PREV' }),
    snapshot,
    nextStep: () => tourActor?.send({ type: 'NEXT' }),
    prevStep: () => tourActor?.send({ type: 'PREV' }),
    endTour: () => tourActor?.send({ type: 'END_TOUR' }),
    skipTour: () => tourActor?.send({ type: 'SKIP_TOUR' }),
    sendEvent: (event: any) => tourActor?.send(event),
  };
};

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
  CardPositioning,
  OverlayStyles,
} from '../types';
import { CardProps } from '../types';
import { ComponentType } from 'react';
import { useTour } from './TourProvider';
import { CARD_POSITIONING_DEFAULT, STYLE_DEFAULT } from '../const';

interface TourMachineReactProps {
  customCard?: ComponentType<CardProps>;
  closeOnClickOutside?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  cardPositioning?: CardPositioning;
  overlayStyles?: OverlayStyles;
}

// Global actor reference - only exists when tour is active
let tourActor: TourActor | null = null;
let tourMachine: TTourMachine | null = null;

export const TourMachineCore: React.FC<TourMachineReactProps> = ({
  customCard,
  closeOnClickOutside = true,
  cardPositioning: cardPositioningProp = {
    floating: true,
    side: 'top',
    distancePx: 0,
  },
  overlayStyles: overlayStylesProp = STYLE_DEFAULT,
  onComplete,
  onSkip,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const overlayStyles = useMemo(() => {
    return {
      ...STYLE_DEFAULT,
      ...overlayStylesProp,
    };
  }, [overlayStylesProp]);

  const cardPositioning = useMemo(() => {
    return {
      ...CARD_POSITIONING_DEFAULT,
      ...cardPositioningProp,
    };
  }, [cardPositioningProp]);

  const { tourConfig, onTourSkipped } = useTour();

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
        onTourSkipped?.();
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
    };
  }, [onComplete, onSkip, onTourSkipped, tourConfig, tourConfig.id]);

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
    if (!snapshot?.value || !tourActor) return;

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

  // keyboard control
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') return tourActor?.send({ type: 'NEXT' });
      if (event.key === 'ArrowLeft') return tourActor?.send({ type: 'PREV' });
      if (event.key === 'Escape') return tourActor?.send({ type: 'SKIP_TOUR' });
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TourOverlay
      cardPositioning={cardPositioning}
      overlayStyles={overlayStyles}
      customCard={customCard}
      onOverlayClick={
        closeOnClickOutside
          ? () => tourActor?.send({ type: 'SKIP_TOUR' })
          : undefined
      }
    />
  );
};

// the same as core but get is active from the context and conditionally render the core
// have the same props as core and pass all of them to the core
export const TourMachine = (props: TourMachineReactProps) => {
  const { isActive } = useTour();
  return isActive ? <TourMachineCore {...props} /> : null;
};

export const useTourState = <TConfig extends TourConfig>() => {
  const { tourConfig } = useTour();

  const tourHelpers = useMemo(() => {
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

  if (!snapshot || !tourActor) return null;

  const isActive =
    !snapshot?.value ||
    !['idle', 'completed', 'skipped'].includes(snapshot?.value);

  return {
    isActive,
    currentState,
    currentStepData,
    currentStepIndex: isActive ? tourHelpers?.getStepIndex(currentState) : -1,
    totalSteps: tourHelpers?.getTotalSteps() || 0,
    canGoNext: tourActor.can({ type: 'NEXT' }),
    canGoPrev: tourActor.can({ type: 'PREV' }),
    snapshot,
    nextStep: () => tourActor?.send({ type: 'NEXT' }),
    prevStep: () => tourActor?.send({ type: 'PREV' }),
    endTour: () => tourActor?.send({ type: 'END_TOUR' }),
    skipTour: () => tourActor?.send({ type: 'SKIP_TOUR' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendEvent: (event: any) => tourActor?.send(event),
  };
};

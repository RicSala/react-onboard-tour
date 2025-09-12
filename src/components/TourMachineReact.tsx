'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TourOverlay } from './TourOverlay';
import { generateTourMachine } from '../helpers/tourMachineGenerator';
import { StateMachine } from '@tinystack/machine';
import {
  TourContext,
  BaseTourEvent,
  TourActor,
  type TourMachine as TTourMachine,
  TourConfig,
  CardPositioning,
  OverlayStyles,
} from '../types';
import { CardProps } from '../types';
import { ComponentType } from 'react';
import { useTourContext } from './TourProvider';
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
export let tourActor: TourActor | null = null;
export let tourMachine: TTourMachine | null = null;

export const TourMachineCore: React.FC<TourMachineReactProps> = ({
  customCard,
  closeOnClickOutside = true,
  cardPositioning: cardPositioningProp,
  overlayStyles: overlayStylesProp,
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

  const { tourConfig, handleSkip, handleComplete } = useTourContext() as {
    tourConfig: TourConfig; // We KNOW tourConfig is not null here (otherwise this wouldn't render)
    handleSkip: () => void;
    handleComplete: () => void;
  };

  // on pop state skip the tour and clean up the actor
  useEffect(() => {
    const handlePopState = () => {
      tourActor?.send({ type: 'SKIP_TOUR', tourId: tourConfig.id });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [tourConfig.id]);

  // Initialize actor only once per tour
  useEffect(() => {
    // If actor already exists for this tour, don't recreate it
    if (tourActor && tourMachine?.config.id === tourConfig.id) {
      return;
    }

    if (!tourMachine || tourMachine.config.id !== tourConfig.id) {
      const machineConfig = generateTourMachine<TourContext, BaseTourEvent>(
        tourConfig
      );
      tourMachine = new StateMachine<TourContext, BaseTourEvent>(machineConfig);
    }

    // Create and start the actor
    tourActor = tourMachine.createActor();

    // Subscribe to check for completion or skip
    const unsubscribe = tourActor.subscribe((snapshot) => {
      // Check if tour completed normally
      if (snapshot.value === 'completed' || snapshot.value === 'skipped') {
        tourActor?.stop();
        tourActor = null;
        tourMachine = null;
      }
    });

    tourActor.start();
    tourActor.send({ type: 'START_TOUR', tourId: tourConfig.id });

    // Only cleanup on true unmount (when component is removed)
    return () => {
      unsubscribe();
      tourActor?.stop();
      tourActor = null;
      tourMachine = null;
    };
  }, [tourConfig]); // Only depend on tour ID, not the whole config object

  // Handle completion/skip callbacks in a separate effect
  useEffect(() => {
    if (!tourActor) return;

    const unsubscribe = tourActor.subscribe((snapshot) => {
      if (snapshot.value === 'completed') {
        handleComplete?.();
        onComplete?.();
      }
      if (snapshot.value === 'skipped') {
        handleSkip?.();
        onSkip?.();
      }
    });

    return unsubscribe;
  }, [onComplete, onSkip, handleSkip, handleComplete]);

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
        router.push(targetPage);
      }
      // For step states, navigate if needed
      else if (snapshot.value.startsWith('step')) {
        router.push(targetPage);
      }
    }
  }, [snapshot, pathname, router]);

  // Detect page changes and notify the state machine
  useEffect(() => {
    if (!snapshot?.value || !tourActor) return;

    // Send PAGE_CHANGED for any active state (not idle or completed)
    if (snapshot.value !== 'idle' && snapshot.value !== 'completed') {
      tourActor.send({
        type: 'PAGE_CHANGED',
        page: pathname,
        tourId: tourConfig.id,
      });
    }
  }, [pathname, snapshot?.value, tourConfig.id]);

  // keyboard control
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight')
        return tourActor?.send({ type: 'NEXT', tourId: tourConfig.id });
      if (event.key === 'ArrowLeft')
        return tourActor?.send({ type: 'PREV', tourId: tourConfig.id });
      if (event.key === 'Escape')
        return tourActor?.send({ type: 'SKIP_TOUR', tourId: tourConfig.id });
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tourConfig.id]);

  return (
    <TourOverlay
      tourId={tourConfig.id}
      cardPositioning={cardPositioning}
      overlayStyles={overlayStyles}
      customCard={customCard}
      onOverlayClick={
        closeOnClickOutside
          ? () => tourActor?.send({ type: 'SKIP_TOUR', tourId: tourConfig.id })
          : undefined
      }
    />
  );
};

// the same as core but get is active from the context and conditionally render the core
// have the same props as core and pass all of them to the core
export const TourMachine = (props: TourMachineReactProps) => {
  const { isActive } = useTourContext();
  return isActive ? <TourMachineCore {...props} /> : null;
};

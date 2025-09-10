'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { TourMachine } from './TourMachineReact';
import { TourConfig } from '../helpers/tourMachineGenerator';
import DefaultCard from './DefaultCard';

interface TourContextType {
  startTour: (tourId?: string) => void;
  endTour: () => void;
  isActive: boolean;
  currentTourId: string | null;
  tourConfig: TourConfig;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: ReactNode;
  tourConfig: TourConfig;
}

export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  tourConfig,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);

  const startTour = useCallback(
    (tourId = 'main') => {
      if (isActive) return; // Prevent starting if already active
      console.log('[OptimizedTour] Starting tour:', tourId);
      setCurrentTourId(tourId);
      setIsActive(true);
    },
    [isActive]
  );

  const endTour = useCallback(() => {
    console.log('[OptimizedTour] Ending tour (completed)');
    setIsActive(false);
    setCurrentTourId(null);
  }, []);

  const onTourSkipped = useCallback(() => {
    console.log('[OptimizedTour] Tour was skipped');
    setIsActive(false);
    setCurrentTourId(null);
  }, []);

  const value = useMemo<TourContextType>(
    () => ({
      startTour,
      endTour,
      isActive,
      currentTourId,
      tourConfig,
    }),
    [startTour, endTour, isActive, currentTourId, tourConfig]
  );

  return (
    <TourContext.Provider value={value}>
      {/* Only render the heavy tour logic when active */}
      {isActive && currentTourId && (
        <TourMachine
          tourConfig={tourConfig}
          customCard={DefaultCard}
          onComplete={endTour}
          onSkip={onTourSkipped}
        />
      )}
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useOptimizedTour must be used within an TourProvider');
  }
  return context;
};

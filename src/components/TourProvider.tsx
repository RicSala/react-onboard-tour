'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { TourConfig } from '../types';

interface TourContextType {
  startTour: (tourId: string) => void;
  endTour: () => void;
  handleSkip: () => void;
  handleComplete: () => void;
  isActive: boolean;
  tourConfig?: TourConfig;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: ReactNode;
  tours: TourConfig[];
}

export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  tours,
}) => {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const isActive = useMemo(() => activeTourId !== null, [activeTourId]);
  const tourConfig = useMemo(
    () => tours.find((tour) => tour.id === activeTourId),
    [activeTourId, tours]
  );
  const startTour = useCallback(
    (tourId: string) => {
      if (isActive) return; // Prevent starting if already active
      setActiveTourId(tourId);
    },
    [isActive]
  );

  const endTour = useCallback(() => {
    setActiveTourId(null);
  }, []);

  const handleSkip = useCallback(() => {
    setActiveTourId(null);
  }, []);

  const handleComplete = useCallback(() => {
    setActiveTourId(null);
  }, []);

  const value = useMemo<TourContextType>(
    () => ({
      startTour,
      endTour,
      isActive,
      tourConfig,
      handleSkip,
      handleComplete,
    }),
    [startTour, endTour, isActive, tourConfig, handleSkip, handleComplete]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTourContext = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useOptimizedTour must be used within an TourProvider');
  }
  return context;
};

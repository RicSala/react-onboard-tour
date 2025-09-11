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
  startTour: (tourId?: string) => void;
  endTour: () => void;
  onTourSkipped: () => void;
  isActive: boolean;
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

  const startTour = useCallback(() => {
    if (isActive) return; // Prevent starting if already active
    setIsActive(true);
  }, [isActive]);

  const endTour = useCallback(() => {
    setIsActive(false);
  }, []);

  const onTourSkipped = useCallback(() => {
    setIsActive(false);
  }, []);

  const value = useMemo<TourContextType>(
    () => ({
      startTour,
      endTour,
      isActive,
      tourConfig,
      onTourSkipped,
    }),
    [startTour, endTour, isActive, tourConfig, onTourSkipped]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useOptimizedTour must be used within an TourProvider');
  }
  return context;
};

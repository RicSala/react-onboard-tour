'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Tour, TouringContext as TouringContextType } from '../types';

interface TourProviderProps {
  children: React.ReactNode;
  tours?: Tour[];
}

const TouringContext = createContext<TouringContextType | undefined>(undefined);

export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  tours = [],
}) => {
  const [currentStepState, setCurrentStepState] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);

  const setCurrentStep = useCallback((step: number, delay?: number) => {
    if (delay) {
      setTimeout(() => {
        setCurrentStepState(step);
        setIsActive(true);
      }, delay);
    } else {
      setCurrentStepState(step);
      setIsActive(true);
    }
  }, []);

  const closeTour = useCallback(() => {
    console.log('closeTou!');
    setIsActive(false);
    setCurrentTour(null);
  }, []);

  const startTour = useCallback((tour: string) => {
    console.log('startTour', tour);
    console.log('currentTour', currentTour);
    setCurrentTour(tour);
    setCurrentStepState(0);
    setIsActive(true);
  }, []);

  const value = useMemo<TouringContextType>(
    () => ({
      startTour,
      closeTour,
      setCurrentStep,
      currentStep: currentStepState,
      currentTour,
      isTourActive: isActive,
    }),
    [
      startTour,
      closeTour,
      setCurrentStep,
      currentStepState,
      currentTour,
      isActive,
    ]
  );

  return (
    <TouringContext.Provider value={value}>{children}</TouringContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TouringContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

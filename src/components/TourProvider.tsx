'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type {
  TouringContext as TouringContextType,
  TouringReactProps,
} from '../types';
import { TouringReact } from './TouringReact';

interface TourProviderProps {
  children: React.ReactNode;
  props: TouringReactProps;
}

const TouringContext = createContext<TouringContextType | undefined>(undefined);

export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  props,
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

  const startTour = useCallback(
    (tour: string) => {
      if (isActive) return;
      setCurrentTour(tour);
      setCurrentStepState(0);
      setIsActive(true);
    },
    [isActive]
  );

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
    <TouringContext.Provider value={value}>
      {isActive && <TouringReact {...props} />}
      {children}
    </TouringContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TouringContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

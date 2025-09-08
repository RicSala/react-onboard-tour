import { useCallback, useEffect, useMemo, useState } from 'react';
import { TouringReactProps } from '../types';
import { SmoothSpotlight } from './SmothSpotlight';
import { useTour } from './TourProvider';
import DefaultCard from './DefaultCard';
import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
} from '@floating-ui/react';
import { motion, AnimatePresence } from 'motion/react';
import { useWatchForChanges } from '../hooks/useWatchForChanges';
import { useOnPopstate } from '../hooks/useOnPopstate';

export const TouringReact = ({
  // children,
  tours,
  onStepChange,
  onComplete,
  onSkip,
  disableConsoleLogs,
  scrollToTop,
  noInViewScroll,
  closeOnClickOutside = false,
  toastFn = () => {},
  navigationAdapter = () => ({ push: () => {}, getCurrentPath: () => '' }),
}: TouringReactProps) => {
  const { currentTour, currentStep, setCurrentStep, closeTour, isTourActive } =
    useTour();

  const [isValidating, setIsValidating] = useState(false);

  const { refs, floatingStyles } = useFloating({
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(20),
      flip({
        fallbackAxisSideDirection: 'start', // Allow switching to top/bottom when left/right don't fit
        crossAxis: true, // Check the perpendicular axis
      }),
      shift({
        padding: 8,
        crossAxis: true, // Allow shifting on cross axis to push into reference element
      }),
    ],
    placement: 'right',
  });

  const router = useMemo(navigationAdapter, []);

  const currentTourSteps = useMemo(
    () => tours.find((tour) => tour.tour === currentTour)?.steps,
    [currentTour, tours]
  );
  const currentStepConfig = currentTourSteps
    ? currentTourSteps[currentStep]
    : undefined;

  const isFinalStep = currentTourSteps
    ? currentStep === currentTourSteps?.length - 1
    : false;

  const [element, setElement] = useState<HTMLElement>();
  const [hasSearched, setHasSearched] = useState(false);

  const skipTour = useCallback(() => {
    onSkip?.(currentStep, currentTour);
    setHasSearched(false);
    closeTour();
  }, [currentStep, currentTour, onSkip, closeTour]);

  useOnPopstate(skipTour);

  // Update the element and ref when the step changes
  useEffect(() => {
    console.log('element', element?.innerText);
    if (!currentStepConfig) return;

    if (!currentStepConfig.selector) {
      setElement(undefined);
      refs.setReference(null);
      setHasSearched(true);
      return;
    }

    let foundElement = document.querySelector(
      currentStepConfig.selector
    ) as HTMLElement;

    if (!foundElement) {
      console.log('No element found for selector:', currentStepConfig.selector);
      setElement(undefined);
      refs.setReference(null);
    } else {
      console.log('foundElement', foundElement);
      setElement(foundElement);
      refs.setReference(foundElement);
    }
    setHasSearched(true);
  }, [currentStepConfig]);

  const nextStep = async () => {
    if (!currentTourSteps || !currentStepConfig || isValidating) return;

    // Check if current step has validation
    if (currentStepConfig.validate) {
      setIsValidating(true);
      try {
        const result = await currentStepConfig.validate();
        if (!result.isValid) {
          console.error('Validation failed:', result);
          toastFn(result.error || 'Validation failed');
          setIsValidating(false);
          return; // Don't proceed to next step
        }
      } catch (error) {
        console.error('Validation error:', error);
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }

    if (isFinalStep) {
      onComplete?.(currentTour);
      return closeTour();
    }

    const nextStepIndex = currentStep + 1;
    const route = currentStepConfig.nextRoute;

    try {
      onStepChange?.(nextStepIndex, currentTour);

      if (!route) return setCurrentStep(nextStepIndex);

      router.push(route);

      const targetSelector = currentTourSteps[nextStepIndex].selector;

      if (!targetSelector) return setCurrentStep(nextStepIndex);

      // Use MutationObserver to detect when the target element is available in the DOM
      const observer = new MutationObserver((_, observer) => {
        const element = document.querySelector(targetSelector);
        if (element) {
          // Once the element is found, update the step and scroll to the element
          setCurrentStep(nextStepIndex);
          // scroll element into view
          element.scrollIntoView({ behavior: 'smooth' });

          // Stop observing after the element is found
          observer.disconnect();
        }
      });

      // Start observing the document body for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } catch (error) {
      if (!disableConsoleLogs) {
        console.error('Error navigating to next route', error);
      }
    }
  };

  useWatchForChanges({
    config: currentStepConfig?.watchForChanges,
    targetSelector: currentStepConfig?.selector,
    onChangeDetected: nextStep,
    enabled: !!currentStepConfig?.watchForChanges,
  });

  const prevStep = () => {
    if (currentTourSteps && currentStep > 0) {
      try {
        const prevStepIndex = currentStep - 1;
        const route = currentTourSteps[currentStep].prevRoute;
        console.log('route', route);

        onStepChange?.(prevStepIndex, currentTour);

        if (route) {
          router.push(route);

          const targetSelector = currentTourSteps[prevStepIndex].selector;

          if (targetSelector) {
            // Use MutationObserver to detect when the target element is available in the DOM
            const observer = new MutationObserver((_, observer) => {
              const element = document.querySelector(targetSelector);
              if (element) {
                // Once the element is found, update the step and scroll to the element
                setCurrentStep(prevStepIndex);
                // scroll element into view
                element.scrollIntoView({ behavior: 'smooth' });

                // Stop observing after the element is found
                observer.disconnect();
              }
            });

            // Start observing the document body for changes
            observer.observe(document.body, {
              childList: true,
              subtree: true,
            });
          } else {
            setCurrentStep(prevStepIndex);
          }
        } else {
          setCurrentStep(prevStepIndex);
          // scrollToElement(prevStepIndex);
        }
      } catch (error) {
        if (!disableConsoleLogs) {
          console.error('Error navigating to previous route', error);
        }
      }
    }
  };

  // keyboard control
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') return nextStep();
      if (event.key === 'ArrowLeft') return prevStep();
      if (event.key === 'Escape') return skipTour();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, prevStep, skipTour]);

  // scroll to top when tour is closed
  useEffect(() => {
    if (isTourActive) return;
    scrollToTop && window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollToTop, isTourActive]);

  return (
    <div>
      <AnimatePresence>
        {isTourActive && hasSearched && (
          <SmoothSpotlight
            key='spotlight'
            blockClicks={false}
            element={element}
            padding={20}
            radius={10}
            shadowOpacity='0.5'
            shadowRgb='0, 0, 0'
            onClickOutside={closeOnClickOutside ? skipTour : undefined}
          />
        )}
      </AnimatePresence>
      {currentStepConfig && hasSearched && (
        <motion.div
          style={{ ...floatingStyles, zIndex: 1000 }}
          ref={refs.setFloating}
          initial={false}
          animate={{
            position: element ? (floatingStyles.position as any) : 'fixed',
            top: element ? floatingStyles.top : '50%',
            left: element ? floatingStyles.left : '50%',
            transform: element
              ? floatingStyles.transform
              : 'translate(-50%, -50%)',
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <DefaultCard
            arrow={<></>}
            step={currentStepConfig}
            currentStep={currentStep}
            totalSteps={currentTourSteps?.length || 0}
            nextStep={nextStep}
            prevStep={prevStep}
            skipTour={skipTour}
            isValidating={isValidating}
          />
        </motion.div>
      )}
    </div>
  );
};

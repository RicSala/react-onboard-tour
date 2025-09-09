import { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
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
import { Debugger } from './Debugger';
import { scrollIfNeeded } from '../utils/scrollIfNeeded';

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
  debug = false,
}: TouringReactProps) => {
  const { currentTour, currentStep, setCurrentStep, closeTour, isTourActive } =
    useTour();

  // Debug tour state
  useEffect(() => {
    console.log('Tour state:', { isTourActive, currentTour });
  }, [isTourActive, currentTour]);

  const [isValidating, setIsValidating] = useState(false);
  const [element, setElement] = useState<HTMLElement>();
  const [hasSearched, setHasSearched] = useState(false);
  const [showCard, setShowCard] = useState(false);

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
    placement: 'right', // Use bottom as base, offset will center it
  });

  const currentTourSteps = useMemo(
    () => tours.find((tour) => tour.tour === currentTour)?.steps,
    [currentTour, tours]
  );
  const currentStepConfig = useMemo(
    () => (currentTourSteps ? currentTourSteps[currentStep] : undefined),
    [currentTourSteps, currentStep]
  );

  const isFinalStep = useMemo(
    () =>
      currentTourSteps ? currentStep === currentTourSteps?.length - 1 : false,
    [currentTourSteps, currentStep]
  );

  const skipTour = useCallback(() => {
    onSkip?.(currentStep, currentTour);
    setHasSearched(false);
    closeTour();
  }, [currentStep, currentTour, onSkip, closeTour]);

  // Update the element and ref when the step changes
  useEffect(() => {
    if (!currentStepConfig) return;

    // Hide card while transitioning
    setShowCard(false);

    if (!currentStepConfig.selector) {
      setElement(undefined);
      refs.setReference(null);
      setHasSearched(true);
      setShowCard(true);
      return;
    }

    let foundElement = document.querySelector(
      currentStepConfig.selector
    ) as HTMLElement;

    if (!foundElement) {
      setElement(undefined);
      refs.setReference(null);
      setShowCard(true);
    } else {
      setElement(foundElement);
      refs.setReference(foundElement);
      // Allow time for navigation to complete
      new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
        // Wait for scroll to finish before showing card
        scrollIfNeeded(foundElement).then(() => {
          setShowCard(true);
        });
      });
    }
    setHasSearched(true);
  }, [currentStepConfig, element?.innerText, refs]);

  const nextStep = useCallback(async () => {
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

      setShowCard(false);
      navigationAdapter().push(route);

      const targetSelector = currentTourSteps[nextStepIndex].selector;

      if (!targetSelector) return setCurrentStep(nextStepIndex);

      // Use MutationObserver to detect when the target element is available in the DOM
      const observer = new MutationObserver((_, observer) => {
        const element = document.querySelector(targetSelector);
        if (element) {
          // Once the element is found, update the step and scroll to the element
          setCurrentStep(nextStepIndex);
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
  }, [
    currentTourSteps,
    currentStepConfig,
    isValidating,
    isFinalStep,
    currentStep,
    toastFn,
    onComplete,
    currentTour,
    closeTour,
    onStepChange,
    setCurrentStep,
    navigationAdapter,
    disableConsoleLogs,
  ]);

  const prevStep = useCallback(() => {
    if (currentTourSteps && currentStep > 0) {
      try {
        const prevStepIndex = currentStep - 1;
        const route = currentTourSteps[currentStep].prevRoute;

        onStepChange?.(prevStepIndex, currentTour);

        if (route) {
          setShowCard(false);
          navigationAdapter().push(route);

          const targetSelector = currentTourSteps[prevStepIndex].selector;

          if (targetSelector) {
            // Use MutationObserver to detect when the target element is available in the DOM
            const observer = new MutationObserver((_, observer) => {
              const element = document.querySelector(
                targetSelector
              ) as HTMLElement | null;
              if (element) {
                // Once the element is found, update the step and scroll to the element
                setCurrentStep(prevStepIndex);
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
  }, [
    currentTourSteps,
    currentStep,
    onStepChange,
    currentTour,
    navigationAdapter,
    setCurrentStep,
    disableConsoleLogs,
  ]);

  // If nextstep conditions are met, advance to next step
  useWatchForChanges({
    config: currentStepConfig?.watchForChanges,
    targetSelector: currentStepConfig?.selector,
    onChangeDetected: nextStep,
    enabled: !!currentStepConfig?.watchForChanges,
  });

  // If the user navigates back, skip the tour
  useOnPopstate(skipTour);

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
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }, [scrollToTop, isTourActive]);

  const position = useMemo(() => {
    return {
      // Don't animate position - it's not animatable!
      position: element ? floatingStyles.position : 'fixed',
      top: element ? floatingStyles.top : '50%',
      left: element ? floatingStyles.left : '50%',
      transform: element ? floatingStyles.transform : 'translate(-50%, -50%)',
    };
  }, [element, floatingStyles]);

  return (
    <div>
      {/* Debugger Component */}
      {debug && (
        <Debugger
          element={element as HTMLElement}
          floatingStyles={position}
          floatingRef={refs.floating as RefObject<HTMLElement>}
          currentStep={currentStep}
          isTourActive={isTourActive}
        />
      )}
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
      <AnimatePresence mode='wait'>
        {currentStepConfig && hasSearched && showCard && (
          <motion.div
            key={`${currentStep}-${element ? 'element' : 'centered'}`}
            style={{
              ...(element
                ? floatingStyles
                : {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }),
              zIndex: 1000,
            }}
            ref={refs.setFloating}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
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
      </AnimatePresence>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { TouringReactProps } from '../types';
import { SmoothSpotlight } from './SmothSpotlight';
import { useTour } from './TourProvider';
import DefaultCard from './DefaultCard';
import { useFloating, autoUpdate, flip, offset } from '@floating-ui/react';
import { motion, AnimatePresence } from 'motion/react';

export const TouringReact = ({
  children,
  tours,
  onStepChange,
  onComplete,
  onSkip,
  disableConsoleLogs,
  scrollToTop,
  noInViewScroll,
  navigationAdapter = () => ({ push: () => {}, getCurrentPath: () => '' }),
}: TouringReactProps) => {
  const { currentTour, currentStep, setCurrentStep, closeTour } = useTour();
  const { refs, floatingStyles } = useFloating({
    whileElementsMounted: autoUpdate,
    middleware: [flip(), offset(20)],
    placement: 'right',
  });

  const router = navigationAdapter();

  const currentTourSteps = tours.find(
    (tour) => tour.tour === currentTour
  )?.steps;
  const [element, setElement] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const step = currentTourSteps?.[currentStep];

    console.log('step', step);
    if (step?.selector) {
      const foundElement = document.querySelector(
        step.selector
      ) as HTMLButtonElement;
      setElement(foundElement);
      refs.setReference(foundElement);
    } else {
      setElement(null);
      refs.setReference(null);
    }
  }, [currentStep, currentTourSteps]);

  const nextStep = () => {
    if (!currentTourSteps) return;

    const isFinalStep = currentStep === currentTourSteps?.length - 1;

    if (isFinalStep) {
      onComplete?.(currentTour);
      return closeTour();
    }

    const nextStepIndex = currentStep + 1;
    const route = currentTourSteps[currentStep].nextRoute;

    try {
      onStepChange?.(nextStepIndex, currentTour);

      if (!route) return setCurrentStep(nextStepIndex);

      router.push(route);

      const targetSelector = currentTourSteps[nextStepIndex].selector;

      if (!targetSelector) return setCurrentStep(nextStepIndex);

      // Use MutationObserver to detect when the target element is available in the DOM
      const observer = new MutationObserver((mutations, observer) => {
        const element = document.querySelector(targetSelector);
        if (element) {
          // Once the element is found, update the step and scroll to the element
          setCurrentStep(nextStepIndex);
          // scrollToElement(nextStepIndex);

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
            const observer = new MutationObserver((mutations, observer) => {
              const element = document.querySelector(targetSelector);
              if (element) {
                // Once the element is found, update the step and scroll to the element
                setCurrentStep(prevStepIndex);
                // scrollToElement(prevStepIndex);

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

  const skipTour = () => {
    onSkip?.(currentStep, currentTour);
    closeTour();
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

  return (
    <div>
      {children}
      <AnimatePresence>
        {element && (
          <SmoothSpotlight
            key='spotlight'
            blockClicks={false}
            element={element!}
            padding={20}
            radius={10}
            shadowOpacity='0.5'
            shadowRgb='0, 0, 0'
            // Step Controls
          />
        )}
      </AnimatePresence>
      {currentTourSteps?.[currentStep] && (
        <motion.div
          style={{ ...floatingStyles, zIndex: 1000 }}
          ref={refs.setFloating}
          initial={false}
          animate={{
            position: floatingStyles.position as any,
            top: floatingStyles.top,
            left: floatingStyles.left,
            transform: floatingStyles.transform,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <DefaultCard
            arrow={<></>}
            step={currentTourSteps?.[currentStep]}
            currentStep={currentStep}
            totalSteps={currentTourSteps?.length || 0}
            nextStep={nextStep}
            prevStep={prevStep}
            skipTour={skipTour}
          />
        </motion.div>
      )}
    </div>
  );
};

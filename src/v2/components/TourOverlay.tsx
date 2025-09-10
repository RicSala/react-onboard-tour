'use client';

import { useEffect, useState, ComponentType } from 'react';
import { useTourState } from './TourMachineReact';
import { TourConfig } from '../helpers/tourMachineGenerator';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { CardProps } from '../types';
import DefaultCard from './DefaultCard';

interface TourOverlayProps {
  tourConfig: TourConfig;
  customCard?: ComponentType<CardProps>;
}

export const TourOverlay = ({ tourConfig, customCard }: TourOverlayProps) => {
  const Card = customCard || DefaultCard;
  const tour = useTourState<typeof tourConfig>();
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);

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

  useEffect(() => {
    if (!tour?.currentStepData?.targetElement) {
      setElementRect(null);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(
        tour.currentStepData!.targetElement!
      );
      if (element) {
        setElementRect(element.getBoundingClientRect());
      } else {
        setElementRect(null);
      }
    };

    // Initial update with a small delay to allow page to render
    const initialTimer = setTimeout(updateRect, 100);
    updateRect();

    // Keep trying for a bit if element not found (for navigation cases)
    let retryCount = 0;
    const retryInterval = setInterval(() => {
      const element = document.querySelector(
        tour.currentStepData!.targetElement!
      );
      if (element || retryCount > 10) {
        updateRect();
        if (element) {
          clearInterval(retryInterval);
        }
      }
      retryCount++;
    }, 200);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(retryInterval);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [tour?.currentStepData?.targetElement, tour?.currentState]);

  // Check after all hooks
  if (!tour || !tour.isActive) return null;

  const padding = 8;
  const cutoutX = !elementRect ? 0 : elementRect.left - padding;
  const cutoutY = !elementRect ? 0 : elementRect.top - padding;
  const cutoutWidth = !elementRect ? 0 : elementRect.width + padding * 2;
  const cutoutHeight = !elementRect ? 0 : elementRect.height + padding * 2;

  return (
    <>
      {/* Dark overlay with cutout */}
      <div className='fixed inset-0 z-40 pointer-events-none'>
        <svg className='w-full h-full'>
          {elementRect && (
            <defs>
              <mask id='tour-mask-optimized'>
                <rect x='0' y='0' width='100%' height='100%' fill='white' />
                <rect
                  x={cutoutX}
                  y={cutoutY}
                  width={cutoutWidth}
                  height={cutoutHeight}
                  rx='8'
                  fill='black'
                />
              </mask>
            </defs>
          )}
          <rect
            x='0'
            y='0'
            width='100%'
            height='100%'
            fill='black'
            fillOpacity='0.5'
            mask={elementRect ? 'url(#tour-mask-optimized)' : undefined}
          />
        </svg>
      </div>

      {/* Highlight border */}
      {elementRect && (
        <div
          className='fixed z-40 rounded-lg pointer-events-none'
          ref={refs.setReference}
          style={{
            left: cutoutX,
            top: cutoutY,
            width: cutoutWidth,
            height: cutoutHeight,
          }}
        />
      )}

      {/* Tooltip Card */}
      {elementRect && (
        <Card
          className='fixed z-50 pointer-events-auto'
          style={floatingStyles}
          title={tour.currentStepData?.title}
          content={tour.currentStepData?.content}
          currentStepIndex={tour.currentStepIndex}
          totalSteps={tour.totalSteps}
          canGoNext={tour.canGoNext}
          canGoPrev={tour.canGoPrev}
          nextStep={tour.nextStep}
          prevStep={tour.prevStep}
          skipTour={tour.skipTour}
          endTour={tour.endTour}
          ref={refs.setFloating}
        />
      )}
    </>
  );
};

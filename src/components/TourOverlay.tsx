'use client';

import { useEffect, useState, ComponentType, useMemo } from 'react';
import { useTourState } from './TourMachineReact';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { CardPositioning, CardProps, OverlayStyles } from '../types';
import DefaultCard from './DefaultCard';
import { scrollIfNeeded } from '../helpers/scrollIfNeeded';
import { motion } from 'motion/react';

interface TourOverlayProps {
  customCard?: ComponentType<CardProps>;
  onOverlayClick?: () => void;
  backdropPointerEvents?: 'auto' | 'none';
  overlayStyles: Required<OverlayStyles>;
  cardPositioning: Required<CardPositioning>;
}

export const TourOverlay = ({
  customCard,
  onOverlayClick,
  backdropPointerEvents = 'auto',
  overlayStyles,
  cardPositioning,
}: TourOverlayProps) => {
  const Card = customCard || DefaultCard;
  const tour = useTourState();
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);

  const currentStepData = useMemo(() => {
    return tour?.currentStepData;
  }, [tour?.currentStepData]);

  const targetElement = useMemo(
    () => currentStepData?.targetElement,
    [currentStepData]
  );

  const { refs, floatingStyles } = useFloating({
    whileElementsMounted: autoUpdate,
    middleware: cardPositioning.floating
      ? [
          offset(cardPositioning.distancePx),
          flip({
            fallbackAxisSideDirection: 'start', // Allow switching to top/bottom when left/right don't fit
            crossAxis: true, // Check the perpendicular axis
          }),
          shift({
            padding: 8,
            crossAxis: true, // Allow shifting on cross axis to push into reference element
          }),
        ]
      : [],
    placement: cardPositioning.side, // Use bottom as base, offset will center it
  });

  useEffect(() => {
    if (!targetElement) return; // Keep the previous position

    const updateRect = () => {
      const element = document.querySelector(targetElement!);
      if (element) setElementRect(element.getBoundingClientRect());
      // Otherwise keep the previous position
    };

    // Initial update with a small delay to allow page to render
    const initialTimer = setTimeout(updateRect, 100);
    updateRect();

    // Keep trying for a bit if element not found (for navigation cases)
    let retryCount = 0;
    const retryInterval = setInterval(() => {
      const element = document.querySelector(targetElement!);
      if (element || retryCount > 10) {
        updateRect();
        clearInterval(retryInterval);
        if (element) {
          scrollIfNeeded(element as HTMLElement);
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
  }, [targetElement, tour?.currentState]);

  const cutoutX = useMemo(
    () => (!elementRect ? 0 : elementRect.left - overlayStyles.padding),
    [elementRect, overlayStyles.padding]
  );
  const cutoutY = useMemo(
    () => (!elementRect ? 0 : elementRect.top - overlayStyles.padding),
    [elementRect, overlayStyles.padding]
  );
  const cutoutWidth = useMemo(
    () => (!elementRect ? 0 : elementRect.width + overlayStyles.padding * 2),
    [elementRect, overlayStyles.padding]
  );
  const cutoutHeight = useMemo(
    () => (!elementRect ? 0 : elementRect.height + overlayStyles.padding * 2),
    [elementRect, overlayStyles.padding]
  );
  // Check after all hooks
  if (!tour || !tour.isActive) return null;

  // Get viewport dimensions
  const viewportElement =
    //  viewport ||
    document.body;
  const viewportScrollHeight = viewportElement.scrollHeight;
  const viewportScrollWidth = viewportElement.scrollWidth;

  return (
    <>
      {/* Dark overlay with cutout */}
      <motion.div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 998,
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <svg width='100%' height='100%'>
          {elementRect && (
            <defs>
              <mask id='smooth-spotlight-mask'>
                <rect width='100%' height='100%' fill='white' />
                <motion.rect
                  initial={{
                    x: cutoutX + cutoutWidth / 2 - 20,
                    y: cutoutY + cutoutHeight / 2 - 20,
                    width: 40,
                    height: 40,
                    rx: 10,
                    ry: 10,
                  }}
                  animate={{
                    x: cutoutX,
                    y: cutoutY,
                    width: cutoutWidth,
                    height: cutoutHeight,
                    rx: overlayStyles.radius,
                    ry: overlayStyles.radius,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  fill='black'
                />
              </mask>
            </defs>
          )}
          <motion.rect
            width='100%'
            height='100%'
            fill={`rgba(${overlayStyles.colorRgb}, ${overlayStyles.opacity})`}
            mask='url(#smooth-spotlight-mask)'
          />
        </svg>
      </motion.div>

      {/* Highlighted element */}
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
          className='fixed z-[999] pointer-events-auto'
          style={floatingStyles}
          title={tour.currentStepData?.title}
          content={tour.currentStepData?.content}
          currentStepIndex={tour.currentStepIndex}
          totalSteps={tour.totalSteps}
          canGoNext={tour.canGoNext!}
          canGoPrev={tour.canGoPrev!}
          nextStep={tour.nextStep}
          prevStep={tour.prevStep}
          skipTour={tour.skipTour}
          endTour={tour.endTour}
          ref={refs.setFloating}
        />
      )}

      {/* Blocking panes */}

      <>
        {/* Top rectangle */}
        <div
          onClick={onOverlayClick}
          style={{
            height: Math.max(cutoutY, 0),
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            pointerEvents: backdropPointerEvents, // block clicks to anything under the top rectangle
            zIndex: 997,
          }}
        />

        {/* Bottom rectangle */}
        <div
          onClick={onOverlayClick}
          style={{
            height: Math.max(viewportScrollHeight - cutoutY - cutoutHeight, 0),
            position: 'fixed',
            top: cutoutY + cutoutHeight,
            bottom: 0,
            left: 0,
            right: 0,
            pointerEvents: backdropPointerEvents,
            zIndex: 997,
          }}
        />

        {/* Left rectangle */}
        <div
          onClick={onOverlayClick}
          style={{
            width: Math.max(cutoutX, 0),
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            pointerEvents: backdropPointerEvents,
            zIndex: 997,
          }}
        />

        {/* Right rectangle */}
        <div
          onClick={onOverlayClick}
          style={{
            width: Math.max(viewportScrollWidth - cutoutX - cutoutWidth, 0),
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            pointerEvents: backdropPointerEvents,
            zIndex: 997,
          }}
        />
      </>
    </>
  );
};

'use client';

import { useEffect, useState, ComponentType, useMemo } from 'react';
import { useTour } from '../hooks/useTour';
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
import DynamicPortal from './DynamicPortal';

interface TourOverlayProps {
  customCard?: ComponentType<CardProps>;
  onOverlayClick?: () => void;
  backdropPointerEvents?: 'auto' | 'none';
  overlayStyles: Required<OverlayStyles>;
  cardPositioning: Required<CardPositioning>;
  tourId: string;
}

// Helper function to find the scrollable parent of an element
const getScrollableParent = (element: Element): HTMLElement => {
  let parent: HTMLElement | null = element.parentElement;

  while (parent) {
    const computedStyle = getComputedStyle(parent);
    const overflowY = computedStyle.overflowY;
    const overflowX = computedStyle.overflowX;
    const isScrollableY = overflowY === 'scroll' || overflowY === 'auto';
    const isScrollableX = overflowX === 'scroll' || overflowX === 'auto';

    if (
      (isScrollableY && parent.scrollHeight > parent.clientHeight) ||
      (isScrollableX && parent.scrollWidth > parent.clientWidth)
    ) {
      return parent; // Found a scrollable parent
    }

    parent = parent.parentElement;
  }

  // No scrollable parent found, return document.body
  return document.body;
};

export const TourOverlay = ({
  customCard,
  onOverlayClick,
  backdropPointerEvents = 'auto',
  overlayStyles,
  cardPositioning,
  tourId,
}: TourOverlayProps) => {
  const Card = customCard || DefaultCard;
  const tour = useTour(tourId);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [viewportElement, setViewportElement] = useState<HTMLElement | null>(
    null
  );
  const [scrollableParent, setScrollableParent] = useState<HTMLElement | null>(
    null
  );

  const targetElement = useMemo(
    () => tour?.currentStepData?.targetElement,
    [tour?.currentStepData]
  );

  const viewportId = useMemo(
    () => tour?.currentStepData?.viewportId,
    [tour?.currentStepData]
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

  // Track viewport element and its scrollable parent
  useEffect(() => {
    if (viewportId) {
      const viewport = document.getElementById(viewportId);
      if (viewport) {
        setViewportElement(viewport);
        // Find the scrollable parent (the container with borders/scrollbars)
        const parent = getScrollableParent(viewport);
        setScrollableParent(parent);
      } else {
        console.warn(`Viewport element with ID "${viewportId}" not found`);
        setViewportElement(null);
        setScrollableParent(null);
      }
    } else {
      // No custom viewport, but we still need to find the scrollable parent
      // Start from body and find the actual scrollable container
      setViewportElement(null);
      const parent = getScrollableParent(document.body);
      setScrollableParent(parent);
    }
  }, [viewportId]);

  useEffect(() => {
    if (!targetElement) return; // Keep the previous position

    const updateRect = () => {
      const element = document.querySelector(targetElement!);
      if (element) {
        const rect = element.getBoundingClientRect();
        
        // Get the actual container that will hold our overlay
        const container = viewportElement || scrollableParent || document.body;
        const containerRect = container.getBoundingClientRect();
        
        // Calculate position relative to the container
        // Add scroll offsets to get the absolute position within the scrollable area
        const scrollLeft = container.scrollLeft || 0;
        const scrollTop = container.scrollTop || 0;
        
        setElementRect(
          new DOMRect(
            rect.left - containerRect.left + scrollLeft,
            rect.top - containerRect.top + scrollTop,
            rect.width,
            rect.height
          )
        );
      }
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

    // Only need resize listener now, no scroll listener needed!
    window.addEventListener('resize', updateRect);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(retryInterval);
      window.removeEventListener('resize', updateRect);
    };
  }, [targetElement, tour?.currentState, viewportElement, scrollableParent]);

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

  // Get viewport dimensions - use scrollable parent when available to include padding
  const containerElement = scrollableParent || viewportElement || document.body;
  const viewportScrollHeight = containerElement.scrollHeight;
  const viewportScrollWidth = containerElement.scrollWidth;

  return (
    <>
      {/* Main overlay inside viewport */}
      <DynamicPortal viewportID={viewportId}>
        <motion.div
          data-name='tourista-overlay'
          initial='hidden'
          animate='visible'
          exit='hidden'
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden',
            height: `${viewportScrollHeight}px`,
            width: `${viewportScrollWidth}px`,
            zIndex: 997,
            pointerEvents: 'none',
          }}
        >
          {/* Dark overlay with cutout */}
          <svg
            width={viewportScrollWidth}
            height={viewportScrollHeight}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          >
            {elementRect && (
              <defs>
                <mask id='smooth-spotlight-mask'>
                  <rect
                    width={viewportScrollWidth}
                    height={viewportScrollHeight}
                    fill='white'
                  />
                  <motion.rect
                    id={`smooth-spotlight-mask-${tourId}`}
                    initial={{
                      x: cutoutX + cutoutWidth / 2 - 20,
                      y: cutoutY + cutoutHeight / 2 - 20,
                      width: 40,
                      height: 40,
                      rx: 10,
                      ry: 10,
                    }}
                    animate={{
                      x: targetElement ? cutoutX : cutoutX + cutoutWidth / 2,
                      y: targetElement ? cutoutY : cutoutY + cutoutHeight / 2,
                      width: targetElement ? cutoutWidth : 0,
                      height: targetElement ? cutoutHeight : 0,
                      rx: overlayStyles.radius,
                      ry: overlayStyles.radius,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    fill='black'
                  />
                </mask>
              </defs>
            )}
            <rect
              width={viewportScrollWidth}
              height={viewportScrollHeight}
              fill={`rgba(${overlayStyles.colorRgb}, ${overlayStyles.opacity})`}
              mask='url(#smooth-spotlight-mask)'
            />
          </svg>

          {/* Blocking panes to prevent clicks */}
          <div
            data-name='tourista-prevent-click-overlay'
            style={{
              position: 'absolute',
              zIndex: 998,
              pointerEvents: 'none',
              height: `${viewportScrollHeight}px`,
              width: `${viewportScrollWidth}px`,
            }}
          >
            {/* Top overlay */}
            <div
              data-name='tourista-prevent-click-overlay-top'
              onClick={onOverlayClick}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                pointerEvents: backdropPointerEvents,
                height: Math.max(cutoutY, 0),
              }}
            />
            {/* Bottom overlay */}
            <div
              data-name='tourista-prevent-click-overlay-bottom'
              onClick={onOverlayClick}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: cutoutY + cutoutHeight,
                pointerEvents: backdropPointerEvents,
                height: Math.max(
                  viewportScrollHeight - cutoutY - cutoutHeight,
                  0
                ),
              }}
            />
            {/* Left overlay */}
            <div
              data-name='tourista-prevent-click-overlay-left'
              onClick={onOverlayClick}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                pointerEvents: backdropPointerEvents,
                width: Math.max(cutoutX, 0),
                height: viewportScrollHeight,
              }}
            />
            {/* Right overlay */}
            <div
              data-name='tourista-prevent-click-overlay-right'
              onClick={onOverlayClick}
              style={{
                position: 'absolute',
                top: 0,
                left: cutoutX + cutoutWidth,
                pointerEvents: backdropPointerEvents,
                width: Math.max(viewportScrollWidth - cutoutX - cutoutWidth, 0),
                height: viewportScrollHeight,
              }}
            />
          </div>
          {/* Highlighted element reference for floating UI */}
          {elementRect && (
            <div
              data-name='tourista-highlight-reference'
              className='absolute rounded-lg pointer-events-none'
              ref={refs.setReference}
              style={{
                left: cutoutX,
                top: cutoutY,
                width: cutoutWidth,
                height: cutoutHeight,
                zIndex: 999,
              }}
            />
          )}
        </motion.div>
      </DynamicPortal>

      {/* Outer overlay for outside of custom viewport - only when viewportID and scrollableParent are available */}
      <DynamicPortal>
        {viewportId && scrollableParent && (
          <motion.div
            data-name='tourista-outer-overlay'
            initial='hidden'
            animate='visible'
            exit='hidden'
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              overflow: 'hidden',
              height: `${document.body.scrollHeight}px`,
              width: `${document.body.scrollWidth}px`,
              zIndex: 997,
              pointerEvents: 'none',
            }}
          >
            {/* Blocking overlay around the scrollable parent to prevent clicks */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 998,
                pointerEvents: 'none',
                width: '100vw',
                height: document.body.scrollHeight,
              }}
            >
              {/* Top overlay */}
              <div
                id='external-top-overlay'
                onClick={onOverlayClick}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  pointerEvents: backdropPointerEvents,
                  height:
                    scrollableParent.getBoundingClientRect().top +
                    window.scrollY,
                  width: `${document.body.scrollWidth}px`,
                  backgroundColor: `rgba(${overlayStyles.colorRgb}, ${overlayStyles.opacity})`,
                }}
              />

              {/* Bottom overlay */}
              <div
                onClick={onOverlayClick}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  pointerEvents: backdropPointerEvents,
                  top: `${
                    scrollableParent.getBoundingClientRect().bottom +
                    window.scrollY
                  }px`,
                  height: `${
                    document.body.scrollHeight -
                    scrollableParent.getBoundingClientRect().bottom -
                    window.scrollY
                  }px`,
                  width: `${document.body.scrollWidth}px`,
                  backgroundColor: `rgba(${overlayStyles.colorRgb}, ${overlayStyles.opacity})`,
                }}
              />

              {/* Left overlay */}
              <div
                onClick={onOverlayClick}
                style={{
                  position: 'absolute',
                  pointerEvents: backdropPointerEvents,
                  left: 0,
                  top:
                    scrollableParent.getBoundingClientRect().top +
                    window.scrollY,
                  width:
                    scrollableParent.getBoundingClientRect().left +
                    window.scrollX,
                  height: scrollableParent.getBoundingClientRect().height,
                  backgroundColor: `rgba(${overlayStyles.colorRgb}, ${overlayStyles.opacity})`,
                }}
              />

              {/* Right overlay */}
              <div
                onClick={onOverlayClick}
                style={{
                  position: 'absolute',
                  pointerEvents: backdropPointerEvents,
                  top:
                    scrollableParent.getBoundingClientRect().top +
                    window.scrollY,
                  left: `${
                    scrollableParent.getBoundingClientRect().right +
                    window.scrollX
                  }px`,
                  width: `${
                    document.body.scrollWidth -
                    scrollableParent.getBoundingClientRect().right -
                    window.scrollX
                  }px`,
                  height: scrollableParent.getBoundingClientRect().height,
                  backgroundColor: `rgba(${overlayStyles.colorRgb}, ${overlayStyles.opacity})`,
                }}
              />
            </div>
          </motion.div>
        )}
        {/* Tooltip Card */}
        <Card
          className='absolute z-[999] pointer-events-auto'
          style={
            targetElement
              ? floatingStyles
              : {
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }
          }
          title={tour.currentStepData?.title}
          content={tour.currentStepData?.content}
          currentStepIndex={tour.currentStepIndex}
          totalSteps={tour.totalSteps}
          canGoNext={tour.canGoNext!}
          canSkip={tour.canSkip!}
          canGoPrev={tour.canGoPrev!}
          nextStep={tour.nextStep}
          prevStep={tour.prevStep}
          skipTour={tour.skipTour}
          endTour={tour.endTour}
          ref={refs.setFloating}
        />
      </DynamicPortal>
    </>
  );
};

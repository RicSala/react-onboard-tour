'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SmoothSpotlightProps {
  element?: HTMLElement;
  padding: number;
  radius: number;
  shadowOpacity: string;
  shadowRgb: string;
  blockClicks: boolean;
  viewport?: HTMLElement;
  onClickOutside?: () => void;
}

export const SmoothSpotlight: React.FC<SmoothSpotlightProps> = ({
  element,
  padding,
  radius,
  shadowOpacity,
  shadowRgb,
  blockClicks,
  viewport,
  onClickOutside,
}) => {
  // Debug: Log when component mounts/unmounts
  useEffect(() => {
    console.log('SmoothSpotlight mounted');
    return () => {
      console.log('SmoothSpotlight unmounting');
    };
  }, []);
  const [position, setPosition] = useState(() => {
    if (!element) return { px: 0, py: 0, pw: 0, ph: 0 };
    const rect = element.getBoundingClientRect();
    return {
      px: rect.x - padding / 2,
      py: rect.y - padding / 2,
      pw: rect.width + padding,
      ph: rect.height + padding,
    };
  });

  // Update position on scroll or resize
  useEffect(() => {
    if (!element) {
      return setPosition((prev) => ({
        px: prev.px + prev.pw / 2,
        py: prev.py + prev.ph / 2,
        pw: 0,
        ph: 0,
      }));
    }
    const updatePosition = () => {
      // if element is no longer in the DOM, do nothing
      if (!element.isConnected) return;

      const rect = element.getBoundingClientRect();
      setPosition({
        px: rect.x - padding / 2,
        py: rect.y - padding / 2,
        pw: rect.width + padding,
        ph: rect.height + padding,
      });
    };

    // Initial update
    updatePosition();

    // Listen to scroll and resize events
    window.addEventListener('scroll', updatePosition, true); // Use capture to catch all scroll events
    window.addEventListener('resize', updatePosition);

    // Also observe the element for position changes
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(element);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      resizeObserver.disconnect();
    };
  }, [element, padding]);

  const { px, py, pw, ph } = position;

  // Get viewport dimensions
  const viewportElement = viewport || document.body;
  const viewportRect = viewportElement.getBoundingClientRect();
  const viewportScrollHeight = viewportElement.scrollHeight;
  const viewportScrollWidth = viewportElement.scrollWidth;

  return (
    <>
      {/* Visual spotlight effect */}
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
          <defs>
            <mask id='smooth-spotlight-mask'>
              <rect width='100%' height='100%' fill='white' />
              <motion.rect
                initial={{
                  x: px + pw / 2 - 20,
                  y: py + ph / 2 - 20,
                  width: 40,
                  height: 40,
                  rx: radius,
                  ry: radius,
                }}
                animate={{
                  x: px,
                  y: py,
                  width: pw,
                  height: ph,
                  rx: radius,
                  ry: radius,
                }}
                exit={{
                  x: px + pw / 2 - 20,
                  y: py + ph / 2 - 20,
                  width: 40,
                  height: 40,
                  rx: radius,
                  ry: radius,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                fill='black'
              />
            </mask>
          </defs>
          <motion.rect
            width='100%'
            height='100%'
            fill={`rgba(${shadowRgb}, ${shadowOpacity})`}
            mask='url(#smooth-spotlight-mask)'
          />
        </svg>
      </motion.div>

      {/* Click blocking overlays - four rectangles */}
      {(blockClicks || onClickOutside) && (
        <div
          data-spotlight-blocker='true'
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 997,
            pointerEvents: 'none',
            height: `${viewportScrollHeight}px`,
            width: `${viewportScrollWidth}px`,
          }}
        >
          {/* Top rectangle */}
          <motion.div
            onClick={onClickOutside}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              pointerEvents: 'auto',
            }}
            animate={{
              height: Math.max(py, 0),
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />

          {/* Bottom rectangle */}
          <motion.div
            onClick={onClickOutside}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'auto',
            }}
            animate={{
              height: Math.max(viewportRect.height - (py + ph), 0),
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />

          {/* Left rectangle */}
          <motion.div
            onClick={onClickOutside}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'auto',
              height: viewportRect.height,
            }}
            animate={{
              width: Math.max(px, 0),
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />

          {/* Right rectangle */}
          <motion.div
            onClick={onClickOutside}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              pointerEvents: 'auto',
              height: viewportRect.height,
            }}
            animate={{
              left: px + pw,
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      )}
    </>
  );
};

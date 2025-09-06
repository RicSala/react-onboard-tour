'use client';

import React from 'react';
import { motion } from 'motion/react';

// special thanks to https://github.com/enszrlu/NextStep/issues/32 @dinamicby

interface SmoothSpotlightProps {
  element: HTMLElement;
  padding: number;
  radius: number;
  shadowOpacity: string;
  shadowRgb: string;
  blockClicks: boolean;
  viewport?: HTMLElement;
}

export const SmoothSpotlight: React.FC<SmoothSpotlightProps> = ({
  element,
  padding,
  radius,
  shadowOpacity,
  shadowRgb,
  blockClicks,
  viewport,
}) => {
  const px = element.getBoundingClientRect().x - padding / 2;
  const py = element.getBoundingClientRect().y - padding / 2;
  const pw = element.getBoundingClientRect().width + padding;
  const ph = element.getBoundingClientRect().height + padding;

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
          position: 'absolute',
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
      {blockClicks && (
        <div
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

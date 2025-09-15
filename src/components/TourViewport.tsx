import React from 'react';

interface TourViewportProps {
  children: React.ReactNode;
  id: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A viewport component for wrapping content that will be targeted by the tour overlay.
 *
 * This component creates a clean boundary for the tour overlay system by removing
 * overflow visibility. The actual scrolling should be handled by the parent container.
 *
 * @param children - The content to be rendered within the viewport
 * @param id - The unique identifier for the viewport, used for targeting in tour steps
 * @param className - Optional CSS classes to apply
 * @param style - Optional inline styles to apply
 * @returns The rendered viewport component
 *
 * @example
 * // Wrap your content inside a scrollable container
 * <div className="overflow-auto h-96 border rounded-lg">
 *   <TourViewport id="scrollable-viewport">
 *     <YourContent />
 *   </TourViewport>
 * </div>
 */
const TourViewport: React.FC<TourViewportProps> = ({
  children,
  id,
  className = '',
  style = {},
}) => {
  return (
    <div
      id={id}
      className={className}
      style={{
        position: 'relative',
        // overflow: 'hidden',
        margin: 0,
        padding: 0,
        minHeight: '100%',
        minWidth: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default TourViewport;

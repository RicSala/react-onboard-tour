import { CardProps } from '../types';
import { forwardRef } from 'react';

const DefaultCard = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      content,
      currentStepIndex,
      totalSteps,
      canGoNext,
      canGoPrev,
      nextStep,
      prevStep,
      skipTour,
      endTour,
      className,
      style,
      showControls = true,
      showSkip = true,
    },
    ref
  ) => {
    const isLastStep = currentStepIndex === totalSteps - 1;

    return (
      <div
        ref={ref}
        className={className}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow:
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '1rem',
          maxWidth: '32rem',
          minWidth: '16rem',
          ...style,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{title}</h2>
        </div>
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
          {content}
        </div>
        <div
          style={{
            marginBottom: '1rem',
            backgroundColor: '#E5E7EB',
            borderRadius: '9999px',
            height: '0.625rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#2563EB',
              height: '0.625rem',
              borderRadius: '9999px',
              width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
              transition: 'width 0.3s ease-in-out',
            }}
          ></div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.75rem',
          }}
        >
          <button
            onClick={prevStep}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: '500',
              color: canGoPrev ? '#4B5563' : '#9CA3AF',
              backgroundColor: '#F3F4F6',
              borderRadius: '0.375rem',
              cursor: canGoPrev ? 'pointer' : 'not-allowed',
              display: showControls ? 'block' : 'none',
              border: 'none',
            }}
            disabled={!canGoPrev}
          >
            Previous!
          </button>
          <span style={{ color: '#6B7280', whiteSpace: 'nowrap' }}>
            {currentStepIndex + 1} of {totalSteps}
          </span>
          {/* Only show Finish when we're at the last step AND can't go next (final state) */}
          {!canGoNext && isLastStep ? (
            <button
              onClick={endTour}
              style={{
                padding: '0.5rem 1rem',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#10B981',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: showControls ? 'block' : 'none',
                border: 'none',
              }}
            >
              Finish
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canGoNext}
              style={{
                padding: '0.5rem 1rem',
                fontWeight: '500',
                color: 'white',
                backgroundColor: canGoNext ? '#2563EB' : '#9CA3AF',
                borderRadius: '0.375rem',
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                display: showControls ? 'block' : 'none',
                border: 'none',
              }}
            >
              Next
            </button>
          )}
        </div>
        {showSkip && !isLastStep && (
          <button
            onClick={skipTour}
            style={{
              marginTop: '1rem',
              fontSize: '0.75rem',
              width: '100%',
              padding: '0.5rem 1rem',
              fontWeight: '500',
              color: '#4B5563',
              backgroundColor: '#F3F4F6',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'block',
              border: 'none',
            }}
          >
            Skip Tour
          </button>
        )}
      </div>
    );
  }
);

DefaultCard.displayName = 'DefaultCard';

export default DefaultCard;

'use client';

import { useTour } from '../hooks/useTour';
import { useState } from 'react';

export const DebugPanel = ({ tourId }: { tourId: string }) => {
  const tour = useTour(tourId);
  const [isOpen, setIsOpen] = useState(true);

  console.log('[DebugPanel] Tour state:', tour);

  if (
    !tour ||
    !tour.isActive ||
    tour.currentState === null ||
    !tour.snapshot?.context
  ) {
    return (
      <div className='fixed bottom-4 left-4 bg-gray-200 text-gray-600 px-3 py-2 rounded-lg shadow-lg text-sm z-50'>
        No active tour
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className='fixed bottom-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-50'
      >
        Show Debug Info
      </button>
    );
  }

  return (
    <div className='fixed bottom-4 left-4 bg-white rounded-lg shadow-xl p-4 w-80 border-2 border-green-200 z-[9998]'>
      <div className='flex justify-between items-center mb-3'>
        <h3 className='font-bold text-green-800'>Generated Tour Status</h3>
        <button
          onClick={() => setIsOpen(false)}
          className='text-gray-400 hover:text-gray-600'
        >
          ✕
        </button>
      </div>

      <div className='space-y-2 text-sm'>
        <div className='bg-green-50 p-2 rounded'>
          <span className='font-semibold'>Tour ID:</span>
          <div className='font-mono text-green-700'>
            {tour.snapshot?.context?.tourId}
          </div>
        </div>

        <div className='bg-green-50 p-2 rounded'>
          <span className='font-semibold'>Current State:</span>
          <div className='font-mono text-green-700'>{tour.currentState}</div>
        </div>

        <div className='bg-green-50 p-2 rounded'>
          <span className='font-semibold'>Is Active:</span>
          <span
            className={`ml-2 ${
              tour.isActive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {tour.isActive ? 'Yes' : 'No'}
          </span>
        </div>

        {tour.currentStepData && (
          <div className='bg-green-50 p-2 rounded'>
            <span className='font-semibold'>Target:</span>
            <div className='text-green-700'>
              {tour.currentStepData.targetElement}
            </div>
          </div>
        )}

        <div className='bg-gray-50 p-2 rounded'>
          <span className='font-semibold'>Context:</span>
          <div className='text-xs text-gray-600 font-mono overflow-auto max-h-32'>
            <pre>{JSON.stringify(tour.snapshot?.context, null, 2)}</pre>
          </div>
        </div>

        <div className='bg-green-50 p-2 rounded'>
          <span className='font-semibold'>Can Navigate:</span>
          <div className='text-green-700'>
            Next: {tour.canGoNext ? '✅' : '❌'} | Prev:{' '}
            {tour.canGoPrev ? '✅' : '❌'}
          </div>
        </div>

        {tour.snapshot.context.autoAdvanceTimer && (
          <div className='bg-yellow-50 p-2 rounded border border-yellow-200'>
            <span className='font-semibold text-yellow-800'>Auto-advance:</span>
            <div className='text-yellow-700 text-xs'>
              ⏱️ Active (Timer ID: {tour.snapshot?.context?.autoAdvanceTimer})
            </div>
          </div>
        )}

        {/* Show async operation status */}
        {tour.currentState &&
          (tour.currentState.includes('_pending') ||
            tour.currentState.includes('_processing') ||
            tour.currentState.includes('_success')) && (
            <div className='bg-purple-50 p-2 rounded border border-purple-200'>
              <span className='font-semibold text-purple-800'>
                Async Status:
              </span>
              <div className='text-purple-700 text-xs'>
                {tour.currentState.includes('_pending') &&
                  '⏸️ Waiting for payment'}
                {tour.currentState.includes('_processing') &&
                  '⏳ Processing payment...'}
                {tour.currentState.includes('_success') &&
                  '✅ Payment complete!'}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

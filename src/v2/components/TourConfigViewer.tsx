'use client';

import { useState } from 'react';
import { TourConfig } from '../helpers/tourMachineGenerator';

interface TourConfigViewerProps {
  tourConfig: TourConfig;
  machineConfig: any;
}

export const TourConfigViewer = ({
  tourConfig,
  machineConfig,
}: TourConfigViewerProps) => {
  const [selectedState, setSelectedState] = useState<string>('idle');
  const [expandedStates, setExpandedStates] = useState<Set<string>>(
    new Set(['idle'])
  );

  // Extract all states and their transitions
  const states = machineConfig.states || {};

  // Helper to get state type and color
  const getStateInfo = (stateName: string) => {
    if (stateName === 'idle') return { type: 'initial', color: 'bg-gray-500' };
    if (stateName === 'completed')
      return { type: 'final', color: 'bg-green-500' };
    if (stateName.includes('navigatingTo_'))
      return { type: 'navigation', color: 'bg-yellow-500' };
    if (stateName.includes('_pending'))
      return { type: 'async-pending', color: 'bg-blue-400' };
    if (stateName.includes('_processing'))
      return { type: 'async-processing', color: 'bg-orange-500' };
    if (stateName.includes('_success'))
      return { type: 'async-success', color: 'bg-green-400' };
    return { type: 'sync', color: 'bg-purple-500' };
  };

  // Helper to format state name for display
  const formatStateName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Toggle expanded state
  const toggleExpanded = (stateName: string) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(stateName)) {
      newExpanded.delete(stateName);
    } else {
      newExpanded.add(stateName);
    }
    setExpandedStates(newExpanded);
  };

  // Get all events from a state
  const getStateEvents = (state: any) => {
    const events: string[] = [];
    if (state?.on) {
      Object.keys(state.on).forEach((eventName) => {
        events.push(eventName);
      });
    }
    return events;
  };

  // Get target state for an event
  const getEventTarget = (state: any, eventName: string) => {
    const event = state?.on?.[eventName];
    if (typeof event === 'string') return event;
    if (event?.target) return event.target;
    return null;
  };

  // Create a simplified graph structure
  const createGraph = () => {
    const nodes: { [key: string]: { transitions: { [key: string]: string } } } =
      {};

    Object.entries(states).forEach(([stateName, state]: [string, any]) => {
      const transitions: { [key: string]: string } = {};

      if (state?.on) {
        Object.entries(state.on).forEach(
          ([eventName, eventConfig]: [string, any]) => {
            const target =
              typeof eventConfig === 'string'
                ? eventConfig
                : eventConfig.target;
            if (target) {
              transitions[eventName] = target;
            }
          }
        );
      }

      nodes[stateName] = { transitions };
    });

    return nodes;
  };

  const graph = createGraph();

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>
          🔍 Tour Machine Visualization
        </h1>

        {/* Machine Info */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Machine Configuration</h2>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='font-medium'>Machine ID:</span>{' '}
              {machineConfig.id}
            </div>
            <div>
              <span className='font-medium'>Initial State:</span>{' '}
              {machineConfig.initial}
            </div>
            <div>
              <span className='font-medium'>Total States:</span>{' '}
              {Object.keys(states).length}
            </div>
            <div>
              <span className='font-medium'>Total Steps:</span>{' '}
              {tourConfig.steps.length}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-4'>State Types</h2>
          <div className='flex flex-wrap gap-4'>
            {[
              { type: 'initial', color: 'bg-gray-500', label: 'Initial' },
              { type: 'sync', color: 'bg-purple-500', label: 'Sync Step' },
              {
                type: 'async-pending',
                color: 'bg-blue-400',
                label: 'Async Pending',
              },
              {
                type: 'async-processing',
                color: 'bg-orange-500',
                label: 'Async Processing',
              },
              {
                type: 'async-success',
                color: 'bg-green-400',
                label: 'Async Success',
              },
              {
                type: 'navigation',
                color: 'bg-yellow-500',
                label: 'Navigation',
              },
              { type: 'final', color: 'bg-green-500', label: 'Final' },
            ].map(({ type, color, label }) => (
              <div key={type} className='flex items-center gap-2'>
                <div className={`w-4 h-4 rounded ${color}`}></div>
                <span className='text-sm'>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Visualization */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* States List */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4'>States & Transitions</h2>
            <div className='space-y-2 max-h-[600px] overflow-y-auto'>
              {Object.entries(graph).map(([stateName, node]) => {
                const stateInfo = getStateInfo(stateName);
                const isExpanded = expandedStates.has(stateName);
                const isSelected = selectedState === stateName;

                return (
                  <div
                    key={stateName}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setSelectedState(stateName);
                        toggleExpanded(stateName);
                      }}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-3 h-3 rounded-full ${stateInfo.color}`}
                        ></div>
                        <span className='font-medium text-sm'>{stateName}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-500'>
                          {Object.keys(node.transitions).length} events
                        </span>
                        <span className='text-gray-400'>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>

                    {isExpanded && Object.keys(node.transitions).length > 0 && (
                      <div className='mt-3 pl-5 space-y-1'>
                        {Object.entries(node.transitions).map(
                          ([event, target]) => (
                            <div
                              key={event}
                              className='flex items-center justify-between text-xs'
                            >
                              <span className='font-mono bg-gray-100 px-2 py-1 rounded'>
                                {event}
                              </span>
                              <span className='text-gray-400'>→</span>
                              <span
                                className='text-blue-600 hover:underline cursor-pointer'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedState(target);
                                  setExpandedStates(
                                    new Set([...expandedStates, target])
                                  );
                                }}
                              >
                                {target}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected State Details */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4'>
              State Details: {selectedState}
            </h2>
            {selectedState && states[selectedState] && (
              <div className='space-y-4'>
                {/* State Info */}
                <div>
                  <h3 className='font-medium mb-2'>Type</h3>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        getStateInfo(selectedState).color
                      }`}
                    ></div>
                    <span className='text-sm'>
                      {getStateInfo(selectedState).type}
                    </span>
                  </div>
                </div>

                {/* Entry Actions */}
                {states[selectedState].entry && (
                  <div>
                    <h3 className='font-medium mb-2'>Entry Actions</h3>
                    <div className='bg-gray-50 p-3 rounded text-xs font-mono'>
                      {Array.isArray(states[selectedState].entry)
                        ? states[selectedState].entry.length + ' actions'
                        : '1 action'}
                    </div>
                  </div>
                )}

                {/* Exit Actions */}
                {states[selectedState].exit && (
                  <div>
                    <h3 className='font-medium mb-2'>Exit Actions</h3>
                    <div className='bg-gray-50 p-3 rounded text-xs font-mono'>
                      {Array.isArray(states[selectedState].exit)
                        ? states[selectedState].exit.length + ' actions'
                        : '1 action'}
                    </div>
                  </div>
                )}

                {/* Transitions */}
                <div>
                  <h3 className='font-medium mb-2'>Available Events</h3>
                  {getStateEvents(states[selectedState]).length > 0 ? (
                    <div className='space-y-2'>
                      {getStateEvents(states[selectedState]).map((event) => {
                        const target = getEventTarget(
                          states[selectedState],
                          event
                        );
                        return (
                          <div
                            key={event}
                            className='bg-gray-50 p-3 rounded flex justify-between items-center'
                          >
                            <span className='font-mono text-sm'>{event}</span>
                            {target && (
                              <button
                                onClick={() => {
                                  setSelectedState(target);
                                  setExpandedStates(
                                    new Set([...expandedStates, target])
                                  );
                                }}
                                className='text-blue-600 text-sm hover:underline'
                              >
                                → {target}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className='text-gray-500 text-sm'>
                      No events (terminal state)
                    </p>
                  )}
                </div>

                {/* Raw State Config */}
                <div>
                  <h3 className='font-medium mb-2'>Raw Configuration</h3>
                  <pre className='bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto'>
                    {JSON.stringify(states[selectedState], null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Flow Diagram (Text-based) */}
        <div className='bg-white rounded-lg shadow-md p-6 mt-8'>
          <h2 className='text-xl font-semibold mb-4'>Tour Flow</h2>
          <div className='font-mono text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto'>
            <pre>{`
idle
 ├─[START_TOUR]→ ${tourConfig.steps[0]?.id || 'first_step'}
 └─[END_TOUR]→ completed

${tourConfig.steps
  .map((step, idx) => {
    const isLast = idx === tourConfig.steps.length - 1;
    if ('type' in step && step.type === 'async') {
      return `${step.id}_pending
 ├─[START_${step.id.toUpperCase()}]→ ${step.id}_processing
 ├─[PREV]→ ${idx > 0 ? tourConfig.steps[idx - 1].id : '(none)'}
 └─[END_TOUR]→ completed

${step.id}_processing
 ├─[${step.id.toUpperCase()}_SUCCESS]→ ${step.id}_success
 ├─[${step.id.toUpperCase()}_FAILED]→ ${step.id}_pending
 └─[END_TOUR]→ completed

${step.id}_success
 ${!isLast ? `├─[NEXT]→ ${tourConfig.steps[idx + 1]?.id}` : ''}
 ├─[PREV]→ ${step.id}_pending
 └─[END_TOUR]→ completed`;
    } else {
      return `${step.id}
 ${!isLast ? `├─[NEXT]→ ${tourConfig.steps[idx + 1]?.id}` : ''}
 ${idx > 0 ? `├─[PREV]→ ${tourConfig.steps[idx - 1].id}` : ''}
 ${
   'autoAdvance' in step && step.autoAdvance
     ? `├─[AUTO_ADVANCE]→ ${
         isLast ? 'completed' : tourConfig.steps[idx + 1]?.id
       }`
     : ''
 }
 └─[END_TOUR]→ completed`;
    }
  })
  .join('\n\n')}
            `}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

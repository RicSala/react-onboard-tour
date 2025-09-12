import { assign, MachineConfig } from '@tinystack/machine';
import {
  ExtractCustomEvents,
  ExtractStates,
  StepContent,
  TourConfig,
  TourStep,
} from '../types';

// Global timer reference for auto-advance
let globalTimerRef: any = null;

export function generateTourMachine<
  TContext extends Record<string, any>,
  TEvent extends { type: string; tourId: string }
>(config: TourConfig): MachineConfig<TContext, TEvent> {
  const baseMachine = generateBaseTourMachine<TContext, TEvent>(config);
  const withEventTracking = addEventTrackingToMachine(baseMachine);
  return withEventTracking; // Skip the guards helper for now
}

// Generate the base machine without event tracking
function generateBaseTourMachine<
  TContext extends Record<string, any>,
  TEvent extends { type: string; tourId: string }
>(config: TourConfig): MachineConfig<TContext, TEvent> {
  const states: any = {};

  // First, expand steps to get all states (async steps generate 3 states each)
  interface ExpandedState {
    id: string;
    step: TourStep;
    stepIndex: number; // Original step index
    subState?: 'pending' | 'processing' | 'success';
  }

  const expandedStates: ExpandedState[] = [];

  config.steps.forEach((step, stepIndex) => {
    if (step.type === 'async') {
      expandedStates.push(
        { id: `${step.id}_pending`, step, stepIndex, subState: 'pending' },
        {
          id: `${step.id}_processing`,
          step,
          stepIndex,
          subState: 'processing',
        },
        { id: `${step.id}_success`, step, stepIndex, subState: 'success' }
      );
    } else {
      expandedStates.push({ id: step.id, step, stepIndex });
    }
  });

  // Initial state
  states.idle = {
    entry: [
      assign(() => ({
        tourId: '',
        currentPage: '',
        targetElement: '',
        title: '',
        content: '',
        lastEvent: null,
      })),
    ],
    on: {
      START_TOUR: {
        target: expandedStates[0]?.id || 'completed',
        actions: [
          assign((context: any, event: any) => {
            return {
              tourId: event.tourId,
            };
          }),
        ],
      },
    },
  };

  // Generate states for each expanded state
  expandedStates.forEach((expandedState, stateIndex) => {
    const { id: stateId, step, stepIndex, subState } = expandedState;
    const nextExpandedState = expandedStates[stateIndex + 1];
    const prevExpandedState = expandedStates[stateIndex - 1];
    const isLastState = stateIndex === expandedStates.length - 1;

    // Determine content based on whether this is an async sub-state
    let content: StepContent;
    if (step.type === 'async' && subState) {
      content = step.content[subState];
    } else if (step.type !== 'async') {
      content = {
        targetElement: step.targetElement,
        title: step.title,
        content: step.content,
      };
    } else {
      content = { targetElement: '', title: '', content: '' };
    }

    // Create the state
    const state: any = {
      entry: [
        assign(() => ({
          currentPage: step.page,
          targetElement: content.targetElement,
          title: content.title,
          content: content.content,
        })),
      ],
      on: {} as any,
    };

    // Add auto-advance for sync steps
    if (step.type !== 'async' && !subState && step.autoAdvance) {
      state.entry.push({
        type: 'startAutoAdvance',
        exec: ({ self }: any) => {
          // Clear any existing timer first
          if (globalTimerRef) {
            clearTimeout(globalTimerRef);
            globalTimerRef = null;
          }
          globalTimerRef = setTimeout(() => {
            self.send({ type: 'AUTO_ADVANCE' });
          }, step.autoAdvance);
        },
      });

      state.entry.push(
        assign(() => ({
          autoAdvanceTimer: globalTimerRef,
        }))
      );

      // Add exit handler to clear timer
      state.exit = [
        {
          type: 'clearAutoAdvance',
          exec: () => {
            if (globalTimerRef) {
              clearTimeout(globalTimerRef);
              globalTimerRef = null;
            }
          },
        },
        assign(() => ({ autoAdvanceTimer: undefined })),
      ];

      // Add AUTO_ADVANCE handler
      if (!isLastState) {
        const nextPage = nextExpandedState?.step.page;
        const currentPage = step.page;

        state.on.AUTO_ADVANCE = {
          target:
            nextPage !== currentPage
              ? `navigatingTo_${nextExpandedState.id}`
              : nextExpandedState.id,
        };
      }
    }

    // Handle transitions based on state type
    if (step.type === 'async' && subState === 'pending') {
      // Async pending state - waits for start event
      const events = step.events || {};
      const startEvent = events.start || `START_${step.id.toUpperCase()}`;

      state.on[startEvent] = {
        target: `${step.id}_processing`,
      };

      // Allow going back (check canPrev, defaults to true)
      if (prevExpandedState && step.canPrev !== false) {
        const prevPage = prevExpandedState.step.page;
        // For async steps, go to success state
        const targetId =
          prevExpandedState.step.type === 'async' && !prevExpandedState.subState
            ? `${prevExpandedState.step.id}_success`
            : prevExpandedState.id;

        state.on.PREV =
          prevPage !== step.page
            ? { target: `navigatingTo_${targetId}` }
            : { target: targetId };
      }
    } else if (step.type === 'async' && subState === 'processing') {
      // Async processing state - waits for success/failure
      const events = step.events || {};
      const successEvent = events.success || `${step.id.toUpperCase()}_SUCCESS`;
      const failedEvent = events.failed || `${step.id.toUpperCase()}_FAILED`;

      state.on[successEvent] = {
        target: `${step.id}_success`,
      };

      state.on[failedEvent] = {
        target: `${step.id}_pending`,
      };
    } else if (step.type === 'async' && subState === 'success') {
      // Async success state - can go next or back to pending
      if (!isLastState) {
        const nextPage = nextExpandedState?.step.page;
        state.on.NEXT =
          nextPage !== step.page
            ? {
                target: `navigatingTo_${nextExpandedState.id}`,
                guards: [
                  {
                    condition: (context: any, event: any) => {
                      return event.tourId === context.tourId;
                    },
                  },
                ],
              }
            : {
                target: nextExpandedState.id,
                guards: [
                  {
                    condition: (context: any, event: any) => {
                      return event.tourId === context.tourId;
                    },
                  },
                ],
              };
      } else {
        state.on.NEXT = {
          target: 'completed',
          guards: [
            {
              condition: (context: any, event: any) => {
                return event.tourId === context.tourId;
              },
            },
          ],
        };
      }

      // Don't allow going back from success state to prevent re-doing async task
    } else {
      // Regular sync state
      if (!isLastState) {
        const nextPage = nextExpandedState?.step.page;
        state.on.NEXT =
          nextPage !== step.page
            ? {
                target: `navigatingTo_${nextExpandedState.id}`,
                guards: [
                  {
                    condition: (context: any, event: any) => {
                      return event.tourId === context.tourId;
                    },
                  },
                ],
              }
            : {
                target: nextExpandedState.id,
                guards: [
                  {
                    condition: (context: any, event: any) => {
                      return event.tourId === context.tourId;
                    },
                  },
                ],
              };
      } else {
        state.on.NEXT = {
          target: 'completed',
          guards: [
            {
              condition: (context: any, event: any) => {
                return event.tourId === context.tourId;
              },
            },
          ],
        };
      }

      if (prevExpandedState && step.canPrev !== false) {
        const prevPage = prevExpandedState.step.page;
        // For async steps, go to success state
        const targetId =
          prevExpandedState.step.type === 'async' && !prevExpandedState.subState
            ? `${prevExpandedState.step.id}_success`
            : prevExpandedState.id;

        state.on.PREV =
          prevPage !== step.page
            ? { target: `navigatingTo_${targetId}` }
            : { target: targetId };
      }
    }

    // Add common event handlers
    state.on.END_TOUR = 'completed';
    // Skip is allowed if global allowSkip is true AND step's canSkip is not false
    if (config.allowSkip && step.canSkip !== false) {
      state.on.SKIP_TOUR = 'skipped';
    }

    states[stateId] = state;

    // Forward navigation state (for NEXT)
    if (nextExpandedState && nextExpandedState.step.page !== step.page) {
      const navStateId = `navigatingTo_${nextExpandedState.id}`;
      if (!states[navStateId]) {
        // Get content for the next state
        let nextContent: StepContent;
        if (nextExpandedState.step.type === 'async') {
          // For async steps, use pending content
          nextContent = nextExpandedState.step.content.pending;
        } else {
          nextContent = {
            targetElement: nextExpandedState.step.targetElement,
            title: nextExpandedState.step.title,
            content: nextExpandedState.step.content,
          };
        }

        states[navStateId] = {
          entry: [
            assign(() => ({
              currentPage: nextExpandedState.step.page,
              targetElement: nextContent.targetElement,
              title: nextContent.title,
              content: nextContent.content,
            })),
          ],
          on: {
            PAGE_CHANGED: {
              target: nextExpandedState.id,
              guards: [
                {
                  condition: (_context: any, event: any) =>
                    event.page === nextExpandedState.step.page,
                },
              ],
            },
            NEXT: nextExpandedState.id,
            END_TOUR: 'completed',
            ...(config.allowSkip &&
              step.canSkip !== false && { SKIP_TOUR: 'skipped' }),
          },
        };
      }
    }

    // Backward navigation state (for PREV)
    if (prevExpandedState && prevExpandedState.step.page !== step.page) {
      // For async steps, navigate to the success state
      const targetId =
        prevExpandedState.step.type === 'async' && !prevExpandedState.subState
          ? `${prevExpandedState.step.id}_success`
          : prevExpandedState.id;

      const navStateId = `navigatingTo_${targetId}`;
      if (!states[navStateId]) {
        // Get content for the target state
        let targetContent: StepContent;
        if (prevExpandedState.step.type === 'async') {
          targetContent = prevExpandedState.step.content.success;
        } else {
          targetContent = {
            targetElement: prevExpandedState.step.targetElement,
            title: prevExpandedState.step.title,
            content: prevExpandedState.step.content,
          };
        }

        states[navStateId] = {
          entry: [
            assign(() => ({
              currentPage: prevExpandedState.step.page,
              targetElement: targetContent.targetElement,
              title: targetContent.title,
              content: targetContent.content,
            })),
          ],
          on: {
            PAGE_CHANGED: {
              target: targetId,
              guards: [
                {
                  condition: (_context: any, event: any) =>
                    event.page === prevExpandedState.step.page,
                },
              ],
            },
            PREV: targetId,
            END_TOUR: 'completed',
            ...(config.allowSkip &&
              step.canSkip !== false && { SKIP_TOUR: 'skipped' }),
          },
        };
      }
    }
  });

  // Completed state
  states.completed = {
    type: 'final' as const,
    entry: [
      {
        type: 'clearAutoAdvance',
        exec: () => {
          if (globalTimerRef) {
            clearTimeout(globalTimerRef);
            globalTimerRef = null;
          }
        },
      },
      assign(() => ({
        currentPage: '',
        targetElement: '',
        title: '',
        content: '',
      })),
    ],
  };

  // Skipped state (separate from completed)
  states.skipped = {
    type: 'final' as const,
    entry: [
      {
        type: 'clearAutoAdvance',
        exec: () => {
          if (globalTimerRef) {
            clearTimeout(globalTimerRef);
            globalTimerRef = null;
          }
        },
      },
      assign(() => ({
        currentPage: '',
        targetElement: '',
        title: '',
        content: '',
      })),
    ],
  };

  return {
    id: config.id,
    initial: 'idle',
    states,
    context: {
      tourId: config.id,
      currentPage: '',
      targetElement: '',
      title: '',
      content: '',
    } as any,
  };
}

// Helper function to get async task info for a step
export function getAsyncTaskInfo(step: TourStep) {
  if (step.type !== 'async') return null;

  const events = step.events || {};

  return {
    taskId: step.id,
    states: {
      pending: `${step.id}_pending`,
      processing: `${step.id}_processing`,
      success: `${step.id}_success`,
    },
    events: {
      start: events.start || `START_${step.id.toUpperCase()}`,
      success: events.success || `${step.id.toUpperCase()}_SUCCESS`,
      failed: events.failed || `${step.id.toUpperCase()}_FAILED`,
    },
  };
}

// Typed helper to get async task info by step ID
export function getAsyncTaskInfoById<T extends TourConfig>(
  config: T,
  stepId: T['steps'][number]['id']
) {
  const step = config.steps.find((s) => s.id === stepId);
  if (!step) return null;
  return getAsyncTaskInfo(step);
}

// Helper function to add event tracking to all transitions in a machine config
export function addEventTrackingToMachine<
  TContext extends Record<string, any>,
  TEvent extends { type: string; tourId: string }
>(
  machineConfig: MachineConfig<TContext, TEvent>
): MachineConfig<TContext, TEvent> {
  const processTransition = (transition: any): any => {
    if (!transition) return transition;

    if (typeof transition === 'string') {
      // Simple string target
      return {
        target: transition,
        actions: [
          assign((_context: any, event: any) => ({
            lastEvent: event,
          })),
        ],
      };
    } else if (typeof transition === 'object') {
      // Object with target and possibly other properties
      return {
        ...transition,
        actions: [
          assign((_context: any, event: any) => ({
            lastEvent: event,
          })),
          ...(transition.actions || []),
        ],
      };
    }
    return transition;
  };

  const processStateOn = (on: any): any => {
    if (!on) return on;

    const processedOn: any = {};
    for (const eventType in on) {
      processedOn[eventType] = processTransition(on[eventType]);
    }
    return processedOn;
  };

  const processState = (state: any): any => {
    if (!state) return state;

    const processedState = { ...state };

    // Process the 'on' transitions
    if (state.on) {
      processedState.on = processStateOn(state.on);
    }

    // Recursively process nested states
    if (state.states) {
      processedState.states = {};
      for (const stateName in state.states) {
        processedState.states[stateName] = processState(
          state.states[stateName]
        );
      }
    }

    return processedState;
  };

  // Process the root machine
  const processedConfig = { ...machineConfig };

  // Process root-level 'on' transitions
  if (machineConfig.on) {
    processedConfig.on = processStateOn(machineConfig.on);
  }

  // Process all states
  if (machineConfig.states) {
    processedConfig.states = {};
    for (const stateName in machineConfig.states) {
      processedConfig.states[stateName] = processState(
        machineConfig.states[stateName]
      );
    }
  }

  return processedConfig;
}

// Add tourId guards to all transitions
export function addTourIdGuards<
  TContext extends Record<string, any>,
  TEvent extends { type: string; tourId: string }
>(
  machineConfig: MachineConfig<TContext, TEvent>
): MachineConfig<TContext, TEvent> {
  const processTransition = (transition: any): any => {
    if (!transition) return transition;

    // Guard function to check tourId
    const tourIdGuard = ({ context, event }: any) => {
      return event.tourId === context.tourId;
    };

    if (typeof transition === 'string') {
      // Simple string target - convert to object with guard
      return {
        target: transition,
        guard: tourIdGuard,
      };
    } else if (typeof transition === 'object') {
      // Object transition - add guard
      return {
        ...transition,
        guard: tourIdGuard,
      };
    }
    return transition;
  };

  const processStateOn = (on: any): any => {
    if (!on) return on;
    const processedOn: any = {};

    for (const eventType in on) {
      const transition = on[eventType];
      if (Array.isArray(transition)) {
        processedOn[eventType] = transition.map(processTransition);
      } else {
        processedOn[eventType] = processTransition(transition);
      }
    }

    return processedOn;
  };

  const processState = (state: any): any => {
    if (!state) return state;

    const processedState = { ...state };

    // Process the 'on' transitions
    if (state.on) {
      processedState.on = processStateOn(state.on);
    }

    // Recursively process nested states
    if (state.states) {
      processedState.states = {};
      for (const stateName in state.states) {
        processedState.states[stateName] = processState(
          state.states[stateName]
        );
      }
    }

    return processedState;
  };

  // Process the root machine
  const processedConfig = { ...machineConfig };

  // Process root-level 'on' transitions
  if (machineConfig.on) {
    processedConfig.on = processStateOn(machineConfig.on);
  }

  // Process all states
  if (machineConfig.states) {
    processedConfig.states = {};
    for (const stateName in machineConfig.states) {
      processedConfig.states[stateName] = processState(
        machineConfig.states[stateName]
      );
    }
  }

  return processedConfig;
}

// Create a typed helper for a specific tour config
export function createTourHelpers<const T extends TourConfig>(config: T) {
  // Extract only IDs of steps that have async tasks
  type AsyncStepIds = T['steps'][number] extends infer Step
    ? Step extends { type: 'async'; id: infer Id }
      ? Id
      : never
    : never;

  // Extract all possible states for this config
  type States = ExtractStates<T>;

  return {
    getAsyncTask: (stepId: AsyncStepIds) => {
      const step = config.steps.find((s) => s.id === stepId);
      if (!step) return null;
      return getAsyncTaskInfo(step) as unknown as {
        taskId: string;
        states: {
          pending: string;
          processing: string;
          success: string;
        };
        events: {
          start: ExtractCustomEvents<T>['type'];
          success: ExtractCustomEvents<T>['type'];
          failed: ExtractCustomEvents<T>['type'];
        };
      };
    },
    // Count actual UI steps (async counts as 1)
    getTotalSteps: () => config.steps.length,
    // Get step index for UI (async states all have same index)
    getStepIndex: (stateId: string) => {
      let stepIndex = 0;
      for (const step of config.steps) {
        if (step.type === 'async') {
          if (
            stateId === `${step.id}_pending` ||
            stateId === `${step.id}_processing` ||
            stateId === `${step.id}_success`
          ) {
            return stepIndex;
          }
        } else if (stateId === step.id) {
          return stepIndex;
        }
        stepIndex++;
      }
      return -1;
    },
    // Type guard to check if a state value is valid
    isValidState: (_state: string): _state is States => {
      return true; // Runtime check could be added here if needed
    },
    // Helper to get typed state
    States: {} as States, // Type-only export for use in other files
  };
}

export const createMockHelpers = () => {
  return {
    getAsyncTask: () => null,
    getTotalSteps: () => 0,
    getStepIndex: () => 0,
    isValidState: () => true,
    States: {} as any,
  };
};

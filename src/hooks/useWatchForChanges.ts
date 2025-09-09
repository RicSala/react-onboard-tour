import { useEffect } from 'react';
import { WatchForChanges } from '../types';

interface UseWatchForChangesProps {
  config: WatchForChanges | undefined;
  targetSelector: string | undefined;
  onChangeDetected: () => void;
  enabled?: boolean;
}

export const useWatchForChanges = ({
  config,
  targetSelector,
  onChangeDetected,
  enabled = true,
}: UseWatchForChangesProps) => {
  useEffect(() => {
    if (!enabled || !config || !targetSelector) return;

    console.log('useWatchForChanges SETUP', {
      config,
      targetSelector,
      enabled,
      timestamp: Date.now(),
      stackTrace: new Error().stack?.split('\n').slice(2, 5).join('\n'),
    });

    let observer: MutationObserver | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let debounceId: ReturnType<typeof setTimeout> | null = null;
    let hasFoundElement = false;

    const target = config.target || targetSelector;
    console.log('target', target);
    const targetElement = document.querySelector(target);
    console.log('targetElement', targetElement);
    if (!targetElement) return;

    console.log('Setting up MutationObserver for:', target);

    // Create the observer
    observer = new MutationObserver(() => {
      console.log('MutationObserver callback');

      // Skip if we've already found the element and set up the debounce
      if (hasFoundElement) return;

      const foundElement = document.querySelector(config.lookFor);

      if (foundElement) {
        console.log('Found expected element:', config.lookFor);
        hasFoundElement = true;

        // Disconnect observer immediately to prevent further callbacks
        observer?.disconnect();

        // Clear any existing debounce
        if (debounceId) clearTimeout(debounceId);

        // Debounce the advancement to avoid too quick transitions
        debounceId = setTimeout(() => {
          console.log('Advancing to next step via DOM change detection');
          onChangeDetected();

          // Clean up timeout
          if (timeoutId) clearTimeout(timeoutId);
        }, config.debounce ?? 100);
      }
    });

    // Start observing
    observer.observe(targetElement, {
      childList: config.childList !== false, // Default true
      attributes: config.attributes === true,
      characterData: config.characterData === true,
      subtree: true, // Always watch entire subtree
    });

    // Set up timeout to stop watching after specified time
    const timeoutDuration = config.timeout ?? 10000;
    timeoutId = setTimeout(() => {
      console.log('MutationObserver timeout reached, stopping observation');
      if (observer) observer.disconnect();
    }, timeoutDuration);

    // Cleanup function
    return () => {
      console.info('useWatchForChanges cleanup');
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      // if (debounceId) clearTimeout(debounceId);
    };
  }, [config, targetSelector, onChangeDetected, enabled]);
};

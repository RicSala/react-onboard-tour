import { useMemo, useRef } from 'react';

export const useIsObjectRefChanging = (obj: unknown, name: string) => {
  const renderCount = useRef(0);
  const idRef = useRef(Math.random()); // Unique ID for this hook instance

  useMemo(() => {
    renderCount.current++;
    console.log(
      `🟦🟦 [${
        (idRef.current.toFixed(3) as unknown as number) * 1000
      }] ${name} is changing - Changed: ${renderCount.current} times, obj:`,
      obj
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obj]);
};

/*
We use an id so we can track if it's the same instance of the hook (thus real mutation) or just different uses of the hook (thus printing it multiple times). It's the same the counter does, but just a bit more explicit.
*/

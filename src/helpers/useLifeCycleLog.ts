import { useEffect, useRef } from 'react';

export const useLifecycleLog = (componentName: string) => {
  const renderCount = useRef(0);
  renderCount.current++;

  console.log(`🟡 ${componentName} render #${renderCount.current}`);

  useEffect(() => {
    console.log(`🟢 ${componentName} mounted`);
    return () => console.log(`🔴 ${componentName} unmounted`);
  }, [componentName]);
};

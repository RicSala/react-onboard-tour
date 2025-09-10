import { useEffect } from 'react';

export const useOnPopstate = (onPopstate = () => {}) => {
  useEffect(() => {
    window.addEventListener('popstate', onPopstate);
    return () => {
      window.removeEventListener('popstate', onPopstate);
    };
  }, [onPopstate]);
};

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { NavigationAdapter } from '../types';

export const useNextNavigationAdapter = (): NavigationAdapter => {
  const router = useRouter();
  const pathname = usePathname();

  return {
    push: (path: string) => {
      router.push(path);
    },
    getCurrentPath: () => {
      return pathname;
    },
  };
};
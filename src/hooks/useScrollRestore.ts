import { useEffect } from 'react';

const scrollPositions = new Map<string, number>();

export function saveScrollPosition(key: string) {
  scrollPositions.set(key, window.scrollY);
}

export function useScrollRestore(key: string) {
  useEffect(() => {
    const saved = scrollPositions.get(key);
    if (saved !== undefined) {
      // Use requestAnimationFrame to ensure DOM is rendered
      requestAnimationFrame(() => {
        window.scrollTo(0, saved);
      });
      scrollPositions.delete(key);
    }
  }, [key]);
}

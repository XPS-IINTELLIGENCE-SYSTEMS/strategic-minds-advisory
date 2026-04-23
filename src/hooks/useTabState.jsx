import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook to preserve scroll position and component state when switching tabs.
 * Stores each tab's scroll position and can restore it when returning to the tab.
 */
export function useTabState(tabId) {
  const scrollPositionRef = useRef(0);
  const scrollContainerRef = useRef(null);

  // Save scroll position before leaving the tab
  const saveScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  }, []);

  // Restore scroll position when entering the tab
  const restoreScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
        }
      }, 0);
    }
  }, []);

  // Restore on mount/update
  useEffect(() => {
    restoreScrollPosition();
  }, [tabId, restoreScrollPosition]);

  return {
    scrollContainerRef,
    saveScrollPosition,
    restoreScrollPosition,
    scrollPositionRef,
  };
}
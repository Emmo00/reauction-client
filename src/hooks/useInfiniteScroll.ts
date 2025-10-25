import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isFetching && enabled) {
      setIsFetching(true);
      callbackRef.current();
    }
  }, [isFetching, enabled]);

  useEffect(() => {
    if (!observerRef.current || !enabled) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, threshold, rootMargin, enabled]);

  const setNotFetching = useCallback(() => setIsFetching(false), []);

  return { observerRef, isFetching, setNotFetching };
}
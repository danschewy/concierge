'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export function useAutoScroll(dependency: unknown) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const isAutoScrolling = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      isAutoScrolling.current = true;
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 500);
      setIsUserScrolled(false);
      setHasNewMessages(false);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isAutoScrolling.current) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
      setIsUserScrolled(!isAtBottom);
      if (isAtBottom) setHasNewMessages(false);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isUserScrolled) {
      scrollToBottom();
    } else {
      setHasNewMessages(true);
    }
  }, [dependency, isUserScrolled, scrollToBottom]);

  return { containerRef, isUserScrolled, hasNewMessages, scrollToBottom };
}

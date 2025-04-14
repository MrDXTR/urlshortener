"use client";

import { useEffect } from "react";


export function PointerEventsCleanup() {
  useEffect(() => {
    const resetPointerEvents = () => {
      const bodyStyle = window.getComputedStyle(document.body);
      if (bodyStyle.pointerEvents === 'none') {
        console.log('Detected pointer-events: none on body, resetting...');
        document.body.style.pointerEvents = '';
      }
    };

    // Reset on mount
    resetPointerEvents();

    // Set up an interval to periodically check
    const interval = setInterval(resetPointerEvents, 1000);

    // Also listen for any dialog/modal related events
    const handleClick = () => {
      // Small delay to allow modal close events to process
      setTimeout(resetPointerEvents, 100);
    };

    document.addEventListener('click', handleClick);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleClick);
      // Reset on unmount as well
      document.body.style.pointerEvents = '';
    };
  }, []);

  return null;
} 
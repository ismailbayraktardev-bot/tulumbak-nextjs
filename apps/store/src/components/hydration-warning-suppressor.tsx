'use client';

import { useEffect } from 'react';

/**
 * Component to suppress hydration warnings caused by browser extensions
 * that modify the DOM after server-side rendering.
 */
export function HydrationWarningSuppressor() {
  useEffect(() => {
    // Remove any attributes added by browser extensions that cause hydration mismatches
    const body = document.body;
    if (body.hasAttribute('cz-shortcut-listen')) {
      body.removeAttribute('cz-shortcut-listen');
    }
  }, []);

  return null;
}
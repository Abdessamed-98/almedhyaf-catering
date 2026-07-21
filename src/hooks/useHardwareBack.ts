import { useEffect, useRef } from 'react';

/**
 * Maps the browser / phone back gesture onto in-app navigation.
 * The apps are state-driven SPAs (no routes), so by default the first back
 * press leaves the whole site. This hook keeps a sentinel history entry
 * armed while the app is mounted; on `popstate` it asks the app to navigate
 * one level up instead (previous screen → home → portal).
 *
 * `handler` returns true when it consumed the back press (the sentinel is
 * re-armed); returning false lets the browser actually leave the page.
 */
export function useHardwareBack(handler: () => boolean) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    window.history.pushState({ appTrap: true }, '');
    const onPop = () => {
      if (ref.current()) window.history.pushState({ appTrap: true }, '');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}

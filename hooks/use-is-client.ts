import { useSyncExternalStore } from "react";

// Subscribe is a no-op: we only care about the initial snapshot difference,
// not ongoing store updates.
const emptySubscribe = () => () => {};

/**
 * Returns `false` during SSR and on the first client render (matching the
 * server snapshot), then `true` once the component has hydrated.
 *
 * Use this instead of the `useEffect(() => setMounted(true), [])` pattern,
 * which triggers the react-hooks/set-state-in-effect lint rule.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

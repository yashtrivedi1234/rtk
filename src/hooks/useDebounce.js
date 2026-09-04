import { useEffect, useState } from "react";

/**
 * Delays propagating `value` until it has been stable for `delay` ms.
 * Used so search input does not fire an RTK Query request on every keystroke.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` after `delay` ms of inactivity.
 */
export const useDebouncedValue = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebouncedValue;

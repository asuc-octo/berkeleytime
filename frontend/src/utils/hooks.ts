import { Dispatch, SetStateAction, useCallback, useState } from 'react';

/**
 * A version of useState that presists a value across page
 * refreshes using localStorage. Pass a unique 'key'
 * to identify the value.
 */
export function useLocalStorageState<S>(
  key: string,
  initialValue: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  const [value, setValue] = useState<S>(() => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch(e) {
        
      }
    }

    localStorage.setItem(key, JSON.stringify(initialValue));
    return initialValue;
  });

  const wrappedSetValue = useCallback((newValue: S | SetStateAction<S>) => {
    setValue(oldValue => {
      let updatedValue: S;
      if (newValue instanceof Function) {
        updatedValue = newValue(oldValue);
      } else {
        updatedValue = newValue;
      }
      localStorage.setItem(key, JSON.stringify(updatedValue));
      return updatedValue;
    });
  }, [key]);

  return [value, wrappedSetValue];
}

import { useState, useEffect } from 'react';

/**
 * Persistent state hook backed by localStorage.
 * Drop-in replacement: swap with a DB-backed hook later without changing consumers.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  }, [key, value]);

  const remove = () => {
    localStorage.removeItem(key);
    setValue(initialValue);
  };

  return [value, setValue, remove];
}

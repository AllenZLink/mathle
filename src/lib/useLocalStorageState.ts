import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export default function useLocalStorageState<T>(defaultValue: T, key: string): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    try {
      if (typeof window === "undefined") return defaultValue;
      const stored = window.localStorage.getItem(key);
      return stored == null ? defaultValue : JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage can be unavailable in private browsing or restricted embeds.
    }
  }, [key, value]);

  return [value, setValue];
}

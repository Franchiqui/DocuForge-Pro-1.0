'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type LocalStorageValue<T> = T | null;

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onError?: (error: Error) => void;
}

export interface UseLocalStorageReturn<T> {
  value: LocalStorageValue<T>;
  setValue: (newValue: T | ((prev: LocalStorageValue<T>) => T)) => void;
  removeValue: () => void;
  isPersistent: boolean;
}

const defaultSerializer = <T>(value: T): string => {
  return JSON.stringify(value);
};

const defaultDeserializer = <T>(value: string): T => {
  return JSON.parse(value);
};

const isBrowser = typeof window !== 'undefined';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
    onError
  } = options;

  const [storedValue, setStoredValue] = useState<LocalStorageValue<T>>(() => {
    if (!isBrowser) return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      onError?.(error as Error);
      return initialValue;
    }
  });

  const [isPersistent, setIsPersistent] = useState(true);
  const initialValueRef = useRef(initialValue);
  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    if (!isBrowser) return;

    const testKey = `__test_persistence__${Date.now()}`;
    try {
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      setIsPersistent(true);
    } catch {
      setIsPersistent(false);
    }
  }, []);

  const setValue = useCallback(
    (newValue: T | ((prev: LocalStorageValue<T>) => T)) => {
      if (!isBrowser || !isPersistent) return;

      try {
        const valueToStore =
          newValue instanceof Function
            ? newValue(storedValue)
            : newValue;

        setStoredValue(valueToStore);

        const serializedValue = serializer(valueToStore);
        window.localStorage.setItem(keyRef.current, serializedValue);

        window.dispatchEvent(
          new StorageEvent('storage', {
            key: keyRef.current,
            newValue: serializedValue,
            storageArea: window.localStorage
          })
        );
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [storedValue, isPersistent, serializer, onError]
  );

  const removeValue = useCallback(() => {
    if (!isBrowser) return;

    try {
      window.localStorage.removeItem(keyRef.current);
      setStoredValue(initialValueRef.current);

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: keyRef.current,
          newValue: null,
          storageArea: window.localStorage
        })
      );
    } catch (error) {
      onError?.(error as Error);
    }
  }, [onError]);

  useEffect(() => {
    if (!isBrowser) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === keyRef.current && event.storageArea === window.localStorage) {
        try {
          const newValue = event.newValue
            ? deserializer(event.newValue)
            : initialValueRef.current;
          setStoredValue(newValue);
        } catch (error) {
          onError?.(error as Error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [deserializer, onError]);

  useEffect(() => {
    if (!isBrowser || !isPersistent) return;

    const handleBeforeUnload = () => {
      try {
        if (storedValue !== null) {
          const serializedValue = serializer(storedValue);
          window.localStorage.setItem(keyRef.current, serializedValue);
        }
      } catch (error) {
        onError?.(error as Error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [storedValue, isPersistent, serializer, onError]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    isPersistent
  };
}

export function useLocalStorageWithSchema<T>(
  key: string,
  initialValue: T,
  schema?: { parse: (value: unknown) => T },
  options?: UseLocalStorageOptions<T>
): UseLocalStorageReturn<T> {
  const result = useLocalStorage<T>(key, initialValue, options);

  useEffect(() => {
    if (schema && result.value !== null) {
      try {
        schema.parse(result.value);
      } catch (error) {
        result.setValue(initialValue);
        options?.onError?.(error as Error);
      }
    }
  }, [result.value, schema, initialValue, result, options]);

  return result;
}

export function useLocalStorageBatch() {
  const getMultiple = useCallback(<T>(keys: string[]): Record<string, T | null> => {
    if (!isBrowser) return {};

    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      try {
        const item = window.localStorage.getItem(key);
        result[key] = item ? JSON.parse(item) : null;
      } catch {
        result[key] = null;
      }
    });
    return result;
  }, []);

  const setMultiple = useCallback(<T>(items: Record<string, T>): void => {
    if (!isBrowser) return;

    Object.entries(items).forEach(([key, value]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to set ${key} in localStorage:`, error);
      }
    });

    Object.keys(items).forEach(key => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(items[key]),
          storageArea: window.localStorage
        })
      );
    });
  }, []);

  const removeMultiple = useCallback((keys: string[]): void => {
    if (!isBrowser) return;

    keys.forEach(key => {
      try {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: null,
            storageArea: window.localStorage
          })
        );
      } catch (error) {
        console.error(`Failed to remove ${key} from localStorage:`, error);
      }
    });
  }, []);

  const clearAll = useCallback((): void => {
    if (!isBrowser) return;

    try {
      const keys = Object.keys(window.localStorage);
      window.localStorage.clear();
      
      keys.forEach(key => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: null,
            storageArea: window.localStorage
          })
        );
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, []);

  return {
    getMultiple,
    setMultiple,
    removeMultiple,
    clearAll
  };
}

export function useLocalStorageQuota() {
  const [quotaInfo, setQuotaInfo] = useState<{
    used: number;
    remaining: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    if (!isBrowser || !('storage' in navigator)) return;

    const estimateQuota = async () => {
      try {
        if ('estimate' in navigator.storage) {
          const { usage, quota } = await navigator.storage.estimate();
          
          if (usage !== undefined && quota !== undefined) {
            setQuotaInfo({
              used: usage,
              remaining: quota - usage,
              percentage: Math.round((usage / quota) * 100)
            });
          }
        }
      } catch (error) {
        console.error('Failed to estimate storage quota:', error);
      }
    };

    estimateQuota();
    
    const intervalId = setInterval(estimateQuota, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const clearExcessData = useCallback((targetPercentage: number = 80): void => {
    if (!isBrowser || !quotaInfo || quotaInfo.percentage <= targetPercentage) return;

    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('docuforge_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.slice(0, Math.ceil(keysToRemove.length * 0.3)).forEach(key => {
        window.localStorage.removeItem(key);
      });

      setQuotaInfo(prev => prev ? {
        ...prev,
        percentage: Math.max(0, prev.percentage - 20)
      } : null);
    } catch (error) {
      console.error('Failed to clear excess localStorage data:', error);
    }
  }, [quotaInfo]);

  return { quotaInfo, clearExcessData };
}
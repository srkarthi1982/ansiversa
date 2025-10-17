const canUseStorage = () => typeof window !== 'undefined' && 'localStorage' in window;

export function readJSON<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`Failed to read storage key "${key}"`, error);
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to persist storage key "${key}"`, error);
  }
}

export function remove(key: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove storage key "${key}"`, error);
  }
}

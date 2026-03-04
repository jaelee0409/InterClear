/**
 * Typed AsyncStorage wrapper.
 * All keys are namespaced to avoid collisions.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@interviewlab:';

function key(k: string) {
  return `${PREFIX}${k}`;
}

async function get<T>(storageKey: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key(storageKey));
  if (raw === null) return null;
  return JSON.parse(raw) as T;
}

async function set<T>(storageKey: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key(storageKey), JSON.stringify(value));
}

async function remove(storageKey: string): Promise<void> {
  await AsyncStorage.removeItem(key(storageKey));
}

async function clear(): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const appKeys = allKeys.filter((k) => k.startsWith(PREFIX));
  await AsyncStorage.multiRemove(appKeys);
}

export const localStore = { get, set, remove, clear };

/** Well-known storage keys — update here if key names change */
export const STORAGE_KEYS = {
  USER: 'user',
  SESSIONS: 'sessions',
  SETTINGS: 'settings',
} as const;

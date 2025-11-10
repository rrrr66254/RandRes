const PREFIX = 'randres_';

export const storageKeys = {
  language: `${PREFIX}language`,
  savedRestaurants: `${PREFIX}saved_restaurants`,
  testResult: `${PREFIX}test_result`,
};

export function saveToStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to storage', error);
  }
}

export function loadFromStorage(key, defaultValue = null) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (error) {
    console.error('Failed to load from storage', error);
    return defaultValue;
  }
}

export function removeFromStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove storage', error);
  }
}

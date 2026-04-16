const DEFAULT_TTL = 10 * 60 * 1000;

export const readPageCache = (key, ttl = DEFAULT_TTL) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue?.savedAt || Date.now() - parsedValue.savedAt > ttl) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return parsedValue.data || null;
  } catch {
    return null;
  }
};

export const writePageCache = (key, data) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify({
      savedAt: Date.now(),
      data,
    }));
  } catch {
    // Ignore storage quota and serialization failures.
  }
};
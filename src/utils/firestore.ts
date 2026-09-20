/**
 * Recursively removes any keys with `undefined` values from an object or array.
 * Firestore document operations (setDoc, addDoc, updateDoc) strictly reject undefined values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        if (value !== null && typeof value === 'object') {
          cleaned[key] = sanitizeForFirestore(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned as any;
  }
  return data;
}

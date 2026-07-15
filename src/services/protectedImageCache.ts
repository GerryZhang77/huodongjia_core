const OBJECT_URL_TTL = 20 * 60 * 1000;
const MAX_OBJECT_URLS = 80;

type ObjectUrlEntry = {
  blob: Blob;
  objectUrl: string;
  lastUsedAt: number;
};

const objectUrlCache = new Map<string, ObjectUrlEntry>();

function prune(now = Date.now()) {
  for (const [key, entry] of objectUrlCache) {
    if (now - entry.lastUsedAt <= OBJECT_URL_TTL) continue;
    URL.revokeObjectURL(entry.objectUrl);
    objectUrlCache.delete(key);
  }
  if (objectUrlCache.size <= MAX_OBJECT_URLS) return;
  const overflow = Array.from(objectUrlCache.entries())
    .sort((left, right) => left[1].lastUsedAt - right[1].lastUsedAt)
    .slice(0, objectUrlCache.size - MAX_OBJECT_URLS);
  for (const [key, entry] of overflow) {
    URL.revokeObjectURL(entry.objectUrl);
    objectUrlCache.delete(key);
  }
}

export function getProtectedImageObjectUrl(key: string, blob: Blob) {
  const cached = objectUrlCache.get(key);
  if (cached?.blob === blob) {
    cached.lastUsedAt = Date.now();
    return cached.objectUrl;
  }
  if (cached) URL.revokeObjectURL(cached.objectUrl);
  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(key, { blob, objectUrl, lastUsedAt: Date.now() });
  prune();
  return objectUrl;
}

/** 登录主体变化、退出登录或 401 时同步清除受保护图片的内存 URL。 */
export function clearProtectedImageObjectUrlCache() {
  for (const entry of objectUrlCache.values()) {
    URL.revokeObjectURL(entry.objectUrl);
  }
  objectUrlCache.clear();
}

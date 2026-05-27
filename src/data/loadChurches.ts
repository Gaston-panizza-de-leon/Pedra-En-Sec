import type { Church, ImageObject } from '../types';

const REMOTE_URL = 'https://www.templum-mallorca.online/data/iglesias.json';
const BASE_URL = 'https://www.templum-mallorca.online/';
const LOCAL_URL = '/data/external/iglesias.json';
const CACHE_KEY = 'churches_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const REMOTE_TIMEOUT_MS = 3000;

interface CacheEntry {
  timestamp: number;
  churches: Church[];
}

function resolveImageUrls(churches: Church[]): Church[] {
  return churches.map((church) => {
    if (!church.image) return church;
    return {
      ...church,
      image: church.image.map((img): ImageObject => ({
        ...img,
        contentUrl: resolveUrl(img.contentUrl),
      })),
    };
  });
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  try {
    return new URL(path, BASE_URL).toString();
  } catch {
    return path;
  }
}

function readCache(): Church[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.churches;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function writeCache(churches: Church[]): void {
  try {
    const entry: CacheEntry = { timestamp: Date.now(), churches };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage might be full or unavailable – ignore
  }
}

async function fetchRemote(): Promise<Church[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);

  const response = await fetch(REMOTE_URL, { signal: controller.signal });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Remote churches returned ${response.status}`);
  }

  const data = await response.json();
  const churches: Church[] = data['@graph'] || [];

  return resolveImageUrls(churches);
}

async function fetchLocal(): Promise<Church[]> {
  const response = await fetch(LOCAL_URL);
  if (!response.ok) {
    throw new Error(`Local churches returned ${response.status}`);
  }
  const data = await response.json();
  return (data['@graph'] || []) as Church[];
}

/**
 * Load churches with remote-first strategy:
 * 1. Try remote (templum-mallorca.online) with 8s timeout
 * 2. Fallback to localStorage cache (24h TTL)
 * 3. Last resort: local JSON file
 */
export async function loadChurches(): Promise<Church[]> {
  // 1. Remote
  try {
    const churches = await fetchRemote();
    writeCache(churches);
    return churches;
  } catch (err) {
    console.warn('[Churches] Remote fetch failed, trying cache:', (err as Error).message);
  }

  // 2. LocalStorage cache
  const cached = readCache();
  if (cached) {
    console.info('[Churches] Loaded from localStorage cache');
    return cached;
  }

  // 3. Local file (last resort)
  try {
    const churches = await fetchLocal();
    return churches;
  } catch (err) {
    console.error('[Churches] All sources failed:', (err as Error).message);
    return [];
  }
}

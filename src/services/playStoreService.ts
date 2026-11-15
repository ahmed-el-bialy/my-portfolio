import { useQuery } from '@tanstack/react-query';
import { AHMED_CONFIG } from '../data/config';

export interface PlayStoreAppStats {
  appId: string;
  title?: string;
  storeUrl: string;
  isLive: boolean;
  downloads: string | null;
  rating: string | null;
  reviewsCount: string | null;
  updatedAt?: string | null;
  fallback?: boolean;
  fetchedAt?: string;
}

const STORAGE_KEY_PREFIX = 'ahmed_playstore_stats_v1_';

const DEFAULT_FALLBACK_STATS = (appId: string): PlayStoreAppStats => ({
  appId,
  title: 'Revio',
  storeUrl: AHMED_CONFIG.socials.playstore,
  isLive: true,
  downloads: '10+',
  rating: null,
  reviewsCount: null,
  updatedAt: null,
  fallback: true,
});

export async function fetchPlayStoreAppStats(
  appId: string = 'com.ahmed.revio',
  forceRefresh: boolean = false
): Promise<PlayStoreAppStats> {
  const storageKey = `${STORAGE_KEY_PREFIX}${appId}`;
  try {
    const res = await fetch(
      `/api/playstore/app?id=${encodeURIComponent(appId)}${forceRefresh ? '&refresh=1' : ''}`
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json && json.success) {
      const normalized: PlayStoreAppStats = {
        appId: json.appId || appId,
        title: json.title || 'Revio',
        storeUrl: json.storeUrl || AHMED_CONFIG.socials.playstore,
        isLive: Boolean(json.isLive ?? true),
        downloads: json.downloads || null,
        rating: json.rating || null,
        reviewsCount: json.reviewsCount || null,
        updatedAt: json.updatedAt || null,
        fallback: Boolean(json.fallback),
        fetchedAt: json.fetchedAt,
      };
      if (typeof window !== 'undefined' && !normalized.fallback) {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ timestamp: Date.now(), data: normalized })
          );
        } catch {}
      }
      return normalized;
    }
  } catch {}

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data) return parsed.data;
      }
    } catch {}
  }

  return DEFAULT_FALLBACK_STATS(appId);
}

export function usePlayStoreAppStats(appId: string = 'com.ahmed.revio') {
  return useQuery<PlayStoreAppStats>({
    queryKey: ['playstore-app', appId],
    queryFn: () => fetchPlayStoreAppStats(appId),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    placeholderData: () => {
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}${appId}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?.data) return parsed.data;
          }
        } catch {}
      }
      return DEFAULT_FALLBACK_STATS(appId);
    },
  });
}

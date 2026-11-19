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

const DEFAULT_FALLBACK_STATS = (appId: string): PlayStoreAppStats => {
  const isRevio = appId === 'com.ahmed.revio';
  return {
    appId,
    title: isRevio ? 'Revio' : appId || undefined,
    storeUrl: isRevio
      ? AHMED_CONFIG.socials.playstore
      : appId
      ? `https://play.google.com/store/apps/details?id=${encodeURIComponent(appId)}`
      : AHMED_CONFIG.socials.playstore,
    isLive: isRevio,
    downloads: isRevio ? '10+' : null,
    rating: null,
    reviewsCount: null,
    updatedAt: null,
    fallback: true,
  };
};

export async function fetchPlayStoreAppStats(
  appId: string = 'com.ahmed.revio',
  forceRefresh: boolean = false
): Promise<PlayStoreAppStats> {
  const cleanId = (appId || '').trim();
  if (!cleanId) {
    return DEFAULT_FALLBACK_STATS('');
  }
  const storageKey = `${STORAGE_KEY_PREFIX}${cleanId}`;
  try {
    const res = await fetch(
      `/api/playstore/app?id=${encodeURIComponent(cleanId)}${forceRefresh ? '&refresh=1' : ''}`
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json && json.success) {
      const normalized: PlayStoreAppStats = {
        appId: json.appId || cleanId,
        title: json.title || (cleanId === 'com.ahmed.revio' ? 'Revio' : cleanId),
        storeUrl:
          json.storeUrl ||
          (cleanId === 'com.ahmed.revio'
            ? AHMED_CONFIG.socials.playstore
            : `https://play.google.com/store/apps/details?id=${encodeURIComponent(cleanId)}`),
        isLive: Boolean(json.isLive),
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

  return DEFAULT_FALLBACK_STATS(cleanId);
}

export function usePlayStoreAppStats(appId: string = 'com.ahmed.revio') {
  const cleanId = (appId || '').trim();
  return useQuery<PlayStoreAppStats>({
    queryKey: ['playstore-app', cleanId],
    queryFn: () => fetchPlayStoreAppStats(cleanId),
    enabled: Boolean(cleanId),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    placeholderData: () => {
      if (!cleanId) return undefined;
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cleanId}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?.data) return parsed.data;
          }
        } catch {}
      }
      return DEFAULT_FALLBACK_STATS(cleanId);
    },
  });
}

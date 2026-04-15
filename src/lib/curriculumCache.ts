/**
 * Shared in-memory cache for the /curriculum/full-tree/ response.
 * Both SubjectTopicsPage and TopicDetailPage use this so:
 *   1. The tree is fetched only once (not per-page)
 *   2. Navigation between pages is instant (cache hit)
 *   3. No ID mismatch between mock and API data
 */
import { apiClient } from './apiClient';

let cachedTree: any = null;
let inflight: Promise<any> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cacheTimestamp = 0;

export async function getCurriculumTree(): Promise<any> {
  // Return cached data if fresh
  if (cachedTree && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedTree;
  }

  // Deduplicate concurrent requests
  if (inflight) return inflight;

  inflight = apiClient
    .get<any>('/curriculum/full-tree/')
    .then((resp) => {
      const data = resp.data?.results?.[0] || resp.data;
      cachedTree = data;
      cacheTimestamp = Date.now();
      return cachedTree;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function invalidateCurriculumCache(): void {
  cachedTree = null;
  cacheTimestamp = 0;
}

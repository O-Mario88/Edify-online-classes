import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * On-device cache for content that needs to survive without a network
 * round-trip — saved lessons, queued offline actions, low-data
 * preferences. Built on AsyncStorage so we don't add a heavier DB
 * dependency for what is, today, a few KB per item.
 *
 * Keys are namespaced under `maple:` so they're easy to spot in dev
 * tools and to nuke wholesale on logout.
 */

const PREFIX = 'maple:';

const SAVED_LESSON_INDEX = `${PREFIX}lessons:index`;
const SAVED_LESSON_KEY = (id: string | number) => `${PREFIX}lesson:${id}`;
const PREFS_KEY = `${PREFIX}prefs`;
const QUEUED_ACTIONS_KEY = `${PREFIX}queue`;

export interface SavedLessonMeta {
  id: string | number;
  title: string;
  subject: string;
  savedAt: string; // ISO
  /** Approximate KB consumed. Used for the offline list footer. */
  sizeKb: number;
}

export interface OfflinePrefs {
  /** Hide / pause video playback to save data. */
  lowDataMode: boolean;
  /** Prefer audio summaries over video lessons where available. */
  preferAudioLessons: boolean;
}

export interface QueuedAction {
  id: string;
  /** "assessment-submit", "lesson-attend", etc. */
  kind: string;
  /** Body to send when we're back online. */
  payload: unknown;
  /** Endpoint to POST to. */
  endpoint: string;
  queuedAt: string;
}

export const offlineStore = {
  // ── Saved lessons ───────────────────────────────────────────────
  async saveLesson(id: string | number, payload: unknown, meta: Omit<SavedLessonMeta, 'savedAt' | 'sizeKb'>): Promise<SavedLessonMeta> {
    const json = JSON.stringify(payload);
    const sizeKb = Math.max(1, Math.round(json.length / 1024));
    const full: SavedLessonMeta = { ...meta, savedAt: new Date().toISOString(), sizeKb };
    await AsyncStorage.setItem(SAVED_LESSON_KEY(id), json);
    const list = await offlineStore.listSavedLessons();
    const next = [full, ...list.filter((l) => String(l.id) !== String(id))];
    await AsyncStorage.setItem(SAVED_LESSON_INDEX, JSON.stringify(next));
    return full;
  },

  async readLesson<T = unknown>(id: string | number): Promise<T | null> {
    const raw = await AsyncStorage.getItem(SAVED_LESSON_KEY(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async removeLesson(id: string | number): Promise<void> {
    await AsyncStorage.removeItem(SAVED_LESSON_KEY(id));
    const list = await offlineStore.listSavedLessons();
    await AsyncStorage.setItem(
      SAVED_LESSON_INDEX,
      JSON.stringify(list.filter((l) => String(l.id) !== String(id))),
    );
  },

  async isLessonSaved(id: string | number): Promise<boolean> {
    const raw = await AsyncStorage.getItem(SAVED_LESSON_KEY(id));
    return !!raw;
  },

  async listSavedLessons(): Promise<SavedLessonMeta[]> {
    const raw = await AsyncStorage.getItem(SAVED_LESSON_INDEX);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as SavedLessonMeta[];
    } catch {
      return [];
    }
  },

  // ── Preferences ─────────────────────────────────────────────────
  async getPrefs(): Promise<OfflinePrefs> {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return { lowDataMode: false, preferAudioLessons: false };
    try {
      const parsed = JSON.parse(raw);
      return {
        lowDataMode: !!parsed.lowDataMode,
        preferAudioLessons: !!parsed.preferAudioLessons,
      };
    } catch {
      return { lowDataMode: false, preferAudioLessons: false };
    }
  },

  async setPrefs(next: Partial<OfflinePrefs>): Promise<OfflinePrefs> {
    const current = await offlineStore.getPrefs();
    const merged: OfflinePrefs = { ...current, ...next };
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(merged));
    return merged;
  },

  // ── Queued actions (drafts) ────────────────────────────────────
  async enqueueAction(action: Omit<QueuedAction, 'id' | 'queuedAt'>): Promise<QueuedAction> {
    const queue = await offlineStore.listQueuedActions();
    const full: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      queuedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(QUEUED_ACTIONS_KEY, JSON.stringify([...queue, full]));
    return full;
  },

  async listQueuedActions(): Promise<QueuedAction[]> {
    const raw = await AsyncStorage.getItem(QUEUED_ACTIONS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as QueuedAction[];
    } catch {
      return [];
    }
  },

  async removeQueuedAction(id: string): Promise<void> {
    const queue = await offlineStore.listQueuedActions();
    await AsyncStorage.setItem(QUEUED_ACTIONS_KEY, JSON.stringify(queue.filter((q) => q.id !== id)));
  },

  // ── Maintenance ────────────────────────────────────────────────
  /** Wipe everything we've cached. Useful on logout. */
  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(PREFIX));
    if (ours.length > 0) await AsyncStorage.multiRemove(ours);
  },
};

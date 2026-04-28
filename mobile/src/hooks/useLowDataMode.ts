import { useEffect, useState } from 'react';
import { offlineStore, type OfflinePrefs } from '@/storage/offlineStore';
import { useNetworkStatus } from './useNetworkStatus';

export interface LowDataState {
  /** True when the user has explicitly opted into low-data mode. */
  preferenceOn: boolean;
  /** True when NetInfo reports a 2g/3g cellular generation. */
  networkLow: boolean;
  /** Combined: respect either signal. Use this for gating. */
  active: boolean;
}

/**
 * Hook combining the explicit "Low-data mode" preference (from
 * offlineStore.getPrefs) with the live NetInfo cellular generation.
 * If either signal is "low data", `active` is true and consumers
 * should skip auto-playing video, pre-fetching heavy assets, or
 * loading high-resolution images.
 *
 * The preference is read once on mount and re-read whenever the user
 * toggles it on the offline screen (the screen calls `notify()`).
 */
let listeners: (() => void)[] = [];

/** Module-level signal so the offline screen can tell every consumer
 *  to re-read the pref after a toggle. Keeps things light without a
 *  global store dependency. */
export const notifyLowDataPrefChanged = () => {
  listeners.forEach((l) => l());
};

export const useLowDataMode = (): LowDataState => {
  const network = useNetworkStatus();
  const [prefs, setPrefs] = useState<OfflinePrefs>({ lowDataMode: false, preferAudioLessons: false });

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      offlineStore.getPrefs().then((p) => {
        if (!cancelled) setPrefs(p);
      });
    };
    load();
    listeners.push(load);
    return () => {
      cancelled = true;
      listeners = listeners.filter((l) => l !== load);
    };
  }, []);

  return {
    preferenceOn: !!prefs.lowDataMode,
    networkLow: network.isLowQuality,
    active: !!prefs.lowDataMode || network.isLowQuality,
  };
};

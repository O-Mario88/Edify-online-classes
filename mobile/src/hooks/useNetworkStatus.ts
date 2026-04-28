import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  /** True when there's a usable connection (not necessarily fast). */
  isOnline: boolean;
  /** Connection type — 'wifi' / 'cellular' / 'none' / 'unknown'. */
  type: string;
  /** Hint that the network is too slow for video / heavy assets. */
  isLowQuality: boolean;
}

const isQualityLow = (s: NetInfoState): boolean => {
  if (!s.isInternetReachable) return false;
  // NetInfo's `details.cellularGeneration` is "2g" / "3g" / "4g" / "5g"
  // when known. Treat 2g/3g as low quality.
  const gen = (s.details as any)?.cellularGeneration as string | undefined;
  if (gen && (gen === '2g' || gen === '3g')) return true;
  return false;
};

/**
 * Live network status. Re-renders when the device toggles wifi /
 * cellular / airplane mode. The `isLowQuality` flag is the signal the
 * low-data mode preference checks before auto-loading video.
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    type: 'unknown',
    isLowQuality: false,
  });

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => {
      setStatus({
        isOnline: !!s.isConnected && s.isInternetReachable !== false,
        type: s.type || 'unknown',
        isLowQuality: isQualityLow(s),
      });
    });
    NetInfo.fetch().then((s) => {
      setStatus({
        isOnline: !!s.isConnected && s.isInternetReachable !== false,
        type: s.type || 'unknown',
        isLowQuality: isQualityLow(s),
      });
    });
    return () => unsub();
  }, []);

  return status;
};

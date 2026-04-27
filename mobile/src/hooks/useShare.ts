import { Share, Linking, Platform } from 'react-native';

interface ShareableItem {
  /** Headline that goes at the top of the shared message. */
  title: string;
  /** Body of the shared message — keep it short, parents read on the go. */
  message: string;
  /** Optional URL — passport / certificate / report deep link. */
  url?: string;
}

interface ShareResult {
  ok: boolean;
  /** "shared" | "dismissed" | "fallback" — what actually happened. */
  outcome: 'shared' | 'dismissed' | 'fallback' | 'error';
}

/**
 * One-tap share helper that prefers WhatsApp when it's installed and
 * gracefully falls back to the OS share sheet otherwise. Returns a
 * structured outcome so callers can show a "Sent!" or "Cancelled" hint
 * without a separate guard.
 *
 * Composes the visible message as: `<title>\n\n<message>\n<url?>`. The
 * three-part shape works equally well in WhatsApp, SMS, and Gmail —
 * parents copy-pasting into a school WhatsApp group is a common path.
 */
export async function shareItem(item: ShareableItem): Promise<ShareResult> {
  const composed = [item.title, item.message, item.url].filter(Boolean).join('\n\n');

  // Try WhatsApp directly first when on iOS — Linking.canOpenURL is the
  // canonical "is the app installed?" check. On Android the OS share
  // sheet already promotes WhatsApp, so we go straight to the sheet to
  // avoid a permissions warning about whatsapp:// queries.
  if (Platform.OS === 'ios') {
    const waUrl = `whatsapp://send?text=${encodeURIComponent(composed)}`;
    try {
      const ok = await Linking.canOpenURL(waUrl);
      if (ok) {
        await Linking.openURL(waUrl);
        return { ok: true, outcome: 'shared' };
      }
    } catch {
      // fall through to system share
    }
  }

  try {
    const result = await Share.share({
      title: item.title,
      message: composed,
      url: item.url, // iOS uses url separately when present
    });
    if (result.action === Share.sharedAction) {
      return { ok: true, outcome: 'shared' };
    }
    if (result.action === Share.dismissedAction) {
      return { ok: false, outcome: 'dismissed' };
    }
    return { ok: false, outcome: 'fallback' };
  } catch {
    return { ok: false, outcome: 'error' };
  }
}

/**
 * Hook form — returns the share function so screens can pass props
 * around or memoise call sites.
 */
export const useShare = () => shareItem;

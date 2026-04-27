import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export interface RegistrationResult {
  permission: PermissionState;
  /** Expo push token, or null if permission denied / running on a simulator. */
  token: string | null;
}

/**
 * Configure foreground notification presentation. Called once at app
 * boot so banners + sounds appear even while the app is open.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Best-effort push registration. Idempotent — safe to call on every
 * cold start. Returns the Expo push token when granted; the caller is
 * responsible for sending it to the backend.
 *
 * On Android we also create a default channel so notifications fire
 * with the expected importance level.
 */
export async function registerForPush(): Promise<RegistrationResult> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Class & assignment alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0F2A45',
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') {
    return { permission: status as PermissionState, token: null };
  }

  // Pull the EAS projectId from app.json so the Expo push service
  // routes correctly. In a dev client without EAS this can be null —
  // the call still works in Expo Go in that case.
  const projectId =
    (Constants.expoConfig?.extra as any)?.eas?.projectId ||
    (Constants as any)?.easConfig?.projectId ||
    undefined;

  try {
    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return { permission: 'granted', token: tokenResp.data };
  } catch {
    return { permission: 'granted', token: null };
  }
}

import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export interface CapturedPhoto {
  uri: string;
  width: number;
  height: number;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}

interface CaptureOptions {
  /** "ask" (default) shows the camera-or-library chooser. "camera" or
   *  "library" goes straight to the requested source. */
  source?: 'ask' | 'camera' | 'library';
  /** JPEG quality 0..1. Default 0.7 — keeps uploads under 1 MB on
   *  modern phones, important for low-data contexts. */
  quality?: number;
}

/**
 * One-call photo capture for student submissions (exercise book pages,
 * project photos, science experiments, handwritten essays, math
 * working). Resolves to an array of one CapturedPhoto on success, or
 * null when the user cancels or denies permission.
 *
 * The chooser is implemented with React Native's built-in Alert so we
 * don't take a dependency on a sheet library — three buttons, system
 * look-and-feel, no JS bridge cost.
 */
export async function capturePhoto(opts: CaptureOptions = {}): Promise<CapturedPhoto | null> {
  const source = opts.source ?? 'ask';
  const quality = opts.quality ?? 0.7;

  const pickWith = async (kind: 'camera' | 'library'): Promise<CapturedPhoto | null> => {
    const perm = kind === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        kind === 'camera'
          ? 'Maple needs camera access to photograph your work. Enable it in Settings.'
          : 'Maple needs photo library access to attach your work. Enable it in Settings.',
      );
      return null;
    }
    const result = kind === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality,
          allowsEditing: false,
          exif: false,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality,
          allowsMultipleSelection: false,
          exif: false,
        });
    if (result.canceled || !result.assets?.[0]) return null;
    const a = result.assets[0];
    return {
      uri: a.uri,
      width: a.width,
      height: a.height,
      fileName: a.fileName ?? undefined,
      mimeType: a.mimeType ?? undefined,
      fileSize: a.fileSize ?? undefined,
    };
  };

  if (source !== 'ask') return pickWith(source);

  // Ask the user — camera vs photo library — via a 3-button alert.
  return new Promise<CapturedPhoto | null>((resolve) => {
    Alert.alert(
      'Add a photo',
      'How would you like to attach your work?',
      [
        { text: 'Take photo', onPress: () => pickWith('camera').then(resolve) },
        { text: 'Pick from library', onPress: () => pickWith('library').then(resolve) },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

/** Hook form for screens that prefer hooks. */
export const usePhotoCapture = () => capturePhoto;

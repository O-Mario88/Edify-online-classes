import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder as useExpoRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export interface VoiceClip {
  uri: string;
  durationMs: number;
}

interface VoiceRecorderApi {
  isRecording: boolean;
  /** ms elapsed since recording started — updates ~every 250ms. */
  elapsedMs: number;
  start: () => Promise<void>;
  /** Stops recording and returns the resulting clip (or null on failure). */
  stop: () => Promise<VoiceClip | null>;
  /** Cancels recording and discards the file. */
  cancel: () => Promise<void>;
}

/**
 * Hook wrapping expo-audio's recorder with the small set of controls
 * the Maple UI actually wants: start, stop-and-return, cancel-and-
 * discard, plus a live elapsed counter for the recording UI.
 *
 * Permission is requested lazily on the first start() call. iOS audio
 * mode is configured for record + playback on the same session so the
 * captured clip can be previewed without a re-init.
 */
export function useVoiceRecorder(): VoiceRecorderApi {
  const recorder = useExpoRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const startTimeRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Tick a render every 250ms while recording so the duration label
  // updates without depending on the underlying state cadence.
  useEffect(() => {
    if (!state.isRecording) {
      setElapsedMs(0);
      startTimeRef.current = null;
      return;
    }
    if (startTimeRef.current == null) startTimeRef.current = Date.now();
    const t = setInterval(() => {
      if (startTimeRef.current != null) {
        setElapsedMs(Date.now() - startTimeRef.current);
      }
    }, 250);
    return () => clearInterval(t);
  }, [state.isRecording]);

  const start = async () => {
    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Microphone permission needed',
        'Maple needs microphone access to record your answer. Enable it in Settings.',
      );
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stop = async (): Promise<VoiceClip | null> => {
    if (!state.isRecording) return null;
    const finalElapsed =
      startTimeRef.current != null ? Date.now() - startTimeRef.current : elapsedMs;
    try {
      await recorder.stop();
    } catch {
      return null;
    }
    const uri = recorder.uri;
    if (!uri) return null;
    return { uri, durationMs: finalElapsed };
  };

  const cancel = async () => {
    if (!state.isRecording) return;
    try {
      await recorder.stop();
    } catch {
      // best-effort; we discard the file URI by not returning it
    }
  };

  return {
    isRecording: state.isRecording,
    elapsedMs,
    start,
    stop,
    cancel,
  };
}

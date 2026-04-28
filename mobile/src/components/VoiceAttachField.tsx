import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useVoiceRecorder, type VoiceClip } from '@/hooks/useVoiceRecorder';
import { colors, palette, shadows } from '@/theme';

interface Props {
  value?: VoiceClip | null;
  onChange: (clip: VoiceClip | null) => void;
  label?: string;
  hint?: string;
}

/**
 * Voice-answer field. Three states:
 *   1. No clip — large mic button to start recording.
 *   2. Recording — pulsing red record button + elapsed time + cancel.
 *   3. Recorded — playback button + duration + replace + remove.
 *
 * Used for assessment audio answers, ask-teacher voice questions, and
 * reading-fluency recordings. Clip uri is a local file:// path; the
 * caller is responsible for uploading it on submit.
 */
export const VoiceAttachField: React.FC<Props> = ({ value, onChange, label, hint }) => {
  const recorder = useVoiceRecorder();
  const [clip, setClip] = useState<VoiceClip | null>(value ?? null);

  const set = (c: VoiceClip | null) => {
    setClip(c);
    onChange(c);
  };

  const onStop = async () => {
    const c = await recorder.stop();
    if (c) set(c);
  };

  return (
    <View>
      {label && (
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</Text>
      )}

      {recorder.isRecording ? (
        <View
          className="rounded-2xl p-4 flex-row items-center"
          style={{ backgroundColor: palette.rose[50] }}
        >
          <View className="w-10 h-10 rounded-full bg-rose-500 items-center justify-center mr-3">
            <Ionicons name="mic" size={18} color={colors.text.onBrand} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-rose-900">Recording…</Text>
            <Text className="text-xs text-rose-700 mt-0.5">{formatElapsed(recorder.elapsedMs)}</Text>
          </View>
          <Pressable
            onPress={() => recorder.cancel()}
            accessibilityRole="button"
            accessibilityLabel="Cancel recording"
            className="px-3 py-1.5 rounded-full bg-white mr-2"
          >
            <Text className="text-[11px] font-bold text-rose-700">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={onStop}
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
            className="px-3 py-1.5 rounded-full bg-rose-600"
          >
            <Text className="text-[11px] font-bold text-white">Stop</Text>
          </Pressable>
        </View>
      ) : clip ? (
        <RecordedRow clip={clip} onReplace={() => recorder.start()} onRemove={() => set(null)} />
      ) : (
        <Pressable
          onPress={() => recorder.start()}
          accessibilityRole="button"
          accessibilityLabel="Start voice recording"
          className="rounded-2xl border-2 border-dashed border-slate-300 p-5 items-center justify-center"
          style={{ backgroundColor: palette.slate[50] }}
        >
          <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center mb-2">
            <Ionicons name="mic-outline" size={24} color={colors.brand.primary} />
          </View>
          <Text className="text-sm font-bold text-slate-900">Record a voice note</Text>
          {hint && <Text className="text-xs text-slate-500 mt-1 text-center">{hint}</Text>}
        </Pressable>
      )}
    </View>
  );
};

const RecordedRow: React.FC<{ clip: VoiceClip; onReplace: () => void; onRemove: () => void }> = ({ clip, onReplace, onRemove }) => {
  const player = useAudioPlayer({ uri: clip.uri });
  const status = useAudioPlayerStatus(player);

  // Auto-stop and rewind when playback reaches the end so the play
  // button toggles cleanly the next time.
  useEffect(() => {
    if (status.didJustFinish) {
      player.pause();
      player.seekTo(0);
    }
  }, [status.didJustFinish, player]);

  const toggle = () => {
    if (status.playing) player.pause();
    else player.play();
  };

  return (
    <View
      className="rounded-2xl bg-white p-3 flex-row items-center"
      style={shadows.sm}
    >
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pause playback' : 'Play recording'}
        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: colors.brand.primary }}
      >
        <Ionicons name={status.playing ? 'pause' : 'play'} size={20} color={colors.text.onBrand} />
      </Pressable>
      <View className="flex-1">
        <Text className="text-sm font-bold text-slate-900">Voice note</Text>
        <Text className="text-xs text-slate-500 mt-0.5">{formatElapsed(clip.durationMs)} long</Text>
        <View className="flex-row mt-2">
          <Pressable onPress={onReplace} className="px-2.5 py-1 rounded-full bg-slate-100 mr-2">
            <Text className="text-[11px] font-bold text-slate-700">Re-record</Text>
          </Pressable>
          <Pressable onPress={onRemove} className="px-2.5 py-1 rounded-full bg-rose-50">
            <Text className="text-[11px] font-bold text-rose-700">Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

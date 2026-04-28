import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { capturePhoto, type CapturedPhoto } from '@/hooks/usePhotoCapture';
import { colors, palette, shadows } from '@/theme';

interface Props {
  /** Initial photo, if any (for re-mounting). */
  value?: CapturedPhoto | null;
  /** Fired when the photo changes. Pass null to clear. */
  onChange: (photo: CapturedPhoto | null) => void;
  /** Optional label rendered above the field. */
  label?: string;
  /** Optional helper text rendered below the photo when none is set. */
  hint?: string;
}

/**
 * Reusable "attach a photo of your working" affordance. Shows a tap
 * target before any photo is attached, and a thumbnail + replace +
 * remove row once one is set. Used on assessment essay questions,
 * project submissions, and mistake notebook entries.
 */
export const PhotoAttachField: React.FC<Props> = ({ value, onChange, label, hint }) => {
  const [photo, setPhoto] = useState<CapturedPhoto | null>(value ?? null);

  const set = (p: CapturedPhoto | null) => {
    setPhoto(p);
    onChange(p);
  };

  const onAdd = async () => {
    const p = await capturePhoto();
    if (p) set(p);
  };

  return (
    <View>
      {label && (
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</Text>
      )}
      {!photo ? (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Add a photo"
          className="rounded-2xl border-2 border-dashed border-slate-300 p-5 items-center justify-center"
          style={{ backgroundColor: palette.slate[50] }}
        >
          <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center mb-2">
            <Ionicons name="camera-outline" size={24} color={colors.brand.primary} />
          </View>
          <Text className="text-sm font-bold text-slate-900">Attach a photo</Text>
          {hint && <Text className="text-xs text-slate-500 mt-1 text-center">{hint}</Text>}
        </Pressable>
      ) : (
        <View
          className="rounded-2xl bg-white p-3 flex-row items-center"
          style={shadows.sm}
        >
          <Image
            source={{ uri: photo.uri }}
            style={{ width: 64, height: 64, borderRadius: 12 }}
            resizeMode="cover"
          />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-bold text-slate-900">Photo attached</Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              {photo.width} × {photo.height}{photo.fileSize ? ` · ${Math.round(photo.fileSize / 1024)} KB` : ''}
            </Text>
            <View className="flex-row mt-2">
              <Pressable onPress={onAdd} className="px-2.5 py-1 rounded-full bg-slate-100 mr-2">
                <Text className="text-[11px] font-bold text-slate-700">Replace</Text>
              </Pressable>
              <Pressable onPress={() => set(null)} className="px-2.5 py-1 rounded-full bg-rose-50">
                <Text className="text-[11px] font-bold text-rose-700">Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SUPPORTED_COUNTRIES, type CountryCode } from '@/config/countries';
import { useCountry } from '@/hooks/useCountry';
import { colors, palette } from '@/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Bottom-sheet country picker. Lists every supported country with its
 * flag, curriculum line, and exam-track preview so the user can see
 * exactly what changes when they switch.
 *
 * Persisting the selection happens through useCountry/setCode which
 * writes to AsyncStorage; subscribers re-render automatically.
 */
export const CountryPickerSheet: React.FC<Props> = ({ visible, onClose }) => {
  const { code, setCode } = useCountry();

  const onPick = async (next: CountryCode) => {
    await setCode(next);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.surface.overlay, justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.surface.raised,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 32,
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-extrabold text-slate-900">Choose your country</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={palette.slate[600]} />
            </Pressable>
          </View>
          <Text className="text-xs text-slate-500 mb-4 leading-relaxed">
            Maple shows your country's curriculum, exams, and local payment methods. Switch any
            time from the chip above the login screen.
          </Text>

          {SUPPORTED_COUNTRIES.map((c) => {
            const active = c.code === code;
            return (
              <Pressable
                key={c.code}
                onPress={() => onPick(c.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={c.name}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 18,
                  marginBottom: 10,
                  backgroundColor: active ? colors.brand.primary : colors.surface.raised,
                  borderWidth: 1,
                  borderColor: active ? colors.brand.primary : colors.border.default,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 28, marginRight: 12 }}>{c.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: active ? colors.text.onBrand : colors.text.primary }}>
                    {c.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      marginTop: 2,
                      color: active ? 'rgba(255,255,255,0.78)' : colors.text.muted,
                    }}
                  >
                    {c.curriculum} · {c.exam_tracks.primary} · {c.exam_tracks.secondary} · {c.currency}
                  </Text>
                </View>
                {active && <Ionicons name="checkmark" size={18} color={colors.brand.accent} />}
              </Pressable>
            );
          })}

          <Text className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            More countries coming soon. Tell us where you'd like Maple next at support@maple.edify.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

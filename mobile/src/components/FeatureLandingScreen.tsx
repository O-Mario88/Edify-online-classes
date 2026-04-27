import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from './AppScreen';
import { shareItem } from '@/hooks/useShare';
import { colors, palette, shadows } from '@/theme';

export interface FeatureBullet {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}

interface Props {
  /** Eyebrow shown above the title (e.g. "Practice Labs"). */
  eyebrow: string;
  /** Hero icon shown in the disc. */
  icon: keyof typeof Ionicons.glyphMap;
  /** Tint of the hero disc — picks from a small pastel set. */
  tint?: 'navy' | 'amber' | 'emerald' | 'indigo' | 'rose' | 'teal' | 'orange' | 'purple';
  /** Title shown big & bold. */
  title: string;
  /** One-line summary under the title. */
  summary: string;
  /** Three bullet points — what the learner will get here. */
  bullets: FeatureBullet[];
  /** Optional status pill (e.g. "Coming next week"). */
  status?: string;
  /** Optional share payload — when present, renders a "Share via
   *  WhatsApp" button above the "Back to dashboard" CTA. */
  share?: { title: string; message: string; url?: string };
}

const TINTS: Record<NonNullable<Props['tint']>, { bg: string; fg: string }> = {
  navy:    { bg: palette.navy[100],    fg: palette.navy[900]    },
  amber:   { bg: palette.amber[50],    fg: palette.amber[800]   },
  emerald: { bg: palette.emerald[50],  fg: palette.emerald[800] },
  indigo:  { bg: palette.indigo[50],   fg: palette.indigo[700]  },
  rose:    { bg: palette.rose[50],     fg: palette.rose[800]    },
  teal:    { bg: palette.teal[50],     fg: palette.teal[800]    },
  orange:  { bg: palette.orange[50],   fg: palette.orange[800]  },
  purple:  { bg: palette.purple[50],   fg: palette.purple[800]  },
};

/**
 * Reusable landing for "feature is real, depth is on the way" screens.
 * Hero disc + eyebrow + headline + summary + three bullets describing
 * what the learner will find here once it ships, plus a back button.
 */
export const FeatureLandingScreen: React.FC<Props> = ({
  eyebrow,
  icon,
  tint = 'navy',
  title,
  summary,
  bullets,
  status = 'Coming soon',
  share,
}) => {
  const router = useRouter();
  const tintColors = TINTS[tint];
  return (
    <AppScreen scroll={false}>
      <View className="flex-1 px-6 pt-6 pb-8">
        <Pressable onPress={() => router.back()} className="mb-6">
          <Text className="text-sm font-semibold" style={{ color: colors.brand.primary }}>← Back</Text>
        </Pressable>

        <View className="items-center mb-7">
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center mb-5"
            style={{ backgroundColor: tintColors.bg }}
          >
            <Ionicons name={icon} size={42} color={tintColors.fg} />
          </View>
          <Text className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: colors.text.muted }}>{eyebrow}</Text>
          <Text className="text-3xl font-extrabold mt-2 text-center tracking-tight" style={{ color: colors.text.primary }}>
            {title}
          </Text>
          <Text className="text-sm mt-2 text-center px-4 leading-relaxed" style={{ color: colors.text.body }}>
            {summary}
          </Text>
          <View
            className="mt-4 px-3 py-1 rounded-full"
            style={{ backgroundColor: tintColors.bg }}
          >
            <Text className="text-[11px] font-bold uppercase tracking-wider" style={{ color: tintColors.fg }}>
              {status}
            </Text>
          </View>
        </View>

        <View
          className="rounded-3xl p-5"
          style={{ backgroundColor: colors.surface.raised, ...shadows.sm }}
        >
          <Text className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: colors.text.muted }}>
            What you'll find here
          </Text>
          {bullets.map((b, i) => (
            <View key={i} className={`flex-row items-start ${i > 0 ? 'mt-4' : ''}`}>
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: tintColors.bg }}
              >
                <Ionicons name={b.icon} size={18} color={tintColors.fg} />
              </View>
              <View className="flex-1 pr-1">
                <Text className="text-sm font-bold" style={{ color: colors.text.primary }}>{b.title}</Text>
                <Text className="text-xs mt-1 leading-relaxed" style={{ color: colors.text.body }}>{b.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {share && (
          <Pressable
            onPress={() => shareItem(share)}
            accessibilityRole="button"
            accessibilityLabel={`Share ${title} via WhatsApp`}
            className="mt-6 py-3 rounded-2xl items-center flex-row justify-center"
            style={{ backgroundColor: colors.partner.whatsapp }}
          >
            <Ionicons name="logo-whatsapp" size={18} color={colors.text.onBrand} />
            <Text className="text-sm font-bold ml-2" style={{ color: colors.text.onBrand }}>Share via WhatsApp</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => router.push('/(student)' as any)}
          className={`${share ? 'mt-3' : 'mt-6'} py-3 rounded-2xl items-center`}
          style={{ backgroundColor: colors.brand.primary }}
        >
          <Text className="text-sm font-bold" style={{ color: colors.text.onBrand }}>Back to dashboard</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
};

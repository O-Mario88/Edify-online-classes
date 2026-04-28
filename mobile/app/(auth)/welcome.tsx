import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BrandBackground } from '@/components/BrandBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CountryChip } from '@/components/CountryChip';
import { CountryPickerSheet } from '@/components/CountryPickerSheet';
import { useCountry } from '@/hooks/useCountry';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Public homepage shown to unauthenticated visitors after the cold-
 * start splash. Replaces the previous sparse "logo + sign-in" screen
 * with a proper marketing surface — hero copy, a public preview of
 * scheduled lessons, syllabus pathway pills, and a primary
 * "Get Started" CTA that routes into login (which itself links to
 * sign-up). Country chip top-right swaps the curriculum labels.
 */
export default function Welcome() {
  const router = useRouter();
  const { config } = useCountry();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.canvas }}>
      <BrandBackground haloY={0.18} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar — country chip on the right */}
          <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6, alignItems: 'flex-end' }}>
            <CountryChip variant="subtle" onPress={() => setPickerOpen(true)} />
          </View>

          {/* Hero */}
          <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 }}>
            <Text style={styles.eyebrow}>Maple Africa</Text>
            <Text style={styles.h1}>Learn with real teachers.</Text>
            <Text style={styles.h1}>Follow your country's curriculum.</Text>
            <Text style={[styles.h1, { color: palette.slate[500] }]}>Prepare for exams. Prove your progress.</Text>
            <Text style={styles.subtext}>
              A mobile-first online school for African learners, parents, teachers, and institutions —
              starting with Uganda and Kenya.
            </Text>
          </View>

          {/* Primary CTA — single Get Started entry point.
              The login screen has its own "Sign up" link so a single
              button serves both new and returning users. */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <PrimaryButton
              label="Get Started"
              onPress={() => router.push('/(auth)/login')}
            />
          </View>

          {/* Why Maple — 4 quick value props */}
          <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
            <Text style={styles.sectionEyebrow}>WHY MAPLE WORKS</Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              <ValueProp icon="calendar-outline" tint="indigo" title="Today's Plan" body="A short stack of tasks generated from your strongest and weakest subjects." />
              <ValueProp icon="people-outline" tint="emerald" title="Real Teacher Support" body="Live classes, standby teachers, graded assessments — every lesson a real human." />
              <ValueProp icon="ribbon-outline" tint="amber" title="Exam Readiness" body="Mock papers, mistake notebook, and a band that updates as you practise." />
              <ValueProp icon="shield-checkmark-outline" tint="rose" title="Learning Passport" body="A verified record of badges, certificates, and reviewed projects — shareable." />
            </View>
          </View>

          {/* Syllabus preview */}
          <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
            <Text style={styles.sectionEyebrow}>EXPLORE LEARNING PATHWAYS</Text>
            <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(config.code === 'KE'
                ? ['Lower Primary', 'Upper Primary', 'Junior School', 'Senior School', 'KCPE Prep', 'KCSE Prep']
                : ['P1–P3', 'P4–P5', 'P6', 'P7 PLE', 'S1–S2', 'S3–S4 UCE', 'S5–S6 UACE']
              ).map((label) => (
                <PathwayPill key={label} label={label} />
              ))}
            </View>
          </View>

          {/* Footer note */}
          <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
            <Text style={styles.footnote}>
              By continuing you agree to Maple's terms and privacy policy.{'\n'}
              <Text style={{ color: colors.text.body }}>{config.flag} {config.name} · {config.curriculum}</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <CountryPickerSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </View>
  );
}

const TINT: Record<string, { bg: string; fg: string }> = {
  indigo:  { bg: palette.indigo[50],  fg: palette.indigo[700]  },
  emerald: { bg: palette.emerald[50], fg: palette.emerald[800] },
  amber:   { bg: palette.amber[50],   fg: palette.amber[800]   },
  rose:    { bg: palette.rose[50],    fg: palette.rose[800]    },
};

const ValueProp: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  tint: keyof typeof TINT;
  title: string;
  body: string;
}> = ({ icon, tint, title, body }) => {
  const t = TINT[tint];
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface.raised,
      borderRadius: radius.cardLg,
      padding: 14,
      ...shadows.xs,
    }}>
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: t.bg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Ionicons name={icon} size={22} color={t.fg} />
      </View>
      <View style={{ flex: 1, paddingTop: 2 }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
          {title}
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: colors.text.body, marginTop: 4, lineHeight: fontSize.xs * 1.55 }}>
          {body}
        </Text>
      </View>
    </View>
  );
};

const PathwayPill: React.FC<{ label: string }> = ({ label }) => (
  <View
    style={{
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.pill,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    }}
  >
    <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold as any, color: colors.text.body }}>
      {label}
    </Text>
  </View>
);

const styles = {
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold as any,
    letterSpacing: 1.6,
    color: palette.bronze[700],
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  },
  h1: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold as any,
    color: colors.text.primary,
    letterSpacing: -0.6,
    lineHeight: fontSize['3xl'] * 1.12,
  },
  subtext: {
    marginTop: 14,
    fontSize: fontSize.base,
    color: colors.text.body,
    lineHeight: fontSize.base * 1.55,
    maxWidth: 480,
  },
  sectionEyebrow: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.bold as any,
    letterSpacing: 1.4,
    color: colors.text.muted,
  },
  footnote: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center' as const,
    lineHeight: fontSize.xs * 1.55,
  },
} as const;

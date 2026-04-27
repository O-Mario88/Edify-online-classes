import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import {
  schoolMatchApi,
  type OpportunityPreferences,
  type VisibilityStatus,
  type StudyModePreference,
} from '@/api/schoolMatch.api';
import { useParentStore } from '@/auth/parentStore';

/**
 * Parent-only screen for the In-Person School Opportunities preferences.
 *
 * Default state for a brand-new account is fully private — institutions
 * cannot discover the learner until the parent flips the master
 * "Open to verified institutions" switch *and* approves it. Every
 * write hits /school-match/preferences/ which records the parent's
 * approval timestamp on the row.
 */
export default function SchoolMatchPreferencesScreen() {
  const router = useRouter();
  const selectedChildId = useParentStore((s) => s.selectedChildId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<OpportunityPreferences | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await schoolMatchApi.getPreferences(selectedChildId ?? undefined);
    setLoading(false);
    if (err || !data) {
      setError(err?.message || 'Could not load preferences.');
      return;
    }
    setPrefs(data);
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  const persist = async (patch: Partial<OpportunityPreferences>) => {
    if (!prefs) return;
    setSaving(true);
    setError(null);
    const next = { ...prefs, ...patch };
    setPrefs(next); // optimistic
    const payload: any = { ...patch };
    if (selectedChildId) payload.student_id = selectedChildId;
    const { data, error: err } = await schoolMatchApi.setPreferences(payload);
    setSaving(false);
    if (err) {
      setError(err.message || 'Could not save. Try again.');
      // Roll back optimistic update so UI matches server truth.
      void reload();
      return;
    }
    if (data) setPrefs(data);
  };

  const masterOn = !!prefs?.is_discoverable;

  const masterToggle = () => {
    if (!prefs) return;
    if (!masterOn) {
      // Going public — confirm with an explicit Alert so the parent
      // knows what just happened.
      Alert.alert(
        'Open to verified institutions?',
        'Maple will start showing your child\'s anonymous learning profile to verified, active schools that match their level. Your contact details will be shared so they can reach out. You can switch this off any time.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, opt in',
            onPress: () =>
              persist({
                parent_approved: true,
                visibility_status: 'open_to_contact',
                open_to_institution_contact: true,
              }),
          },
        ],
      );
    } else {
      persist({
        parent_approved: false,
        visibility_status: 'private',
        open_to_institution_contact: false,
      });
    }
  };

  return (
    <AppScreen>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Opportunities</Text>
        <Text className="text-2xl font-extrabold text-slate-900">In-person school opportunities</Text>
        <Text className="text-sm text-slate-600 mt-1 leading-relaxed">
          When you're ready for in-person schooling, Maple can help trusted institutions discover
          your child's learning profile and invite you to apply. Your name and contact details will
          not be shared unless you approve.
        </Text>
      </View>

      {loading ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : error || !prefs ? (
        <View className="px-5"><ErrorState onRetry={reload} message={error || undefined} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Master switch */}
          <View className="px-5">
            <Pressable
              onPress={masterToggle}
              accessibilityRole="switch"
              accessibilityState={{ checked: masterOn }}
              accessibilityLabel="Open to verified institutions"
              className="rounded-3xl p-5 flex-row items-center"
              style={[
                cardShadow,
                { backgroundColor: masterOn ? '#0F2A45' : '#FFFFFF' },
              ]}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: masterOn ? 'rgba(255,255,255,0.12)' : '#FEF3C7' }}
              >
                <Ionicons
                  name={masterOn ? 'business' : 'lock-closed-outline'}
                  size={22}
                  color={masterOn ? '#E8C9A4' : '#92400E'}
                />
              </View>
              <View className="flex-1 pr-3">
                <Text
                  className="text-base font-extrabold"
                  style={{ color: masterOn ? '#FFFFFF' : '#0F172A' }}
                >
                  {masterOn ? 'Open to verified institutions' : 'Not visible to institutions'}
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: masterOn ? 'rgba(255,255,255,0.78)' : '#475569' }}
                >
                  {masterOn
                    ? 'Verified, active schools matching your child\'s level may invite you to apply.'
                    : 'Default. Institutions cannot discover your child until you opt in here.'}
                </Text>
              </View>
              <View
                className="w-12 h-7 rounded-full justify-center px-1"
                style={{ backgroundColor: masterOn ? '#E8C9A4' : '#E2E8F0' }}
              >
                <View
                  className="w-5 h-5 rounded-full bg-white"
                  style={{ marginLeft: masterOn ? 'auto' : 0 }}
                />
              </View>
            </Pressable>

            {!masterOn && (
              <Text className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                Until you opt in, no institution can see your child's profile, scores, or contact
                details. The Learning Passport stays private.
              </Text>
            )}
          </View>

          {/* Granular settings — only meaningful when master is on. */}
          {masterOn && (
            <>
              <View className="px-5 mt-7">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                  What you're open to
                </Text>
                <PrefRow
                  icon="school-outline"
                  title="Day school"
                  body="Schools where your child returns home each day."
                  value={prefs.open_to_day}
                  onToggle={() => persist({ open_to_day: !prefs.open_to_day })}
                />
                <PrefRow
                  icon="bed-outline"
                  title="Boarding school"
                  body="Schools with residential / boarding admission."
                  value={prefs.open_to_boarding}
                  onToggle={() => persist({ open_to_boarding: !prefs.open_to_boarding })}
                />
                <PrefRow
                  icon="ribbon-outline"
                  title="Scholarships and bursaries"
                  body="Surface scholarship offers from verified institutions."
                  value={prefs.open_to_scholarships}
                  onToggle={() => persist({ open_to_scholarships: !prefs.open_to_scholarships })}
                />
                <PrefRow
                  icon="map-outline"
                  title="School visit invitations"
                  body="Schools may invite you on-site for a tour."
                  value={prefs.open_to_school_visit_invites}
                  onToggle={() => persist({ open_to_school_visit_invites: !prefs.open_to_school_visit_invites })}
                />
                <PrefRow
                  icon="play-circle-outline"
                  title="Preview class invitations"
                  body="Try a class without committing to admission."
                  value={prefs.open_to_preview_class_invites}
                  onToggle={() => persist({ open_to_preview_class_invites: !prefs.open_to_preview_class_invites })}
                />
              </View>

              <View className="px-5 mt-7">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Where to look
                </Text>
                <PrefRow
                  icon="location-outline"
                  title="Same country only"
                  body="Don't surface schools outside your country."
                  value={prefs.national_search_only}
                  onToggle={() => persist({ national_search_only: !prefs.national_search_only })}
                />
              </View>

              {/* Default share level — caps what an institution can see
                  *before* requesting per-section access. */}
              <View className="px-5 mt-7 mb-2">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                  What schools see by default
                </Text>
                <ShareLevelPicker
                  current={prefs.share_level}
                  onPick={(lvl) => persist({ share_level: lvl })}
                />
                <Text className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  Institutions only see your child's anonymized profile until you approve a
                  Passport-access request. Your contact details are shared with verified schools
                  that match — they'll reach out to you, never your child.
                </Text>
              </View>
            </>
          )}

          {saving && (
            <Text className="text-[11px] text-slate-500 mt-2 text-center">Saving…</Text>
          )}
        </ScrollView>
      )}
    </AppScreen>
  );
}

const cardShadow = {
  elevation: 2,
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
} as const;

const PrefRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  value: boolean;
  onToggle: () => void;
}> = ({ icon, title, body, value, onToggle }) => (
  <Pressable
    onPress={onToggle}
    accessibilityRole="switch"
    accessibilityState={{ checked: value }}
    accessibilityLabel={title}
    className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
    style={{
      elevation: 1,
      shadowColor: '#0F172A',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    }}
  >
    <View className="w-9 h-9 rounded-2xl bg-indigo-100 items-center justify-center mr-3">
      <Ionicons name={icon} size={18} color="#3730A3" />
    </View>
    <View className="flex-1 pr-3">
      <Text className="text-sm font-bold text-slate-900">{title}</Text>
      <Text className="text-xs text-slate-500 mt-0.5">{body}</Text>
    </View>
    <View
      className="w-12 h-7 rounded-full justify-center px-1"
      style={{ backgroundColor: value ? '#0F2A45' : '#E2E8F0' }}
    >
      <View
        className="w-5 h-5 rounded-full bg-white"
        style={{ marginLeft: value ? 'auto' : 0 }}
      />
    </View>
  </Pressable>
);

const SHARE_LEVELS: { key: 'anonymous_summary' | 'academic_summary' | 'passport_summary' | 'full_passport'; label: string; body: string }[] = [
  { key: 'anonymous_summary', label: 'Anonymous summary',  body: 'Class level, region, subject strengths only.' },
  { key: 'academic_summary',  label: 'Academic summary',   body: 'Above + recent score band and improvement trend.' },
  { key: 'passport_summary',  label: 'Passport summary',   body: 'Above + count of badges, certificates, projects.' },
  { key: 'full_passport',     label: 'Full Passport',      body: 'Everything in the Passport. Most permissive.' },
];

const ShareLevelPicker: React.FC<{
  current: OpportunityPreferences['share_level'];
  onPick: (l: OpportunityPreferences['share_level']) => void;
}> = ({ current, onPick }) => (
  <View>
    {SHARE_LEVELS.map((l) => {
      const on = l.key === current;
      return (
        <Pressable
          key={l.key}
          onPress={() => onPick(l.key)}
          accessibilityRole="radio"
          accessibilityState={{ selected: on }}
          accessibilityLabel={l.label}
          className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
          style={[
            { elevation: 1, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
            on ? { borderWidth: 2, borderColor: '#0F2A45' } : undefined,
          ]}
        >
          <View
            className="w-5 h-5 rounded-full items-center justify-center mr-3"
            style={{
              borderWidth: 2,
              borderColor: on ? '#0F2A45' : '#CBD5E1',
              backgroundColor: on ? '#0F2A45' : 'transparent',
            }}
          >
            {on && <View className="w-2 h-2 rounded-full bg-white" />}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-900">{l.label}</Text>
            <Text className="text-xs text-slate-500 mt-0.5">{l.body}</Text>
          </View>
        </Pressable>
      );
    })}
  </View>
);

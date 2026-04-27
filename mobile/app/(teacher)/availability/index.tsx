import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { teacherApi, type AvailabilityRecord } from '@/api/teacher.api';

const SUBJECT_CHOICES = ['Maths', 'Science', 'English', 'History', 'Geography', 'ICT', 'Religious Education'];

/**
 * Standby availability — toggle on/off and pick subjects you can
 * answer questions in. Posts to /standby-teachers/availability/ on
 * every change so the assignment engine reflects the current state
 * within seconds.
 */
export default function TeacherAvailability() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await teacherApi.myAvailability();
      if (cancelled) return;
      if (data) {
        setAvailable(!!data.is_available);
        setSubjects(data.subjects || []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = async (next: AvailabilityRecord) => {
    setSaving(true);
    setError(null);
    const { error: err } = await teacherApi.setAvailability(next);
    setSaving(false);
    if (err) {
      setError(err.message || 'Could not save availability. Try again.');
    }
  };

  const toggle = async () => {
    const next = !available;
    setAvailable(next);
    await persist({ is_available: next, subjects });
  };

  const toggleSubject = async (subject: string) => {
    const next = subjects.includes(subject)
      ? subjects.filter((s) => s !== subject)
      : [...subjects, subject];
    setSubjects(next);
    await persist({ is_available: available, subjects: next });
  };

  return (
    <AppScreen>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Standby</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Standby availability</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Toggle on to receive student questions in real time. Switch off when you need quiet hours.
        </Text>
      </View>

      <View className="px-5 mt-3">
        {loading ? (
          <LoadingSkeleton height={120} lines={3} />
        ) : (
          <>
            {/* Big availability toggle card */}
            <Pressable
              onPress={toggle}
              accessibilityRole="switch"
              accessibilityState={{ checked: available }}
              accessibilityLabel="Standby availability"
              className="rounded-3xl p-5 flex-row items-center"
              style={[
                cardShadow,
                { backgroundColor: available ? '#0F2A45' : '#FFFFFF' },
              ]}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: available ? 'rgba(255,255,255,0.12)' : '#CCFBF1' }}
              >
                <Ionicons
                  name={available ? 'radio' : 'radio-outline'}
                  size={22}
                  color={available ? '#E8C9A4' : '#115E59'}
                />
              </View>
              <View className="flex-1 pr-3">
                <Text
                  className="text-base font-extrabold"
                  style={{ color: available ? '#FFFFFF' : '#0F172A' }}
                >
                  {available ? 'You\'re available' : 'You\'re offline'}
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: available ? 'rgba(255,255,255,0.78)' : '#475569' }}
                >
                  {available ? 'Students can send you questions right now.' : 'Tap to start receiving questions.'}
                </Text>
              </View>
              <View
                className="w-12 h-7 rounded-full justify-center px-1"
                style={{ backgroundColor: available ? '#E8C9A4' : '#E2E8F0' }}
              >
                <View
                  className="w-5 h-5 rounded-full"
                  style={{
                    backgroundColor: '#FFFFFF',
                    marginLeft: available ? 'auto' : 0,
                  }}
                />
              </View>
            </Pressable>

            {error && (
              <View className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200">
                <Text className="text-sm font-medium text-rose-800">{error}</Text>
              </View>
            )}

            {saving && (
              <Text className="text-[11px] text-slate-500 mt-3 text-center">Saving…</Text>
            )}

            {/* Subjects */}
            <View className="mt-7">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Subjects I can help with
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {SUBJECT_CHOICES.map((subj) => {
                  const on = subjects.includes(subj);
                  return (
                    <Pressable
                      key={subj}
                      onPress={() => toggleSubject(subj)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        borderRadius: 999,
                        backgroundColor: on ? '#0F172A' : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: on ? '#0F172A' : '#E2E8F0',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: on ? '#FFFFFF' : '#475569' }}>
                        {subj}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Hint card */}
            <View className="mt-7 mb-2 bg-white rounded-3xl p-4" style={cardShadow}>
              <Text className="text-sm font-bold text-slate-900">How standby works</Text>
              <Bullet text="When you're available, the network routes incoming questions to you within your subjects." />
              <Bullet text="You can accept or skip — only accepted questions count toward earnings." />
              <Bullet text="Quiet hours: switch off here, or enable do-not-disturb on your phone." />
            </View>
          </>
        )}
      </View>
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

const Bullet: React.FC<{ text: string }> = ({ text }) => (
  <View className="flex-row items-start mt-2">
    <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 mr-2.5" />
    <Text className="flex-1 text-xs text-slate-700 leading-relaxed">{text}</Text>
  </View>
);

import React, { useState } from 'react';
import {
  View, Text, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import {
  institutionMatchApi,
  type CreateScholarshipPayload,
  type ScholarshipAmountBand,
  type ScholarshipKind,
  type ScholarshipOpportunity,
} from '@/api/institutionMatch.api';

const KIND_LABEL: Record<ScholarshipKind, string> = {
  academic:        'Academic merit',
  financial_need:  'Financial need',
  exam_candidate:  'Exam candidate support',
  boarding:        'Boarding scholarship',
  girl_child_stem: 'Girl-child STEM',
  orphan:          'Orphan / vulnerable',
  high_performer:  'High-performing learner',
  other:           'Other',
};

const AMOUNT_LABEL: Record<ScholarshipAmountBand, string> = {
  partial_25:  'Partial — 25%',
  partial_50:  'Partial — 50%',
  partial_75:  'Partial — 75%',
  full:        'Full scholarship',
  stipend:     'Stipend / allowance',
  custom:      'Custom',
};

/**
 * Institution scholarships catalogue. List + create + soft-delete.
 * The list filters institution-supplied scholarships down to a
 * shortlist a finance / DOS team can manage in a few minutes.
 */
export default function InstitutionScholarshipsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [creatingOpen, setCreatingOpen] = useState(false);

  const query = useApiQuery<{ count: number; scholarships: ScholarshipOpportunity[] }>(
    ['institution-scholarships'],
    () => institutionMatchApi.listScholarships(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data?.scholarships ?? [];

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Pressable onPress={() => router.back()} className="mb-2">
            <Text className="text-sm font-semibold text-maple-900">← Back</Text>
          </Pressable>
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">School Match</Text>
          <Text className="text-2xl font-extrabold text-slate-900">Scholarships</Text>
          <Text className="text-sm text-slate-600 mt-1 leading-relaxed">
            Bursaries, full and partial scholarships, and learner-support awards your school is
            offering. Match-eligible learners who've opted in to scholarships will see them.
          </Text>
        </View>
        <Pressable
          onPress={() => setCreatingOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Create scholarship"
          className="w-11 h-11 rounded-full bg-maple-900 items-center justify-center"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : items.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="No scholarships yet"
            message="Tap the + above to publish your first scholarship. Active learners who opted in to scholarships will see it."
          />
        </View>
      ) : (
        <View className="px-5">
          {items.map((s) => (
            <ScholarshipCard
              key={s.id}
              scholarship={s}
              onToggle={async () => {
                await institutionMatchApi.updateScholarship(s.id, { active: !s.active });
                await query.refetch();
              }}
            />
          ))}
        </View>
      )}

      <ScholarshipCreateSheet
        visible={creatingOpen}
        onClose={() => setCreatingOpen(false)}
        onCreated={async () => {
          setCreatingOpen(false);
          await query.refetch();
        }}
      />
    </AppScreen>
  );
}

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

const ScholarshipCard: React.FC<{
  scholarship: ScholarshipOpportunity;
  onToggle: () => void;
}> = ({ scholarship: s, onToggle }) => (
  <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
    <View className="flex-row items-start mb-2">
      <View className="w-10 h-10 rounded-2xl bg-amber-100 items-center justify-center mr-3">
        <Ionicons name="ribbon-outline" size={20} color="#92400E" />
      </View>
      <View className="flex-1 pr-2">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
          {KIND_LABEL[s.kind] || s.kind}
        </Text>
        <Text className="text-base font-extrabold text-slate-900 mt-0.5">{s.title}</Text>
      </View>
      <View
        className="px-2 py-0.5 rounded-full"
        style={{ backgroundColor: s.active ? '#D1FAE5' : '#E2E8F0' }}
      >
        <Text
          className="text-[10px] font-bold"
          style={{ color: s.active ? '#065F46' : '#475569' }}
        >
          {s.active ? 'ACTIVE' : 'INACTIVE'}
        </Text>
      </View>
    </View>

    {!!s.description && (
      <Text numberOfLines={3} className="text-xs text-slate-600 leading-relaxed mb-2">
        {s.description}
      </Text>
    )}

    <View className="flex-row flex-wrap" style={{ gap: 6 }}>
      <Tag label={AMOUNT_LABEL[s.amount_band] || s.amount_band} />
      {s.seats_available > 0 && <Tag label={`${s.seats_available} seat${s.seats_available === 1 ? '' : 's'}`} />}
      {s.deadline && <Tag label={`Deadline ${new Date(s.deadline).toLocaleDateString()}`} />}
      {s.target_class_levels.slice(0, 3).map((cl, i) => <Tag key={`cl-${i}`} label={cl} />)}
    </View>

    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={s.active ? 'Deactivate' : 'Reactivate'}
      className="mt-3 self-start px-3 py-1.5 rounded-full"
      style={{ backgroundColor: s.active ? '#F1F5F9' : '#0F2A45' }}
    >
      <Text
        className="text-[11px] font-bold"
        style={{ color: s.active ? '#475569' : '#FFFFFF' }}
      >
        {s.active ? 'Deactivate' : 'Reactivate'}
      </Text>
    </Pressable>
  </View>
);

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <View className="px-2 py-0.5 rounded-full bg-slate-100">
    <Text className="text-[10px] font-bold text-slate-700">{label}</Text>
  </View>
);

// ── Create sheet ─────────────────────────────────────────────────────

const KINDS: ScholarshipKind[] = ['academic', 'financial_need', 'exam_candidate', 'boarding', 'girl_child_stem', 'orphan', 'high_performer', 'other'];
const AMOUNTS: ScholarshipAmountBand[] = ['partial_25', 'partial_50', 'partial_75', 'full', 'stipend', 'custom'];

const ScholarshipCreateSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ visible, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<ScholarshipKind>('academic');
  const [amount, setAmount] = useState<ScholarshipAmountBand>('partial_50');
  const [seats, setSeats] = useState('1');
  const [classLevels, setClassLevels] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle(''); setDescription(''); setKind('academic'); setAmount('partial_50');
    setSeats('1'); setClassLevels(''); setError(null); setSubmitting(false);
  };
  const close = () => { reset(); onClose(); };

  const submit = async () => {
    setError(null);
    if (title.trim().length < 4) {
      setError('Give the scholarship a clear title (at least 4 characters).');
      return;
    }
    setSubmitting(true);
    const payload: CreateScholarshipPayload = {
      title,
      description,
      kind,
      amount_band: amount,
      seats_available: Math.max(1, parseInt(seats || '1', 10) || 1),
      target_class_levels: classLevels.split(',').map((s) => s.trim()).filter(Boolean),
    };
    const { error: err } = await institutionMatchApi.createScholarship(payload);
    setSubmitting(false);
    if (err) {
      setError((err as any).message || 'Could not create. Try again.');
      return;
    }
    onCreated();
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'flex-end' }}
      >
        <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' }}>
          <View className="flex-row items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
            <Text className="text-base font-extrabold text-slate-900">New scholarship</Text>
            <Pressable onPress={close}>
              <Ionicons name="close" size={22} color="#475569" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 28 }}>
            <Field label="Title">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. P7 Mathematics Champions Scholarship"
                placeholderTextColor="#94A3B8"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900"
              />
            </Field>

            <Field label="Description">
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="A few lines on what's covered, who it's for, and how to apply."
                placeholderTextColor="#94A3B8"
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 min-h-[120px]"
              />
            </Field>

            <Field label="Kind">
              <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                {KINDS.map((k) => {
                  const on = kind === k;
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setKind(k)}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
                        backgroundColor: on ? '#0F172A' : '#FFFFFF',
                        borderWidth: 1, borderColor: on ? '#0F172A' : '#E2E8F0',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: on ? '#FFFFFF' : '#475569' }}>
                        {KIND_LABEL[k]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label="Amount band">
              <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                {AMOUNTS.map((a) => {
                  const on = amount === a;
                  return (
                    <Pressable
                      key={a}
                      onPress={() => setAmount(a)}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
                        backgroundColor: on ? '#0F172A' : '#FFFFFF',
                        borderWidth: 1, borderColor: on ? '#0F172A' : '#E2E8F0',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: on ? '#FFFFFF' : '#475569' }}>
                        {AMOUNT_LABEL[a]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <View className="flex-row" style={{ gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field label="Seats">
                  <TextInput
                    value={seats}
                    onChangeText={setSeats}
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor="#94A3B8"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  />
                </Field>
              </View>
              <View style={{ flex: 2 }}>
                <Field label="Target class levels (comma-separated)">
                  <TextInput
                    value={classLevels}
                    onChangeText={setClassLevels}
                    placeholder="P6, P7"
                    placeholderTextColor="#94A3B8"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  />
                </Field>
              </View>
            </View>

            {error && (
              <View className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <Text className="text-sm font-medium text-rose-800">{error}</Text>
              </View>
            )}

            <Pressable
              onPress={submit}
              disabled={submitting}
              className="mt-4 py-3 rounded-2xl items-center bg-maple-900"
            >
              <Text className="text-sm font-bold text-white">
                {submitting ? 'Publishing…' : 'Publish scholarship'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Field: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <View className="mb-4">
    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</Text>
    {children}
  </View>
);

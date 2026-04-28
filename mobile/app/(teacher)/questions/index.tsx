import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { teacherApi, type SupportRequestSummary } from '@/api/teacher.api';

/**
 * Student questions inbox — pulls /standby-teachers/support-requests/
 * teacher-queue/. Each row can be accepted (claim it for yourself) and
 * resolved with a written response. Voice replies and photo attach
 * land in a follow-up.
 */
export default function TeacherQuestionsInbox() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [responding, setResponding] = useState<SupportRequestSummary | null>(null);

  const query = useApiQuery<SupportRequestSummary[]>(
    ['teacher-questions'],
    () => teacherApi.supportInbox(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];
  const open = items.filter((i) => i.status === 'open');
  const claimed = items.filter((i) => i.status === 'claimed');

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Inbox</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Student questions</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Accept a question to claim it, then send a worked-through reply.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : items.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="Inbox empty"
            message="When students send a standby question, it'll show up here."
          />
        </View>
      ) : (
        <View className="px-5">
          {open.length > 0 && (
            <Section label="Waiting">
              {open.map((q) => (
                <QuestionRow
                  key={String(q.id)}
                  q={q}
                  primaryLabel="Accept"
                  onPrimary={async () => {
                    await teacherApi.acceptQuestion(q.id);
                    await query.refetch();
                  }}
                />
              ))}
            </Section>
          )}
          {claimed.length > 0 && (
            <Section label="Yours to answer">
              {claimed.map((q) => (
                <QuestionRow
                  key={String(q.id)}
                  q={q}
                  primaryLabel="Reply"
                  onPrimary={() => setResponding(q)}
                />
              ))}
            </Section>
          )}
        </View>
      )}

      <RespondModal
        question={responding}
        onClose={() => setResponding(null)}
        onSubmit={async (response) => {
          if (!responding) return;
          await teacherApi.resolveQuestion(responding.id, { response });
          setResponding(null);
          await query.refetch();
        }}
      />
    </AppScreen>
  );
}

const Section: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <View className="mb-5">
    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</Text>
    {children}
  </View>
);

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

const QuestionRow: React.FC<{
  q: SupportRequestSummary;
  primaryLabel: string;
  onPrimary: () => void;
}> = ({ q, primaryLabel, onPrimary }) => (
  <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
    <View className="flex-row items-center mb-2">
      <View className="w-9 h-9 rounded-full bg-amber-100 items-center justify-center mr-2.5">
        <Text className="text-xs font-extrabold text-amber-800">
          {q.student_name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase() || '?'}
        </Text>
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">{q.student_name}</Text>
        <Text className="text-[11px] text-slate-500 mt-0.5">{q.subject || 'General'}</Text>
      </View>
    </View>
    <Text numberOfLines={3} className="text-sm text-slate-700 leading-relaxed">{q.question}</Text>
    <Pressable
      onPress={onPrimary}
      accessibilityRole="button"
      accessibilityLabel={primaryLabel}
      className="mt-3 self-start px-4 py-2 rounded-full bg-maple-900"
    >
      <Text className="text-xs font-bold text-white">{primaryLabel}</Text>
    </Pressable>
  </View>
);

const RespondModal: React.FC<{
  question: SupportRequestSummary | null;
  onClose: () => void;
  onSubmit: (response: string) => Promise<void>;
}> = ({ question, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (text.trim().length < 4) return;
    setSubmitting(true);
    await onSubmit(text);
    setSubmitting(false);
    setText('');
  };

  return (
    <Modal visible={!!question} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'flex-end' }}
      >
        <View className="bg-white rounded-t-3xl px-6 pt-5 pb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-extrabold text-slate-900">Reply</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color="#475569" />
            </Pressable>
          </View>
          {question && (
            <View className="bg-slate-50 rounded-2xl p-3 mb-4">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {question.student_name} asked
              </Text>
              <Text numberOfLines={4} className="text-sm text-slate-800 mt-1 leading-relaxed">
                {question.question}
              </Text>
            </View>
          )}
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Your reply</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            placeholder="Walk through it step by step…"
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
            className="rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-900 min-h-[160px]"
          />
          <Pressable
            onPress={submit}
            disabled={submitting || text.trim().length < 4}
            accessibilityRole="button"
            accessibilityLabel="Send reply"
            className="mt-4 py-3 rounded-2xl items-center"
            style={{ backgroundColor: text.trim().length < 4 ? '#CBD5E1' : '#0F2A45' }}
          >
            <Text className="text-sm font-bold text-white">{submitting ? 'Sending…' : 'Send reply'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

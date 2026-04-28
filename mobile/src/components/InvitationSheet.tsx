import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  institutionMatchApi,
  type InstitutionInvitationType,
} from '@/api/institutionMatch.api';
import { colors, palette } from '@/theme';

interface Props {
  visible: boolean;
  studentId: number | string;
  /** Pre-fill the why-interested bullets with the match reasons. */
  defaultReasons?: string[];
  onClose: () => void;
  onSubmitted?: (invitationId: number) => void;
}

const TYPE_OPTIONS: { key: InstitutionInvitationType; label: string; hint: string }[] = [
  { key: 'apply',               label: 'Invite to apply',         hint: 'Open the door for an admission application.' },
  { key: 'interview',           label: 'Interview',               hint: 'Set up a conversation before the application.' },
  { key: 'entrance_assessment', label: 'Entrance assessment',     hint: 'Sit a placement / entrance test.' },
  { key: 'school_visit',        label: 'School visit',            hint: 'Tour the campus before deciding.' },
  { key: 'preview_class',       label: 'Preview class',           hint: 'Try a class without committing.' },
  { key: 'scholarship',         label: 'Scholarship offer',       hint: 'Offer a partial or full bursary.' },
  { key: 'boarding_admission',  label: 'Boarding admission',      hint: 'Discussion about boarding placement.' },
  { key: 'information_request', label: 'Request more info',       hint: 'Ask the parent for additional context.' },
];

/**
 * Bottom-sheet for the institution to send a school-match invitation
 * to a learner's parent. Captures the type, optional message, and an
 * editable list of why-interested bullets pre-filled from the match
 * reasons. POST flows through institutionMatchApi.createInvitation().
 */
export const InvitationSheet: React.FC<Props> = ({
  visible, studentId, defaultReasons = [], onClose, onSubmitted,
}) => {
  const [type, setType] = useState<InstitutionInvitationType>('apply');
  const [message, setMessage] = useState('');
  const [reasons, setReasons] = useState<string[]>(defaultReasons.slice(0, 5));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reset = () => {
    setType('apply'); setMessage(''); setReasons(defaultReasons.slice(0, 5));
    setSubmitting(false); setError(null); setDone(false);
  };
  const close = () => { reset(); onClose(); };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const { data, error: err } = await institutionMatchApi.createInvitation({
      student_id: studentId,
      invitation_type: type,
      message,
      why_interested: reasons.filter((r) => r.trim().length > 0).slice(0, 5),
      requested_share_level: 'academic_summary',
    });
    setSubmitting(false);
    if (err || !data?.ok) {
      setError(data?.detail || err?.message || 'Could not send invitation.');
      return;
    }
    setDone(true);
    if (data.invitation?.id) onSubmitted?.(data.invitation.id);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: colors.surface.overlay, justifyContent: 'flex-end' }}
      >
        <View style={{ backgroundColor: colors.surface.raised, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' }}>
          <View className="flex-row items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
            <Text className="text-base font-extrabold text-slate-900">Invite this learner</Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={palette.slate[600]} />
            </Pressable>
          </View>

          {done ? (
            <View className="items-center px-6 py-7">
              <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mb-3">
                <Ionicons name="paper-plane-outline" size={22} color={palette.emerald[800]} />
              </View>
              <Text className="text-base font-extrabold text-slate-900 text-center">
                Invitation sent
              </Text>
              <Text className="text-sm text-slate-600 mt-2 text-center max-w-xs leading-relaxed">
                The parent will get a notification. You'll see contact details here once they accept.
              </Text>
              <Pressable onPress={close} className="mt-5 px-6 py-3 rounded-full bg-maple-900">
                <Text className="text-sm font-bold text-white">Got it</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 28 }}>
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Invitation type
              </Text>
              {TYPE_OPTIONS.map((opt) => {
                const on = type === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setType(opt.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={opt.label}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                      borderRadius: 16,
                      marginBottom: 8,
                      backgroundColor: on ? colors.text.primary : colors.surface.raised,
                      borderWidth: 1,
                      borderColor: on ? colors.text.primary : colors.border.default,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '800', color: on ? colors.text.onBrand : colors.text.primary }}>
                      {opt.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        marginTop: 2,
                        color: on ? 'rgba(255,255,255,0.78)' : colors.text.muted,
                      }}
                    >
                      {opt.hint}
                    </Text>
                  </Pressable>
                );
              })}

              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-2">
                Personal note (optional)
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="A few warm lines so the parent knows this isn't a form."
                placeholderTextColor={colors.text.soft}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 min-h-[100px]"
              />

              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-2">
                Why this learner
              </Text>
              <Text className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Pre-filled with the match reasons. Edit or remove any line. The parent sees these
                bullets on the invitation card.
              </Text>
              {[0, 1, 2, 3, 4].map((idx) => (
                <View key={idx} className="flex-row items-center mb-2">
                  <Ionicons name="checkmark" size={14} color={colors.brand.primary} style={{ marginRight: 6 }} />
                  <TextInput
                    value={reasons[idx] || ''}
                    onChangeText={(v) => {
                      const next = [...reasons];
                      next[idx] = v;
                      setReasons(next);
                    }}
                    placeholder="(empty — skipped)"
                    placeholderTextColor={palette.slate[300]}
                    className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  />
                </View>
              ))}

              {error && (
                <View className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <Text className="text-sm font-medium text-rose-800">{error}</Text>
                </View>
              )}

              <Pressable
                onPress={submit}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Send invitation"
                className="mt-4 py-3 rounded-2xl items-center bg-maple-900"
              >
                <Text className="text-sm font-bold text-white">
                  {submitting ? 'Sending…' : 'Send invitation'}
                </Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

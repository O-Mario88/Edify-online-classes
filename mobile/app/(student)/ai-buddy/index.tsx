import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import {
  studyBuddyApi,
  type StudyBuddyConversation,
  type StudyBuddyMessage,
} from '@/api/studyBuddy.api';

const SUGGESTED_PROMPTS = [
  'Explain fractions step by step',
  'Help me revise yesterday\'s class',
  'Give me 3 practice questions on percentages',
  'I keep failing word problems — what should I do?',
  'Summarise this lesson for me',
];

/**
 * Maple Study Buddy — chat with a Claude-backed AI study companion.
 * Hints, not answers. Escalates to a real teacher whenever the topic
 * drifts out of scope or the user asks for help beyond what the AI
 * should provide. Empty state offers suggested prompts so a learner
 * who's never used a chat tool has somewhere to start.
 */
export default function AiBuddyScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [conversation, setConversation] = useState<StudyBuddyConversation | null>(null);
  const [messages, setMessages] = useState<StudyBuddyMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive.
  useEffect(() => {
    if (messages.length === 0) return;
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);

    // Optimistic user bubble — we add to the local list immediately so
    // the UI feels snappy even on slow networks.
    const optimistic: StudyBuddyMessage = {
      id: -Date.now(),
      role: 'user',
      content: trimmed,
      escalation_hint: false,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setInput('');

    const { data, error: err } = await studyBuddyApi.ask({
      message: trimmed,
      conversation_id: conversation?.id,
    });
    setSending(false);
    if (err || !data) {
      setError(err?.message || 'Could not reach Study Buddy. Try again.');
      // Roll back the optimistic bubble so the user can re-send.
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      return;
    }
    setConversation(data.conversation);
    // Replace optimistic with real if the server gave us one back; otherwise keep it.
    setMessages((m) => [...m.filter((x) => x.id !== optimistic.id),
      { ...optimistic, id: -optimistic.id }, data.message]);
  };

  const onEscalate = () => {
    router.push('/(student)/ask-teacher' as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppScreen scroll={false}>
        <View className="px-5 pt-6 pb-3 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Text className="text-sm font-semibold text-maple-900">← Back</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              AI Study Buddy
            </Text>
            <Text numberOfLines={1} className="text-base font-extrabold text-slate-900 mt-0.5">
              {conversation?.title || 'New chat'}
            </Text>
          </View>
          {(conversation?.escalated || messages.some((m) => m.escalation_hint)) && (
            <Pressable
              onPress={onEscalate}
              accessibilityRole="button"
              accessibilityLabel="Ask a real teacher"
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#0F2A45' }}
            >
              <Text className="text-[11px] font-bold text-white">Ask a teacher</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View className="mt-2">
              <View
                className="bg-white rounded-3xl p-5 mb-5"
                style={{
                  elevation: 1,
                  shadowColor: '#0F172A',
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: '#EDE9FE' }}
                  >
                    <Ionicons name="sparkles-outline" size={20} color="#5B21B6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-extrabold text-slate-900">
                      Hi, I'm your Maple Study Buddy.
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      I give hints, not answers — so you really learn.
                    </Text>
                  </View>
                </View>
                <Text className="text-[11px] text-slate-500 leading-relaxed">
                  Anchored to your country's syllabus, never the open web. If something needs a real
                  teacher, I'll route you to one.
                </Text>
              </View>

              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Try a starter prompt
              </Text>
              {SUGGESTED_PROMPTS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => send(p)}
                  accessibilityRole="button"
                  accessibilityLabel={p}
                  className="bg-white rounded-2xl px-4 py-3 mb-2.5 flex-row items-center"
                  style={{
                    elevation: 1,
                    shadowColor: '#0F172A',
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                >
                  <Ionicons name="bulb-outline" size={14} color="#5B21B6" />
                  <Text className="flex-1 ml-2 text-sm text-slate-800">{p}</Text>
                  <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
                </Pressable>
              ))}
            </View>
          ) : (
            messages.map((m) => <Bubble key={m.id} m={m} onEscalate={onEscalate} />)
          )}

          {sending && (
            <View className="self-start mt-2 px-3 py-2 rounded-2xl bg-slate-100">
              <Text className="text-xs text-slate-500">Thinking…</Text>
            </View>
          )}

          {error && (
            <View className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <Text className="text-sm font-medium text-rose-800">{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        <View
          className="px-4 py-3 border-t border-slate-100 bg-white flex-row items-end"
          style={{ paddingBottom: Platform.OS === 'ios' ? 18 : 12 }}
        >
          <View className="flex-1 mr-2 rounded-2xl bg-slate-50 px-3 py-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              multiline
              placeholder="Ask anything about your studies…"
              placeholderTextColor="#94A3B8"
              className="text-sm text-slate-900"
              style={{ maxHeight: 120 }}
              accessibilityLabel="Message Study Buddy"
            />
          </View>
          <Pressable
            onPress={() => send(input)}
            disabled={sending || input.trim().length === 0}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{
              backgroundColor: input.trim().length === 0 || sending ? '#CBD5E1' : '#0F2A45',
            }}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const Bubble: React.FC<{ m: StudyBuddyMessage; onEscalate: () => void }> = ({ m, onEscalate }) => {
  const isUser = m.role === 'user';
  return (
    <View className={`my-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className="rounded-3xl px-4 py-2.5 max-w-[86%]"
        style={{
          backgroundColor: isUser ? '#0F2A45' : '#FFFFFF',
          elevation: isUser ? 0 : 1,
          shadowColor: '#0F172A',
          shadowOpacity: isUser ? 0 : 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text
          selectable
          className="text-sm leading-relaxed"
          style={{ color: isUser ? '#FFFFFF' : '#0F172A' }}
        >
          {m.content}
        </Text>
      </View>
      {!isUser && m.escalation_hint && (
        <Pressable
          onPress={onEscalate}
          accessibilityRole="button"
          accessibilityLabel="Ask a real teacher"
          className="mt-1.5 px-3 py-1.5 rounded-full flex-row items-center"
          style={{ backgroundColor: '#FEF3C7' }}
        >
          <Ionicons name="help-buoy-outline" size={12} color="#92400E" />
          <Text className="text-[11px] font-bold text-amber-900 ml-1.5">
            Ask a real Maple teacher
          </Text>
        </Pressable>
      )}
    </View>
  );
};

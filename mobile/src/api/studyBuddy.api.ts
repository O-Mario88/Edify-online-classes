import { api } from './client';

export type StudyBuddyPersona = 'student' | 'parent' | 'teacher';
export type StudyBuddyRole = 'user' | 'assistant' | 'system';

export interface StudyBuddyConversation {
  id: number;
  persona: StudyBuddyPersona;
  title: string;
  subject: string;
  topic: string;
  escalated: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyBuddyMessage {
  id: number;
  role: StudyBuddyRole;
  content: string;
  escalation_hint: boolean;
  created_at: string;
}

export interface AskResponse {
  conversation: StudyBuddyConversation;
  message: StudyBuddyMessage;
}

export interface AskPayload {
  message: string;
  conversation_id?: number;
  persona?: StudyBuddyPersona;
  subject?: string;
  topic?: string;
}

export const studyBuddyApi = {
  /** GET /study-buddy/conversations/ — recent threads, newest first. */
  list() {
    return api.get<{ conversations: StudyBuddyConversation[] }>('/study-buddy/conversations/');
  },

  /** GET /study-buddy/conversations/<id>/ — full message history. */
  detail(id: number | string) {
    return api.get<{ conversation: StudyBuddyConversation; messages: StudyBuddyMessage[] }>(
      `/study-buddy/conversations/${id}/`,
    );
  },

  /** POST /study-buddy/ask/ — send a message; creates a conversation
   *  on first call. Returns the assistant message + conversation snapshot. */
  ask(payload: AskPayload) {
    return api.post<AskResponse>('/study-buddy/ask/', payload);
  },
};

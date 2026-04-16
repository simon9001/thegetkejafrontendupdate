// features/Api/ChatApi.ts
// Maps to backend routes at /api/chat/*
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface Conversation {
  id:               string;
  type:             string;
  property_id?:     string;
  properties?:      { id: string; title: string; listing_type?: string; property_locations?: any; property_media?: { url: string; is_cover?: boolean }[] };
  participant_a:    string;
  participant_b:    string;
  other_participant_id: string;
  last_message_text?:   string;
  last_message_at?:     string;
  unread_count?:        number;
  is_archived?:         boolean;
  is_blocked?:          boolean;
  created_at:           string;
}

export interface Message {
  id:                string;
  conversation_id?:  string;
  sender_id:         string;
  type:              string;
  body?:             string | null;
  media_url?:        string | null;
  read_by_recipient: boolean;
  read_at?:          string | null;
  is_deleted?:       boolean;
  reply_to_id?:      string | null;
  created_at:        string;
}

export interface StartConversationArgs {
  property_id:     string;
  recipient_id:    string;
  initial_message: string;
  type?:           string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['Conversation', 'Message'],
  endpoints:   (builder) => ({

    // POST /api/chat/start  → start or get-or-create conversation
    startConversation: builder.mutation<{ conversation: Conversation }, StartConversationArgs>({
      query: (body) => ({ url: 'chat/start', method: 'POST', body }),
      invalidatesTags: ['Conversation'],
    }),

    // GET /api/chat/conversations
    getConversations: builder.query<{ conversations: Conversation[]; total: number; page: number }, { page?: number; limit?: number } | void>({
      query: (args) => {
        const p = (args as any)?.page  ?? 1;
        const l = (args as any)?.limit ?? 30;
        return `chat/conversations?page=${p}&limit=${l}`;
      },
      providesTags: ['Conversation'],
    }),

    // GET /api/chat/conversations/:id
    getConversationById: builder.query<{ conversation: Conversation }, string>({
      query: (id) => `chat/conversations/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Conversation', id }],
    }),

    // GET /api/chat/conversations/:id/messages
    getMessages: builder.query<{ messages: Message[]; total: number; page: number }, { conversationId: string; page?: number }>({
      query: ({ conversationId, page = 1 }) => `chat/conversations/${conversationId}/messages?page=${page}`,
      providesTags: (_r, _e, { conversationId }) => [{ type: 'Message', id: conversationId }],
    }),

    // POST /api/chat/conversations/:id/messages
    sendMessage: builder.mutation<{ message: Message }, { conversationId: string; body: string; type?: string }>({
      query: ({ conversationId, body, type = 'text' }) => ({
        url:    `chat/conversations/${conversationId}/messages`,
        method: 'POST',
        body:   { body, type },
      }),
      invalidatesTags: (_r, _e, { conversationId }) => [
        { type: 'Message', id: conversationId },
        'Conversation',
      ],
    }),

    // PATCH /api/chat/conversations/:id/archive
    archiveConversation: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `chat/conversations/${id}/archive`, method: 'PATCH' }),
      invalidatesTags: ['Conversation'],
    }),

    // DELETE /api/chat/messages/:id
    deleteMessage: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `chat/messages/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useStartConversationMutation,
  useGetConversationsQuery,
  useGetConversationByIdQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useArchiveConversationMutation,
  useDeleteMessageMutation,
} = chatApi;

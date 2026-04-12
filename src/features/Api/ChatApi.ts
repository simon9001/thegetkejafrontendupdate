// frontend/src/features/Api/ChatApi.ts
// Maps to actual backend routes:
//   GET    /api/landlord/conversations             → list conversations
//   GET    /api/landlord/conversations/:id/messages → get messages
//   POST   /api/landlord/conversations/:id/messages → send message
//   PATCH  /api/landlord/conversations/:id/read     → mark read
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface Conversation {
  id:            string;
  property_id?:  string;
  property?:     { id: string; title: string; media?: { url: string }[] };
  participant?:  { id: string; full_name: string; avatar_url?: string };
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  created_at:    string;
}

export interface Message {
  id:          string;
  conversation_id: string;
  sender_id:   string;
  sender?:     { id: string; full_name: string; avatar_url?: string };
  content:     string;
  is_read:     boolean;
  created_at:  string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['Conversation', 'Message'],
  endpoints: (builder) => ({

    // GET /api/landlord/conversations
    getConversations: builder.query<Conversation[], void>({
      query: () => 'landlord/conversations',
      providesTags: ['Conversation'],
    }),

    // GET /api/landlord/conversations/:id/messages
    getMessages: builder.query<Message[], string>({
      query: (conversationId) => `landlord/conversations/${conversationId}/messages`,
      providesTags: (_r, _e, id) => [{ type: 'Message', id }],
    }),

    // POST /api/landlord/conversations/:id/messages
    sendMessage: builder.mutation<Message, { conversationId: string; content: string }>({
      query: ({ conversationId, content }) => ({
        url:    `landlord/conversations/${conversationId}/messages`,
        method: 'POST',
        body:   { content },
      }),
      invalidatesTags: (_r, _e, { conversationId }) => [
        { type: 'Message', id: conversationId },
        'Conversation',
      ],
    }),

    // PATCH /api/landlord/conversations/:id/read
    markConversationRead: builder.mutation<{ message: string }, string>({
      query: (conversationId) => ({
        url:    `landlord/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Conversation'],
    }),

    // POST /api/conversations  (initiate / get-or-create from a property page)
    // The combined router or a future public conversations endpoint handles this.
    // Body: { property_id, host_id }
    getOrCreateConversation: builder.mutation<Conversation, { propertyId: string; hostId: string }>({
      query: ({ propertyId, hostId }) => ({
        url:    'conversations',
        method: 'POST',
        body:   { property_id: propertyId, host_id: hostId },
      }),
      invalidatesTags: ['Conversation'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useGetOrCreateConversationMutation,
} = chatApi;

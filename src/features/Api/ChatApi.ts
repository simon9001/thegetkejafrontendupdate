import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const chatApi = createApi({
    reducerPath: 'chatApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Conversation', 'Message', 'UnreadCount'],
    endpoints: (builder) => ({
        getConversations: builder.query<any[], void>({
            query: () => '/chat/conversations',
            providesTags: ['Conversation'],
        }),
        getOrCreateConversation: builder.mutation<any, { propertyId: string; hostId: string }>({
            query: (body) => ({
                url: '/chat/conversations',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Conversation'],
        }),
        getMessages: builder.query<any[], string>({
            query: (conversationId) => `/chat/conversations/${conversationId}/messages`,
            providesTags: (_result, _error, id) => [{ type: 'Message', id }],
        }),
        sendMessage: builder.mutation<any, { conversationId: string; message: string }>({
            query: (body) => ({
                url: '/chat/messages',
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { conversationId }) => [
                { type: 'Message', id: conversationId },
                'Conversation'
            ],
        }),
        getUnreadCount: builder.query<{ unreadCount: number }, void>({
            query: () => '/chat/unread-count',
            providesTags: ['UnreadCount'],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useGetOrCreateConversationMutation,
    useGetMessagesQuery,
    useSendMessageMutation,
    useGetUnreadCountQuery,
} = chatApi;

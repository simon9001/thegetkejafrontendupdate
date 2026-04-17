import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import {
    useGetConversationsQuery,
    useGetMessagesQuery,
    useSendMessageMutation
} from '../../features/Api/ChatApi';
import Layout from '../../components/layout/Layout';
import {
    Search, Send, MessageCircle, MoreVertical,
    Info, ChevronLeft, Loader2, User,
} from 'lucide-react';

// ── Avatar helper ─────────────────────────────────────────────────────────────
const Avatar: React.FC<{ src?: string | null; name?: string | null; size?: string }> = ({
    src, name, size = 'w-12 h-12',
}) => (
    <div className={`${size} rounded-full flex-shrink-0 overflow-hidden bg-[#D4A373]/10 flex items-center justify-center`}>
        {src
            ? <img src={src} alt={name ?? ''} className="w-full h-full object-cover" />
            : name
                ? <span className="text-[#D4A373] font-bold text-sm">{name.charAt(0).toUpperCase()}</span>
                : <User className="w-4 h-4 text-[#D4A373]" />
        }
    </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const Messages: React.FC = () => {
    const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.auth);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showConversationList, setShowConversationList] = useState(true);
    const [search, setSearch] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: conversationsData, isLoading: isConversationsLoading } = useGetConversationsQuery(undefined, {
        skip: !isAuthenticated,
        pollingInterval: 8000,
    });

    // The backend now returns { conversations: [...], total, page }
    const convList: any[] = (conversationsData as any)?.conversations ?? [];

    const { data: messagesData, isLoading: isMessagesLoading } = useGetMessagesQuery(
        { conversationId: selectedConversationId || '' },
        { skip: !selectedConversationId, pollingInterval: 4000 },
    );
    const msgList: any[] = (messagesData as any)?.messages ?? [];

    const [sendMsg, { isLoading: sending }] = useSendMessageMutation();

    const selectedConversation = convList.find((c: any) => c.id === selectedConversationId);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgList]);

    // Auto-select first conversation on desktop
    useEffect(() => {
        if (convList.length > 0 && !selectedConversationId && window.innerWidth >= 1024) {
            setSelectedConversationId(convList[0].id);
            setShowConversationList(false);
        }
    }, [convList, selectedConversationId]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !selectedConversationId) return;
        try {
            await sendMsg({ conversationId: selectedConversationId, body: newMessage.trim() }).unwrap();
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };

    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);
        setShowConversationList(false);
    };

    // The backend attaches `other_participant` with id / full_name / avatar_url
    const getOtherParticipant = (conv: any) =>
        conv?.other_participant ?? {
            id:         conv?.other_participant_id ?? '',
            full_name:  'Unknown',
            avatar_url: null,
        };

    // Filter conversations by search term
    const filteredConvs = convList.filter((c: any) => {
        if (!search) return true;
        const other = getOtherParticipant(c);
        return (
            other.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.last_message_text?.toLowerCase().includes(search.toLowerCase()) ||
            c.properties?.title?.toLowerCase().includes(search.toLowerCase())
        );
    });

    const formatTime = (ts?: string) => {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
    };

    return (
        <Layout showSearch={false}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-140px)]">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 h-full flex overflow-hidden">

                    {/* ── Conversations sidebar ── */}
                    <div className={`${showConversationList ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-96 border-r border-gray-100 h-full`}>
                        <div className="p-5 border-b border-gray-50">
                            <h1 className="text-2xl font-black text-[#1B2430] mb-4">Messages</h1>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search conversations…"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 border border-gray-100"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            {isConversationsLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-6 h-6 text-[#D4A373] animate-spin" />
                                </div>
                            ) : filteredConvs.length > 0 ? (
                                filteredConvs.map((conv: any) => {
                                    const other    = getOtherParticipant(conv);
                                    const isActive = selectedConversationId === conv.id;
                                    const unread   = conv.unread_count ?? 0;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => handleSelectConversation(conv.id)}
                                            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left ${
                                                isActive
                                                    ? 'bg-[#1B2430] text-white'
                                                    : 'hover:bg-gray-50 text-[#1B2430]'
                                            }`}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <Avatar src={other.avatar_url} name={other.full_name} size="w-11 h-11" />
                                                {unread > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A373] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                                                        {unread > 9 ? '9+' : unread}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-[#1B2430]'}`}>
                                                        {other.full_name ?? 'Unknown'}
                                                    </span>
                                                    <span className={`text-[10px] flex-shrink-0 ml-2 ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                                                        {formatTime(conv.last_message_at ?? conv.created_at)}
                                                    </span>
                                                </div>
                                                {conv.properties?.title && (
                                                    <p className={`text-[10px] truncate mb-0.5 ${isActive ? 'text-gray-300' : 'text-[#D4A373]'}`}>
                                                        {conv.properties.title}
                                                    </p>
                                                )}
                                                <p className={`text-xs truncate ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {conv.last_message_text || 'No messages yet'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 px-4">
                                    <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm font-medium">No conversations yet.</p>
                                    <p className="text-gray-300 text-xs mt-1">
                                        {search ? 'No matches found.' : 'Start a chat from a property page.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Chat area ── */}
                    <div className={`${!showConversationList ? 'flex' : 'hidden'} lg:flex flex-1 flex-col h-full bg-gray-50/30`}>
                        {selectedConversation ? (
                            <>
                                {/* Chat header */}
                                <div className="p-4 lg:p-5 bg-white border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowConversationList(true)}
                                            className="lg:hidden p-2 hover:bg-gray-50 rounded-full"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <Avatar
                                            src={getOtherParticipant(selectedConversation).avatar_url}
                                            name={getOtherParticipant(selectedConversation).full_name}
                                            size="w-10 h-10"
                                        />
                                        <div>
                                            <h3 className="font-bold text-[#1B2430] text-sm">
                                                {getOtherParticipant(selectedConversation).full_name ?? 'Unknown'}
                                            </h3>
                                            {selectedConversation.properties?.title && (
                                                <p className="text-[10px] text-[#D4A373] truncate max-w-[200px]">
                                                    {selectedConversation.properties.title}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400"><Info className="w-5 h-5" /></button>
                                        <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400"><MoreVertical className="w-5 h-5" /></button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                                    {isMessagesLoading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="w-6 h-6 text-[#D4A373] animate-spin" />
                                        </div>
                                    ) : msgList.length > 0 ? (
                                        // Backend returns newest-first — reverse to show chronologically
                                        [...msgList].reverse().map((msg: any) => {
                                            const isMe = msg.sender_id === currentUser?.id;
                                            return (
                                                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    {!isMe && (
                                                        <Avatar
                                                            src={getOtherParticipant(selectedConversation).avatar_url}
                                                            name={getOtherParticipant(selectedConversation).full_name}
                                                            size="w-7 h-7"
                                                        />
                                                    )}
                                                    <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                            isMe
                                                                ? 'bg-[#D4A373] text-white rounded-br-sm'
                                                                : 'bg-white text-[#1B2430] border border-gray-100 rounded-bl-sm shadow-sm'
                                                        }`}>
                                                            {msg.is_deleted
                                                                ? <span className="italic opacity-50">Message deleted</span>
                                                                : (msg.body ?? msg.message)
                                                            }
                                                        </div>
                                                        <time className="text-[10px] text-gray-400 px-1">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </time>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                            <MessageCircle className="w-10 h-10 text-gray-200 mb-3" />
                                            <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Type your message here…"
                                            className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="p-3 bg-[#D4A373] text-white rounded-2xl hover:bg-[#C5A373] transition shadow-lg shadow-[#D4A373]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {sending
                                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                                : <Send className="w-5 h-5" />
                                            }
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 bg-[#D4A373]/10 rounded-full flex items-center justify-center mb-6">
                                    <MessageCircle className="w-10 h-10 text-[#D4A373]" />
                                </div>
                                <h2 className="text-xl font-black text-[#1B2430] mb-2">Your messages</h2>
                                <p className="text-gray-400 text-sm max-w-xs">
                                    Select a conversation or start one from a property page.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Messages;

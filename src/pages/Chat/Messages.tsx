import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import {
    useGetConversationsQuery,
    useGetMessagesQuery,
    useSendMessageMutation
} from '../../features/Api/ChatApi';
import Layout from '../../components/layout/Layout';
import {
    Search,
    Send,
    MessageCircle,
    MoreVertical,
    Info,
    ChevronLeft
} from 'lucide-react';

const Messages: React.FC = () => {
    const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.authSlice);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showConverationList, setShowConversationList] = useState(true);

    const { data: conversations = [], isLoading: isConversationsLoading } = useGetConversationsQuery(undefined, {
        skip: !isAuthenticated,
        pollingInterval: 10000,
    });

    const { data: messages = [], isLoading: isMessagesLoading } = useGetMessagesQuery(selectedConversationId || '', {
        skip: !selectedConversationId,
        pollingInterval: 5000,
    });

    const [sendMsg] = useSendMessageMutation();

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !selectedConversationId) return;

        try {
            await sendMsg({
                conversationId: selectedConversationId,
                message: newMessage.trim()
            }).unwrap();
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);
        setShowConversationList(false); // On mobile, hide list when conversation selected
    };

    // Auto-select first conversation if none selected on desktop
    useEffect(() => {
        if (conversations.length > 0 && !selectedConversationId && window.innerWidth > 1024) {
            setSelectedConversationId(conversations[0].id);
        }
    }, [conversations, selectedConversationId]);

    const getOtherParticipant = (conversation: any) => {
        return conversation.guest_id === currentUser?.user_id ? conversation.host : conversation.guest;
    };

    return (
        <Layout showSearch={false}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-140px)]">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 h-full flex overflow-hidden">

                    {/* Conversations Sidebar */}
                    <div className={`${showConverationList ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-96 border-r border-gray-100 h-full`}>
                        <div className="p-6 border-b border-gray-50">
                            <h1 className="text-2xl font-black text-[#1B2430] mb-4">Messages</h1>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#D4A373]/20"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {isConversationsLoading ? (
                                <div className="flex justify-center py-10">
                                    <span className="loading loading-spinner text-[#D4A373]"></span>
                                </div>
                            ) : conversations.length > 0 ? (
                                conversations.map((conv) => {
                                    const otherUser = getOtherParticipant(conv);
                                    const isActive = selectedConversationId === conv.id;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => handleSelectConversation(conv.id)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive
                                                ? 'bg-[#1B2430] text-white'
                                                : 'hover:bg-gray-50 text-[#1B2430]'
                                                }`}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={otherUser?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop'}
                                                    alt={otherUser?.full_name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                {conv.unread_count > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A373] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-sm truncate">{otherUser?.full_name}</span>
                                                    <span className={`text-[10px] ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {new Date(conv.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className={`text-xs truncate ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {conv.last_message || 'No messages yet'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 px-4">
                                    <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-500 text-sm italic">No conversations found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${!showConverationList ? 'flex' : 'hidden'} lg:flex flex-1 flex-col h-full bg-gray-50/30`}>
                        {selectedConversationId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 lg:p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setShowConversationList(true)}
                                            className="lg:hidden p-2 hover:bg-gray-50 rounded-full"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getOtherParticipant(selectedConversation)?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop'}
                                                alt="User"
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <h3 className="font-bold text-[#1B2430]">{getOtherParticipant(selectedConversation)?.full_name}</h3>
                                                <p className="text-[10px] text-green-600 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                    Online
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-gray-50 rounded-full text-gray-500"><Info className="w-5 h-5" /></button>
                                        <button className="p-2 hover:bg-gray-50 rounded-full text-gray-500"><MoreVertical className="w-5 h-5" /></button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {isMessagesLoading ? (
                                        <div className="flex justify-center py-10">
                                            <span className="loading loading-spinner text-[#D4A373]"></span>
                                        </div>
                                    ) : messages.length > 0 ? (
                                        messages.map((msg: any) => {
                                            const isFromMe = msg.sender_id === currentUser?.user_id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`chat ${isFromMe ? 'chat-end' : 'chat-start'}`}
                                                >
                                                    <div className="chat-image avatar">
                                                        <div className="w-10 rounded-full">
                                                            <img
                                                                src={isFromMe ? currentUser?.avatar_url || 'https://img.daisyui.com/images/profile/demo/anon@192.webp' : getOtherParticipant(selectedConversation)?.avatar_url}
                                                                alt="Avatar"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="chat-header text-[10px] opacity-50 mb-1">
                                                        {isFromMe ? 'You' : getOtherParticipant(selectedConversation)?.full_name}
                                                        <time className="ml-2">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                                                    </div>
                                                    <div className={`chat-bubble text-sm ${isFromMe
                                                        ? 'bg-[#D4A373] text-white'
                                                        : 'bg-white border border-gray-100 text-[#1B2430]'
                                                        }`}>
                                                        {msg.message}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-20">
                                            <p className="text-gray-400 italic text-sm">No messages in this conversation yet.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-6 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message here..."
                                            className="flex-1 px-6 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#D4A373]/20"
                                        />
                                        <button
                                            type="submit"
                                            className="p-3 bg-[#D4A373] text-white rounded-2xl hover:bg-[#E6B17E] transition shadow-lg shadow-[#D4A373]/20"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 bg-[#D4A373]/10 rounded-full flex items-center justify-center mb-6">
                                    <MessageCircle className="w-10 h-10 text-[#D4A373]" />
                                </div>
                                <h2 className="text-2xl font-black text-[#1B2430] mb-2">Select a conversation</h2>
                                <p className="text-gray-500 max-w-sm">
                                    Choose one of your existing conversations from the list on the left to start chatting.
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

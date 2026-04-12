import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Clock } from 'lucide-react';
import {
    useGetOrCreateConversationMutation,
    useGetMessagesQuery,
    useSendMessageMutation
} from '../../features/Api/ChatApi';

interface PropertyChatProps {
    propertyId: string;
    host: {
        id?: string;
        name: string;
        avatar: string;
        responseRate: number;
        responseTime: string;
        verified: boolean;
    };
    currentUser: any;
    isAuthenticated: boolean;
}

// Helper component for individual messages to prevent unnecessary re-renders
const MessageItem = React.memo(({ msg, isFromMe, hostName, hostAvatar, currentUserAvatar }: any) => {
    return (
        <div className={`chat ${isFromMe ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full ring-1 ring-gray-200">
                    <img
                        src={isFromMe ? currentUserAvatar || 'https://img.daisyui.com/images/profile/demo/anon@192.webp' : hostAvatar}
                        alt={isFromMe ? 'You' : hostName}
                        className="object-cover"
                    />
                </div>
            </div>
            <div className="chat-header text-[10px] mb-1 font-medium text-gray-400">
                {isFromMe ? 'You' : hostName}
                <time className="ml-2 font-normal">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
            </div>
            <div className={`chat-bubble text-sm min-h-0 py-2 px-3 ${isFromMe
                ? 'bg-[#D4A373] text-white shadow-sm'
                : 'bg-[#1B2430] text-white shadow-sm'
                }`}>
                {msg.message}
            </div>
            <div className="chat-footer opacity-40 text-[10px] mt-1">
                {msg.status}
            </div>
        </div>
    );
});

const PropertyChat: React.FC<PropertyChatProps> = ({
    propertyId,
    host,
    currentUser,
    isAuthenticated
}) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Chat API hooks
    const [getOrCreateConversation] = useGetOrCreateConversationMutation();
    const { data: realMessages = [], isLoading: isMessagesLoading } = useGetMessagesQuery(activeConversationId || '', {
        skip: !activeConversationId,
        pollingInterval: 3000,
    });
    const [sendMsg] = useSendMessageMutation();

    // Scroll to bottom on new messages
    useEffect(() => {
        if (isChatOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [realMessages, isChatOpen]);

    const handleOpenChat = useCallback(async () => {
        if (!isAuthenticated) {
            alert('Please login to chat with the host');
            return;
        }

        setIsChatOpen(prev => !prev);

        if (!isChatOpen && !activeConversationId) {
            try {
                const hostId = host.id || (host as any).owner_id || (host as any).ownerId;
                if (!hostId) {
                    console.error('Host ID is missing for property:', propertyId, 'Host object:', host);
                    toast.error('Unable to start chat: Host information is unavailable.');
                    return;
                }

                const conversation = await getOrCreateConversation({
                    propertyId,
                    hostId: hostId
                }).unwrap();
                setActiveConversationId(conversation.id);
            } catch (error) {
                console.error('Failed to create/get conversation:', error);
            }
        }
    }, [isAuthenticated, isChatOpen, activeConversationId, propertyId, host.id, getOrCreateConversation]);

    const handleSendMessage = useCallback(async () => {
        if (!message.trim() || !activeConversationId) return;

        const currentMsg = message.trim();
        setMessage(''); // Clear immediately for snappy UI

        try {
            await sendMsg({
                conversationId: activeConversationId,
                content: currentMsg,
            }).unwrap();
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessage(currentMsg); // Restore on failure
        }
    }, [message, activeConversationId, sendMsg]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
            <button
                onClick={handleOpenChat}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#D4A373]" />
                    <span className="font-medium text-[#1B2430]">Chat with host</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        {host.responseRate}% response rate
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                        {isChatOpen ? 'Close' : 'Open'}
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 overflow-hidden"
                    >
                        {/* Chat Messages */}
                        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {isMessagesLoading && realMessages.length === 0 ? (
                                <div className="flex justify-center py-20">
                                    <span className="loading loading-spinner text-[#D4A373] loading-lg"></span>
                                </div>
                            ) : realMessages.length > 0 ? (
                                realMessages.map((msg: any) => (
                                    <MessageItem
                                        key={msg.id}
                                        msg={msg}
                                        isFromMe={msg.sender_id === currentUser?.user_id}
                                        hostName={host.name}
                                        hostAvatar={host.avatar}
                                        currentUserAvatar={currentUser?.avatar_url}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                    <div className="w-12 h-12 bg-[#D4A373]/10 rounded-full flex items-center justify-center mb-3">
                                        <MessageCircle className="w-6 h-6 text-[#D4A373]" />
                                    </div>
                                    <p className="text-sm text-gray-500 italic">
                                        No messages yet. Say hello to {host.name}!
                                    </p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={`Message ${host.name}...`}
                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40 text-sm transition"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className={`p-2 rounded-lg transition shadow-sm ${!message.trim()
                                        ? 'bg-gray-100 text-gray-400'
                                        : 'bg-[#D4A373] text-white hover:bg-[#E6B17E]'
                                        }`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-1 mt-3">
                                <div className="p-1 bg-[#D4A373]/10 rounded">
                                    <Clock className="w-3 h-3 text-[#D4A373]" />
                                </div>
                                <p className="text-[10px] text-gray-500">
                                    Typically responds within {host.responseTime}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PropertyChat;

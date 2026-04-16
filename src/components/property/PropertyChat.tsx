// components/property/PropertyChat.tsx
// Chat widget embedded in the property detail page.
// Calls POST /api/chat/start to create/get a conversation, then polls for messages.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useStartConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
} from '../../features/Api/ChatApi';

interface PropertyChatProps {
  propertyId: string;
  host: {
    id?:          string;
    name:         string;
    avatar?:      string | null;
    verified?:    boolean;
  };
  currentUser:      any;
  isAuthenticated:  boolean;
}

const PropertyChat: React.FC<PropertyChatProps> = ({
  propertyId,
  host,
  currentUser,
  isAuthenticated,
}) => {
  const [isOpen, setIsOpen]                     = useState(false);
  const [conversationId, setConversationId]     = useState<string | null>(null);
  const [inputText, setInputText]               = useState('');
  const [initialMsg, setInitialMsg]             = useState('');
  const [startingUp, setStartingUp]             = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [startConversation] = useStartConversationMutation();
  const { data: msgData, isLoading: msgsLoading } = useGetMessagesQuery(
    { conversationId: conversationId ?? '', page: 1 },
    { skip: !conversationId, pollingInterval: 4000 },
  );
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  const messages = msgData?.messages ?? [];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // ── Open chat: start conversation if needed ───────────────────────────────
  const handleOpen = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to chat with the owner');
      return;
    }
    if (!host.id) {
      toast.error('Owner information is unavailable for this listing');
      return;
    }
    setIsOpen(true);
  }, [isAuthenticated, host.id]);

  const handleStartConversation = useCallback(async () => {
    if (!initialMsg.trim()) return;
    if (!host.id) return;
    setStartingUp(true);
    try {
      const res = await startConversation({
        property_id:     propertyId,
        recipient_id:    host.id,
        initial_message: initialMsg.trim(),
        type:            'property_enquiry',
      }).unwrap();
      setConversationId(res.conversation.id);
      setInitialMsg('');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not start conversation. Try again.');
    } finally {
      setStartingUp(false);
    }
  }, [initialMsg, host.id, propertyId, startConversation]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !conversationId) return;
    const text = inputText.trim();
    setInputText('');
    try {
      await sendMessage({ conversationId, body: text }).unwrap();
    } catch {
      setInputText(text);
      toast.error('Failed to send. Please try again.');
    }
  }, [inputText, conversationId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };
  const handleInitialKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStartConversation(); }
  };

  const avatarFallback = host.name?.charAt(0)?.toUpperCase() ?? 'O';
  const myId = currentUser?.id ?? currentUser?.user_id;

  return (
    <div className="border border-[#e5e5e5] rounded-2xl overflow-hidden shadow-sm">
      {/* Header toggle */}
      <button
        type="button"
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ff385c]/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4.5 h-4.5 text-[#ff385c]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#222222]">Chat with owner</p>
            <p className="text-[11px] text-[#6a6a6a]">{host.name}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#6a6a6a] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="border-t border-[#e5e5e5]">
          {/* Messages area */}
          <div className="h-72 overflow-y-auto flex flex-col gap-3 p-4 bg-[#fafafa]">
            {msgsLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 text-[#ff385c] animate-spin" />
              </div>
            ) : messages.length === 0 && conversationId ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-8 h-8 text-[#e5e5e5] mb-2" />
                <p className="text-xs text-[#6a6a6a]">No messages yet. Start the conversation!</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ff385c]/10 flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6 text-[#ff385c]" />
                </div>
                <p className="text-sm font-semibold text-[#222222] mb-1">Ask {host.name} anything</p>
                <p className="text-xs text-[#6a6a6a]">Type your first message below to get started</p>
              </div>
            ) : (
              // Messages — backend returns newest first, reverse to show oldest at top
              [...messages].reverse().map((msg) => {
                const isMe = msg.sender_id === myId;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center shrink-0 text-white text-[10px] font-bold overflow-hidden">
                        {host.avatar
                          ? <img src={host.avatar} alt={host.name} className="w-full h-full object-cover" />
                          : avatarFallback}
                      </div>
                    )}
                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#ff385c] text-white rounded-br-sm'
                          : 'bg-white text-[#222222] border border-[#e5e5e5] rounded-bl-sm'
                      }`}
                    >
                      {msg.is_deleted ? (
                        <span className="italic opacity-60">Message deleted</span>
                      ) : (
                        msg.body
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="bg-white border-t border-[#e5e5e5] p-3">
            {!conversationId ? (
              /* First message — starts the conversation */
              <div className="flex gap-2">
                <input
                  type="text"
                  value={initialMsg}
                  onChange={(e) => setInitialMsg(e.target.value)}
                  onKeyDown={handleInitialKeyDown}
                  placeholder={`Ask ${host.name} about this property…`}
                  className="flex-1 px-3 py-2 text-sm border border-[#e5e5e5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] bg-[#fafafa]"
                />
                <button
                  type="button"
                  onClick={handleStartConversation}
                  disabled={!initialMsg.trim() || startingUp}
                  className="px-4 py-2 bg-[#ff385c] text-white text-sm font-bold rounded-xl hover:bg-[#e00b41] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {startingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send
                </button>
              </div>
            ) : (
              /* Subsequent messages */
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="flex-1 px-3 py-2 text-sm border border-[#e5e5e5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] bg-[#fafafa]"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim() || sending}
                  className="p-2.5 bg-[#ff385c] text-white rounded-xl hover:bg-[#e00b41] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyChat;

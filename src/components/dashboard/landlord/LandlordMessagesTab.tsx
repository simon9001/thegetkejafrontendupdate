// components/dashboard/landlord/LandlordMessagesTab.tsx
// Full inbox + conversation view for landlord/owner side.
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Loader2, ChevronLeft, Building2, Search } from 'lucide-react';
import { SectionHeader } from '../shared';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from '../../../features/Api/ChatApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

const LandlordMessagesTab: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useSelector((s: RootState) => s.auth);
  const myId = (user as any)?.id ?? (user as any)?.user_id;

  const { data: convData, isLoading: convsLoading } = useGetConversationsQuery({ page: 1, limit: 50 });
  const conversations = convData?.conversations ?? [];

  const { data: msgData, isLoading: msgsLoading } = useGetMessagesQuery(
    { conversationId: activeId ?? '', page: 1 },
    { skip: !activeId, pollingInterval: 4000 },
  );
  const messages = msgData?.messages ?? [];

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeId) return;
    const text = inputText.trim();
    setInputText('');
    try {
      await sendMessage({ conversationId: activeId, body: text }).unwrap();
    } catch {
      setInputText(text);
    }
  }, [inputText, activeId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Active conversation metadata
  const activeConv = conversations.find((c) => c.id === activeId);

  // Filtered list
  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const title = c.properties?.title ?? '';
    const last  = c.last_message_text ?? '';
    return title.toLowerCase().includes(search.toLowerCase()) ||
           last.toLowerCase().includes(search.toLowerCase());
  });

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 36e5;
    if (diffH < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffH < 168) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Messages" sub="Chat with enquirers and tenants" />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 520 }}>
        <div className="flex h-[560px]">

          {/* ── Conversation list ─────────────────────────────────────────── */}
          <div className={`w-full md:w-[320px] border-r border-gray-100 flex flex-col shrink-0 ${activeId ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a6a6a] pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] bg-[#fafafa]"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {convsLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
                  <MessageCircle className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-sm text-[#6a6a6a]">No conversations yet</p>
                  <p className="text-xs text-[#9a9a9a] mt-1">Messages from enquirers will appear here</p>
                </div>
              ) : (
                filtered.map((conv) => {
                  const isActive  = conv.id === activeId;
                  const unread    = conv.unread_count ?? 0;
                  const propTitle = conv.properties?.title ?? 'Property';
                  const cover     = conv.properties?.property_media?.find((m) => m.is_cover)?.url
                                 ?? conv.properties?.property_media?.[0]?.url;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setActiveId(conv.id)}
                      className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${isActive ? 'bg-[#fff0f2]' : ''}`}
                    >
                      {/* Property thumbnail */}
                      <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        {cover
                          ? <img src={cover} alt="" className="w-full h-full object-cover" />
                          : <Building2 className="w-5 h-5 text-gray-300 m-2.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-semibold text-[#222222] truncate pr-2">{propTitle}</p>
                          <span className="text-[10px] text-[#9a9a9a] shrink-0">{formatTime(conv.last_message_at)}</span>
                        </div>
                        <p className="text-xs text-[#6a6a6a] truncate">{conv.last_message_text ?? 'No messages yet'}</p>
                      </div>
                      {unread > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] bg-[#ff385c] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Message pane ─────────────────────────────────────────────── */}
          <div className={`flex-1 flex flex-col ${activeId ? 'flex' : 'hidden md:flex'}`}>
            {!activeId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-[#ff385c]/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-[#ff385c]" />
                </div>
                <p className="text-sm font-semibold text-[#222222] mb-1">Select a conversation</p>
                <p className="text-xs text-[#6a6a6a]">Choose a conversation from the list to view messages</p>
              </div>
            ) : (
              <>
                {/* Conversation header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveId(null)}
                    className="md:hidden p-1 text-[#6a6a6a] hover:text-[#222222]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <p className="text-sm font-bold text-[#222222]">
                      {activeConv?.properties?.title ?? 'Conversation'}
                    </p>
                    <p className="text-[11px] text-[#6a6a6a]">
                      {activeConv?.type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4 bg-[#fafafa]">
                  {msgsLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-5 h-5 text-[#ff385c] animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-xs text-[#6a6a6a]">No messages yet</p>
                    </div>
                  ) : (
                    // Backend returns newest first → reverse for display
                    [...messages].reverse().map((msg) => {
                      const isMe = msg.sender_id === myId;
                      return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div
                            className={`max-w-[72%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-[#ff385c] text-white rounded-br-sm'
                                : 'bg-white text-[#222222] border border-[#e5e5e5] rounded-bl-sm'
                            }`}
                          >
                            {msg.is_deleted ? (
                              <span className="italic opacity-60 text-xs">Message deleted</span>
                            ) : (
                              msg.body
                            )}
                            <div className={`text-[10px] mt-0.5 ${isMe ? 'text-white/60' : 'text-[#9a9a9a]'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white border-t border-gray-100 p-3 shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] bg-[#fafafa]"
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
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandlordMessagesTab;

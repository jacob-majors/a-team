'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Plus, X, Hash, Loader2 } from 'lucide-react'
import { cn } from '@a-team/utils'
import { useRole } from '@/components/layout/role-switcher'
import { trpc } from '@/lib/trpc/client'
import { supabase } from '@a-team/db'

type ChannelType = 'public' | 'coaches' | 'admin'

interface Channel {
  id: string
  name: string
  description: string | null
  type: ChannelType
  createdAt: Date
}

interface Message {
  id: string
  channelId: string
  userId: string
  content: string
  createdAt: Date
}

const ROLE_CHANNEL_ACCESS: Record<string, ChannelType[]> = {
  admin: ['public', 'coaches', 'admin'],
  coach: ['public', 'coaches'],
  athlete: ['public'],
  parent: ['public'],
}

// Derive display name from userId (best effort — real impl would join users table)
function avatarLetters(userId: string) {
  return userId.slice(0, 2).toUpperCase()
}

export default function ChatPage() {
  const { role } = useRole()
  const allowedTypes = ROLE_CHANNEL_ACCESS[role] ?? ['public']

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // --- tRPC ---
  const { data: channels = [], refetch: refetchChannels } = trpc.chat.getChannels.useQuery()
  const visibleChannels = channels.filter((c) => allowedTypes.includes(c.type as ChannelType))
  const activeChannel = visibleChannels.find((c) => c.id === activeChannelId) ?? visibleChannels[0] ?? null

  const { data: fetchedMessages, isLoading: loadingMessages } = trpc.chat.getMessages.useQuery(
    { channelId: activeChannel?.id ?? '', limit: 100 },
    { enabled: !!activeChannel }
  )

  const sendMessage = trpc.chat.sendMessage.useMutation()
  const createChannel = trpc.chat.createChannel.useMutation({
    onSuccess: () => { refetchChannels(); setNewChannelName(''); setShowNewChannel(false) },
  })

  // Sync fetched messages into local state (oldest-first)
  useEffect(() => {
    if (fetchedMessages) {
      setMessages([...fetchedMessages].reverse().map(m => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })))
    }
  }, [fetchedMessages])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fix active channel when role/channels change
  useEffect(() => {
    if (!activeChannelId && visibleChannels[0]) {
      setActiveChannelId(visibleChannels[0].id)
    } else if (activeChannelId && !visibleChannels.find((c) => c.id === activeChannelId)) {
      setActiveChannelId(visibleChannels[0]?.id ?? null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, channels])

  // --- Supabase Realtime subscription ---
  const handleNewRealtimeMessage = useCallback((payload: { new: Record<string, unknown> }) => {
    const row = payload.new
    const msg: Message = {
      id: row['id'] as string,
      channelId: row['channel_id'] as string,
      userId: row['user_id'] as string,
      content: row['content'] as string,
      createdAt: new Date(row['created_at'] as string),
    }
    setMessages((prev) => {
      if (prev.find((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  useEffect(() => {
    if (!activeChannel) return
    const channel = supabase
      .channel(`chat:${activeChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${activeChannel.id}`,
        },
        handleNewRealtimeMessage
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChannel, handleNewRealtimeMessage])

  async function handleSend() {
    const content = input.trim()
    if (!content || !activeChannel) return
    setInput('')
    await sendMessage.mutateAsync({ channelId: activeChannel.id, content })
    // Message will appear via realtime subscription
  }

  async function handleCreateChannel(e: React.FormEvent) {
    e.preventDefault()
    const name = newChannelName.trim().toLowerCase().replace(/\s+/g, '-')
    if (!name) return
    const type = role === 'admin' ? 'public' : 'public'
    await createChannel.mutateAsync({ name, type: type as ChannelType })
  }

  return (
    <div className="flex h-[calc(100vh-9.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Channel list */}
      <div className="flex w-52 shrink-0 flex-col border-r border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="text-sm font-semibold text-gray-900">Channels</span>
          {(role === 'admin' || role === 'coach') && (
            <button
              onClick={() => setShowNewChannel(true)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {visibleChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannelId(channel.id)}
              className={cn(
                'w-full px-4 py-2.5 text-left transition-colors',
                activeChannel?.id === channel.id ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <p className="text-sm font-medium flex items-center gap-1">
                <Hash className="h-3 w-3 opacity-50" />{channel.name}
              </p>
              {channel.description && <p className="text-xs text-gray-400">{channel.description}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex flex-1 flex-col min-w-0">
        {activeChannel ? (
          <>
            <div className="border-b border-gray-200 px-6 py-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-1">
                <Hash className="h-4 w-4 text-gray-400" />{activeChannel.name}
              </h2>
              {activeChannel.description && (
                <p className="text-xs text-gray-500">{activeChannel.description}</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Hash className="h-10 w-10 text-gray-200" />
                  <p className="mt-3 font-medium text-gray-400">No messages yet</p>
                  <p className="text-sm text-gray-300">Be the first to say something in #{activeChannel.name}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => {
                    const isFirst = i === 0 || messages[i - 1]?.userId !== msg.userId
                    return (
                      <div key={msg.id} className={cn('flex gap-3', !isFirst && 'mt-0.5')}>
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          'bg-gray-200 text-gray-700',
                          !isFirst && 'opacity-0'
                        )}>
                          {avatarLetters(msg.userId)}
                        </div>
                        <div className="max-w-lg">
                          {isFirst && (
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">{msg.userId}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                          <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-3.5 py-2 text-sm text-gray-800">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message #${activeChannel.name}...`}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessage.isPending}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            No channels available
          </div>
        )}
      </div>

      {/* New channel modal */}
      {showNewChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowNewChannel(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">New Channel</h3>
              <button onClick={() => setShowNewChannel(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel name</label>
                <input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. race-day"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNewChannel(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
                <button type="submit" disabled={createChannel.isPending} className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white disabled:opacity-60">
                  {createChannel.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Plus, X, Hash } from 'lucide-react'
import { cn } from '@a-team/utils'
import { useRole } from '@/components/layout/role-switcher'

type ChannelType = 'public' | 'coaches' | 'admin'

interface Channel {
  id: string
  name: string
  description: string
  type: ChannelType
}

interface Message {
  id: string
  channelId: string
  userId: string
  userName: string
  content: string
  createdAt: Date
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: '1', name: 'all-team', description: 'Everyone', type: 'public' },
  { id: '2', name: 'coaches', description: 'Coaches & admins only', type: 'coaches' },
  { id: '3', name: 'riders', description: 'Athletes', type: 'public' },
  { id: '4', name: 'parents', description: 'Parent communication', type: 'public' },
]

const ROLE_CHANNEL_ACCESS: Record<string, ChannelType[]> = {
  admin: ['public', 'coaches', 'admin'],
  coach: ['public', 'coaches'],
  athlete: ['public'],
  parent: ['public'],
}

export default function ChatPage() {
  const { role } = useRole()
  const allowedTypes = ROLE_CHANNEL_ACCESS[role] ?? ['public']
  const visibleChannels = DEFAULT_CHANNELS.filter(c => allowedTypes.includes(c.type))

  const [activeChannel, setActiveChannel] = useState<Channel>(visibleChannels[0]!)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [input, setInput] = useState('')
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Ensure active channel is still visible when role changes
  useEffect(() => {
    const updated = channels.filter(c => allowedTypes.includes(c.type))
    if (!updated.find(c => c.id === activeChannel.id)) {
      setActiveChannel(updated[0]!)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChannel])

  function handleSend() {
    const content = input.trim()
    if (!content) return

    const msg: Message = {
      id: crypto.randomUUID(),
      channelId: activeChannel.id,
      userId: 'demo',
      userName: role.charAt(0).toUpperCase() + role.slice(1),
      content,
      createdAt: new Date(),
    }

    setMessages(prev => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] ?? []), msg],
    }))
    setInput('')
  }

  function handleCreateChannel(e: React.FormEvent) {
    e.preventDefault()
    const name = newChannelName.trim().toLowerCase().replace(/\s+/g, '-')
    if (!name) return
    const channel: Channel = { id: crypto.randomUUID(), name, description: '', type: 'public' }
    setChannels(prev => [...prev, channel])
    setActiveChannel(channel)
    setNewChannelName('')
    setShowNewChannel(false)
  }

  const channelMessages = messages[activeChannel.id] ?? []

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
          {channels.filter(c => allowedTypes.includes(c.type)).map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={cn(
                'w-full px-4 py-2.5 text-left transition-colors',
                activeChannel.id === channel.id ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
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
        <div className="border-b border-gray-200 px-6 py-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-1">
            <Hash className="h-4 w-4 text-gray-400" />{activeChannel.name}
          </h2>
          {activeChannel.description && (
            <p className="text-xs text-gray-500">{activeChannel.description}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {channelMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Hash className="h-10 w-10 text-gray-200" />
              <p className="mt-3 font-medium text-gray-400">No messages yet</p>
              <p className="text-sm text-gray-300">Be the first to say something in #{activeChannel.name}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {channelMessages.map((msg) => {
                const isMe = msg.userId === 'demo'
                return (
                  <div key={msg.id} className={cn('flex gap-3', isMe && 'flex-row-reverse')}>
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      isMe ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
                    )}>
                      {msg.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className={cn('max-w-xs sm:max-w-sm', isMe && 'items-end flex flex-col')}>
                      <div className={cn('flex items-baseline gap-2 mb-1', isMe && 'flex-row-reverse')}>
                        <span className="text-xs font-medium text-gray-700">{msg.userName}</span>
                        <span className="text-xs text-gray-400">
                          {msg.createdAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={cn(
                        'rounded-2xl px-3.5 py-2 text-sm',
                        isMe ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      )}>
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
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Message #${activeChannel.name}...`}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New channel modal */}
      {showNewChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowNewChannel(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">New Channel</h3>
              <button onClick={() => setShowNewChannel(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel name</label>
                <input
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  placeholder="e.g. race-day"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNewChannel(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

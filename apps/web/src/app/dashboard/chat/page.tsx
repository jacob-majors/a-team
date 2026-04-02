'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send, Plus, X, Hash, Loader2, SmilePlus, CornerDownRight,
  MoreHorizontal, Pencil, Trash2, AtSign, ChevronDown,
} from 'lucide-react'
import { cn } from '@a-team/utils'
import { useRole } from '@/components/layout/role-switcher'
import { trpc } from '@/lib/trpc/client'
import { createClient } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────────────────

type ChannelType = 'public' | 'coaches' | 'admin'

interface Channel {
  id: string
  name: string
  description: string | null
  type: ChannelType
}

interface Reaction {
  emoji: string
  users: string[]   // userIds
  count: number
}

interface ReplySnippet {
  id: string
  userName: string
  content: string
}

interface Message {
  id: string
  channelId: string
  userId: string
  userName: string
  avatarInitials: string
  content: string
  replyTo: ReplySnippet | null
  reactions: Reaction[]
  edited: boolean
  deleted: boolean
  createdAt: Date
}

type MentionUser = { id: string; name: string }

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_CHANNEL_ACCESS: Record<string, ChannelType[]> = {
  admin:   ['public', 'coaches', 'admin'],
  coach:   ['public', 'coaches'],
  athlete: ['public'],
  parent:  ['public'],
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '😮', '👏', '🤙']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function groupReactions(raw: { emoji: string; userId: string }[]): Reaction[] {
  const map = new Map<string, string[]>()
  for (const r of raw) {
    if (!map.has(r.emoji)) map.set(r.emoji, [])
    map.get(r.emoji)!.push(r.userId)
  }
  return Array.from(map.entries()).map(([emoji, users]) => ({ emoji, users, count: users.length }))
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { role } = useRole()
  const supabase = createClient()
  const allowedTypes = ROLE_CHANNEL_ACCESS[role] ?? ['public']

  // Data from tRPC
  const { data: channels = [], refetch: refetchChannels } = trpc.chat.getChannels.useQuery()
  const visibleChannels = (channels as Channel[]).filter(c => allowedTypes.includes(c.type))
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const activeChannel = visibleChannels.find(c => c.id === activeChannelId) ?? visibleChannels[0] ?? null

  // Current user
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [allUsers, setAllUsers] = useState<MentionUser[]>([])

  // Messages
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  // Input
  const [input, setInput] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // @mention picker
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)

  // Emoji picker
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null)
  const [hoverMsg, setHoverMsg] = useState<string | null>(null)

  // New channel
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ── Load current user ────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setMyUserId(data.user.id)
    })
    supabase.from('users').select('id, name').then(({ data }) => {
      if (data) setAllUsers(data as MentionUser[])
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fix active channel ───────────────────────────────────────────
  useEffect(() => {
    if (!activeChannelId && visibleChannels[0]) {
      setActiveChannelId(visibleChannels[0].id)
    } else if (activeChannelId && !visibleChannels.find(c => c.id === activeChannelId)) {
      setActiveChannelId(visibleChannels[0]?.id ?? null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, channels])

  // ── Load messages when channel changes ──────────────────────────
  useEffect(() => {
    if (!activeChannel) return
    setMessages([])
    setLoadingMsgs(true)

    supabase
      .from('chat_messages')
      .select(`
        id, channel_id, user_id, content, reply_to_id, edited, deleted, created_at,
        users!chat_messages_user_id_fkey ( name ),
        chat_reactions ( emoji, user_id )
      `)
      .eq('channel_id', activeChannel.id)
      .eq('deleted', false)
      .order('created_at', { ascending: true })
      .limit(150)
      .then(({ data }) => {
        setLoadingMsgs(false)
        if (!data) return

        // Build a quick id→name map for reply snippets
        const msgMap = new Map<string, { userName: string; content: string }>()
        const parsed: Message[] = data.map((row: any) => {
          const userName = row.users?.name ?? 'Unknown'
          const msg: Message = {
            id: row.id,
            channelId: row.channel_id,
            userId: row.user_id,
            userName,
            avatarInitials: initials(userName),
            content: row.content,
            replyTo: null,
            reactions: groupReactions((row.chat_reactions ?? []).map((r: any) => ({ emoji: r.emoji, userId: r.user_id }))),
            edited: row.edited,
            deleted: row.deleted,
            createdAt: new Date(row.created_at),
          }
          msgMap.set(row.id, { userName, content: row.content })
          return msg
        })

        // Resolve replyTo snippets
        const replyIds = data.filter((r: any) => r.reply_to_id).map((r: any) => r.reply_to_id as string)
        if (replyIds.length > 0) {
          supabase
            .from('chat_messages')
            .select('id, content, users!chat_messages_user_id_fkey ( name )')
            .in('id', replyIds)
            .then(({ data: replyData }) => {
              const replyMap = new Map<string, ReplySnippet>()
              ;(replyData ?? []).forEach((r: any) => {
                replyMap.set(r.id, { id: r.id, userName: r.users?.name ?? 'Unknown', content: r.content })
              })
              setMessages(parsed.map((m, i) => ({
                ...m,
                replyTo: (data[i] as any).reply_to_id ? (replyMap.get((data[i] as any).reply_to_id) ?? null) : null,
              })))
            })
        } else {
          setMessages(parsed)
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel?.id])

  // ── Realtime subscription ────────────────────────────────────────
  const handleNewMessage = useCallback((payload: any) => {
    const row = payload.new
    supabase
      .from('users')
      .select('name')
      .eq('id', row.user_id)
      .single()
      .then(({ data: u }) => {
        const userName = u?.name ?? 'Unknown'
        const msg: Message = {
          id: row.id,
          channelId: row.channel_id,
          userId: row.user_id,
          userName,
          avatarInitials: initials(userName),
          content: row.content,
          replyTo: null,
          reactions: [],
          edited: row.edited ?? false,
          deleted: row.deleted ?? false,
          createdAt: new Date(row.created_at),
        }
        if (row.reply_to_id) {
          supabase
            .from('chat_messages')
            .select('id, content, users!chat_messages_user_id_fkey ( name )')
            .eq('id', row.reply_to_id)
            .single()
            .then(({ data: replyRow }) => {
              msg.replyTo = replyRow ? { id: replyRow.id, userName: (replyRow as any).users?.name ?? 'Unknown', content: replyRow.content } : null
              setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
            })
        } else {
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
        }
      })
  }, [supabase])

  const handleUpdateMessage = useCallback((payload: any) => {
    const row = payload.new
    setMessages(prev => prev.map(m =>
      m.id === row.id
        ? { ...m, content: row.content, edited: row.edited, deleted: row.deleted }
        : m
    ))
  }, [])

  const handleNewReaction = useCallback((payload: any) => {
    const row = payload.new
    setMessages(prev => prev.map(m => {
      if (m.id !== row.message_id) return m
      const existing = m.reactions.find(r => r.emoji === row.emoji)
      if (existing) {
        if (existing.users.includes(row.user_id)) return m
        return { ...m, reactions: m.reactions.map(r => r.emoji === row.emoji ? { ...r, users: [...r.users, row.user_id], count: r.count + 1 } : r) }
      }
      return { ...m, reactions: [...m.reactions, { emoji: row.emoji, users: [row.user_id], count: 1 }] }
    }))
  }, [])

  const handleDeleteReaction = useCallback((payload: any) => {
    const row = payload.old
    setMessages(prev => prev.map(m => {
      if (m.id !== row.message_id) return m
      return {
        ...m,
        reactions: m.reactions
          .map(r => r.emoji === row.emoji ? { ...r, users: r.users.filter(u => u !== row.user_id), count: r.count - 1 } : r)
          .filter(r => r.count > 0),
      }
    }))
  }, [])

  useEffect(() => {
    if (!activeChannel) return
    const chan = supabase
      .channel(`chat:${activeChannel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${activeChannel.id}` }, handleNewMessage)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${activeChannel.id}` }, handleUpdateMessage)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_reactions' }, handleNewReaction)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_reactions' }, handleDeleteReaction)
      .subscribe()
    return () => { supabase.removeChannel(chan) }
  }, [activeChannel, supabase, handleNewMessage, handleUpdateMessage, handleNewReaction, handleDeleteReaction])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── @mention detection ───────────────────────────────────────────
  function handleInputChange(val: string) {
    setInput(val)
    const lastAt = val.lastIndexOf('@')
    if (lastAt !== -1) {
      const after = val.slice(lastAt + 1)
      if (!after.includes(' ') && after.length <= 20) {
        setMentionQuery(after.toLowerCase())
        setMentionIndex(0)
        return
      }
    }
    setMentionQuery(null)
  }

  const mentionMatches = mentionQuery !== null
    ? allUsers.filter(u => u.name.toLowerCase().includes(mentionQuery)).slice(0, 6)
    : []

  function insertMention(user: MentionUser) {
    const lastAt = input.lastIndexOf('@')
    setInput(input.slice(0, lastAt) + `@${user.name} `)
    setMentionQuery(null)
    inputRef.current?.focus()
  }

  // ── Send message ────────────────────────────────────────────────
  async function handleSend() {
    const content = input.trim()
    if (!content || !activeChannel || !myUserId) return
    setInput('')
    setReplyTo(null)
    setMentionQuery(null)

    await supabase.from('chat_messages').insert({
      id: crypto.randomUUID(),
      channel_id: activeChannel.id,
      user_id: myUserId,
      content,
      reply_to_id: replyTo?.id ?? null,
    })
  }

  // ── Edit message ────────────────────────────────────────────────
  async function handleEdit(msg: Message) {
    setEditingId(msg.id)
    setEditContent(msg.content)
  }

  async function submitEdit() {
    if (!editingId || !editContent.trim()) return
    await supabase.from('chat_messages').update({ content: editContent.trim(), edited: true }).eq('id', editingId)
    setEditingId(null)
    setEditContent('')
  }

  // ── Delete message ───────────────────────────────────────────────
  async function handleDelete(msgId: string) {
    await supabase.from('chat_messages').update({ deleted: true, content: '[deleted]' }).eq('id', msgId)
  }

  // ── Toggle reaction ──────────────────────────────────────────────
  async function toggleReaction(msgId: string, emoji: string) {
    if (!myUserId) return
    setEmojiPickerFor(null)
    const msg = messages.find(m => m.id === msgId)
    const alreadyReacted = msg?.reactions.find(r => r.emoji === emoji)?.users.includes(myUserId)
    if (alreadyReacted) {
      await supabase.from('chat_reactions').delete().match({ message_id: msgId, user_id: myUserId, emoji })
    } else {
      await supabase.from('chat_reactions').insert({ id: crypto.randomUUID(), message_id: msgId, user_id: myUserId, emoji })
    }
  }

  // ── Create channel ───────────────────────────────────────────────
  async function handleCreateChannel(e: React.FormEvent) {
    e.preventDefault()
    const name = newChannelName.trim().toLowerCase().replace(/\s+/g, '-')
    if (!name || !myUserId) return
    await supabase.from('chat_channels').insert({ id: crypto.randomUUID(), name, type: 'public', created_by: myUserId })
    setNewChannelName('')
    setShowNewChannel(false)
    refetchChannels()
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionMatches.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => (i + 1) % mentionMatches.length); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setMentionIndex(i => (i - 1 + mentionMatches.length) % mentionMatches.length); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionMatches[mentionIndex]!); return }
      if (e.key === 'Escape') { setMentionQuery(null); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-9.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* ── Channel sidebar ─── */}
      <div className="flex w-56 shrink-0 flex-col border-r border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="text-sm font-semibold text-gray-900">Channels</span>
          {(role === 'admin' || role === 'coach') && (
            <button onClick={() => setShowNewChannel(true)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {visibleChannels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannelId(ch.id)}
              className={cn(
                'w-full px-4 py-2.5 text-left transition-colors',
                activeChannel?.id === ch.id ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <p className="text-sm font-medium flex items-center gap-1">
                <Hash className="h-3 w-3 opacity-50" />{ch.name}
              </p>
              {ch.description && <p className="text-xs text-gray-400 truncate">{ch.description}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main area ─── */}
      <div className="flex flex-1 flex-col min-w-0">
        {activeChannel ? (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">{activeChannel.name}</h2>
              {activeChannel.description && <span className="text-xs text-gray-400">— {activeChannel.description}</span>}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loadingMsgs ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Hash className="h-10 w-10 text-gray-200" />
                  <p className="mt-3 font-medium text-gray-400">No messages yet</p>
                  <p className="text-sm text-gray-300">Be the first in #{activeChannel.name}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg, i) => {
                    const isMe = msg.userId === myUserId
                    const prevMsg = messages[i - 1]
                    const grouped = prevMsg && prevMsg.userId === msg.userId &&
                      msg.createdAt.getTime() - prevMsg.createdAt.getTime() < 5 * 60 * 1000
                    const isHovered = hoverMsg === msg.id

                    return (
                      <div
                        key={msg.id}
                        className={cn('group relative flex gap-3 rounded-lg px-2 py-0.5 hover:bg-gray-50', grouped ? 'items-start' : 'items-start mt-3')}
                        onMouseEnter={() => setHoverMsg(msg.id)}
                        onMouseLeave={() => { setHoverMsg(null); setEmojiPickerFor(null) }}
                      >
                        {/* Avatar */}
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5', grouped && 'opacity-0', isMe ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700')}>
                          {msg.avatarInitials}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Sender + time */}
                          {!grouped && (
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className={cn('text-sm font-semibold', isMe ? 'text-orange-600' : 'text-gray-800')}>
                                {msg.userName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {msg.createdAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </span>
                              {msg.edited && <span className="text-xs text-gray-400">(edited)</span>}
                            </div>
                          )}

                          {/* Reply snippet */}
                          {msg.replyTo && !msg.deleted && (
                            <div className="mb-1 flex items-start gap-1.5 rounded-md border-l-2 border-orange-300 bg-orange-50 px-2 py-1 text-xs">
                              <CornerDownRight className="h-3 w-3 text-orange-400 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-medium text-orange-700">{msg.replyTo.userName}</span>
                                <span className="ml-1 text-gray-500 truncate">{msg.replyTo.content.slice(0, 80)}</span>
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          {editingId === msg.id ? (
                            <div className="flex gap-2 items-end">
                              <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit() } if (e.key === 'Escape') { setEditingId(null) } }}
                                className="flex-1 rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex flex-col gap-1">
                                <button onClick={submitEdit} className="rounded px-2 py-1 bg-orange-500 text-white text-xs">Save</button>
                                <button onClick={() => setEditingId(null)} className="rounded px-2 py-1 bg-gray-100 text-gray-600 text-xs">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p className={cn('text-sm leading-relaxed break-words whitespace-pre-wrap', msg.deleted ? 'italic text-gray-400' : 'text-gray-800')}>
                              {msg.content.split(/(@\w[\w\s]*)/g).map((part, j) =>
                                part.startsWith('@') ? (
                                  <span key={j} className="font-semibold text-orange-600 bg-orange-50 rounded px-0.5">{part}</span>
                                ) : part
                              )}
                            </p>
                          )}

                          {/* Reactions */}
                          {msg.reactions.length > 0 && !msg.deleted && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {msg.reactions.map(r => (
                                <button
                                  key={r.emoji}
                                  onClick={() => toggleReaction(msg.id, r.emoji)}
                                  className={cn(
                                    'flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors',
                                    r.users.includes(myUserId ?? '')
                                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                  )}
                                  title={r.users.length + ' reaction' + (r.users.length !== 1 ? 's' : '')}
                                >
                                  {r.emoji} <span className="text-xs font-medium">{r.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Hover actions */}
                        {isHovered && !msg.deleted && editingId !== msg.id && (
                          <div className="absolute right-2 top-0 flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white shadow-sm px-1 py-0.5 -translate-y-1/2">
                            {/* Quick reactions */}
                            {QUICK_REACTIONS.slice(0, 4).map(emoji => (
                              <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                                className="rounded p-1 text-base hover:bg-gray-100">{emoji}</button>
                            ))}
                            {/* More reactions */}
                            <button onClick={() => setEmojiPickerFor(emojiPickerFor === msg.id ? null : msg.id)}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100">
                              <SmilePlus className="h-4 w-4" />
                            </button>
                            {/* Reply */}
                            <button onClick={() => { setReplyTo(msg); inputRef.current?.focus() }}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100">
                              <CornerDownRight className="h-4 w-4" />
                            </button>
                            {/* Mention */}
                            <button onClick={() => { setInput(i => i + `@${msg.userName} `); inputRef.current?.focus() }}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100">
                              <AtSign className="h-4 w-4" />
                            </button>
                            {/* Edit / Delete (own messages or admin) */}
                            {(isMe || role === 'admin') && (
                              <>
                                {isMe && (
                                  <button onClick={() => handleEdit(msg)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                )}
                                <button onClick={() => handleDelete(msg.id)} className="rounded p-1 text-red-400 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Extended emoji picker */}
                        {emojiPickerFor === msg.id && (
                          <div className="absolute right-2 top-8 z-10 rounded-xl border border-gray-200 bg-white shadow-lg p-2">
                            <div className="grid grid-cols-4 gap-1">
                              {QUICK_REACTIONS.map(emoji => (
                                <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                                  className="rounded p-1.5 text-xl hover:bg-gray-100">{emoji}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* ── Input area ─── */}
            <div className="border-t border-gray-200 px-4 py-3">
              {/* Reply preview */}
              {replyTo && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-200 px-3 py-1.5 text-xs">
                  <CornerDownRight className="h-3 w-3 text-orange-400 shrink-0" />
                  <span className="text-orange-700 font-medium">{replyTo.userName}:</span>
                  <span className="text-gray-600 truncate flex-1">{replyTo.content.slice(0, 60)}</span>
                  <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* @mention dropdown */}
              {mentionMatches.length > 0 && (
                <div className="mb-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                  {mentionMatches.map((u, i) => (
                    <button
                      key={u.id}
                      onClick={() => insertMention(u)}
                      className={cn('flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-orange-50', i === mentionIndex && 'bg-orange-50 text-orange-700')}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                        {initials(u.name)}
                      </div>
                      {u.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${activeChannel.name}… (@ to mention)`}
                    rows={1}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
                    style={{ minHeight: '2.75rem', maxHeight: '8rem' }}
                    onInput={e => {
                      const t = e.currentTarget
                      t.style.height = 'auto'
                      t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                    }}
                  />
                  <button
                    onClick={() => { setInput(i => i + '@'); inputRef.current?.focus(); setMentionQuery('') }}
                    className="absolute right-3 bottom-2.5 text-gray-400 hover:text-orange-500"
                  >
                    <AtSign className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">Enter to send · Shift+Enter for new line · @ to mention</p>
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
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">New Channel</h3>
              <button onClick={() => setShowNewChannel(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel name</label>
                <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)}
                  placeholder="e.g. race-day" autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
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

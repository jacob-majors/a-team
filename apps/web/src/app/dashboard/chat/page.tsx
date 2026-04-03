'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send, Plus, X, Hash, Loader2, SmilePlus, CornerDownRight,
  Pencil, Trash2, AtSign,
} from 'lucide-react'
import { cn } from '@a-team/utils'
import { useRole } from '@/components/layout/role-switcher'
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
  users: string[]
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

const DEV_USER = { id: 'dev-user', name: 'jacob.majors' }

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

  const [channels, setChannels] = useState<Channel[]>([])
  const visibleChannels = channels.filter(c => allowedTypes.includes(c.type))
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const activeChannel = visibleChannels.find(c => c.id === activeChannelId) ?? visibleChannels[0] ?? null

  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [myName, setMyName] = useState<string>('You')
  const [allUsers, setAllUsers] = useState<MentionUser[]>([])

  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  const [input, setInput] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)

  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null)
  const [hoverMsg, setHoverMsg] = useState<string | null>(null)

  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')

  // Typing indicators: map of userId -> name for who is typing
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({})
  const typingTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const isTypingRef = useRef(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ── Load current user ────────────────────────────────────────────
  useEffect(() => {
    const devBypass = typeof document !== 'undefined' && document.cookie.includes('dev_bypass=1')
    if (devBypass) {
      setMyUserId(DEV_USER.id)
      setMyName(DEV_USER.name)
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setMyUserId(data.user.id)
          supabase.from('users').select('name').eq('id', data.user.id).single().then(({ data: u }) => {
            if (u?.name) setMyName(u.name)
          })
        }
      })
    }
    supabase.from('users').select('id, name').then(({ data }) => {
      if (data) setAllUsers(data as MentionUser[])
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Load channels ────────────────────────────────────────────────
  useEffect(() => {
    supabase.from('chat_channels').select('id, name, description, type').order('name').then(({ data }) => {
      if (data) setChannels(data as Channel[])
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

  // ── Load messages ────────────────────────────────────────────────
  useEffect(() => {
    if (!activeChannel) return
    setMessages([])
    setLoadingMsgs(true)
    setTypingUsers({})

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
      .then(async ({ data }) => {
        setLoadingMsgs(false)
        if (!data) return

        const parsed: Message[] = data.map((row: any) => {
          const userName = (row.users as any)?.name ?? 'Unknown'
          return {
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
        })

        // Resolve replyTo snippets
        const replyIds = data.filter((r: any) => r.reply_to_id).map((r: any) => r.reply_to_id as string)
        if (replyIds.length > 0) {
          const { data: replyData } = await supabase
            .from('chat_messages')
            .select('id, content, users!chat_messages_user_id_fkey ( name )')
            .in('id', replyIds)
          const replyMap = new Map<string, ReplySnippet>()
          ;(replyData ?? []).forEach((r: any) => {
            replyMap.set(r.id, { id: r.id, userName: (r.users as any)?.name ?? 'Unknown', content: r.content })
          })
          setMessages(parsed.map((m, i) => ({
            ...m,
            replyTo: (data[i] as any).reply_to_id ? (replyMap.get((data[i] as any).reply_to_id) ?? null) : null,
          })))
        } else {
          setMessages(parsed)
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel?.id])

  // ── Realtime: messages + reactions ──────────────────────────────
  const handleNewMessage = useCallback((payload: any) => {
    const row = payload.new
    supabase.from('users').select('name').eq('id', row.user_id).single().then(({ data: u }) => {
      const userName = u?.name ?? 'Unknown'
      const msg: Message = {
        id: row.id, channelId: row.channel_id, userId: row.user_id,
        userName, avatarInitials: initials(userName), content: row.content,
        replyTo: null, reactions: [], edited: row.edited ?? false, deleted: row.deleted ?? false,
        createdAt: new Date(row.created_at),
      }
      if (row.reply_to_id) {
        supabase.from('chat_messages').select('id, content, users!chat_messages_user_id_fkey ( name )').eq('id', row.reply_to_id).single().then(({ data: rr }) => {
          msg.replyTo = rr ? { id: rr.id, userName: (rr as any).users?.name ?? 'Unknown', content: rr.content } : null
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
      m.id === row.id ? { ...m, content: row.content, edited: row.edited, deleted: row.deleted } : m
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
  }, [activeChannel?.id, handleNewMessage, handleUpdateMessage, handleNewReaction, handleDeleteReaction])

  // ── Typing indicators via Realtime Presence ──────────────────────
  useEffect(() => {
    if (!activeChannel || !myUserId) return

    const presenceChan = supabase.channel(`typing:${activeChannel.id}`, {
      config: { presence: { key: myUserId } },
    })

    presenceChan
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChan.presenceState<{ name: string; typing: boolean }>()
        const typing: Record<string, string> = {}
        for (const [uid, presences] of Object.entries(state)) {
          if (uid === myUserId) continue
          const latest = (presences as any[])[0]
          if (latest?.typing) typing[uid] = latest.name ?? uid
        }
        setTypingUsers(typing)
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setTypingUsers(prev => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChan.track({ name: myName, typing: false })
        }
      })

    presenceChannelRef.current = presenceChan
    return () => {
      supabase.removeChannel(presenceChan)
      presenceChannelRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel?.id, myUserId, myName])

  async function broadcastTyping(typing: boolean) {
    if (!presenceChannelRef.current) return
    isTypingRef.current = typing
    await presenceChannelRef.current.track({ name: myName, typing })
  }

  // Stop typing after 2s of no input
  function scheduleStopTyping() {
    if (typingTimeouts.current['self']) clearTimeout(typingTimeouts.current['self'])
    typingTimeouts.current['self'] = setTimeout(() => {
      if (isTypingRef.current) broadcastTyping(false)
    }, 2000)
  }

  // ── Auto-scroll ──────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── @mention detection ───────────────────────────────────────────
  function handleInputChange(val: string) {
    setInput(val)
    if (val.trim()) {
      if (!isTypingRef.current) broadcastTyping(true)
      scheduleStopTyping()
    } else {
      broadcastTyping(false)
    }

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
    broadcastTyping(false)

    await supabase.from('chat_messages').insert({
      id: crypto.randomUUID(),
      channel_id: activeChannel.id,
      user_id: myUserId,
      content,
      reply_to_id: replyTo?.id ?? null,
    })
  }

  // ── Edit / Delete ────────────────────────────────────────────────
  function handleEdit(msg: Message) {
    setEditingId(msg.id)
    setEditContent(msg.content)
  }

  async function submitEdit() {
    if (!editingId || !editContent.trim()) return
    await supabase.from('chat_messages').update({ content: editContent.trim(), edited: true }).eq('id', editingId)
    setEditingId(null)
    setEditContent('')
  }

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
    const { data } = await supabase.from('chat_channels').insert({ id: crypto.randomUUID(), name, type: 'public', created_by: myUserId }).select().single()
    if (data) setChannels(prev => [...prev, data as Channel].sort((a, b) => a.name.localeCompare(b.name)))
    setNewChannelName('')
    setShowNewChannel(false)
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

  const typingNames = Object.values(typingUsers)

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-9.5rem)] overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-sm">

      {/* ── Channel sidebar ─── */}
      <div className="flex w-52 shrink-0 flex-col border-r border-[rgb(var(--border))]">
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-3">
          <span className="text-sm font-semibold text-[rgb(var(--text))]">Channels</span>
          {(role === 'admin' || role === 'coach') && (
            <button onClick={() => setShowNewChannel(true)} className="rounded p-1 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]">
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
                'w-full px-4 py-2 text-left transition-colors',
                activeChannel?.id === ch.id
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                  : 'text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]'
              )}
            >
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Hash className="h-3 w-3 opacity-50" />{ch.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main area ─── */}
      <div className="flex flex-1 flex-col min-w-0">
        {activeChannel ? (
          <>
            {/* Header */}
            <div className="border-b border-[rgb(var(--border))] px-6 py-3 flex items-center gap-2">
              <Hash className="h-4 w-4 text-[rgb(var(--text-muted))]" />
              <h2 className="font-semibold text-[rgb(var(--text))]">{activeChannel.name}</h2>
              {activeChannel.description && (
                <span className="text-xs text-[rgb(var(--text-muted))]">— {activeChannel.description}</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loadingMsgs ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--text-muted))]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Hash className="h-10 w-10 text-[rgb(var(--border))]" />
                  <p className="mt-3 font-medium text-[rgb(var(--text-muted))]">No messages yet</p>
                  <p className="text-sm text-[rgb(var(--text-muted))] opacity-60">Be the first in #{activeChannel.name}</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {messages.map((msg, i) => {
                    const isMe = msg.userId === myUserId
                    const prevMsg = messages[i - 1]
                    const grouped = prevMsg && prevMsg.userId === msg.userId &&
                      msg.createdAt.getTime() - prevMsg.createdAt.getTime() < 5 * 60 * 1000
                    const isHovered = hoverMsg === msg.id

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'group relative flex gap-3 rounded-lg px-2 py-0.5 hover:bg-[rgb(var(--bg-secondary))]',
                          grouped ? 'items-start' : 'items-start mt-3'
                        )}
                        onMouseEnter={() => setHoverMsg(msg.id)}
                        onMouseLeave={() => { setHoverMsg(null); setEmojiPickerFor(null) }}
                      >
                        {/* Avatar */}
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5',
                          grouped && 'opacity-0',
                          isMe ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-muted))]'
                        )}>
                          {msg.avatarInitials}
                        </div>

                        <div className="flex-1 min-w-0">
                          {!grouped && (
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className={cn('text-sm font-semibold', isMe ? 'text-brand-600 dark:text-brand-400' : 'text-[rgb(var(--text))]')}>
                                {msg.userName}
                              </span>
                              <span className="text-xs text-[rgb(var(--text-muted))]">
                                {msg.createdAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </span>
                              {msg.edited && <span className="text-xs text-[rgb(var(--text-muted))] opacity-60">(edited)</span>}
                            </div>
                          )}

                          {/* Reply snippet */}
                          {msg.replyTo && !msg.deleted && (
                            <div className="mb-1 flex items-start gap-1.5 rounded-md border-l-2 border-brand-300 bg-brand-50 dark:bg-brand-950/50 px-2 py-1 text-xs">
                              <CornerDownRight className="h-3 w-3 text-brand-400 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-medium text-brand-700 dark:text-brand-300">{msg.replyTo.userName}</span>
                                <span className="ml-1 text-[rgb(var(--text-muted))] truncate">{msg.replyTo.content.slice(0, 80)}</span>
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          {editingId === msg.id ? (
                            <div className="flex gap-2 items-end">
                              <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit() }
                                  if (e.key === 'Escape') setEditingId(null)
                                }}
                                className="flex-1 rounded-lg border border-brand-300 bg-[rgb(var(--bg-secondary))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex flex-col gap-1">
                                <button onClick={submitEdit} className="rounded px-2 py-1 bg-brand-500 text-white text-xs">Save</button>
                                <button onClick={() => setEditingId(null)} className="rounded px-2 py-1 bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-muted))] text-xs">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p className={cn('text-sm leading-relaxed break-words whitespace-pre-wrap', msg.deleted ? 'italic text-[rgb(var(--text-muted))]' : 'text-[rgb(var(--text))]')}>
                              {msg.content.split(/(@[\w][\w\s]*)/g).map((part, j) =>
                                part.startsWith('@') ? (
                                  <span key={j} className="font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 rounded px-0.5">{part}</span>
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
                                      ? 'border-brand-300 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
                                      : 'border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-secondary))]'
                                  )}
                                >
                                  {r.emoji} <span className="text-xs font-medium">{r.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Hover toolbar */}
                        {isHovered && !msg.deleted && editingId !== msg.id && (
                          <div className="absolute right-2 top-0 -translate-y-1/2 flex items-center gap-0.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-md px-1 py-0.5 z-10">
                            {QUICK_REACTIONS.slice(0, 4).map(emoji => (
                              <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                                className="rounded p-1 text-base hover:bg-[rgb(var(--bg-secondary))]">{emoji}</button>
                            ))}
                            <button onClick={() => setEmojiPickerFor(emojiPickerFor === msg.id ? null : msg.id)}
                              className="rounded p-1 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]">
                              <SmilePlus className="h-4 w-4" />
                            </button>
                            <button onClick={() => { setReplyTo(msg); inputRef.current?.focus() }}
                              className="rounded p-1 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]">
                              <CornerDownRight className="h-4 w-4" />
                            </button>
                            <button onClick={() => { setInput(v => v + `@${msg.userName} `); inputRef.current?.focus() }}
                              className="rounded p-1 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]">
                              <AtSign className="h-4 w-4" />
                            </button>
                            {(isMe || role === 'admin') && (
                              <>
                                {isMe && (
                                  <button onClick={() => handleEdit(msg)} className="rounded p-1 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]">
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                )}
                                <button onClick={() => handleDelete(msg.id)} className="rounded p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Extended emoji picker */}
                        {emojiPickerFor === msg.id && (
                          <div className="absolute right-2 top-8 z-20 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-lg p-2">
                            <div className="grid grid-cols-4 gap-1">
                              {QUICK_REACTIONS.map(emoji => (
                                <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                                  className="rounded p-1.5 text-xl hover:bg-[rgb(var(--bg-secondary))]">{emoji}</button>
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

            {/* Typing indicator */}
            <div className="px-6 h-5 flex items-center">
              {typingNames.length > 0 && (
                <p className="text-xs text-[rgb(var(--text-muted))] flex items-center gap-1.5">
                  <span className="flex gap-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[rgb(var(--text-muted))] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[rgb(var(--text-muted))] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[rgb(var(--text-muted))] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span>
                    {typingNames.length === 1
                      ? `${typingNames[0]} is typing…`
                      : typingNames.length === 2
                      ? `${typingNames[0]} and ${typingNames[1]} are typing…`
                      : `${typingNames.length} people are typing…`}
                  </span>
                </p>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-[rgb(var(--border))] px-4 py-3">
              {/* Reply preview */}
              {replyTo && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 px-3 py-1.5 text-xs">
                  <CornerDownRight className="h-3 w-3 text-brand-400 shrink-0" />
                  <span className="text-brand-700 dark:text-brand-300 font-medium">{replyTo.userName}:</span>
                  <span className="text-[rgb(var(--text-muted))] truncate flex-1">{replyTo.content.slice(0, 60)}</span>
                  <button onClick={() => setReplyTo(null)} className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* @mention dropdown */}
              {mentionMatches.length > 0 && (
                <div className="mb-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-lg overflow-hidden">
                  {mentionMatches.map((u, idx) => (
                    <button
                      key={u.id}
                      onClick={() => insertMention(u)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--bg-secondary))]',
                        idx === mentionIndex && 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
                      )}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950 text-xs font-bold text-brand-700 dark:text-brand-300">
                        {initials(u.name)}
                      </div>
                      <span className="text-[rgb(var(--text))]">{u.name}</span>
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
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-4 py-2.5 pr-10 text-sm text-[rgb(var(--text))] placeholder-[rgb(var(--text-muted))] focus:border-brand-400 focus:bg-[rgb(var(--surface))] focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none"
                    style={{ minHeight: '2.75rem', maxHeight: '8rem' }}
                    onInput={e => {
                      const t = e.currentTarget
                      t.style.height = 'auto'
                      t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                    }}
                  />
                  <button
                    onClick={() => { setInput(v => v + '@'); inputRef.current?.focus(); setMentionQuery('') }}
                    className="absolute right-3 bottom-2.5 text-[rgb(var(--text-muted))] hover:text-brand-500"
                  >
                    <AtSign className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">Enter to send · Shift+Enter for new line · @ to mention</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[rgb(var(--text-muted))]">
            No channels available
          </div>
        )}
      </div>

      {/* New channel modal */}
      {showNewChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowNewChannel(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-4">
              <h3 className="font-semibold text-[rgb(var(--text))]">New Channel</h3>
              <button onClick={() => setShowNewChannel(false)}><X className="h-5 w-5 text-[rgb(var(--text-muted))]" /></button>
            </div>
            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Channel name</label>
                <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)}
                  placeholder="e.g. race-day" autoFocus
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:border-brand-400 focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNewChannel(false)} className="flex-1 rounded-lg border border-[rgb(var(--border))] py-2.5 text-sm font-medium text-[rgb(var(--text))]">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

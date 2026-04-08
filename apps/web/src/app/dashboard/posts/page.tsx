'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, MessageCircle, MoreHorizontal, ImagePlus, Send, X, Trash2, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { cn } from '@a-team/utils'

interface PostComment {
  id: string
  user_id: string
  content: string
  created_at: string
  author_name: string
  author_avatar: string | null
}

interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
  author_name: string
  author_avatar: string | null
  likes: { id: string; user_id: string }[]
  comments: PostComment[]
  liked_by_me: boolean
}

function getInitials(name: string) {
  if (!name) return '?'
  if (name.includes('@')) return name.split('@')[0]!.slice(0, 2).toUpperCase()
  return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function Avatar({ name, src, size = 'md' }: { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm'
  if (src) return <img src={src} alt={name} className={cn('rounded-full object-cover shrink-0', sz)} />
  return (
    <div className={cn('rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center shrink-0', sz)}>
      {getInitials(name)}
    </div>
  )
}

export default function PostsPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState('')
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null)

  // Create post
  const [showCreate, setShowCreate] = useState(false)
  const [newCaption, setNewCaption] = useState('')
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Comments
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  // Post menu
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    const { data: rawPosts } = await supabase
      .from('posts')
      .select('*, post_likes(id, user_id), post_comments(id, user_id, content, created_at)')
      .eq('deleted', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!rawPosts) { setLoading(false); return }

    // Collect unique user IDs from posts + comments
    const userIds = [...new Set([
      ...rawPosts.map(p => p.user_id),
      ...rawPosts.flatMap(p => p.post_comments.map((c: any) => c.user_id)),
    ])]

    const { data: profiles } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .in('id', userIds)

    const profileMap: Record<string, { name: string; avatar_url: string | null }> =
      Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

    const uid = currentUserId
    setPosts(rawPosts.map(p => ({
      id: p.id,
      user_id: p.user_id,
      content: p.content,
      image_url: p.image_url,
      created_at: p.created_at,
      author_name: profileMap[p.user_id]?.name ?? 'Team Member',
      author_avatar: profileMap[p.user_id]?.avatar_url ?? null,
      likes: p.post_likes,
      liked_by_me: p.post_likes.some((l: any) => l.user_id === uid),
      comments: p.post_comments
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          author_name: profileMap[c.user_id]?.name ?? 'Team Member',
          author_avatar: profileMap[c.user_id]?.avatar_url ?? null,
        })),
    })))
    setLoading(false)
  }, [supabase, currentUserId])

  useEffect(() => {
    const devBypass = document.cookie.includes('dev_bypass=1')
    if (devBypass) {
      const stored = localStorage.getItem('dev_profile')
      const profile = stored ? JSON.parse(stored) : {}
      setCurrentUserName(profile.name ?? 'Dev User')
      setCurrentUserAvatar(null)
      setCurrentUserId('dev-user')
    } else {
      supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) return
        setCurrentUserId(data.user.id)
        const { data: u } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('id', data.user.id)
          .single()
        setCurrentUserName(u?.name ?? data.user.email ?? 'Team Member')
        setCurrentUserAvatar(u?.avatar_url ?? null)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (currentUserId) loadPosts()
  }, [currentUserId, loadPosts])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => loadPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => loadPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => loadPosts())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, loadPosts])

  function handleImageSelect(file: File) {
    if (!file.type.startsWith('image/')) return
    setNewImageFile(file)
    const url = URL.createObjectURL(file)
    setNewImagePreview(url)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleImageSelect(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageSelect(file)
  }

  async function submitPost() {
    if (!newCaption.trim() && !newImageFile) return
    if (currentUserId === 'dev-user') {
      alert('Sign in with a real account to post.')
      return
    }
    setPosting(true)
    let imageUrl: string | null = null

    if (newImageFile) {
      setUploadProgress('Uploading image…')
      try {
        imageUrl = await uploadToCloudinary(newImageFile, 'posts')
      } catch (err: any) {
        setUploadProgress(err.message ?? 'Upload failed')
        setPosting(false)
        return
      }
    }

    setUploadProgress('Posting…')
    await supabase.from('posts').insert({
      user_id: currentUserId,
      content: newCaption.trim(),
      image_url: imageUrl,
    })

    setNewCaption('')
    setNewImageFile(null)
    setNewImagePreview(null)
    setUploadProgress('')
    setPosting(false)
    setShowCreate(false)
    loadPosts()
  }

  async function toggleLike(post: Post) {
    if (!currentUserId || currentUserId === 'dev-user') return
    if (post.liked_by_me) {
      const like = post.likes.find(l => l.user_id === currentUserId)
      if (like) await supabase.from('post_likes').delete().eq('id', like.id)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: currentUserId })
    }
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== post.id) return p
      if (post.liked_by_me) {
        return { ...p, liked_by_me: false, likes: p.likes.filter(l => l.user_id !== currentUserId) }
      } else {
        return { ...p, liked_by_me: true, likes: [...p.likes, { id: 'temp', user_id: currentUserId! }] }
      }
    }))
  }

  async function submitComment(postId: string) {
    const content = commentInputs[postId]?.trim()
    if (!content || !currentUserId || currentUserId === 'dev-user') return
    setSubmittingComment(postId)
    await supabase.from('post_comments').insert({ post_id: postId, user_id: currentUserId, content })
    setCommentInputs(prev => ({ ...prev, [postId]: '' }))
    setSubmittingComment(null)
    loadPosts()
  }

  async function deletePost(postId: string) {
    await supabase.from('posts').update({ deleted: true }).eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
    setOpenMenu(null)
  }

  function closeCreate() {
    setShowCreate(false)
    setNewCaption('')
    setNewImageFile(null)
    if (newImagePreview) URL.revokeObjectURL(newImagePreview)
    setNewImagePreview(null)
    setUploadProgress('')
  }

  return (
    <div className="max-w-xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Team Feed</h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">What's happening with the team</p>
        </div>
      </div>

      {/* Create post bar */}
      <button
        onClick={() => setShowCreate(true)}
        className="w-full mb-6 flex items-center gap-3 rounded-2xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-4 py-3 text-left hover:border-brand-300 transition shadow-sm"
      >
        <Avatar name={currentUserName} src={currentUserAvatar} size="md" />
        <span className="flex-1 text-sm text-[rgb(var(--text-muted))]">Share something with the team…</span>
        <Camera className="h-5 w-5 text-[rgb(var(--text-muted))] shrink-0" />
      </button>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] overflow-hidden animate-pulse">
              <div className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-full bg-[rgb(var(--border))]" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-32 rounded bg-[rgb(var(--border))]" />
                  <div className="h-3 w-20 rounded bg-[rgb(var(--border))]" />
                </div>
              </div>
              <div className="h-64 bg-[rgb(var(--border))]" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] py-16 text-center">
          <ImagePlus className="mx-auto h-12 w-12 text-[rgb(var(--border))] mb-3" />
          <p className="font-medium text-[rgb(var(--text-muted))]">No posts yet</p>
          <p className="text-sm text-[rgb(var(--text-muted))] opacity-60 mt-1">Be the first to share something!</p>
          <button onClick={() => setShowCreate(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            <Camera className="h-4 w-4" /> Create a post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <article key={post.id} className="rounded-2xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] overflow-hidden shadow-sm">
              {/* Post header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar name={post.author_name} src={post.author_avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[rgb(var(--text))] leading-tight">{post.author_name}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{timeAgo(post.created_at)}</p>
                </div>
                {post.user_id === currentUserId && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                      className="rounded-full p-1.5 hover:bg-[rgb(var(--border))] transition"
                    >
                      <MoreHorizontal className="h-5 w-5 text-[rgb(var(--text-muted))]" />
                    </button>
                    {openMenu === post.id && (
                      <div className="absolute right-0 top-8 z-20 w-36 rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-lg py-1">
                        <button
                          onClick={() => deletePost(post.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" /> Delete post
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Caption (above image if both present) */}
              {post.content && (
                <p className="px-4 pb-3 text-sm text-[rgb(var(--text))] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              )}

              {/* Image */}
              {post.image_url && (
                <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="px-4 pt-3 pb-2 flex items-center gap-4">
                <button
                  onClick={() => toggleLike(post)}
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium transition-colors',
                    post.liked_by_me ? 'text-red-500' : 'text-[rgb(var(--text-muted))] hover:text-red-400'
                  )}
                >
                  <Heart className={cn('h-5 w-5 transition-all', post.liked_by_me && 'fill-red-500')} />
                  {post.likes.length > 0 && <span>{post.likes.length}</span>}
                </button>
                <button
                  onClick={() => setExpandedComments(prev => {
                    const next = new Set(prev)
                    next.has(post.id) ? next.delete(post.id) : next.add(post.id)
                    return next
                  })}
                  className="flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  {post.comments.length > 0 && <span>{post.comments.length}</span>}
                </button>
              </div>

              {/* Comments section */}
              {(expandedComments.has(post.id) || post.comments.length > 0) && (
                <div className="px-4 pb-3 space-y-2 border-t border-[rgb(var(--border))] pt-3">
                  {/* Show latest 2 comments collapsed, all when expanded */}
                  {(expandedComments.has(post.id) ? post.comments : post.comments.slice(-2)).map(c => (
                    <div key={c.id} className="flex items-start gap-2">
                      <Avatar name={c.author_name} src={c.author_avatar} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-[rgb(var(--text))]">{c.author_name} </span>
                        <span className="text-xs text-[rgb(var(--text))]">{c.content}</span>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{timeAgo(c.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {!expandedComments.has(post.id) && post.comments.length > 2 && (
                    <button
                      onClick={() => setExpandedComments(prev => new Set([...prev, post.id]))}
                      className="text-xs text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                    >
                      View all {post.comments.length} comments
                    </button>
                  )}

                  {/* Add comment */}
                  <div className="flex items-center gap-2 pt-1">
                    <Avatar name={currentUserName} src={currentUserAvatar} size="sm" />
                    <div className="flex-1 flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary,var(--surface)))] px-3 py-1.5">
                      <input
                        value={commentInputs[post.id] ?? ''}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment(post.id)}
                        placeholder="Add a comment…"
                        className="flex-1 bg-transparent text-xs text-[rgb(var(--text))] placeholder-[rgb(var(--text-muted))] outline-none"
                      />
                      {commentInputs[post.id]?.trim() && (
                        <button
                          onClick={() => submitComment(post.id)}
                          disabled={submittingComment === post.id}
                          className="text-brand-500 hover:text-brand-600 disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Click outside to close menu */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}

      {/* Create post modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-[rgb(var(--surface))] shadow-2xl max-h-[95vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-4">
              <h3 className="font-semibold text-[rgb(var(--text))]">New Post</h3>
              <button onClick={closeCreate} className="rounded-full p-1 hover:bg-[rgb(var(--border))] transition">
                <X className="h-5 w-5 text-[rgb(var(--text-muted))]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar name={currentUserName} src={currentUserAvatar} size="md" />
                <p className="font-semibold text-sm text-[rgb(var(--text))]">{currentUserName}</p>
              </div>

              {/* Caption */}
              <textarea
                value={newCaption}
                onChange={e => setNewCaption(e.target.value)}
                placeholder="Write a caption…"
                rows={3}
                className="w-full bg-transparent text-[rgb(var(--text))] placeholder-[rgb(var(--text-muted))] text-sm resize-none outline-none leading-relaxed"
                autoFocus
              />

              {/* Image area */}
              {newImagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={newImagePreview} alt="Preview" className="w-full object-cover max-h-80 rounded-xl" />
                  <button
                    onClick={() => { setNewImageFile(null); if (newImagePreview) URL.revokeObjectURL(newImagePreview); setNewImagePreview(null) }}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 hover:bg-black/80 transition"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={cn(
                    'w-full rounded-xl border-2 border-dashed py-10 flex flex-col items-center gap-2 transition-colors',
                    dragOver
                      ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30'
                      : 'border-[rgb(var(--border))] hover:border-brand-300'
                  )}
                >
                  <ImagePlus className="h-8 w-8 text-[rgb(var(--text-muted))]" />
                  <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Add a photo</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] opacity-60">Drag & drop or click to browse</p>
                </button>
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {/* Post button */}
            <div className="border-t border-[rgb(var(--border))] px-4 py-4">
              {uploadProgress && (
                <p className="text-xs text-[rgb(var(--text-muted))] mb-2 text-center">{uploadProgress}</p>
              )}
              <button
                onClick={submitPost}
                disabled={posting || (!newCaption.trim() && !newImageFile)}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {posting ? 'Posting…' : 'Share with team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

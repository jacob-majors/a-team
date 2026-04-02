'use client'

import { useState, useRef } from 'react'
import { Camera, Plus, X, Image, Trash2, ChevronLeft } from 'lucide-react'
import { useRole } from '@/components/layout/role-switcher'

interface Photo {
  id: string
  url: string
  caption: string
}

interface Album {
  id: string
  name: string
  description: string
  createdAt: Date
  photos: Photo[]
}

const ALBUM_GRADIENTS = [
  'from-brand-400 to-brand-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-teal-400 to-teal-600',
]

export default function PhotosPage() {
  const { role } = useRole()
  const canManage = role === 'admin' || role === 'coach'

  const [albums, setAlbums] = useState<Album[]>([])
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null)
  const [showCreateAlbum, setShowCreateAlbum] = useState(false)
  const [albumForm, setAlbumForm] = useState({ name: '', description: '' })
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleCreateAlbum(e: React.FormEvent) {
    e.preventDefault()
    if (!albumForm.name.trim()) return
    const album: Album = { id: crypto.randomUUID(), ...albumForm, createdAt: new Date(), photos: [] }
    setAlbums(prev => [...prev, album])
    setAlbumForm({ name: '', description: '' })
    setShowCreateAlbum(false)
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!activeAlbum) return
    const files = Array.from(e.target.files ?? [])
    const newPhotos: Photo[] = files.map(f => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(f),
      caption: '',
    }))
    const updated = { ...activeAlbum, photos: [...activeAlbum.photos, ...newPhotos] }
    setAlbums(prev => prev.map(a => a.id === activeAlbum.id ? updated : a))
    setActiveAlbum(updated)
    if (fileRef.current) fileRef.current.value = ''
  }

  function deletePhoto(photoId: string) {
    if (!activeAlbum) return
    const updated = { ...activeAlbum, photos: activeAlbum.photos.filter(p => p.id !== photoId) }
    setAlbums(prev => prev.map(a => a.id === activeAlbum.id ? updated : a))
    setActiveAlbum(updated)
    if (lightbox?.id === photoId) setLightbox(null)
  }

  function deleteAlbum(albumId: string) {
    setAlbums(prev => prev.filter(a => a.id !== albumId))
    if (activeAlbum?.id === albumId) setActiveAlbum(null)
  }

  // Album detail view
  if (activeAlbum) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveAlbum(null)} className="rounded-lg p-2 hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activeAlbum.name}</h1>
              {activeAlbum.description && <p className="text-sm text-gray-500">{activeAlbum.description}</p>}
            </div>
          </div>
          {canManage && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
              <Plus className="h-4 w-4" /> Add Photos
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </label>
          )}
        </div>

        {activeAlbum.photos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Camera className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-medium text-gray-500">No photos yet</p>
            {canManage && <p className="text-sm text-gray-400">Upload photos to this album</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {activeAlbum.photos.map(photo => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 cursor-pointer" onClick={() => setLightbox(photo)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.caption || 'Photo'} className="h-full w-full object-cover transition group-hover:scale-105" />
                {canManage && (
                  <button
                    onClick={e => { e.stopPropagation(); deletePhoto(photo.id) }}
                    className="absolute right-2 top-2 hidden rounded-full bg-black/60 p-1.5 text-white group-hover:flex hover:bg-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.url} alt={lightbox.caption} className="max-h-full max-w-full rounded-lg object-contain" onClick={e => e.stopPropagation()} />
            <button onClick={() => setLightbox(null)} className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    )
  }

  // Albums list
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Albums</h1>
          <p className="text-sm text-gray-500">Team memories and race day photos</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateAlbum(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" /> New Album
          </button>
        )}
      </div>

      {albums.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Camera className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-500">No albums yet</p>
          {canManage && <p className="text-sm text-gray-400">Create an album to organize team photos</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {albums.map((album, i) => (
            <div key={album.id} className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => setActiveAlbum(album)}>
              <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${ALBUM_GRADIENTS[i % ALBUM_GRADIENTS.length]}`}>
                {album.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.photos[0].url} alt={album.name} className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-10 w-10 text-white/60" />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 truncate text-sm">{album.name}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <Image className="h-3 w-3" />
                  {album.photos.length} photo{album.photos.length !== 1 ? 's' : ''} · {album.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              {canManage && (
                <button
                  onClick={e => { e.stopPropagation(); deleteAlbum(album.id) }}
                  className="absolute right-2 top-2 hidden rounded-full bg-black/50 p-1.5 text-white group-hover:flex hover:bg-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create album modal */}
      {showCreateAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreateAlbum(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">New Album</h3>
              <button onClick={() => setShowCreateAlbum(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreateAlbum} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Album Name *</label>
                <input value={albumForm.name} onChange={e => setAlbumForm(f => ({ ...f, name: e.target.value }))} required
                  placeholder="e.g. Spring Race 2025"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={albumForm.description} onChange={e => setAlbumForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateAlbum(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white">Create Album</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

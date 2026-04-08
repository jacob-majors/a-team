// Upload a file to Cloudinary via our signed upload API
// Returns the secure_url of the uploaded asset
export async function uploadToCloudinary(
  file: File,
  folder: 'posts' | 'documents' | 'avatars' = 'posts'
): Promise<string> {
  // 1. Get signature from our server
  const signRes = await fetch('/api/cloudinary-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, resource_type: 'auto' }),
  })
  if (!signRes.ok) throw new Error('Failed to sign upload')
  const { signature, timestamp, apiKey, cloudName } = await signRes.json()

  // 2. Upload directly to Cloudinary
  const form = new FormData()
  form.append('file', file)
  form.append('signature', signature)
  form.append('timestamp', String(timestamp))
  form.append('api_key', apiKey)
  form.append('folder', folder)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: 'POST', body: form }
  )
  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Cloudinary upload failed')
  }
  const data = await uploadRes.json()
  return data.secure_url as string
}

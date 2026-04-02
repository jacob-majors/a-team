export const dynamic = 'force-dynamic'

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db, users } from '@a-team/db'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env['CLERK_WEBHOOK_SECRET']
  if (!WEBHOOK_SECRET) {
    return new Response('Missing webhook secret', { status: 500 })
  }

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const email = email_addresses[0]?.email_address ?? ''
    const name = [first_name, last_name].filter(Boolean).join(' ') || email

    await db.insert(users).values({
      id: randomUUID(),
      clerkId: id,
      name,
      email,
      role: 'athlete',
      avatarUrl: image_url,
    })
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const email = email_addresses[0]?.email_address ?? ''
    const name = [first_name, last_name].filter(Boolean).join(' ') || email

    await db
      .update(users)
      .set({ name, email, avatarUrl: image_url })
      .where(eq(users.clerkId, id))
  }

  return new Response('OK', { status: 200 })
}

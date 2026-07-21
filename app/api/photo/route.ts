import { db, r2, getSession, json } from '../_lib/auth';

// F19 — profile photo. Bytes live in R2; access is gated by the F14
// photo_mode / photo_access rules. No photo is ever public.

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 5 * 1024 * 1024;

async function photoModeOf(userId: string) {
  const p = await db().prepare('SELECT photo_mode FROM profiles WHERE user_id = ?').bind(userId).first<{ photo_mode: string }>();
  return p?.photo_mode ?? 'on_request';
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return json({ error: 'No file provided.' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return json({ error: 'Please upload a JPEG, PNG or WebP image.' }, { status: 400 });
  if (file.size > MAX) return json({ error: 'Image must be under 5 MB.' }, { status: 400 });
  const key = `photos/${session.user_id}`;
  await r2().put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  await db().prepare('UPDATE profiles SET photo_key = ?, updated_at = ? WHERE user_id = ?').bind(key, Math.floor(Date.now() / 1000), session.user_id).run();
  return json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  await r2().delete(`photos/${session.user_id}`).catch(() => undefined);
  await db().prepare('UPDATE profiles SET photo_key = NULL, updated_at = ? WHERE user_id = ?').bind(Math.floor(Date.now() / 1000), session.user_id).run();
  return json({ ok: true });
}

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const owner = new URL(request.url).searchParams.get('owner') || session.user_id;
  if (owner !== session.user_id) {
    const mode = await photoModeOf(owner);
    if (mode === 'hidden') return json({ error: 'Private.' }, { status: 403 });
    if (mode !== 'verified') {
      const grant = await db().prepare('SELECT status FROM photo_access WHERE owner_user = ? AND viewer_user = ?').bind(owner, session.user_id).first<{ status: string }>();
      if (grant?.status !== 'granted') return json({ error: 'Not authorised to view this photo.' }, { status: 403 });
    }
  }
  const prof = await db().prepare('SELECT photo_key FROM profiles WHERE user_id = ?').bind(owner).first<{ photo_key: string | null }>();
  if (!prof?.photo_key) return json({ error: 'No photo.' }, { status: 404 });
  const obj = await r2().get(prof.photo_key);
  if (!obj) return json({ error: 'No photo.' }, { status: 404 });
  return new Response(obj.body, { headers: { 'content-type': obj.httpMetadata?.contentType ?? 'image/jpeg', 'cache-control': 'private, max-age=60' } });
}

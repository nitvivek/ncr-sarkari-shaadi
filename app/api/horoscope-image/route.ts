import { db, r2, getSession, json } from '../_lib/auth';

// Phase B: kundli / horoscope image. Private to the owner; only owner can
// upload, fetch, or delete. Stored at R2 key `horoscope/<uid>`.

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return json({ error: 'No file provided.' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return json({ error: 'Please upload a JPEG, PNG, WebP image or PDF.' }, { status: 400 });
  if (file.size > MAX) return json({ error: 'File must be under 5 MB.' }, { status: 400 });
  const key = `horoscope/${session.user_id}`;
  // Replace any prior upload (single slot).
  await r2().put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  await db().prepare('UPDATE profiles SET horoscope_image_key = ?, updated_at = ? WHERE user_id = ?').bind(key, Math.floor(Date.now() / 1000), session.user_id).run();
  return json({ ok: true });
}

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const prof = await db().prepare('SELECT horoscope_image_key FROM profiles WHERE user_id = ?').bind(session.user_id).first<{ horoscope_image_key: string | null }>();
  if (!prof?.horoscope_image_key) return json({ error: 'No horoscope image.' }, { status: 404 });
  const obj = await r2().get(prof.horoscope_image_key);
  if (!obj) return json({ error: 'No horoscope image.' }, { status: 404 });
  return new Response(obj.body, { headers: { 'content-type': obj.httpMetadata?.contentType ?? 'image/jpeg', 'cache-control': 'private, max-age=60' } });
}

export async function DELETE(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  await r2().delete(`horoscope/${session.user_id}`).catch(() => undefined);
  await db().prepare('UPDATE profiles SET horoscope_image_key = NULL, updated_at = ? WHERE user_id = ?').bind(Math.floor(Date.now() / 1000), session.user_id).run();
  return json({ ok: true });
}

import { db, r2, getSession, json } from '../_lib/auth';

// Phase B: gallery of additional photos. Primary photo stays on
// profiles.photo_key (F19). Gallery photos are gated by the same F14 rules.

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 5 * 1024 * 1024;
const MAX_PHOTOS = 6;

async function photoModeOf(userId: string) {
  const p = await db().prepare('SELECT photo_mode FROM profiles WHERE user_id = ?').bind(userId).first<{ photo_mode: string }>();
  return p?.photo_mode ?? 'on_request';
}

function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return json({ error: 'No file provided.' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return json({ error: 'Please upload a JPEG, PNG or WebP image.' }, { status: 400 });
  if (file.size > MAX) return json({ error: 'Image must be under 5 MB.' }, { status: 400 });
  const count = await db().prepare('SELECT COUNT(*) as n FROM profile_photos WHERE user_id = ?').bind(session.user_id).first<{ n: number }>();
  if ((count?.n ?? 0) >= MAX_PHOTOS) return json({ error: `You can have at most ${MAX_PHOTOS} gallery photos.` }, { status: 400 });
  const id = newId();
  const key = `photos/${session.user_id}/${id}`;
  await r2().put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  const maxPos = await db().prepare('SELECT COALESCE(MAX(position), -1) as p FROM profile_photos WHERE user_id = ?').bind(session.user_id).first<{ p: number }>();
  const now = Math.floor(Date.now() / 1000);
  await db().prepare('INSERT INTO profile_photos (id, user_id, r2_key, position, created_at) VALUES (?, ?, ?, ?, ?)').bind(id, session.user_id, key, (maxPos?.p ?? -1) + 1, now).run();
  return json({ ok: true, id, key });
}

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const url = new URL(request.url);
  const owner = url.searchParams.get('owner') || session.user_id;
  const id = url.searchParams.get('id');
  if (id) {
    // Serve a single gallery photo. Owner always; otherwise respect photo_mode.
    const row = await db().prepare('SELECT * FROM profile_photos WHERE id = ? AND user_id = ?').bind(id, owner).first<{ r2_key: string }>();
    if (!row) return json({ error: 'Not found.' }, { status: 404 });
    if (owner !== session.user_id) {
      const mode = await photoModeOf(owner);
      if (mode === 'hidden') return json({ error: 'Private.' }, { status: 403 });
      if (mode !== 'verified') {
        const grant = await db().prepare('SELECT status FROM photo_access WHERE owner_user = ? AND viewer_user = ?').bind(owner, session.user_id).first<{ status: string }>();
        if (grant?.status !== 'granted') return json({ error: 'Not authorised.' }, { status: 403 });
      }
    }
    const obj = await r2().get(row.r2_key);
    if (!obj) return json({ error: 'Not found.' }, { status: 404 });
    return new Response(obj.body, { headers: { 'content-type': obj.httpMetadata?.contentType ?? 'image/jpeg', 'cache-control': 'private, max-age=60' } });
  }
  // List gallery metadata (owner only).
  if (owner !== session.user_id) return json({ error: 'Not authorised.' }, { status: 403 });
  const rows = await db().prepare('SELECT id, position FROM profile_photos WHERE user_id = ? ORDER BY position').bind(owner).all<{ id: string; position: number }>();
  return json({ photos: rows.results });
}

export async function DELETE(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return json({ error: 'Missing id.' }, { status: 400 });
  const row = await db().prepare('SELECT r2_key FROM profile_photos WHERE id = ? AND user_id = ?').bind(id, session.user_id).first<{ r2_key: string }>();
  if (!row) return json({ error: 'Not found.' }, { status: 404 });
  await r2().delete(row.r2_key).catch(() => undefined);
  await db().prepare('DELETE FROM profile_photos WHERE id = ? AND user_id = ?').bind(id, session.user_id).run();
  return json({ ok: true });
}

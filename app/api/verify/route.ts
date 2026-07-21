import { db, r2, getSession, json } from '../_lib/auth';

// F19 — verification. Members upload govt ID + photo ID; docs live in R2
// and are DELETED after an admin approves/rejects (privacy by design).
// Approval sets profiles.verified_at (the badge).

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const govt = form?.get('govt_id');
  const photo = form?.get('photo_id');
  if (!(govt instanceof File) && !(photo instanceof File)) return json({ error: 'Attach at least one document.' }, { status: 400 });
  const now = Math.floor(Date.now() / 1000);
  let govtKey: string | null = null;
  let photoKey: string | null = null;
  for (const [field, file] of [['govt_id', govt], ['photo_id', photo]] as const) {
    if (!(file instanceof File)) continue;
    if (!ALLOWED.includes(file.type)) return json({ error: 'Documents must be JPEG, PNG, WebP or PDF.' }, { status: 400 });
    if (file.size > MAX) return json({ error: 'Each document must be under 5 MB.' }, { status: 400 });
    const key = `verify/${session.user_id}/${field}`;
    await r2().put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    if (field === 'govt_id') govtKey = key; else photoKey = key;
  }
  const existing = await db().prepare('SELECT govt_id_key, photo_id_key FROM verifications WHERE user_id = ?').bind(session.user_id).first<{ govt_id_key: string | null; photo_id_key: string | null }>();
  const finalGovt = govtKey ?? existing?.govt_id_key ?? null;
  const finalPhoto = photoKey ?? existing?.photo_id_key ?? null;
  if (existing) {
    await db().prepare('UPDATE verifications SET govt_id_key = ?, photo_id_key = ?, status = ?, note = NULL, created_at = ?, reviewed_at = NULL WHERE user_id = ?').bind(finalGovt, finalPhoto, 'pending', now, session.user_id).run();
  } else {
    await db().prepare('INSERT INTO verifications (user_id, govt_id_key, photo_id_key, status, created_at) VALUES (?, ?, ?, ?, ?)').bind(session.user_id, finalGovt, finalPhoto, 'pending', now).run();
  }
  return json({ ok: true, status: 'pending' });
}

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  if (new URL(request.url).searchParams.get('mine') === '1') {
    const v = await db().prepare('SELECT status, govt_id_key, photo_id_key, note, reviewed_at FROM verifications WHERE user_id = ?').bind(session.user_id).first<{ status: string; govt_id_key: string | null; photo_id_key: string | null; note: string | null; reviewed_at: number | null }>();
    return json({ verification: v ?? null });
  }
  if (session.role !== 'admin') return json({ error: 'Admins only.' }, { status: 403 });
  const rows = await db().prepare(`SELECT v.user_id, v.status, v.created_at, v.govt_id_key, v.photo_id_key, u.full_name
    FROM verifications v JOIN users u ON u.id = v.user_id WHERE v.status = 'pending' ORDER BY v.created_at ASC LIMIT 100`).bind().all();
  return json({ pending: rows.results ?? [] });
}

export async function PATCH(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  if (session.role !== 'admin') return json({ error: 'Admins only.' }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { userId?: string; action?: string; note?: string } | null;
  const userId = body?.userId?.trim();
  const action = body?.action;
  if (!userId || (action !== 'approve' && action !== 'reject')) return json({ error: 'Missing userId or valid action.' }, { status: 400 });
  const v = await db().prepare('SELECT govt_id_key, photo_id_key FROM verifications WHERE user_id = ?').bind(userId).first<{ govt_id_key: string | null; photo_id_key: string | null }>();
  if (!v) return json({ error: 'No verification found.' }, { status: 404 });
  const now = Math.floor(Date.now() / 1000);
  if (v.govt_id_key) await r2().delete(v.govt_id_key).catch(() => undefined);
  if (v.photo_id_key) await r2().delete(v.photo_id_key).catch(() => undefined);
  const status = action === 'approve' ? 'approved' : 'rejected';
  await db().prepare('UPDATE verifications SET status = ?, note = ?, reviewed_at = ?, govt_id_key = NULL, photo_id_key = NULL WHERE user_id = ?').bind(status, body?.note ?? null, now, userId).run();
  if (action === 'approve') await db().prepare('UPDATE profiles SET verified_at = ?, updated_at = ? WHERE user_id = ?').bind(now, now, userId).run();
  return json({ ok: true, status });
}

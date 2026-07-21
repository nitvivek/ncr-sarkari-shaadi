import { db, getSession, json } from '../_lib/auth';

// F17 — Report. Any member can report another; reports enter a confidential
// admin queue. The reported member is never told who reported them, and
// non-admins cannot read the queue.

const REASONS = ['fake_profile', 'harassment', 'inappropriate', 'spam', 'other'];
const STATUSES = ['open', 'reviewed', 'actioned', 'dismissed'];

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { reportedUser?: string; reason?: string; detail?: string } | null;
  const reported = body?.reportedUser?.trim();
  const reason = body?.reason;
  const detail = (body?.detail ?? '').slice(0, 2000);
  if (!reported || !reason) return json({ error: 'Missing member or reason.' }, { status: 400 });
  if (reported === session.user_id) return json({ error: 'You cannot report yourself.' }, { status: 400 });
  if (!REASONS.includes(reason)) return json({ error: 'Invalid reason.' }, { status: 400 });
  const target = await db().prepare('SELECT id FROM users WHERE id = ?').bind(reported).first<{ id: string }>();
  if (!target) return json({ error: 'That member does not exist.' }, { status: 404 });
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await db()
    .prepare('INSERT INTO reports (id, reporter_user, reported_user, reason, detail, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, session.user_id, reported, reason, detail || null, 'open', now, now)
    .run();
  return json({ ok: true, id });
}

export async function GET(request: Request) {
  // Admin-only confidential queue.
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  if (session.role !== 'admin') return json({ error: 'Admins only.' }, { status: 403 });
  const status = new URL(request.url).searchParams.get('status');
  const where = status && STATUSES.includes(status) ? 'WHERE r.status = ?' : '';
  const stmt = db().prepare(
    `SELECT r.id, r.reason, r.detail, r.status, r.created_at,
            ru.full_name AS reported_name, ru.id AS reported_id,
            rp.full_name AS reporter_name, rp.id AS reporter_id
     FROM reports r
     JOIN users ru ON ru.id = r.reported_user
     JOIN users rp ON rp.id = r.reporter_user
     ${where} ORDER BY r.created_at DESC LIMIT 100`
  );
  const rows = await (where ? stmt.bind(status) : stmt.bind()).all();
  return json({ reports: rows.results ?? [] });
}

export async function PATCH(request: Request) {
  // Admin-only: move a report through the queue.
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  if (session.role !== 'admin') return json({ error: 'Admins only.' }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { id?: string; status?: string } | null;
  const id = body?.id?.trim();
  const status = body?.status;
  if (!id || !status || !STATUSES.includes(status)) return json({ error: 'Missing id or valid status.' }, { status: 400 });
  await db().prepare('UPDATE reports SET status = ?, updated_at = ? WHERE id = ?').bind(status, Math.floor(Date.now() / 1000), id).run();
  return json({ ok: true, status });
}

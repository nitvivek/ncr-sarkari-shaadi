import { db, getSession, json } from '../_lib/auth';

// F13 — Interests: send / accept / decline / withdraw.
// Open messaging still applies; interests are a signal + the gate for
// photo/contact sharing (F14/F16) and a mutual-match indicator.

type ListRow = {
  id: string;
  status: string;
  created_at: number;
  user_id: string;
  full_name: string;
  user_status: string;
};

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const box = new URL(request.url).searchParams.get('box') === 'sent' ? 'sent' : 'received';
  const sql =
    box === 'received'
      ? `SELECT i.id, i.status, i.created_at, u.id AS user_id, u.full_name, u.status AS user_status
         FROM interests i JOIN users u ON u.id = i.from_user
         WHERE i.to_user = ? AND i.status != 'withdrawn' ORDER BY i.created_at DESC`
      : `SELECT i.id, i.status, i.created_at, u.id AS user_id, u.full_name, u.status AS user_status
         FROM interests i JOIN users u ON u.id = i.to_user
         WHERE i.from_user = ? ORDER BY i.created_at DESC`;
  const rows = await db().prepare(sql).bind(session.user_id).all<ListRow>();
  return json({ box, interests: rows.results ?? [] });
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { toUser?: string } | null;
  const toUser = body?.toUser?.trim();
  if (!toUser) return json({ error: 'Missing recipient.' }, { status: 400 });
  if (toUser === session.user_id) return json({ error: 'You cannot send yourself an interest.' }, { status: 400 });
  const target = await db().prepare('SELECT id FROM users WHERE id = ?').bind(toUser).first<{ id: string }>();
  if (!target) return json({ error: 'That member does not exist.' }, { status: 404 });
  const now = Math.floor(Date.now() / 1000);
  const existing = await db()
    .prepare('SELECT id, status FROM interests WHERE from_user = ? AND to_user = ?')
    .bind(session.user_id, toUser)
    .first<{ id: string; status: string }>();
  if (existing) {
    // Re-express interest after a withdraw/decline resets it to pending.
    if (existing.status === 'pending' || existing.status === 'accepted') {
      return json({ ok: true, id: existing.id, status: existing.status });
    }
    await db().prepare('UPDATE interests SET status = ?, updated_at = ? WHERE id = ?').bind('pending', now, existing.id).run();
    return json({ ok: true, id: existing.id, status: 'pending' });
  }
  const id = crypto.randomUUID();
  await db()
    .prepare('INSERT INTO interests (id, from_user, to_user, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, session.user_id, toUser, 'pending', now, now)
    .run();
  return json({ ok: true, id, status: 'pending' });
}

export async function PATCH(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string; action?: string } | null;
  const id = body?.id?.trim();
  const action = body?.action;
  if (!id || !action) return json({ error: 'Missing id or action.' }, { status: 400 });
  const row = await db()
    .prepare('SELECT id, from_user, to_user, status FROM interests WHERE id = ?')
    .bind(id)
    .first<{ id: string; from_user: string; to_user: string; status: string }>();
  if (!row) return json({ error: 'Interest not found.' }, { status: 404 });
  const now = Math.floor(Date.now() / 1000);
  if (action === 'withdraw') {
    if (row.from_user !== session.user_id) return json({ error: 'Not your interest to withdraw.' }, { status: 403 });
    await db().prepare('UPDATE interests SET status = ?, updated_at = ? WHERE id = ?').bind('withdrawn', now, id).run();
    return json({ ok: true, status: 'withdrawn' });
  }
  if (action === 'accept' || action === 'decline') {
    if (row.to_user !== session.user_id) return json({ error: 'Only the recipient can respond to this interest.' }, { status: 403 });
    const status = action === 'accept' ? 'accepted' : 'declined';
    await db().prepare('UPDATE interests SET status = ?, updated_at = ? WHERE id = ?').bind(status, now, id).run();
    return json({ ok: true, status });
  }
  return json({ error: 'Unknown action.' }, { status: 400 });
}

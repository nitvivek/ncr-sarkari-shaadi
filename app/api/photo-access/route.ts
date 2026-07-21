import { db, getSession, json } from '../_lib/auth';

// F14 — Photo privacy access layer. Owners set profiles.photo_mode
// (on_request | verified | hidden). When on_request, a viewer must be
// granted per-request access, which the owner can revoke at any time.
// (Actual image bytes are served from R2 later — F19.)

type ReqRow = { id: string; status: string; created_at: number; user_id: string; full_name: string };

async function photoModeOf(userId: string) {
  const p = await db().prepare('SELECT photo_mode FROM profiles WHERE user_id = ?').bind(userId).first<{ photo_mode: string }>();
  return p?.photo_mode ?? 'on_request';
}

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const url = new URL(request.url);
  const owner = url.searchParams.get('owner');

  // Resolve whether the current viewer may see a specific owner's photo.
  if (owner) {
    if (owner === session.user_id) return json({ canView: true, status: 'self' });
    const mode = await photoModeOf(owner);
    if (mode === 'verified') return json({ canView: true, status: 'open' });
    if (mode === 'hidden') return json({ canView: false, status: 'hidden' });
    const grant = await db()
      .prepare('SELECT status FROM photo_access WHERE owner_user = ? AND viewer_user = ?')
      .bind(owner, session.user_id)
      .first<{ status: string }>();
    return json({ canView: grant?.status === 'granted', status: grant?.status ?? 'none' });
  }

  const box = url.searchParams.get('box') === 'mine' ? 'mine' : 'requests';
  const sql =
    box === 'requests'
      ? `SELECT pa.id, pa.status, pa.created_at, u.id AS user_id, u.full_name
         FROM photo_access pa JOIN users u ON u.id = pa.viewer_user
         WHERE pa.owner_user = ? ORDER BY pa.created_at DESC`
      : `SELECT pa.id, pa.status, pa.created_at, u.id AS user_id, u.full_name
         FROM photo_access pa JOIN users u ON u.id = pa.owner_user
         WHERE pa.viewer_user = ? ORDER BY pa.created_at DESC`;
  const rows = await db().prepare(sql).bind(session.user_id).all<ReqRow>();
  return json({ box, requests: rows.results ?? [] });
}

export async function POST(request: Request) {
  // Viewer requests access to an owner's photo.
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { ownerUser?: string } | null;
  const owner = body?.ownerUser?.trim();
  if (!owner) return json({ error: 'Missing owner.' }, { status: 400 });
  if (owner === session.user_id) return json({ error: 'That is your own photo.' }, { status: 400 });
  const target = await db().prepare('SELECT id FROM users WHERE id = ?').bind(owner).first<{ id: string }>();
  if (!target) return json({ error: 'That member does not exist.' }, { status: 404 });
  const mode = await photoModeOf(owner);
  if (mode === 'hidden') return json({ error: 'This member keeps their photo private.' }, { status: 403 });
  if (mode === 'verified') return json({ ok: true, status: 'granted' }); // already open
  const now = Math.floor(Date.now() / 1000);
  const existing = await db()
    .prepare('SELECT id, status FROM photo_access WHERE owner_user = ? AND viewer_user = ?')
    .bind(owner, session.user_id)
    .first<{ id: string; status: string }>();
  if (existing) {
    if (existing.status === 'granted') return json({ ok: true, id: existing.id, status: 'granted' });
    await db().prepare('UPDATE photo_access SET status = ?, updated_at = ? WHERE id = ?').bind('requested', now, existing.id).run();
    return json({ ok: true, id: existing.id, status: 'requested' });
  }
  const id = crypto.randomUUID();
  await db()
    .prepare('INSERT INTO photo_access (id, owner_user, viewer_user, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, owner, session.user_id, 'requested', now, now)
    .run();
  return json({ ok: true, id, status: 'requested' });
}

export async function PATCH(request: Request) {
  // Owner grants / denies / revokes a viewer's access.
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string; action?: string } | null;
  const id = body?.id?.trim();
  const action = body?.action;
  if (!id || !action) return json({ error: 'Missing id or action.' }, { status: 400 });
  const row = await db()
    .prepare('SELECT id, owner_user, status FROM photo_access WHERE id = ?')
    .bind(id)
    .first<{ id: string; owner_user: string; status: string }>();
  if (!row) return json({ error: 'Request not found.' }, { status: 404 });
  if (row.owner_user !== session.user_id) return json({ error: 'Only the photo owner can change access.' }, { status: 403 });
  const map: Record<string, string> = { grant: 'granted', deny: 'denied', revoke: 'revoked' };
  const status = map[action];
  if (!status) return json({ error: 'Unknown action.' }, { status: 400 });
  const now = Math.floor(Date.now() / 1000);
  await db().prepare('UPDATE photo_access SET status = ?, updated_at = ? WHERE id = ?').bind(status, now, id).run();
  return json({ ok: true, status });
}

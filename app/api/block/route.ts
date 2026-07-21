import { db, getSession, json } from '../_lib/auth';

// F17 — Block. A block hides both members from each other in discovery
// (see /api/members). Reversible.

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const rows = await db()
    .prepare(
      `SELECT b.blocked_user AS user_id, u.full_name, b.created_at
       FROM blocks b JOIN users u ON u.id = b.blocked_user
       WHERE b.blocker_user = ? ORDER BY b.created_at DESC`
    )
    .bind(session.user_id)
    .all<{ user_id: string; full_name: string; created_at: number }>();
  return json({ blocks: rows.results ?? [] });
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { blockedUser?: string; action?: string } | null;
  const blocked = body?.blockedUser?.trim();
  if (!blocked) return json({ error: 'Missing member.' }, { status: 400 });
  if (blocked === session.user_id) return json({ error: 'You cannot block yourself.' }, { status: 400 });
  const target = await db().prepare('SELECT id FROM users WHERE id = ?').bind(blocked).first<{ id: string }>();
  if (!target) return json({ error: 'That member does not exist.' }, { status: 404 });
  if (body?.action === 'unblock') {
    await db().prepare('DELETE FROM blocks WHERE blocker_user = ? AND blocked_user = ?').bind(session.user_id, blocked).run();
    return json({ ok: true, blocked: false });
  }
  await db()
    .prepare('INSERT OR IGNORE INTO blocks (blocker_user, blocked_user, created_at) VALUES (?, ?, ?)')
    .bind(session.user_id, blocked, Math.floor(Date.now() / 1000))
    .run();
  return json({ ok: true, blocked: true });
}

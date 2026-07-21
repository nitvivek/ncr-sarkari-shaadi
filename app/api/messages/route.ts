import { db, getSession, json } from '../_lib/auth';

// Chat threads. Messaging is OPEN by product decision, so the mandatory
// safeguards live here:
//  - blocks are enforced both ways (403)
//  - max 3 messages to someone who has never replied ("wait for a reply")
//  - max 10 new unanswered conversations per day
// Contact details never travel through here automatically; the contact
// handshake (/api/contact) stays separate.

const MAX_LEN = 2000;
const MAX_UNREPLIED = 3;
const MAX_NEW_CONVOS_PER_DAY = 10;

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const me = session.user_id;
  const url = new URL(request.url);
  const withUser = url.searchParams.get('with');

  if (withUser) {
    const rows = await db()
      .prepare('SELECT id, from_user, body, created_at FROM messages WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?) ORDER BY created_at ASC, rowid ASC LIMIT 200')
      .bind(me, withUser, withUser, me)
      .all<{ id: string; from_user: string; body: string; created_at: number }>();
    await db().prepare('UPDATE messages SET read_at = ? WHERE from_user = ? AND to_user = ? AND read_at IS NULL').bind(Math.floor(Date.now() / 1000), withUser, me).run();
    return json({ messages: (rows.results ?? []).map((m) => ({ id: m.id, mine: m.from_user === me, body: m.body, at: m.created_at })) });
  }

  const convos = await db()
    .prepare(
      `SELECT p.partner_id, u.full_name, p.last_at, p.unread,
        (SELECT body FROM messages m WHERE (m.from_user = ? AND m.to_user = p.partner_id) OR (m.from_user = p.partner_id AND m.to_user = ?) ORDER BY m.created_at DESC, m.rowid DESC LIMIT 1) AS last_body
       FROM (
         SELECT CASE WHEN from_user = ? THEN to_user ELSE from_user END AS partner_id,
                MAX(created_at) AS last_at,
                SUM(CASE WHEN to_user = ? AND read_at IS NULL THEN 1 ELSE 0 END) AS unread
         FROM messages WHERE from_user = ? OR to_user = ?
         GROUP BY partner_id
       ) p JOIN users u ON u.id = p.partner_id
       ORDER BY p.last_at DESC LIMIT 50`
    )
    .bind(me, me, me, me, me, me)
    .all<{ partner_id: string; full_name: string; last_at: number; unread: number; last_body: string | null }>();
  return json({ conversations: convos.results ?? [] });
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const me = session.user_id;
  const body = (await request.json().catch(() => null)) as { toUser?: string; body?: string } | null;
  const to = body?.toUser?.trim();
  const text = (body?.body ?? '').trim();
  if (!to || !text) return json({ error: 'Missing recipient or message.' }, { status: 400 });
  if (to === me) return json({ error: 'You cannot message yourself.' }, { status: 400 });
  if (text.length > MAX_LEN) return json({ error: 'Message is too long (2000 characters max).' }, { status: 400 });
  const target = await db().prepare('SELECT id FROM users WHERE id = ?').bind(to).first<{ id: string }>();
  if (!target) return json({ error: 'That member does not exist.' }, { status: 404 });

  const blocked = await db()
    .prepare('SELECT 1 AS x FROM blocks WHERE (blocker_user = ? AND blocked_user = ?) OR (blocker_user = ? AND blocked_user = ?)')
    .bind(me, to, to, me)
    .first<{ x: number }>();
  if (blocked) return json({ error: 'You cannot message this member.' }, { status: 403 });

  const replied = await db().prepare('SELECT 1 AS x FROM messages WHERE from_user = ? AND to_user = ? LIMIT 1').bind(to, me).first<{ x: number }>();
  if (!replied) {
    const sent = await db().prepare('SELECT COUNT(*) AS n FROM messages WHERE from_user = ? AND to_user = ?').bind(me, to).first<{ n: number }>();
    if ((sent?.n ?? 0) >= MAX_UNREPLIED) return json({ error: 'Please wait for a reply before sending more messages.' }, { status: 429 });
    if ((sent?.n ?? 0) === 0) {
      const dayStart = Math.floor(Date.now() / 1000) - 86400;
      const fresh = await db()
        .prepare(
          `SELECT COUNT(DISTINCT to_user) AS n FROM messages m
           WHERE from_user = ? AND created_at >= ?
             AND NOT EXISTS (SELECT 1 FROM messages r WHERE r.from_user = m.to_user AND r.to_user = ?)`
        )
        .bind(me, dayStart, me)
        .first<{ n: number }>();
      if ((fresh?.n ?? 0) >= MAX_NEW_CONVOS_PER_DAY) return json({ error: 'You’ve started a lot of new conversations today. Try again tomorrow.' }, { status: 429 });
    }
  }

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await db().prepare('INSERT INTO messages (id, from_user, to_user, body, created_at) VALUES (?, ?, ?, ?, ?)').bind(id, me, to, text, now).run();
  return json({ ok: true, id, at: now });
}

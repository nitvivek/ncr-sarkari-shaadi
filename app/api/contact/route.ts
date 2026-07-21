import { db, getSession, json } from '../_lib/auth';

// F16 — Contact masking + mutual-consent exchange. Phone/email are never
// returned by any member-facing endpoint. They are revealed to each other
// ONLY when both members have agreed to share, and either can revoke.

function pair(me: string, other: string) {
  const lo = me < other ? me : other;
  const hi = me < other ? other : me;
  return { lo, hi, mine: (me === lo ? 'lo' : 'hi') as 'lo' | 'hi' };
}

type ShareRow = { user_lo: string; user_hi: string; lo_agreed: number; hi_agreed: number };

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const other = new URL(request.url).searchParams.get('with');
  if (!other) return json({ error: 'Missing member.' }, { status: 400 });
  if (other === session.user_id) return json({ error: 'That is you.' }, { status: 400 });
  const { lo, hi, mine } = pair(session.user_id, other);
  const row = await db().prepare('SELECT lo_agreed, hi_agreed FROM contact_share WHERE user_lo = ? AND user_hi = ?').bind(lo, hi).first<ShareRow>();
  const youAgreed = !!(mine === 'lo' ? row?.lo_agreed : row?.hi_agreed);
  const theyAgreed = !!(mine === 'lo' ? row?.hi_agreed : row?.lo_agreed);
  const mutual = youAgreed && theyAgreed;
  if (!mutual) return json({ mutual: false, youAgreed, theyAgreed });
  const contact = await db().prepare('SELECT email, phone FROM users WHERE id = ?').bind(other).first<{ email: string | null; phone: string | null }>();
  return json({ mutual: true, youAgreed, theyAgreed, contact: { email: contact?.email ?? null, phone: contact?.phone ?? null } });
}

export async function POST(request: Request) {
  // Set the current user's agreement to share contact with `withUser`.
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { withUser?: string; agree?: boolean } | null;
  const other = body?.withUser?.trim();
  const agree = body?.agree !== false; // default true; pass agree:false to revoke
  if (!other) return json({ error: 'Missing member.' }, { status: 400 });
  if (other === session.user_id) return json({ error: 'That is you.' }, { status: 400 });
  const target = await db().prepare('SELECT id FROM users WHERE id = ?').bind(other).first<{ id: string }>();
  if (!target) return json({ error: 'That member does not exist.' }, { status: 404 });
  const { lo, hi, mine } = pair(session.user_id, other);
  const now = Math.floor(Date.now() / 1000);
  const row = await db().prepare('SELECT lo_agreed, hi_agreed FROM contact_share WHERE user_lo = ? AND user_hi = ?').bind(lo, hi).first<ShareRow>();
  let loAgreed = row?.lo_agreed ?? 0;
  let hiAgreed = row?.hi_agreed ?? 0;
  if (mine === 'lo') loAgreed = agree ? 1 : 0;
  else hiAgreed = agree ? 1 : 0;
  if (row) {
    await db().prepare('UPDATE contact_share SET lo_agreed = ?, hi_agreed = ?, updated_at = ? WHERE user_lo = ? AND user_hi = ?').bind(loAgreed, hiAgreed, now, lo, hi).run();
  } else {
    await db().prepare('INSERT INTO contact_share (user_lo, user_hi, lo_agreed, hi_agreed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').bind(lo, hi, loAgreed, hiAgreed, now, now).run();
  }
  return json({ ok: true, mutual: !!(loAgreed && hiAgreed), youAgreed: agree });
}

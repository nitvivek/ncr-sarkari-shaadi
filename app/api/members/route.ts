import { db, getSession, json } from '../_lib/auth';

// F15 companion — members directory. Lists other members for discovery,
// EXCLUDING profiles with hidden_profile = 1. A hidden member can still
// call this to browse (hiding removes you from results, not your access).
// Names are masked to first-name + initial; photos are never returned
// here (gated separately via /api/photo-access).

type MemberRow = {
  user_id: string;
  full_name: string;
  service: string | null;
  residence_city: string | null;
  gender: string | null;
  posting_outlook: string | null;
  verified_at: number | null;
  photo_mode: string;
};

function maskName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Member';
  const last = parts.length > 1 ? ` ${parts[parts.length - 1][0].toUpperCase()}.` : '';
  return `${parts[0]}${last}`;
}

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const url = new URL(request.url);
  const gender = url.searchParams.get('gender');
  const conditions = [
    'u.id != ?',
    'COALESCE(p.hidden_profile, 0) = 0',
    'u.id NOT IN (SELECT blocked_user FROM blocks WHERE blocker_user = ?)',
    'u.id NOT IN (SELECT blocker_user FROM blocks WHERE blocked_user = ?)',
  ];
  const binds: unknown[] = [session.user_id, session.user_id, session.user_id];
  if (gender === 'male' || gender === 'female') {
    conditions.push('p.gender = ?');
    binds.push(gender);
  }
  const rows = await db()
    .prepare(
      `SELECT u.id AS user_id, u.full_name, p.service, p.residence_city, p.gender, p.posting_outlook, p.verified_at, p.photo_mode
       FROM users u JOIN profiles p ON p.user_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY u.created_at DESC LIMIT 60`
    )
    .bind(...binds)
    .all<MemberRow>();
  const members = (rows.results ?? []).map((m) => ({
    id: m.user_id,
    name: maskName(m.full_name),
    service: m.service,
    city: m.residence_city,
    gender: m.gender,
    postingOutlook: m.posting_outlook,
    verified: !!m.verified_at,
    photoMode: m.photo_mode,
  }));
  return json({ members, count: members.length });
}

import { db, getSession, json } from '../_lib/auth';

type ProfileRow = {
  user_id: string;
  gender: string | null;
  created_for: string | null;
  ministry: string | null;
  organisation: string | null;
  service: string | null;
  posting_outlook: string | null;
  preferred_hubs: string | null;
  about: string | null;
  residence_city: string | null;
  residence_district: string | null;
  posting_city: string | null;
  posting_district: string | null;
  profile_visible: number;
  verified_at: number | null;
};

const editableFields = ['gender', 'created_for', 'ministry', 'organisation', 'service', 'posting_outlook', 'preferred_hubs', 'about', 'residence_city', 'residence_district', 'posting_city', 'posting_district', 'photo_mode', 'family_notes'] as const;

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const profile = await db().prepare('SELECT * FROM profiles WHERE user_id = ?').bind(session.user_id).first<ProfileRow>();
  return json({ profile });
}

export async function PUT(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return json({ error: 'Invalid request body.' }, { status: 400 });
  const updates: string[] = [];
  const values: unknown[] = [];
  for (const field of editableFields) {
    if (!(field in body)) continue;
    const value = body[field];
    if (value !== null && typeof value !== 'string') return json({ error: `Invalid value for ${field}.` }, { status: 400 });
    if (typeof value === 'string' && value.length > 2000) return json({ error: `Value for ${field} is too long.` }, { status: 400 });
    updates.push(`${field} = ?`);
    values.push(value === '' ? null : value);
  }
  for (const field of ['hidden_profile', 'profile_visible'] as const) {
    if (!(field in body)) continue;
    const value = body[field];
    if (value !== 0 && value !== 1 && value !== true && value !== false) return json({ error: `Invalid value for ${field}.` }, { status: 400 });
    updates.push(`${field} = ?`);
    values.push(value ? 1 : 0);
  }
  if (updates.length === 0) return json({ error: 'Nothing to update.' }, { status: 400 });
  const now = Math.floor(Date.now() / 1000);
  await db().prepare(`UPDATE profiles SET ${updates.join(', ')}, updated_at = ? WHERE user_id = ?`).bind(...values, now, session.user_id).run();
  const profile = await db().prepare('SELECT * FROM profiles WHERE user_id = ?').bind(session.user_id).first<ProfileRow>();
  return json({ ok: true, profile });
}

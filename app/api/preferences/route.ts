import { db, getSession, json } from '../_lib/auth';

type PrefsRow = {
  user_id: string;
  age_range: string | null;
  height_range: string | null;
  marital_status: string | null;  // JSON array string
  religion: string | null;
  education: string | null;        // JSON array string
  diet: string | null;             // JSON array string
  notes: string | null;
  updated_at: number;
};

const MAX = 2000;
const textFields = ['age_range', 'height_range', 'religion', 'notes'] as const;
const jsonFields = ['marital_status', 'education', 'diet'] as const;

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const row = await db().prepare('SELECT * FROM partner_preferences WHERE user_id = ?').bind(session.user_id).first<PrefsRow>();
  if (!row) return json({ preferences: { user_id: session.user_id } });
  return json({ preferences: row });
}

export async function PUT(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return json({ error: 'Invalid request body.' }, { status: 400 });
  const updates: string[] = [];
  const values: unknown[] = [];
  for (const field of textFields) {
    if (!(field in body)) continue;
    const value = body[field];
    if (value !== null && typeof value !== 'string') return json({ error: `Invalid value for ${field}.` }, { status: 400 });
    if (typeof value === 'string' && value.length > MAX) return json({ error: `Value for ${field} is too long.` }, { status: 400 });
    updates.push(`${field} = ?`);
    values.push(value === '' ? null : value);
  }
  for (const field of jsonFields) {
    if (!(field in body)) continue;
    const value = body[field];
    if (value === null) { updates.push(`${field} = NULL`); continue; }
    if (!Array.isArray(value)) return json({ error: `Invalid value for ${field}.` }, { status: 400 });
    const filtered = value.filter((v): v is string => typeof v === 'string').slice(0, 50);
    updates.push(`${field} = ?`);
    values.push(JSON.stringify(filtered));
  }
  if (updates.length === 0) return json({ error: 'Nothing to update.' }, { status: 400 });
  const now = Math.floor(Date.now() / 1000);
  await db().prepare(
    `INSERT INTO partner_preferences (user_id, ${updates.map((u) => u.split(' = ')[0]).join(', ')}, updated_at)
     VALUES (?, ${updates.map(() => '?').join(', ')}, ?)
     ON CONFLICT(user_id) DO UPDATE SET ${updates.join(', ')}, updated_at = ?`
  ).bind(session.user_id, ...values, now, ...values, now).run();
  const row = await db().prepare('SELECT * FROM partner_preferences WHERE user_id = ?').bind(session.user_id).first<PrefsRow>();
  return json({ ok: true, preferences: row });
}

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
  // Phase B
  dob: string | null;
  marital_status: string | null;
  height: string | null;
  mother_tongue: string | null;
  diet: string | null;
  drink: string | null;
  smoke: string | null;
  hobbies: string | null;
  body_type: string | null;
  complexion: string | null;
  physical_status: string | null;
  blood_group: string | null;
  religion: string | null;
  caste: string | null;
  sub_caste: string | null;
  gothra: string | null;
  manglik: string | null;
  highest_education: string | null;
  college: string | null;
  field_of_study: string | null;
  designation: string | null;
  annual_income: string | null;
  hometown: string | null;
  relocate: string | null;
  father_status: string | null;
  father_occupation: string | null;
  mother_status: string | null;
  mother_occupation: string | null;
  brothers: string | null;
  brothers_married: string | null;
  sisters: string | null;
  sisters_married: string | null;
  family_type: string | null;
  family_values: string | null;
  family_status: string | null;
  about_family: string | null;
  time_of_birth: string | null;
  place_of_birth: string | null;
  rashi: string | null;
  nakshatra: string | null;
  kundli_matching: string | null;
  horoscope_image_key: string | null;
};

// Phase B: include all new columns. Immutables are rejected if already set.
const editableFields = [
  'gender', 'created_for', 'ministry', 'organisation', 'service', 'posting_outlook',
  'preferred_hubs', 'about', 'residence_city', 'residence_district', 'posting_city',
  'posting_district', 'photo_mode', 'family_notes',
  'dob', 'marital_status', 'height', 'mother_tongue', 'diet', 'drink', 'smoke',
  'hobbies', 'body_type', 'complexion', 'physical_status', 'blood_group',
  'religion', 'caste', 'sub_caste', 'gothra', 'manglik',
  'highest_education', 'college', 'field_of_study', 'designation', 'annual_income',
  'hometown', 'relocate',
  'father_status', 'father_occupation', 'mother_status', 'mother_occupation',
  'brothers', 'brothers_married', 'sisters', 'sisters_married',
  'family_type', 'family_values', 'family_status', 'about_family',
  'time_of_birth', 'place_of_birth', 'rashi', 'nakshatra', 'kundli_matching',
] as const;

const immutables = new Set(['gender', 'dob', 'height', 'mother_tongue', 'religion']);

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
  const existing = await db().prepare('SELECT gender, dob, height, mother_tongue, religion FROM profiles WHERE user_id = ?').bind(session.user_id).first<Record<string, string | null>>();
  const updates: string[] = [];
  const values: unknown[] = [];
  for (const field of editableFields) {
    if (!(field in body)) continue;
    const value = body[field];
    if (value !== null && typeof value !== 'string') return json({ error: `Invalid value for ${field}.` }, { status: 400 });
    if (typeof value === 'string' && value.length > 2000) return json({ error: `Value for ${field} is too long.` }, { status: 400 });
    if (immutables.has(field) && existing?.[field] && existing[field] !== value) {
      return json({ error: `${field} is set once and cannot be changed.` }, { status: 409 });
    }
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

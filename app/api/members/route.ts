import { db, getSession, json } from '../_lib/auth';

// F15 companion — members directory. Lists other members for discovery,
// EXCLUDING profiles with hidden_profile = 1. A hidden member can still
// call this to browse (hiding removes you from results, not your access).
// Names are masked to first-name + initial; photos are never returned
// here (gated separately via /api/photo-access).
//
// Orientation-aware: each viewer's search target is computed from their
// own `profiles.gender` and `partner_preferences.pref_looking_for`. A profile
// P is shown to viewer V only if:
//   (1) P.gender is in V's target set (Female/Male/All)
//   (2) P's own pref_looking_for includes V's gender (or P is open to any)
// Plus: self, hidden, blocks (both ways), and verified-only are still enforced.
// The `?gender=male|female|all` query param is an explicit override.

type MemberRow = {
  user_id: string;
  full_name: string;
  service: string | null;
  residence_city: string | null;
  gender: string | null;
  posting_outlook: string | null;
  verified_at: number | null;
  photo_mode: string;
  photo_key: string | null;
  created_for: string | null;
  photo_x: number | null;
  photo_y: number | null;
  photo_zoom: number | null;
  pref_looking_for: string | null;
};

type ViewerRow = {
  my_gender: string | null;
  my_pref: string | null;
};

function maskName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Member';
  const last = parts.length > 1 ? ` ${parts[parts.length - 1][0].toUpperCase()}.` : '';
  return `${parts[0]}${last}`;
}

/**
 * Map the orientation pair + override to:
 * - `myGender`: 'male' | 'female' (null if undeclared → no results)
 * - `targetGender`: 'male' | 'female' | 'any' (what P.gender must be)
 * - `otherAgrees`: matches with V's gender, or 'any'
 */
function resolveOrientation(myGender: string | null, myPref: string | null, override: string | null): { myGender: 'male' | 'female' | null; targetGender: 'male' | 'female' | 'any' } | null {
  // Override takes priority for target (P.gender), but the agreement check
  // still uses myGender (the viewer's own gender), since that's the truth
  // about who the viewer is.
  let targetGender: 'male' | 'female' | 'any';
  if (override === 'male' || override === 'female' || override === 'all') {
    targetGender = override === 'all' ? 'any' : override;
  } else if (myPref === 'Female') targetGender = 'female';
  else if (myPref === 'Male') targetGender = 'male';
  else targetGender = 'any';
  if (myGender !== 'male' && myGender !== 'female') return null;
  return { myGender, targetGender };
}

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: 'Not signed in.' }, { status: 401 });
  const url = new URL(request.url);
  const override = url.searchParams.get('gender');

  // Step 1: resolve viewer's own orientation.
  const viewer = await db()
    .prepare('SELECT p.gender AS my_gender, pp.pref_looking_for AS my_pref FROM users u LEFT JOIN profiles p ON p.user_id = u.id LEFT JOIN partner_preferences pp ON pp.user_id = u.id WHERE u.id = ?')
    .bind(session.user_id)
    .first<ViewerRow>();
  const orient = resolveOrientation(viewer?.my_gender ?? null, viewer?.my_pref ?? null, override);
  if (!orient) return json({ members: [], count: 0, orientationRequired: true });

  // Step 2: build the orientation + other-agreement predicates. Binds must
  // appear in binds[] in the EXACT order the `?` placeholders are read
  // by SQLite — left to right, top to bottom in the WHERE clause.
  const targetClause = orient.targetGender === 'any'
    ? "1 = 1"
    : "p.gender = ?";
  const targetBind = orient.targetGender === 'any' ? null : orient.targetGender;
  // Other side agrees — (P is open to any) OR (P's pref includes V's gender).
  const otherAgrees = `
    (
      pp.pref_looking_for IS NULL
      OR pp.pref_looking_for = 'Any / All Genders'
      OR (pp.pref_looking_for = 'Female' AND ? = 'female')
      OR (pp.pref_looking_for = 'Male'   AND ? = 'male')
    )
  `;

  // WHERE placeholder order (left-to-right top-to-bottom):
  //   u.id != ?                                                       (1)
  //   NOT IN (... blocker_user = ?)                                   (2)
  //   NOT IN (... blocker_user = ?)                                   (3)
  //   target clause: p.gender = ?                                     (4)
  //   otherAgrees first ?                                             (5)
  //   otherAgrees second ?                                            (6)
  const binds: unknown[] = [
    session.user_id,                                  // 1
    session.user_id,                                  // 2
    session.user_id,                                  // 3
  ];
  if (targetBind !== null) binds.push(targetBind);    // 4
  binds.push(orient.myGender, orient.myGender);       // 5, 6

  const conditions = [
    'u.id != ?',
    'COALESCE(p.hidden_profile, 0) = 0',
    'u.id NOT IN (SELECT blocked_user FROM blocks WHERE blocker_user = ?)',
    'u.id NOT IN (SELECT blocker_user FROM blocks WHERE blocked_user = ?)',
    'p.verified_at IS NOT NULL',
    `(${targetClause})`,
    otherAgrees,
  ];

  const rows = await db()
    .prepare(
      `SELECT u.id AS user_id, u.full_name, p.service, p.residence_city, p.gender, p.posting_outlook, p.verified_at, p.photo_mode, p.photo_key, p.created_for, p.photo_x, p.photo_y, p.photo_zoom, pp.pref_looking_for
       FROM users u JOIN profiles p ON p.user_id = u.id LEFT JOIN partner_preferences pp ON pp.user_id = u.id
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
    hasPhoto: !!m.photo_key,
    managedByFamily: !!m.created_for && m.created_for !== 'Myself',
    photoX: m.photo_x ?? 0.5,
    photoY: m.photo_y ?? 0.3,
    photoZoom: m.photo_zoom ?? 1.0,
  }));
  return json({ members, count: members.length });
}
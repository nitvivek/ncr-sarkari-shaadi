CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  login TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  role TEXT NOT NULL DEFAULT 'member',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gender TEXT,
  created_for TEXT,
  ministry TEXT,
  organisation TEXT,
  service TEXT,
  posting_outlook TEXT,
  preferred_hubs TEXT,
  about TEXT,
  family_notes TEXT, -- F30: private notes for family-managed profiles (owner-only)
  residence_city TEXT,
  residence_district TEXT,
  posting_city TEXT,
  posting_district TEXT,
  profile_visible INTEGER NOT NULL DEFAULT 0,
  hidden_profile INTEGER NOT NULL DEFAULT 0, -- F15: 1 = hidden from discovery/search
  photo_mode TEXT NOT NULL DEFAULT 'on_request', -- on_request | verified | hidden
  photo_key TEXT, -- F19: R2 object key of the profile photo (null = none)
  verified_at INTEGER,
  photo_x REAL NOT NULL DEFAULT 0.5,  -- 0016: crop focus (object-position x, 0-1)
  photo_y REAL NOT NULL DEFAULT 0.3,  -- 0016: crop focus (object-position y, 0-1)
  photo_zoom REAL NOT NULL DEFAULT 1.0, -- 0016: crop scale (1.0 = fit, max 2.0)
  -- Phase B: expanded matrimony profile fields (2026-07-22)
  dob TEXT,                       -- ISO date; immutable once set
  marital_status TEXT,
  height TEXT,
  mother_tongue TEXT,
  diet TEXT,
  drink TEXT,
  smoke TEXT,
  hobbies TEXT,                   -- JSON array (string list)
  body_type TEXT,
  complexion TEXT,
  physical_status TEXT,           -- Normal | Differently-abled
  blood_group TEXT,
  religion TEXT,                  -- immutable once set
  caste TEXT,
  sub_caste TEXT,
  gothra TEXT,
  manglik TEXT,
  highest_education TEXT,
  college TEXT,
  field_of_study TEXT,
  designation TEXT,
  annual_income TEXT,
  hometown TEXT,
  relocate TEXT,
  father_status TEXT,
  father_occupation TEXT,
  mother_status TEXT,
  mother_occupation TEXT,
  brothers TEXT,
  brothers_married TEXT,
  sisters TEXT,
  sisters_married TEXT,
  family_type TEXT,
  family_values TEXT,
  family_status TEXT,
  about_family TEXT,
  time_of_birth TEXT,
  place_of_birth TEXT,
  rashi TEXT,
  nakshatra TEXT,
  kundli_matching TEXT,
  horoscope_image_key TEXT,       -- R2 key for kundli image
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

-- F13: interests (send / accept / decline / withdraw)
CREATE TABLE IF NOT EXISTS interests (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | declined | withdrawn
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(from_user, to_user)
);
CREATE INDEX IF NOT EXISTS interests_to_idx ON interests(to_user, status);
CREATE INDEX IF NOT EXISTS interests_from_idx ON interests(from_user, status);

-- F14: photo privacy. profiles.photo_mode: on_request | verified | hidden
-- (image bytes themselves live in R2 later — F19; this is the access layer)
CREATE TABLE IF NOT EXISTS photo_access (
  id TEXT PRIMARY KEY,
  owner_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewer_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'requested', -- requested | granted | denied | revoked
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(owner_user, viewer_user)
);
CREATE INDEX IF NOT EXISTS photo_access_owner_idx ON photo_access(owner_user, status);
CREATE INDEX IF NOT EXISTS photo_access_viewer_idx ON photo_access(viewer_user, status);

-- F16: contact masking. Phone/email are never returned by member-facing
-- endpoints; they are revealed to each other only when BOTH sides agree.
-- One canonical row per pair (user_lo < user_hi).
CREATE TABLE IF NOT EXISTS contact_share (
  user_lo TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_hi TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lo_agreed INTEGER NOT NULL DEFAULT 0,
  hi_agreed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_lo, user_hi)
);

-- F17: blocks (hide both ways) + reports (confidential admin queue)
CREATE TABLE IF NOT EXISTS blocks (
  blocker_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (blocker_user, blocked_user)
);
CREATE INDEX IF NOT EXISTS blocks_blocked_idx ON blocks(blocked_user);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- fake_profile | harassment | inappropriate | spam | other
  detail TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open | reviewed | actioned | dismissed
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status, created_at);

-- F19: verification document submissions (docs live in R2, deleted after review)
CREATE TABLE IF NOT EXISTS verifications (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  govt_id_key TEXT,
  photo_id_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  note TEXT,
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);
CREATE INDEX IF NOT EXISTS verifications_status_idx ON verifications(status, created_at);

-- Chat threads (open messaging + mandatory safeguards: block enforcement,
-- unsolicited-message rate limits)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at INTEGER
);
CREATE INDEX IF NOT EXISTS messages_from_idx ON messages(from_user, to_user, created_at);
CREATE INDEX IF NOT EXISTS messages_to_idx ON messages(to_user, read_at);

-- Phase B: partner preferences. One row per user; fields JSON-encoded for
-- flexibility (age range string, height range string, multi-select lists).
CREATE TABLE IF NOT EXISTS partner_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pref_age TEXT,
  pref_height TEXT,
  pref_marital TEXT,      -- JSON array (0017)
  pref_religion TEXT,
  pref_education TEXT,    -- JSON array
  pref_diet TEXT,         -- JSON array
  pref_notes TEXT,
  pref_looking_for TEXT NOT NULL DEFAULT 'Any / All Genders',  -- 0016/0017
  updated_at INTEGER NOT NULL
);

-- Phase B: multi-photo gallery. Primary photo stays on profiles.photo_key;
-- additional photos live here. Ordered by `position`.
CREATE TABLE IF NOT EXISTS profile_photos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS profile_photos_user_idx ON profile_photos(user_id, position);

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

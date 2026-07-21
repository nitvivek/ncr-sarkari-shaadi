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
  residence_city TEXT,
  residence_district TEXT,
  posting_city TEXT,
  posting_district TEXT,
  profile_visible INTEGER NOT NULL DEFAULT 0,
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

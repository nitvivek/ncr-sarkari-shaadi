-- Phase B profile expansion (2026-07-22). dob was added in a one-off earlier
-- ALTER; the rest of the columns and the new tables are applied here.
ALTER TABLE profiles ADD COLUMN marital_status TEXT;
ALTER TABLE profiles ADD COLUMN height TEXT;
ALTER TABLE profiles ADD COLUMN mother_tongue TEXT;
ALTER TABLE profiles ADD COLUMN diet TEXT;
ALTER TABLE profiles ADD COLUMN drink TEXT;
ALTER TABLE profiles ADD COLUMN smoke TEXT;
ALTER TABLE profiles ADD COLUMN hobbies TEXT;
ALTER TABLE profiles ADD COLUMN body_type TEXT;
ALTER TABLE profiles ADD COLUMN complexion TEXT;
ALTER TABLE profiles ADD COLUMN physical_status TEXT;
ALTER TABLE profiles ADD COLUMN blood_group TEXT;
ALTER TABLE profiles ADD COLUMN religion TEXT;
ALTER TABLE profiles ADD COLUMN caste TEXT;
ALTER TABLE profiles ADD COLUMN sub_caste TEXT;
ALTER TABLE profiles ADD COLUMN gothra TEXT;
ALTER TABLE profiles ADD COLUMN manglik TEXT;
ALTER TABLE profiles ADD COLUMN highest_education TEXT;
ALTER TABLE profiles ADD COLUMN college TEXT;
ALTER TABLE profiles ADD COLUMN field_of_study TEXT;
ALTER TABLE profiles ADD COLUMN designation TEXT;
ALTER TABLE profiles ADD COLUMN annual_income TEXT;
ALTER TABLE profiles ADD COLUMN hometown TEXT;
ALTER TABLE profiles ADD COLUMN relocate TEXT;
ALTER TABLE profiles ADD COLUMN father_status TEXT;
ALTER TABLE profiles ADD COLUMN father_occupation TEXT;
ALTER TABLE profiles ADD COLUMN mother_status TEXT;
ALTER TABLE profiles ADD COLUMN mother_occupation TEXT;
ALTER TABLE profiles ADD COLUMN brothers TEXT;
ALTER TABLE profiles ADD COLUMN brothers_married TEXT;
ALTER TABLE profiles ADD COLUMN sisters TEXT;
ALTER TABLE profiles ADD COLUMN sisters_married TEXT;
ALTER TABLE profiles ADD COLUMN family_type TEXT;
ALTER TABLE profiles ADD COLUMN family_values TEXT;
ALTER TABLE profiles ADD COLUMN family_status TEXT;
ALTER TABLE profiles ADD COLUMN about_family TEXT;
ALTER TABLE profiles ADD COLUMN time_of_birth TEXT;
ALTER TABLE profiles ADD COLUMN place_of_birth TEXT;
ALTER TABLE profiles ADD COLUMN rashi TEXT;
ALTER TABLE profiles ADD COLUMN nakshatra TEXT;
ALTER TABLE profiles ADD COLUMN kundli_matching TEXT;
ALTER TABLE profiles ADD COLUMN horoscope_image_key TEXT;

CREATE TABLE IF NOT EXISTS partner_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age_range TEXT,
  height_range TEXT,
  marital_status TEXT,
  religion TEXT,
  education TEXT,
  diet TEXT,
  notes TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS profile_photos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS profile_photos_user_idx ON profile_photos(user_id, position);

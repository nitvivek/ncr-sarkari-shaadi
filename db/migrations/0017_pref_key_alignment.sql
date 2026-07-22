-- Migration 0017 (2026-07-22):
-- Align partner_preferences column names with the client/seed convention.
-- The client + seed script send `pref_age`, `pref_marital`, etc.; the API
-- route was using bare names so all seed preference writes silently no-op'd.
ALTER TABLE partner_preferences RENAME COLUMN age_range TO pref_age;
ALTER TABLE partner_preferences RENAME COLUMN height_range TO pref_height;
ALTER TABLE partner_preferences RENAME COLUMN marital_status TO pref_marital;
ALTER TABLE partner_preferences RENAME COLUMN religion TO pref_religion;
ALTER TABLE partner_preferences RENAME COLUMN education TO pref_education;
ALTER TABLE partner_preferences RENAME COLUMN diet TO pref_diet;
ALTER TABLE partner_preferences RENAME COLUMN notes TO pref_notes;
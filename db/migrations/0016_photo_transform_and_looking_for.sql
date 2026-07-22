-- Migration 0016 (2026-07-22):
-- 1. Per-profile photo crop/zoom (owner-editable; reader-side only).
-- 2. partner_preferences.looking_for — who the profile owner is looking for.
ALTER TABLE profiles ADD COLUMN photo_x REAL NOT NULL DEFAULT 0.5;
ALTER TABLE profiles ADD COLUMN photo_y REAL NOT NULL DEFAULT 0.3;
ALTER TABLE profiles ADD COLUMN photo_zoom REAL NOT NULL DEFAULT 1.0;

ALTER TABLE partner_preferences ADD COLUMN looking_for TEXT NOT NULL DEFAULT 'Any / All Genders';

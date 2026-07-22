-- Migration 0018 (2026-07-22): rename the last stray bare-name column.
ALTER TABLE partner_preferences RENAME COLUMN looking_for TO pref_looking_for;
-- Run against production Postgres before or immediately after deploying soft-delete code.
-- Railway: connect via `railway connect` psql or the Postgres plugin query UI.

ALTER TABLE contributions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

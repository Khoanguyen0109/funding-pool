-- Run against production Postgres before or immediately after deploying the delete-category code.
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

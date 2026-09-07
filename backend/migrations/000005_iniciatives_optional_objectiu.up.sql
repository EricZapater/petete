-- Migration 000005: Make objectiu_id optional in iniciatives and add client_id

ALTER TABLE iniciatives ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Backfill client_id from existing linked objectius
UPDATE iniciatives i
SET client_id = o.client_id
FROM objectius o
WHERE i.objectiu_id = o.id AND i.client_id IS NULL;

-- Allow objectiu_id to be NULL (initiatives directly linked to a client without an objective)
ALTER TABLE iniciatives ALTER COLUMN objectiu_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_iniciatives_client_id ON iniciatives(client_id);

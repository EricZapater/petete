-- Migration 000005 Down
ALTER TABLE iniciatives DROP COLUMN IF EXISTS client_id;
ALTER TABLE iniciatives ALTER COLUMN objectiu_id SET NOT NULL;

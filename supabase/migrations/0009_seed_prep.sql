-- Allow OSM-seeded places to have no creator account
ALTER TABLE places ALTER COLUMN created_by DROP NOT NULL;

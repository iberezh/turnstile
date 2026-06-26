-- Event geolocation for "near me" discovery. lat/lng is the precise point (from the organizer's
-- map pin); h3 is its Uber H3 cell at a fixed resolution, used as a coarse spatial index so the
-- nearest-events query can prefilter candidates by hex neighborhood before ranking by distance.
ALTER TABLE events ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE events ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE events ADD COLUMN IF NOT EXISTS h3 TEXT;
CREATE INDEX IF NOT EXISTS events_h3_idx ON events(h3);

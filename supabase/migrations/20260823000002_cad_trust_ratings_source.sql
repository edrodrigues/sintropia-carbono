-- Add a rating_source column so a rating mirrored from CAD Trust's Observer
-- API and a rating fetched directly from an agency's own API (e.g. Sylvera)
-- can coexist for the same project + rating_name instead of one silently
-- overwriting the other.
ALTER TABLE cad_trust_ratings
  ADD COLUMN rating_source TEXT NOT NULL DEFAULT 'direct';

ALTER TABLE cad_trust_ratings
  DROP CONSTRAINT cad_trust_ratings_project_rating_unique;

ALTER TABLE cad_trust_ratings
  ADD CONSTRAINT cad_trust_ratings_project_rating_source_unique
    UNIQUE (cad_trust_project_id, rating_name, rating_source);

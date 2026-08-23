ALTER TABLE cad_trust_ratings
  ADD CONSTRAINT cad_trust_ratings_project_rating_unique UNIQUE (cad_trust_project_id, rating_name);

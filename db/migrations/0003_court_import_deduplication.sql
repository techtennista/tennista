CREATE UNIQUE INDEX IF NOT EXISTS tennis_courts_source_external_unique
  ON tennis_courts (source, external_id)
  WHERE external_id IS NOT NULL;

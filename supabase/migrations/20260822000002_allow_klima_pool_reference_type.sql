-- price_references.reference_type's CHECK constraint predates this
-- ingestion and doesn't include 'klima_pool', so every Klima price insert
-- from ingest-toucan-klima fails with "violates check constraint
-- price_references_reference_type_check" (confirmed live via Supabase
-- function logs after the first invoke). This widens the allowed set --
-- additive only, no existing rows are affected since no value is removed.
-- Guarded on the constraint actually existing: this repo's local migration
-- history never defined it (it was added directly on the remote project),
-- so a fresh/local rebuild has no such constraint at all. Only tighten or
-- widen a constraint that's actually there -- never invent a new one where
-- none existed, since that could reject reference_type values used
-- elsewhere that this migration hasn't audited.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.price_references'::regclass
      AND conname = 'price_references_reference_type_check'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.price_references'::regclass
      AND conname = 'price_references_reference_type_check'
      AND pg_get_constraintdef(oid) LIKE '%klima_pool%'
  ) THEN
    ALTER TABLE public.price_references
      DROP CONSTRAINT price_references_reference_type_check;
    ALTER TABLE public.price_references
      ADD CONSTRAINT price_references_reference_type_check
      CHECK (reference_type = ANY (ARRAY[
        'trade', 'bid', 'ask', 'indicative', 'closing', 'rfq', 'range',
        'carbonmark_listing', 'carbonmark_pool', 'market', 'klima_pool'
      ]));
  END IF;
END $$;

-- Create challenges table for company environmental challenge announcements
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  sector TEXT,
  context TEXT NOT NULL,
  expected_result TEXT NOT NULL,
  reward TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  comment_count INTEGER DEFAULT 0,
  solution_comment_id UUID,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select" ON challenges
  FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "challenges_insert" ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND user_type = 'company'
        AND role != 'banned'
    )
  );

CREATE POLICY "challenges_update" ON challenges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "challenges_delete" ON challenges
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Add challenge_id to comments table, make post_id nullable
ALTER TABLE comments ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES challenges(id);
ALTER TABLE comments ALTER COLUMN post_id DROP NOT NULL;

-- RLS policies for comments on challenges
CREATE POLICY "comments_challenge_select" ON comments
  FOR SELECT
  USING (
    (challenge_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM challenges WHERE id = challenge_id AND is_deleted = false
    ))
    OR post_id IS NOT NULL
  );

CREATE POLICY "comments_challenge_insert" ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'banned'
    )
    AND (
      (challenge_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM challenges WHERE id = challenge_id AND is_deleted = false
      ))
      OR post_id IS NOT NULL
    )
  );

-- Trigger to maintain comment_count on challenges
CREATE OR REPLACE FUNCTION update_challenge_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.challenge_id IS NOT NULL THEN
    UPDATE challenges SET comment_count = comment_count + 1 WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' AND OLD.challenge_id IS NOT NULL AND OLD.is_deleted = false THEN
    UPDATE challenges SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.challenge_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_challenge_comment_count ON comments;
CREATE TRIGGER trg_update_challenge_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_comment_count();

-- Prevent direct RPC execution by anon/authenticated
REVOKE EXECUTE ON FUNCTION update_challenge_comment_count() FROM PUBLIC, anon, authenticated;

-- Storage bucket for challenge images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('challenge-images', 'challenge-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "challenge_images_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'challenge-images');

CREATE POLICY "challenge_images_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'challenge-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND user_type = 'company'
        AND role != 'banned'
    )
  );

CREATE POLICY "challenge_images_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'challenge-images' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'challenge-images' AND auth.uid() = owner);

CREATE POLICY "challenge_images_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'challenge-images' AND auth.uid() = owner);

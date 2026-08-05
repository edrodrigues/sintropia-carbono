-- ============================================================
-- SCHEMA BASELINE, PART 2: CONSTRAINTS (GENERATED)
-- ============================================================
--
-- Companion to the baseline tables migration. Split into its own file, and
-- deliberately timestamped AFTER the existing migrations, because some of
-- these foreign keys reference tables that later migrations create (for
-- example challenges). Applying them here keeps a from-scratch replay of
-- this directory working in filename order.
--
-- ON DELETE CASCADE is ASSUMED everywhere: the generated TypeScript types
-- record which columns are foreign keys and what they reference, but not
-- the referential action. Verify against the live database before relying
-- on this. See docs/schema-baseline.md.
-- ============================================================

-- Uniqueness required by the foreign keys below, for targets that are not
-- a primary key.

ALTER TABLE public.carbon_projects
  DROP CONSTRAINT IF EXISTS carbon_projects_project_id_key,
  ADD CONSTRAINT carbon_projects_project_id_key UNIQUE (project_id);


-- Foreign keys.

ALTER TABLE public.alerts
  DROP CONSTRAINT IF EXISTS alerts_user_id_fkey,
  ADD CONSTRAINT alerts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey,
  ADD CONSTRAINT api_keys_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.audit_log
  DROP CONSTRAINT IF EXISTS audit_log_organization_id_fkey,
  ADD CONSTRAINT audit_log_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
  ON DELETE CASCADE;

ALTER TABLE public.audit_log
  DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey,
  ADD CONSTRAINT audit_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.bans
  DROP CONSTRAINT IF EXISTS bans_moderator_id_fkey,
  ADD CONSTRAINT bans_moderator_id_fkey
  FOREIGN KEY (moderator_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.bans
  DROP CONSTRAINT IF EXISTS bans_user_id_fkey,
  ADD CONSTRAINT bans_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.carbon_credits
  DROP CONSTRAINT IF EXISTS carbon_credits_project_id_fkey,
  ADD CONSTRAINT carbon_credits_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.carbon_projects(project_id)
  ON DELETE CASCADE;

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_author_id_fkey,
  ADD CONSTRAINT comments_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_challenge_id_fkey,
  ADD CONSTRAINT comments_challenge_id_fkey
  FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
  ON DELETE CASCADE;

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_parent_id_fkey,
  ADD CONSTRAINT comments_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES public.comments(id)
  ON DELETE CASCADE;

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_post_id_fkey,
  ADD CONSTRAINT comments_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES public.posts(id)
  ON DELETE CASCADE;

ALTER TABLE public.karma_transactions
  DROP CONSTRAINT IF EXISTS karma_transactions_post_id_fkey,
  ADD CONSTRAINT karma_transactions_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES public.posts(id)
  ON DELETE CASCADE;

ALTER TABLE public.karma_transactions
  DROP CONSTRAINT IF EXISTS karma_transactions_user_id_fkey,
  ADD CONSTRAINT karma_transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.post_deletions
  DROP CONSTRAINT IF EXISTS post_deletions_moderator_id_fkey,
  ADD CONSTRAINT post_deletions_moderator_id_fkey
  FOREIGN KEY (moderator_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.post_deletions
  DROP CONSTRAINT IF EXISTS post_deletions_post_id_fkey,
  ADD CONSTRAINT post_deletions_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES public.posts(id)
  ON DELETE CASCADE;

ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_author_id_fkey,
  ADD CONSTRAINT posts_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_organization_id_fkey,
  ADD CONSTRAINT profiles_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
  ON DELETE CASCADE;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_referred_by_fkey,
  ADD CONSTRAINT profiles_referred_by_fkey
  FOREIGN KEY (referred_by) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey,
  ADD CONSTRAINT reports_reporter_id_fkey
  FOREIGN KEY (reporter_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.saved_searches
  DROP CONSTRAINT IF EXISTS saved_searches_user_id_fkey,
  ADD CONSTRAINT saved_searches_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.user_achievements
  DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey,
  ADD CONSTRAINT user_achievements_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.votes
  DROP CONSTRAINT IF EXISTS votes_user_id_fkey,
  ADD CONSTRAINT votes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.warnings
  DROP CONSTRAINT IF EXISTS warnings_moderator_id_fkey,
  ADD CONSTRAINT warnings_moderator_id_fkey
  FOREIGN KEY (moderator_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.warnings
  DROP CONSTRAINT IF EXISTS warnings_user_id_fkey,
  ADD CONSTRAINT warnings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.watchlist_items
  DROP CONSTRAINT IF EXISTS watchlist_items_watchlist_id_fkey,
  ADD CONSTRAINT watchlist_items_watchlist_id_fkey
  FOREIGN KEY (watchlist_id) REFERENCES public.watchlists(id)
  ON DELETE CASCADE;

ALTER TABLE public.watchlists
  DROP CONSTRAINT IF EXISTS watchlists_user_id_fkey,
  ADD CONSTRAINT watchlists_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

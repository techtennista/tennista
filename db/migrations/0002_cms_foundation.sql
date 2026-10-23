CREATE TABLE IF NOT EXISTS cms_admin_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'contributor'
    CHECK (role IN ('super_admin', 'editor', 'contributor')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  object_key TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
  width INTEGER,
  height INTEGER,
  duration_seconds NUMERIC,
  alt_text TEXT,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'staged'
    CHECK (status IN ('staged', 'ready', 'archived')),
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bucket, object_key)
);

CREATE TABLE IF NOT EXISTS cms_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}'::JSONB,
  hero_asset_id UUID REFERENCES cms_assets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  author_user_id TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'scheduled' OR scheduled_for IS NOT NULL),
  CHECK (status <> 'published' OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS cms_posts_status_publish_idx
  ON cms_posts (status, published_at DESC);

CREATE TABLE IF NOT EXISTS cms_post_revisions (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES cms_posts(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, revision_number)
);

CREATE TABLE IF NOT EXISTS cms_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  body JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}'::JSONB,
  cover_asset_id UUID REFERENCES cms_assets(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
  venue_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  registration_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'cancelled', 'archived')),
  published_at TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS cms_events_public_idx
  ON cms_events (status, starts_at);

CREATE TABLE IF NOT EXISTS cms_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  cover_asset_id UUID REFERENCES cms_assets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_gallery_items (
  gallery_id UUID NOT NULL REFERENCES cms_galleries(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES cms_assets(id) ON DELETE CASCADE,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (gallery_id, asset_id)
);

CREATE INDEX IF NOT EXISTS cms_gallery_items_order_idx
  ON cms_gallery_items (gallery_id, sort_order);

CREATE TABLE IF NOT EXISTS cms_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('youtube', 'vimeo', 'upload')),
  external_url TEXT,
  video_asset_id UUID REFERENCES cms_assets(id) ON DELETE SET NULL,
  thumbnail_asset_id UUID REFERENCES cms_assets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (provider IN ('youtube', 'vimeo') AND external_url IS NOT NULL)
    OR (provider = 'upload' AND video_asset_id IS NOT NULL)
  )
);

ALTER TABLE tennis_courts
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS surface_types TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS amenities TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS opening_hours TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT;

ALTER TABLE tennis_courts
  DROP CONSTRAINT IF EXISTS tennis_courts_moderation_status_check;

ALTER TABLE tennis_courts
  ADD CONSTRAINT tennis_courts_moderation_status_check
  CHECK (moderation_status IN ('pending', 'published', 'rejected', 'archived'));

CREATE TABLE IF NOT EXISTS cms_court_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, external_id)
);

CREATE TABLE IF NOT EXISTS cms_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'resolved', 'spam', 'archived')),
  assigned_to TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_submissions_inbox_idx
  ON cms_submissions (status, submitted_at DESC);

CREATE TABLE IF NOT EXISTS cms_site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_state JSONB,
  after_state JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_audit_entity_idx
  ON cms_audit_log (entity_type, entity_id, created_at DESC);

CREATE OR REPLACE FUNCTION cms_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_admin_members_updated_at ON cms_admin_members;
CREATE TRIGGER cms_admin_members_updated_at
BEFORE UPDATE ON cms_admin_members
FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

DROP TRIGGER IF EXISTS cms_assets_updated_at ON cms_assets;
CREATE TRIGGER cms_assets_updated_at
BEFORE UPDATE ON cms_assets
FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

DROP TRIGGER IF EXISTS cms_posts_updated_at ON cms_posts;
CREATE TRIGGER cms_posts_updated_at
BEFORE UPDATE ON cms_posts
FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

DROP TRIGGER IF EXISTS cms_events_updated_at ON cms_events;
CREATE TRIGGER cms_events_updated_at
BEFORE UPDATE ON cms_events
FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

DROP TRIGGER IF EXISTS cms_galleries_updated_at ON cms_galleries;
CREATE TRIGGER cms_galleries_updated_at
BEFORE UPDATE ON cms_galleries
FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

DROP TRIGGER IF EXISTS cms_videos_updated_at ON cms_videos;
CREATE TRIGGER cms_videos_updated_at
BEFORE UPDATE ON cms_videos
FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

DROP TRIGGER IF EXISTS cms_submissions_updated_at ON cms_submissions;
CREATE TRIGGER cms_submissions_updated_at
BEFORE UPDATE ON cms_submissions
FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

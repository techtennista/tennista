CREATE TABLE IF NOT EXISTS cms_admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor'
    CHECK (role IN ('super_admin', 'editor', 'contributor')),
  token_hash TEXT NOT NULL UNIQUE,
  invited_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_admin_invites_open_email_idx
  ON cms_admin_invites (email)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

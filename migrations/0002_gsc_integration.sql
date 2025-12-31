-- Google Search Console Integration Tables

-- Store GSC credentials per organization
CREATE TABLE IF NOT EXISTS gsc_connections (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  site_url TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  permission_level TEXT DEFAULT 'siteOwner',
  last_sync_at TEXT,
  sync_enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, site_url)
);

-- Store site-wide GSC metrics
CREATE TABLE IF NOT EXISTS gsc_site_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  date TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  avg_ctr REAL DEFAULT 0,
  avg_position REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, date)
);

-- Store top queries per organization
CREATE TABLE IF NOT EXISTS gsc_top_queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  date TEXT NOT NULL,
  query TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  position REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gsc_connections_org ON gsc_connections(org_id);
CREATE INDEX IF NOT EXISTS idx_gsc_site_metrics_org_date ON gsc_site_metrics(org_id, date);
CREATE INDEX IF NOT EXISTS idx_gsc_top_queries_org_date ON gsc_top_queries(org_id, date);

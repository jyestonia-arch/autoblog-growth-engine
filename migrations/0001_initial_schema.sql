-- AutoBlog Growth Engine - Initial Database Schema
-- Version: 1.0.0

-- Organizations table (SaaS companies using the platform)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  icp TEXT, -- Ideal Customer Profile
  industry TEXT,
  competitors TEXT, -- JSON array
  plan_tier TEXT DEFAULT 'starter' CHECK(plan_tier IN ('starter', 'growth', 'scale')),
  monthly_post_limit INTEGER DEFAULT 10,
  posts_used_this_month INTEGER DEFAULT 0,
  billing_cycle_start TEXT, -- ISO date
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Websites (publishing targets)
CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  cms_type TEXT DEFAULT 'wordpress' CHECK(cms_type IN ('wordpress', 'headless', 'custom')),
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  auto_publish INTEGER DEFAULT 0, -- Boolean
  default_category TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'error')),
  last_sync_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Keyword Clusters (pillar content organization)
CREATE TABLE IF NOT EXISTS keyword_clusters (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  pillar_keyword TEXT NOT NULL,
  cluster_name TEXT NOT NULL,
  description TEXT,
  funnel_stage TEXT DEFAULT 'tofu' CHECK(funnel_stage IN ('tofu', 'mofu', 'bofu')),
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'completed')),
  total_keywords INTEGER DEFAULT 0,
  articles_generated INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Keywords
CREATE TABLE IF NOT EXISTS keywords (
  id TEXT PRIMARY KEY,
  cluster_id TEXT,
  org_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  search_intent TEXT CHECK(search_intent IN ('informational', 'comparison', 'problem', 'use_case', 'transactional')),
  difficulty_score INTEGER DEFAULT 50,
  funnel_stage TEXT DEFAULT 'tofu' CHECK(funnel_stage IN ('tofu', 'mofu', 'bofu')),
  monthly_searches INTEGER DEFAULT 0,
  priority_score INTEGER DEFAULT 50,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'skipped')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (cluster_id) REFERENCES keyword_clusters(id) ON DELETE SET NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  website_id TEXT,
  keyword_id TEXT,
  cluster_id TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  excerpt TEXT,
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  featured_image_url TEXT,
  categories TEXT, -- JSON array
  tags TEXT, -- JSON array
  faqs TEXT, -- JSON array of {question, answer}
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  scheduled_at TEXT,
  published_at TEXT,
  published_url TEXT,
  cms_post_id TEXT,
  seo_score INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL,
  FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE SET NULL,
  FOREIGN KEY (cluster_id) REFERENCES keyword_clusters(id) ON DELETE SET NULL
);

-- Internal Links
CREATE TABLE IF NOT EXISTS internal_links (
  id TEXT PRIMARY KEY,
  source_article_id TEXT NOT NULL,
  target_article_id TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  link_type TEXT CHECK(link_type IN ('pillar_to_cluster', 'cluster_to_pillar', 'related', 'contextual')),
  position_in_content INTEGER DEFAULT 0,
  status TEXT DEFAULT 'suggested' CHECK(status IN ('suggested', 'applied', 'rejected')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (source_article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (target_article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- SEO Metrics (performance tracking)
CREATE TABLE IF NOT EXISTS seo_metrics (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  date TEXT NOT NULL,
  ranking_position INTEGER,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  indexed_status TEXT DEFAULT 'pending' CHECK(indexed_status IN ('indexed', 'not_indexed', 'pending')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Content Jobs Queue
CREATE TABLE IF NOT EXISTS content_jobs (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK(job_type IN ('keyword_research', 'article_generation', 'internal_linking', 'publish', 'seo_check')),
  payload TEXT NOT NULL, -- JSON
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 5,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  scheduled_at TEXT DEFAULT (datetime('now')),
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Sessions (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_websites_org ON websites(org_id);
CREATE INDEX IF NOT EXISTS idx_clusters_org ON keyword_clusters(org_id);
CREATE INDEX IF NOT EXISTS idx_keywords_cluster ON keywords(cluster_id);
CREATE INDEX IF NOT EXISTS idx_keywords_org ON keywords(org_id);
CREATE INDEX IF NOT EXISTS idx_keywords_status ON keywords(status);
CREATE INDEX IF NOT EXISTS idx_articles_org ON articles(org_id);
CREATE INDEX IF NOT EXISTS idx_articles_website ON articles(website_id);
CREATE INDEX IF NOT EXISTS idx_articles_keyword ON articles(keyword_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_internal_links_source ON internal_links(source_article_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_target ON internal_links(target_article_id);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_article ON seo_metrics(article_id);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_date ON seo_metrics(date);
CREATE INDEX IF NOT EXISTS idx_jobs_org ON content_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON content_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON content_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

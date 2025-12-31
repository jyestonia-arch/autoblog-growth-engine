-- Stripe Billing Tables

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan_tier TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  trial_ends_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Payment history table
CREATE TABLE IF NOT EXISTS payment_history (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  invoice_url TEXT,
  invoice_pdf TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Add stripe_customer_id to organizations if not exists
-- Note: SQLite doesn't support IF NOT EXISTS for columns, so we use a separate approach

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_org_id ON payment_history(org_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

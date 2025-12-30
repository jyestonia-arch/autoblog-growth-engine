// AutoBlog Growth Engine - Type Definitions

export interface Bindings {
  DB: D1Database;
  CACHE: KVNamespace;
  OPENAI_API_KEY?: string;
}

// Organization & User Types
export interface Organization {
  id: string;
  name: string;
  domain: string;
  description: string;
  icp: string; // Ideal Customer Profile
  industry: string;
  competitors: string[];
  plan_tier: 'starter' | 'growth' | 'scale';
  monthly_post_limit: number;
  posts_used_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  org_id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

// Website & CMS Integration
export interface Website {
  id: string;
  org_id: string;
  url: string;
  name: string;
  cms_type: 'wordpress' | 'headless' | 'custom';
  api_endpoint: string;
  api_key_encrypted: string;
  auto_publish: boolean;
  default_category: string;
  status: 'active' | 'inactive' | 'error';
  last_sync_at: string | null;
  created_at: string;
}

// Keyword Research Types
export interface KeywordCluster {
  id: string;
  org_id: string;
  pillar_keyword: string;
  cluster_name: string;
  description: string;
  funnel_stage: 'tofu' | 'mofu' | 'bofu';
  status: 'draft' | 'active' | 'completed';
  total_keywords: number;
  articles_generated: number;
  created_at: string;
}

export interface Keyword {
  id: string;
  cluster_id: string;
  org_id: string;
  keyword: string;
  search_intent: 'informational' | 'comparison' | 'problem' | 'use_case' | 'transactional';
  difficulty_score: number; // 1-100
  funnel_stage: 'tofu' | 'mofu' | 'bofu';
  monthly_searches: number;
  priority_score: number; // Calculated score for content roadmap
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  created_at: string;
}

// Article & Content Types
export interface Article {
  id: string;
  org_id: string;
  website_id: string | null;
  keyword_id: string | null;
  cluster_id: string | null;
  title: string;
  slug: string;
  content: string; // Full HTML/Markdown content
  meta_title: string;
  meta_description: string;
  excerpt: string;
  word_count: number;
  reading_time: number;
  featured_image_url: string | null;
  categories: string[];
  tags: string[];
  faqs: FAQ[];
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  scheduled_at: string | null;
  published_at: string | null;
  published_url: string | null;
  cms_post_id: string | null;
  seo_score: number;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

// Internal Linking Types
export interface InternalLink {
  id: string;
  source_article_id: string;
  target_article_id: string;
  anchor_text: string;
  link_type: 'pillar_to_cluster' | 'cluster_to_pillar' | 'related' | 'contextual';
  position_in_content: number; // Character position
  status: 'suggested' | 'applied' | 'rejected';
  created_at: string;
}

export interface LinkSuggestion {
  source_article: Article;
  target_article: Article;
  suggested_anchor: string;
  relevance_score: number;
  link_type: InternalLink['link_type'];
}

// SEO Performance Types
export interface SEOMetric {
  id: string;
  article_id: string;
  date: string;
  ranking_position: number | null;
  impressions: number;
  clicks: number;
  ctr: number;
  indexed_status: 'indexed' | 'not_indexed' | 'pending';
  created_at: string;
}

export interface DashboardStats {
  total_articles: number;
  published_articles: number;
  scheduled_articles: number;
  draft_articles: number;
  total_keywords: number;
  active_clusters: number;
  posts_this_month: number;
  monthly_limit: number;
  avg_seo_score: number;
  indexed_articles: number;
  top_performers: Article[];
}

// Content Job Queue Types
export interface ContentJob {
  id: string;
  org_id: string;
  job_type: 'keyword_research' | 'article_generation' | 'internal_linking' | 'publish' | 'seo_check';
  payload: string; // JSON stringified
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// Pricing & Billing Types
export interface PlanConfig {
  tier: 'starter' | 'growth' | 'scale';
  name: string;
  price: number;
  posts_per_month: number;
  keyword_research: 'limited' | 'full';
  internal_linking: boolean;
  multiple_websites: boolean;
  priority_support: boolean;
  api_access: boolean;
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    price: 49,
    posts_per_month: 10,
    keyword_research: 'limited',
    internal_linking: false,
    multiple_websites: false,
    priority_support: false,
    api_access: false,
  },
  growth: {
    tier: 'growth',
    name: 'Growth',
    price: 149,
    posts_per_month: 30,
    keyword_research: 'full',
    internal_linking: true,
    multiple_websites: false,
    priority_support: false,
    api_access: true,
  },
  scale: {
    tier: 'scale',
    name: 'Scale',
    price: 349,
    posts_per_month: 60,
    keyword_research: 'full',
    internal_linking: true,
    multiple_websites: true,
    priority_support: true,
    api_access: true,
  },
};

// API Request/Response Types
export interface KeywordResearchRequest {
  saas_description: string;
  target_icp: string;
  industry: string;
  competitors?: string[];
  focus_areas?: ('informational' | 'comparison' | 'problem' | 'use_case')[];
}

export interface ArticleGenerationRequest {
  keyword_id: string;
  tone?: 'professional' | 'casual' | 'technical';
  word_count_target?: number;
  include_faqs?: boolean;
  include_comparison_table?: boolean;
}

export interface PublishRequest {
  article_id: string;
  website_id: string;
  schedule_at?: string; // ISO date string for scheduled publishing
}

// WordPress Integration Types
export interface WordPressConfig {
  site_url: string;
  username: string;
  application_password: string;
}

export interface WordPressPost {
  title: string;
  content: string;
  status: 'publish' | 'draft' | 'pending' | 'future';
  slug: string;
  excerpt: string;
  categories: number[];
  tags: number[];
  meta: {
    _yoast_wpseo_title?: string;
    _yoast_wpseo_metadesc?: string;
  };
  date?: string; // For scheduled posts
}

// AutoBlog Growth Engine - API Routes

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateId, hashPassword, verifyPassword, generateSessionToken, generateSlug, countWords, calculateReadingTime, calculateSEOScore, generateExcerpt } from '../utils/helpers';
import { generateKeywords, saveKeywordResearch } from '../services/keyword-research';
import { generateArticle, saveArticle } from '../services/article-generator';
import { analyzeInternalLinks, getArticleLinkSuggestions, applyInternalLinks, getInternalLinkingStats } from '../services/internal-linking';
import { testWordPressConnection, fullPublishWorkflow } from '../services/wordpress-publisher';
import { getSEOHealthReport, getArticlePerformance } from '../services/seo-tracker';
import { generateKeywordsWithClaude, generateArticleWithClaude, generateLinkSuggestionsWithClaude } from '../services/claude-api';
import { sendArticlePublishedEmail, sendArticleScheduledEmail, sendUsageLimitWarningEmail } from '../services/email-service';
import { 
  fetchSitePerformance, 
  fetchUrlPerformance, 
  syncGSCData, 
  generateGSCAuthUrl, 
  exchangeCodeForTokens,
  getVerifiedSites,
  requestIndexing,
  getSitemaps,
  submitSitemap
} from '../services/google-search-console';
import {
  createCustomer,
  getCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  getSubscription,
  cancelSubscription,
  updateSubscription,
  resumeSubscription,
  getInvoices,
  getUpcomingInvoice,
  verifyWebhookSignature,
  mapSubscriptionStatus,
  getPlanTierFromPriceId,
  getPlanLimits,
} from '../services/stripe-service';
import type { Bindings, Organization, User, Website, Keyword, Article, KeywordCluster, PLAN_CONFIGS, STRIPE_PRICE_IDS } from '../types';

const api = new Hono<{ Bindings: Bindings }>();

api.use('/*', cors());

// Auth middleware helper
async function getAuthUser(c: any): Promise<{ user: User; org: Organization } | null> {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const session = await c.env.DB.prepare(
    `SELECT s.*, u.*, o.* FROM sessions s
     JOIN users u ON s.user_id = u.id
     JOIN organizations o ON u.org_id = o.id
     WHERE s.token = ? AND s.expires_at > datetime('now')`
  ).bind(token).first();

  if (!session) return null;
  return { user: session as unknown as User, org: session as unknown as Organization };
}

// ==================== AUTH ROUTES ====================

api.post('/auth/register', async (c) => {
  const { email, password, name, company, domain, industry } = await c.req.json();

  // Validate input
  if (!email || !password || !name || !company) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Check if user exists
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return c.json({ error: 'Email already registered' }, 400);
  }

  // Create organization
  const orgId = generateId();
  await c.env.DB.prepare(
    `INSERT INTO organizations (id, name, domain, industry, plan_tier, monthly_post_limit, posts_used_this_month, billing_cycle_start)
     VALUES (?, ?, ?, ?, 'starter', 10, 0, date('now'))`
  ).bind(orgId, company, domain || '', industry || '').run();

  // Create user
  const userId = generateId();
  const passwordHash = await hashPassword(password);
  await c.env.DB.prepare(
    `INSERT INTO users (id, org_id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?, 'owner')`
  ).bind(userId, orgId, email, passwordHash, name).run();

  // Create session
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await c.env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(generateId(), userId, token, expiresAt).run();

  return c.json({ token, user: { id: userId, email, name, role: 'owner' }, org: { id: orgId, name: company } });
});

api.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();

  const user = await c.env.DB.prepare(
    `SELECT u.*, o.name as org_name, o.plan_tier FROM users u
     JOIN organizations o ON u.org_id = o.id
     WHERE u.email = ?`
  ).bind(email).first() as any;

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await c.env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(generateId(), user.id, token, expiresAt).run();

  return c.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    org: { id: user.org_id, name: user.org_name, plan_tier: user.plan_tier }
  });
});

api.post('/auth/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  return c.json({ success: true });
});

// ==================== ORGANIZATION ROUTES ====================

api.get('/organization', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const org = await c.env.DB.prepare('SELECT * FROM organizations WHERE id = ?').bind(auth.org.id).first();
  return c.json(org);
});

api.put('/organization', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { description, icp, industry, competitors } = await c.req.json();

  await c.env.DB.prepare(
    `UPDATE organizations SET description = ?, icp = ?, industry = ?, competitors = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).bind(description, icp, industry, JSON.stringify(competitors || []), auth.org.id).run();

  return c.json({ success: true });
});

// ==================== DASHBOARD ROUTES ====================

api.get('/dashboard/stats', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const orgId = auth.org.id;

  // Get article counts
  const articleStats = await c.env.DB.prepare(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
       SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
       SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
       AVG(seo_score) as avg_seo_score
     FROM articles WHERE org_id = ?`
  ).bind(orgId).first() as any;

  // Get keyword counts
  const keywordStats = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM keywords WHERE org_id = ?`
  ).bind(orgId).first() as any;

  // Get cluster counts
  const clusterStats = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM keyword_clusters WHERE org_id = ? AND status = 'active'`
  ).bind(orgId).first() as any;

  // Get org limits
  const org = await c.env.DB.prepare(
    `SELECT monthly_post_limit, posts_used_this_month FROM organizations WHERE id = ?`
  ).bind(orgId).first() as any;

  // Get top performing articles
  const topArticles = await c.env.DB.prepare(
    `SELECT a.id, a.title, a.seo_score, a.published_at, a.published_url
     FROM articles a
     WHERE a.org_id = ? AND a.status = 'published'
     ORDER BY a.seo_score DESC LIMIT 5`
  ).bind(orgId).all();

  return c.json({
    total_articles: articleStats?.total || 0,
    published_articles: articleStats?.published || 0,
    scheduled_articles: articleStats?.scheduled || 0,
    draft_articles: articleStats?.draft || 0,
    total_keywords: keywordStats?.total || 0,
    active_clusters: clusterStats?.total || 0,
    posts_this_month: org?.posts_used_this_month || 0,
    monthly_limit: org?.monthly_post_limit || 10,
    avg_seo_score: Math.round(articleStats?.avg_seo_score || 0),
    top_performers: topArticles.results || [],
  });
});

// ==================== KEYWORD ROUTES ====================

api.post('/keywords/research', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const request = await c.req.json();
  const apiKey = c.env.ANTHROPIC_API_KEY;

  // Use Claude API if available, otherwise fallback to template-based
  if (apiKey) {
    try {
      const claudeResult = await generateKeywordsWithClaude(apiKey, {
        saasDescription: request.saas_description,
        targetIcp: request.target_icp,
        industry: request.industry,
        competitors: request.competitors || [],
      });

      // Transform Claude response to our format and save
      const clusters: any[] = [];
      const keywords: any[] = [];

      for (const cluster of claudeResult.clusters) {
        const clusterId = generateId();
        clusters.push({
          id: clusterId,
          org_id: auth.org.id,
          pillar_keyword: cluster.pillarKeyword,
          cluster_name: cluster.name,
          description: `AI-generated ${cluster.funnelStage.toUpperCase()} content cluster`,
          funnel_stage: cluster.funnelStage,
          status: 'active',
          total_keywords: cluster.keywords.length,
          articles_generated: 0,
          created_at: new Date().toISOString(),
        });

        for (const kw of cluster.keywords) {
          keywords.push({
            id: generateId(),
            cluster_id: clusterId,
            org_id: auth.org.id,
            keyword: kw.keyword,
            search_intent: kw.intent,
            difficulty_score: kw.difficulty,
            funnel_stage: cluster.funnelStage,
            monthly_searches: Math.floor(Math.random() * 1000) + 100,
            priority_score: kw.priority,
            status: 'pending',
            created_at: new Date().toISOString(),
          });
        }
      }

      // Save to database
      await saveKeywordResearch(c.env.DB, { clusters, keywords, contentRoadmap: [] });

      return c.json({
        clusters,
        keywords: keywords.slice(0, 20),
        total_keywords: keywords.length,
        ai_powered: true,
      });
    } catch (e: any) {
      console.error('Claude API error:', e.message);
      // Fallback to template-based generation
    }
  }

  // Fallback: Template-based generation
  const result = await generateKeywords(request, auth.org.id);
  await saveKeywordResearch(c.env.DB, result);

  return c.json({
    clusters: result.clusters,
    keywords: result.keywords.slice(0, 20),
    total_keywords: result.keywords.length,
    content_roadmap: result.contentRoadmap,
    ai_powered: false,
  });
});

api.get('/keywords/clusters', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const clusters = await c.env.DB.prepare(
    `SELECT * FROM keyword_clusters WHERE org_id = ? ORDER BY created_at DESC`
  ).bind(auth.org.id).all();

  return c.json(clusters.results || []);
});

api.get('/keywords/clusters/:id', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const clusterId = c.req.param('id');

  const cluster = await c.env.DB.prepare(
    `SELECT * FROM keyword_clusters WHERE id = ? AND org_id = ?`
  ).bind(clusterId, auth.org.id).first();

  if (!cluster) return c.json({ error: 'Cluster not found' }, 404);

  const keywords = await c.env.DB.prepare(
    `SELECT * FROM keywords WHERE cluster_id = ? ORDER BY priority_score DESC`
  ).bind(clusterId).all();

  return c.json({ cluster, keywords: keywords.results || [] });
});

api.get('/keywords', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const status = c.req.query('status');
  const clusterId = c.req.query('cluster_id');

  let query = `SELECT * FROM keywords WHERE org_id = ?`;
  const params: any[] = [auth.org.id];

  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  if (clusterId) {
    query += ` AND cluster_id = ?`;
    params.push(clusterId);
  }

  query += ` ORDER BY priority_score DESC`;

  const keywords = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(keywords.results || []);
});

// ==================== ARTICLE ROUTES ====================

api.post('/articles/generate', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  // Check monthly limit
  const orgData = await c.env.DB.prepare(
    `SELECT posts_used_this_month, monthly_post_limit, description, icp, industry FROM organizations WHERE id = ?`
  ).bind(auth.org.id).first() as any;

  if (orgData.posts_used_this_month >= orgData.monthly_post_limit) {
    return c.json({ error: 'Monthly post limit reached. Please upgrade your plan.' }, 403);
  }

  const { keyword_id } = await c.req.json();

  // Get keyword
  const keyword = await c.env.DB.prepare(
    `SELECT * FROM keywords WHERE id = ? AND org_id = ?`
  ).bind(keyword_id, auth.org.id).first() as Keyword;

  if (!keyword) return c.json({ error: 'Keyword not found' }, 404);

  const apiKey = c.env.ANTHROPIC_API_KEY;
  let article: Article;

  // Use Claude API if available
  if (apiKey) {
    try {
      const claudeResult = await generateArticleWithClaude(apiKey, {
        keyword: keyword.keyword,
        searchIntent: keyword.search_intent,
        funnelStage: keyword.funnel_stage,
        saasDescription: orgData.description,
        targetIcp: orgData.icp,
        industry: orgData.industry,
      });

      // Create article from Claude response
      article = {
        id: generateId(),
        org_id: auth.org.id,
        website_id: null,
        keyword_id: keyword.id,
        cluster_id: keyword.cluster_id,
        title: claudeResult.title,
        slug: generateSlug(claudeResult.title),
        content: claudeResult.content,
        meta_title: claudeResult.metaTitle,
        meta_description: claudeResult.metaDescription,
        excerpt: claudeResult.excerpt,
        word_count: countWords(claudeResult.content),
        reading_time: calculateReadingTime(claudeResult.content),
        featured_image_url: null,
        categories: [keyword.search_intent],
        tags: claudeResult.tags,
        faqs: claudeResult.faqs,
        status: 'draft',
        scheduled_at: null,
        published_at: null,
        published_url: null,
        cms_post_id: null,
        seo_score: calculateSEOScore({
          title: claudeResult.title,
          content: claudeResult.content,
          meta_title: claudeResult.metaTitle,
          meta_description: claudeResult.metaDescription,
          faqs: JSON.stringify(claudeResult.faqs),
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save article
      await saveArticle(c.env.DB, article);

      // Update keyword status
      await c.env.DB.prepare(
        `UPDATE keywords SET status = 'completed' WHERE id = ?`
      ).bind(keyword_id).run();

      // Increment posts used
      await c.env.DB.prepare(
        `UPDATE organizations SET posts_used_this_month = posts_used_this_month + 1 WHERE id = ?`
      ).bind(auth.org.id).run();

      return c.json({ ...article, ai_powered: true });
    } catch (e: any) {
      console.error('Claude API error:', e.message);
      // Fallback to template-based generation
    }
  }

  // Fallback: Template-based generation
  const result = await generateArticle(keyword, auth.org.id);
  await saveArticle(c.env.DB, result.article);

  // Update keyword status
  await c.env.DB.prepare(
    `UPDATE keywords SET status = 'completed' WHERE id = ?`
  ).bind(keyword_id).run();

  // Increment posts used
  await c.env.DB.prepare(
    `UPDATE organizations SET posts_used_this_month = posts_used_this_month + 1 WHERE id = ?`
  ).bind(auth.org.id).run();

  // Check if usage limit warning needed
  const newUsed = orgData.posts_used_this_month + 1;
  const percentUsed = Math.round((newUsed / orgData.monthly_post_limit) * 100);
  
  if ((percentUsed >= 80 || percentUsed >= 100) && c.env.RESEND_API_KEY) {
    const user = await c.env.DB.prepare(
      `SELECT email FROM users WHERE org_id = ? AND role = 'owner' LIMIT 1`
    ).bind(auth.org.id).first() as { email: string };

    const org = await c.env.DB.prepare(
      `SELECT name FROM organizations WHERE id = ?`
    ).bind(auth.org.id).first() as { name: string };

    if (user?.email && org?.name) {
      sendUsageLimitWarningEmail(c.env.RESEND_API_KEY, user.email, {
        organizationName: org.name,
        postsUsed: newUsed,
        postsLimit: orgData.monthly_post_limit,
        percentUsed,
      }).catch(e => console.error('Email send error:', e));
    }
  }

  return c.json({ ...result.article, ai_powered: false });
});

api.get('/articles', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const status = c.req.query('status');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  let query = `SELECT * FROM articles WHERE org_id = ?`;
  const params: any[] = [auth.org.id];

  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const articles = await c.env.DB.prepare(query).bind(...params).all();

  // Get total count
  let countQuery = `SELECT COUNT(*) as count FROM articles WHERE org_id = ?`;
  const countParams: any[] = [auth.org.id];
  if (status) {
    countQuery += ` AND status = ?`;
    countParams.push(status);
  }
  const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first() as any;

  return c.json({
    articles: articles.results || [],
    total: countResult?.count || 0,
    limit,
    offset,
  });
});

api.get('/articles/:id', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const articleId = c.req.param('id');

  const article = await c.env.DB.prepare(
    `SELECT * FROM articles WHERE id = ? AND org_id = ?`
  ).bind(articleId, auth.org.id).first();

  if (!article) return c.json({ error: 'Article not found' }, 404);

  return c.json(article);
});

api.put('/articles/:id', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const articleId = c.req.param('id');
  const updates = await c.req.json();

  // Build update query dynamically
  const allowedFields = ['title', 'content', 'meta_title', 'meta_description', 'status', 'scheduled_at'];
  const setClauses: string[] = [];
  const params: any[] = [];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      params.push(updates[field]);
    }
  }

  if (setClauses.length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  setClauses.push(`updated_at = datetime('now')`);
  params.push(articleId, auth.org.id);

  await c.env.DB.prepare(
    `UPDATE articles SET ${setClauses.join(', ')} WHERE id = ? AND org_id = ?`
  ).bind(...params).run();

  // Send email notification when article is scheduled
  if (updates.status === 'scheduled' && updates.scheduled_at && c.env.RESEND_API_KEY) {
    // Get article and user details
    const article = await c.env.DB.prepare(
      `SELECT a.title, k.keyword as target_keyword FROM articles a
       LEFT JOIN keywords k ON a.keyword_id = k.id
       WHERE a.id = ?`
    ).bind(articleId).first() as { title: string; target_keyword?: string };

    const user = await c.env.DB.prepare(
      `SELECT email FROM users WHERE org_id = ? AND role = 'owner' LIMIT 1`
    ).bind(auth.org.id).first() as { email: string };

    if (article && user?.email) {
      // Non-blocking email send
      sendArticleScheduledEmail(c.env.RESEND_API_KEY, user.email, {
        articleTitle: article.title,
        scheduledAt: updates.scheduled_at,
        keyword: article.target_keyword || 'N/A',
      }).catch(e => console.error('Email send error:', e));
    }
  }

  return c.json({ success: true });
});

// ==================== WEBSITE ROUTES ====================

api.get('/websites', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const websites = await c.env.DB.prepare(
    `SELECT id, org_id, url, name, cms_type, auto_publish, default_category, status, last_sync_at, created_at
     FROM websites WHERE org_id = ?`
  ).bind(auth.org.id).all();

  return c.json(websites.results || []);
});

api.post('/websites', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { url, name, cms_type, api_endpoint, api_key, auto_publish, default_category } = await c.req.json();

  const websiteId = generateId();

  await c.env.DB.prepare(
    `INSERT INTO websites (id, org_id, url, name, cms_type, api_endpoint, api_key_encrypted, auto_publish, default_category, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
  ).bind(
    websiteId, auth.org.id, url, name, cms_type || 'wordpress',
    api_endpoint || url, api_key, auto_publish ? 1 : 0, default_category || ''
  ).run();

  return c.json({ id: websiteId, success: true });
});

api.post('/websites/:id/test', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const websiteId = c.req.param('id');

  const website = await c.env.DB.prepare(
    `SELECT * FROM websites WHERE id = ? AND org_id = ?`
  ).bind(websiteId, auth.org.id).first() as Website;

  if (!website) return c.json({ error: 'Website not found' }, 404);

  const result = await testWordPressConnection(website);
  return c.json(result);
});

// ==================== PUBLISHING ROUTES ====================

api.post('/articles/:id/publish', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const articleId = c.req.param('id');
  const { website_id, schedule_at } = await c.req.json();

  const article = await c.env.DB.prepare(
    `SELECT a.*, k.keyword as target_keyword FROM articles a
     LEFT JOIN keywords k ON a.keyword_id = k.id
     WHERE a.id = ? AND a.org_id = ?`
  ).bind(articleId, auth.org.id).first() as Article & { target_keyword?: string };

  if (!article) return c.json({ error: 'Article not found' }, 404);

  const website = await c.env.DB.prepare(
    `SELECT * FROM websites WHERE id = ? AND org_id = ?`
  ).bind(website_id, auth.org.id).first() as Website;

  if (!website) return c.json({ error: 'Website not found' }, 404);

  const result = await fullPublishWorkflow(article, website, c.env.DB, schedule_at);

  // Send email notification on successful publish
  if (result.success && c.env.RESEND_API_KEY) {
    // Get user email
    const user = await c.env.DB.prepare(
      `SELECT email FROM users WHERE org_id = ? AND role = 'owner' LIMIT 1`
    ).bind(auth.org.id).first() as { email: string };

    if (user?.email) {
      // Non-blocking email send
      sendArticlePublishedEmail(c.env.RESEND_API_KEY, user.email, {
        articleTitle: article.title,
        articleUrl: result.publishedUrl || `${website.url}/blog/${article.slug}`,
        publishedAt: new Date().toISOString(),
        seoScore: article.seo_score,
        wordCount: article.word_count,
        keyword: (article as any).target_keyword || 'N/A',
      }).catch(e => console.error('Email send error:', e));
    }
  }

  return c.json(result);
});

// ==================== INTERNAL LINKING ROUTES ====================

api.post('/internal-links/analyze', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const result = await analyzeInternalLinks(c.env.DB, auth.org.id);
  
  return c.json({
    orphan_count: result.orphanArticles.length,
    well_linked_count: result.wellLinkedArticles.length,
    suggestions_count: result.suggestions.length,
    link_density_score: result.linkDensityScore,
    top_suggestions: result.suggestions.slice(0, 10).map(s => ({
      source_title: s.source_article.title,
      target_title: s.target_article.title,
      anchor: s.suggested_anchor,
      relevance: s.relevance_score,
      type: s.link_type,
    })),
  });
});

api.get('/internal-links/stats', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const stats = await getInternalLinkingStats(c.env.DB, auth.org.id);
  return c.json(stats);
});

api.get('/articles/:id/link-suggestions', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const articleId = c.req.param('id');
  const suggestions = await getArticleLinkSuggestions(c.env.DB, articleId);

  return c.json(suggestions.map(s => ({
    target_id: s.target_article.id,
    target_title: s.target_article.title,
    anchor: s.suggested_anchor,
    relevance: s.relevance_score,
    type: s.link_type,
  })));
});

api.post('/articles/:id/apply-links', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const articleId = c.req.param('id');
  const { links } = await c.req.json();

  const result = await applyInternalLinks(c.env.DB, articleId, links);
  return c.json(result);
});

// ==================== SEO ANALYTICS ROUTES ====================

api.get('/analytics/seo-health', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const report = await getSEOHealthReport(c.env.DB, auth.org.id);
  return c.json(report);
});

api.get('/analytics/articles/:id/performance', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const articleId = c.req.param('id');
  const days = parseInt(c.req.query('days') || '30');

  const metrics = await getArticlePerformance(c.env.DB, articleId, days);
  return c.json(metrics);
});

// ==================== BILLING ROUTES ====================

api.get('/billing/usage', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const org = await c.env.DB.prepare(
    `SELECT plan_tier, monthly_post_limit, posts_used_this_month, billing_cycle_start
     FROM organizations WHERE id = ?`
  ).bind(auth.org.id).first() as any;

  return c.json({
    plan: org.plan_tier,
    posts_used: org.posts_used_this_month,
    posts_limit: org.monthly_post_limit,
    billing_cycle_start: org.billing_cycle_start,
    percentage_used: Math.round((org.posts_used_this_month / org.monthly_post_limit) * 100),
  });
});

api.get('/billing/plans', async (c) => {
  return c.json([
    { tier: 'starter', name: 'Starter', price: 49, posts: 10, features: ['10 posts/month', 'Basic keyword research', 'Single website'] },
    { tier: 'growth', name: 'Growth', price: 149, posts: 30, features: ['30 posts/month', 'Full keyword research', 'Internal linking', 'API access'] },
    { tier: 'scale', name: 'Scale', price: 349, posts: 60, features: ['60+ posts/month', 'Multiple domains', 'Priority support', 'Custom integrations'] },
  ]);
});

// ==================== EMAIL NOTIFICATION ROUTES ====================

api.get('/notifications/status', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  return c.json({
    email_notifications_enabled: !!c.env.RESEND_API_KEY,
    notification_types: [
      { type: 'article_published', description: 'When an article is published to your website', enabled: true },
      { type: 'article_scheduled', description: 'When an article is scheduled via drag & drop', enabled: true },
      { type: 'usage_warning', description: 'When you reach 80% or 100% of your monthly limit', enabled: true },
      { type: 'weekly_report', description: 'Weekly content performance summary', enabled: false },
    ],
  });
});

api.post('/notifications/test', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.RESEND_API_KEY) {
    return c.json({ error: 'Email notifications not configured. RESEND_API_KEY is required.' }, 400);
  }

  // Get user email
  const user = await c.env.DB.prepare(
    `SELECT email, name FROM users WHERE id = ?`
  ).bind(auth.user.id).first() as { email: string; name: string };

  if (!user?.email) {
    return c.json({ error: 'User email not found' }, 400);
  }

  // Send test email
  const result = await sendArticlePublishedEmail(c.env.RESEND_API_KEY, user.email, {
    articleTitle: 'Test Article - Email Notifications Working!',
    articleUrl: 'https://example.com/test-article',
    publishedAt: new Date().toISOString(),
    seoScore: 92,
    wordCount: 1850,
    keyword: 'test keyword',
  });

  if (result.success) {
    return c.json({ success: true, message: `Test email sent to ${user.email}` });
  } else {
    return c.json({ error: result.error || 'Failed to send test email' }, 500);
  }
});

// ==================== GOOGLE SEARCH CONSOLE ROUTES ====================

api.get('/gsc/status', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  // Check if GSC is configured
  const gscConfigured = !!(c.env.GSC_CLIENT_ID && c.env.GSC_CLIENT_SECRET);

  // Check if org has GSC connection
  const connection = await c.env.DB.prepare(
    `SELECT * FROM gsc_connections WHERE org_id = ? LIMIT 1`
  ).bind(auth.org.id).first();

  // Get latest metrics
  let latestMetrics = null;
  if (connection) {
    latestMetrics = await c.env.DB.prepare(
      `SELECT * FROM gsc_site_metrics WHERE org_id = ? ORDER BY date DESC LIMIT 1`
    ).bind(auth.org.id).first();
  }

  return c.json({
    gsc_configured: gscConfigured,
    connected: !!connection,
    connection: connection ? {
      site_url: (connection as any).site_url,
      last_sync_at: (connection as any).last_sync_at,
      sync_enabled: !!(connection as any).sync_enabled,
    } : null,
    latest_metrics: latestMetrics,
  });
});

api.get('/gsc/auth-url', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.GSC_CLIENT_ID) {
    return c.json({ error: 'Google Search Console not configured. GSC_CLIENT_ID is required.' }, 400);
  }

  // Get the current URL to build redirect URI
  const url = new URL(c.req.url);
  const redirectUri = `${url.protocol}//${url.host}/api/gsc/callback`;

  // Generate state token for security
  const state = `${auth.org.id}:${Date.now()}`;

  const authUrl = generateGSCAuthUrl(c.env.GSC_CLIENT_ID, redirectUri, state);

  return c.json({ auth_url: authUrl, redirect_uri: redirectUri });
});

api.get('/gsc/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const error = c.req.query('error');

  if (error) {
    return c.html(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Connection Failed</h1>
          <p>Error: ${error}</p>
          <p><a href="/">Return to Dashboard</a></p>
        </body>
      </html>
    `);
  }

  if (!code || !state) {
    return c.html(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Invalid Request</h1>
          <p>Missing authorization code or state</p>
          <p><a href="/">Return to Dashboard</a></p>
        </body>
      </html>
    `);
  }

  if (!c.env.GSC_CLIENT_ID || !c.env.GSC_CLIENT_SECRET) {
    return c.html(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Configuration Error</h1>
          <p>GSC credentials not configured</p>
          <p><a href="/">Return to Dashboard</a></p>
        </body>
      </html>
    `);
  }

  try {
    const [orgId] = state.split(':');

    const url = new URL(c.req.url);
    const redirectUri = `${url.protocol}//${url.host}/api/gsc/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
      c.env.GSC_CLIENT_ID,
      c.env.GSC_CLIENT_SECRET,
      code,
      redirectUri
    );

    // Get verified sites
    const sites = await getVerifiedSites({
      clientId: c.env.GSC_CLIENT_ID,
      clientSecret: c.env.GSC_CLIENT_SECRET,
      refreshToken: tokens.refreshToken,
    });

    if (sites.length === 0) {
      return c.html(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>⚠️ No Verified Sites</h1>
            <p>No verified sites found in your Google Search Console account.</p>
            <p>Please verify your site in GSC first.</p>
            <p><a href="/">Return to Dashboard</a></p>
          </body>
        </html>
      `);
    }

    // Store connection for first site (could show selector UI)
    const siteUrl = sites[0].siteUrl;
    const connectionId = crypto.randomUUID();

    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO gsc_connections (id, org_id, site_url, refresh_token_encrypted, permission_level)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(connectionId, orgId, siteUrl, tokens.refreshToken, sites[0].permissionLevel).run();

    return c.html(`
      <html>
        <head>
          <script>
            setTimeout(() => {
              window.opener?.postMessage({ type: 'gsc_connected', siteUrl: '${siteUrl}' }, '*');
              window.close();
            }, 2000);
          </script>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>✅ Connected Successfully!</h1>
          <p>Site: ${siteUrl}</p>
          <p>This window will close automatically...</p>
        </body>
      </html>
    `);
  } catch (e: any) {
    return c.html(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Connection Failed</h1>
          <p>Error: ${e.message}</p>
          <p><a href="/">Return to Dashboard</a></p>
        </body>
      </html>
    `);
  }
});

api.post('/gsc/sync', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.GSC_CLIENT_ID || !c.env.GSC_CLIENT_SECRET) {
    return c.json({ error: 'GSC not configured' }, 400);
  }

  // Get connection
  const connection = await c.env.DB.prepare(
    `SELECT * FROM gsc_connections WHERE org_id = ?`
  ).bind(auth.org.id).first() as any;

  if (!connection) {
    return c.json({ error: 'GSC not connected' }, 400);
  }

  // Sync data
  const result = await syncGSCData(
    c.env.DB,
    {
      clientId: c.env.GSC_CLIENT_ID,
      clientSecret: c.env.GSC_CLIENT_SECRET,
      refreshToken: connection.refresh_token_encrypted,
    },
    auth.org.id,
    connection.site_url
  );

  if (result.success) {
    // Update last sync time
    await c.env.DB.prepare(
      `UPDATE gsc_connections SET last_sync_at = datetime('now') WHERE org_id = ?`
    ).bind(auth.org.id).run();
  }

  return c.json(result);
});

api.get('/gsc/performance', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.GSC_CLIENT_ID || !c.env.GSC_CLIENT_SECRET) {
    return c.json({ error: 'GSC not configured' }, 400);
  }

  const connection = await c.env.DB.prepare(
    `SELECT * FROM gsc_connections WHERE org_id = ?`
  ).bind(auth.org.id).first() as any;

  if (!connection) {
    return c.json({ error: 'GSC not connected' }, 400);
  }

  const days = parseInt(c.req.query('days') || '30');
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    const performance = await fetchSitePerformance(
      {
        clientId: c.env.GSC_CLIENT_ID,
        clientSecret: c.env.GSC_CLIENT_SECRET,
        refreshToken: connection.refresh_token_encrypted,
      },
      connection.site_url,
      startDate,
      endDate
    );

    return c.json(performance);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

api.get('/gsc/articles/:id/performance', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.GSC_CLIENT_ID || !c.env.GSC_CLIENT_SECRET) {
    return c.json({ error: 'GSC not configured' }, 400);
  }

  const articleId = c.req.param('id');

  // Get article
  const article = await c.env.DB.prepare(
    `SELECT published_url FROM articles WHERE id = ? AND org_id = ?`
  ).bind(articleId, auth.org.id).first() as any;

  if (!article?.published_url) {
    return c.json({ error: 'Article not found or not published' }, 404);
  }

  const connection = await c.env.DB.prepare(
    `SELECT * FROM gsc_connections WHERE org_id = ?`
  ).bind(auth.org.id).first() as any;

  if (!connection) {
    return c.json({ error: 'GSC not connected' }, 400);
  }

  const days = parseInt(c.req.query('days') || '30');
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    const performance = await fetchUrlPerformance(
      {
        clientId: c.env.GSC_CLIENT_ID,
        clientSecret: c.env.GSC_CLIENT_SECRET,
        refreshToken: connection.refresh_token_encrypted,
      },
      connection.site_url,
      article.published_url,
      startDate,
      endDate
    );

    return c.json(performance);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

api.post('/gsc/request-indexing', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.GSC_CLIENT_ID || !c.env.GSC_CLIENT_SECRET) {
    return c.json({ error: 'GSC not configured' }, 400);
  }

  const { url } = await c.req.json();

  if (!url) {
    return c.json({ error: 'URL is required' }, 400);
  }

  const connection = await c.env.DB.prepare(
    `SELECT * FROM gsc_connections WHERE org_id = ?`
  ).bind(auth.org.id).first() as any;

  if (!connection) {
    return c.json({ error: 'GSC not connected' }, 400);
  }

  const result = await requestIndexing(
    {
      clientId: c.env.GSC_CLIENT_ID,
      clientSecret: c.env.GSC_CLIENT_SECRET,
      refreshToken: connection.refresh_token_encrypted,
    },
    url
  );

  return c.json(result);
});

api.get('/gsc/sitemaps', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.GSC_CLIENT_ID || !c.env.GSC_CLIENT_SECRET) {
    return c.json({ error: 'GSC not configured' }, 400);
  }

  const connection = await c.env.DB.prepare(
    `SELECT * FROM gsc_connections WHERE org_id = ?`
  ).bind(auth.org.id).first() as any;

  if (!connection) {
    return c.json({ error: 'GSC not connected' }, 400);
  }

  try {
    const sitemaps = await getSitemaps(
      {
        clientId: c.env.GSC_CLIENT_ID,
        clientSecret: c.env.GSC_CLIENT_SECRET,
        refreshToken: connection.refresh_token_encrypted,
      },
      connection.site_url
    );

    return c.json(sitemaps);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

api.post('/gsc/disconnect', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  await c.env.DB.prepare(
    `DELETE FROM gsc_connections WHERE org_id = ?`
  ).bind(auth.org.id).run();

  return c.json({ success: true });
});

// ==================== STRIPE BILLING ROUTES ====================

// Stripe Price IDs (replace with your actual Stripe Price IDs)
const STRIPE_PRICES = {
  starter: {
    monthly: 'price_starter_monthly',
    yearly: 'price_starter_yearly',
  },
  growth: {
    monthly: 'price_growth_monthly', 
    yearly: 'price_growth_yearly',
  },
  scale: {
    monthly: 'price_scale_monthly',
    yearly: 'price_scale_yearly',
  },
};

api.get('/billing/subscription', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  // Get subscription from database
  const subscription = await c.env.DB.prepare(
    `SELECT * FROM subscriptions WHERE org_id = ? ORDER BY created_at DESC LIMIT 1`
  ).bind(auth.org.id).first() as any;

  if (!subscription) {
    return c.json({
      has_subscription: false,
      plan_tier: 'starter',
      status: 'none',
      message: 'No active subscription. Using free tier.',
    });
  }

  // If we have Stripe configured and a subscription ID, get live data
  if (c.env.STRIPE_SECRET_KEY && subscription.stripe_subscription_id) {
    try {
      const stripeSubscription = await getSubscription(
        c.env.STRIPE_SECRET_KEY,
        subscription.stripe_subscription_id
      );

      return c.json({
        has_subscription: true,
        plan_tier: subscription.plan_tier,
        status: mapSubscriptionStatus(stripeSubscription.status),
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        trial_ends_at: stripeSubscription.trial_end 
          ? new Date(stripeSubscription.trial_end * 1000).toISOString() 
          : null,
      });
    } catch (e: any) {
      console.error('Stripe error:', e.message);
    }
  }

  return c.json({
    has_subscription: true,
    plan_tier: subscription.plan_tier,
    status: subscription.status,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    cancel_at_period_end: !!subscription.cancel_at_period_end,
  });
});

api.post('/billing/create-checkout', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured. STRIPE_SECRET_KEY is required.' }, 400);
  }

  const { plan_tier, billing_cycle = 'monthly' } = await c.req.json();

  if (!plan_tier || !['starter', 'growth', 'scale'].includes(plan_tier)) {
    return c.json({ error: 'Invalid plan tier' }, 400);
  }

  const priceId = STRIPE_PRICES[plan_tier as keyof typeof STRIPE_PRICES][billing_cycle as 'monthly' | 'yearly'];
  
  if (!priceId) {
    return c.json({ error: 'Invalid billing cycle' }, 400);
  }

  try {
    // Check if org already has a Stripe customer
    let subscription = await c.env.DB.prepare(
      `SELECT stripe_customer_id FROM subscriptions WHERE org_id = ? LIMIT 1`
    ).bind(auth.org.id).first() as any;

    let customerId = subscription?.stripe_customer_id;

    // Create customer if doesn't exist
    if (!customerId) {
      const user = await c.env.DB.prepare(
        `SELECT email, name FROM users WHERE org_id = ? AND role = 'owner' LIMIT 1`
      ).bind(auth.org.id).first() as { email: string; name: string };

      const org = await c.env.DB.prepare(
        `SELECT name FROM organizations WHERE id = ?`
      ).bind(auth.org.id).first() as { name: string };

      const customer = await createCustomer(c.env.STRIPE_SECRET_KEY, {
        email: user.email,
        name: user.name || org.name,
        orgId: auth.org.id,
      });

      customerId = customer.id;
    }

    // Get URL for redirects
    const url = new URL(c.req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Create checkout session
    const session = await createCheckoutSession(c.env.STRIPE_SECRET_KEY, {
      customerId,
      priceId,
      successUrl: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/?checkout=canceled`,
      trialPeriodDays: plan_tier === 'starter' ? undefined : 14, // 14-day trial for Growth/Scale
      metadata: {
        org_id: auth.org.id,
        plan_tier,
      },
    });

    return c.json({ 
      checkout_url: session.url,
      session_id: session.sessionId,
    });
  } catch (e: any) {
    console.error('Stripe checkout error:', e.message);
    return c.json({ error: e.message }, 500);
  }
});

api.post('/billing/portal', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 400);
  }

  // Get customer ID
  const subscription = await c.env.DB.prepare(
    `SELECT stripe_customer_id FROM subscriptions WHERE org_id = ? LIMIT 1`
  ).bind(auth.org.id).first() as any;

  if (!subscription?.stripe_customer_id) {
    return c.json({ error: 'No subscription found' }, 400);
  }

  try {
    const url = new URL(c.req.url);
    const returnUrl = `${url.protocol}//${url.host}/`;

    const session = await createBillingPortalSession(
      c.env.STRIPE_SECRET_KEY,
      subscription.stripe_customer_id,
      returnUrl
    );

    return c.json({ portal_url: session.url });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

api.post('/billing/change-plan', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 400);
  }

  const { new_plan_tier, billing_cycle = 'monthly' } = await c.req.json();

  if (!new_plan_tier || !['starter', 'growth', 'scale'].includes(new_plan_tier)) {
    return c.json({ error: 'Invalid plan tier' }, 400);
  }

  const subscription = await c.env.DB.prepare(
    `SELECT * FROM subscriptions WHERE org_id = ? AND status = 'active' LIMIT 1`
  ).bind(auth.org.id).first() as any;

  if (!subscription?.stripe_subscription_id) {
    return c.json({ error: 'No active subscription found' }, 400);
  }

  const newPriceId = STRIPE_PRICES[new_plan_tier as keyof typeof STRIPE_PRICES][billing_cycle as 'monthly' | 'yearly'];

  try {
    // Preview the change
    const preview = await getUpcomingInvoice(
      c.env.STRIPE_SECRET_KEY,
      subscription.stripe_customer_id,
      subscription.stripe_subscription_id,
      newPriceId
    );

    // Apply the change
    await updateSubscription(
      c.env.STRIPE_SECRET_KEY,
      subscription.stripe_subscription_id,
      newPriceId
    );

    // Update local database
    const newLimits = getPlanLimits(new_plan_tier as 'starter' | 'growth' | 'scale');
    
    await c.env.DB.prepare(
      `UPDATE subscriptions SET plan_tier = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(new_plan_tier, subscription.id).run();

    await c.env.DB.prepare(
      `UPDATE organizations SET plan_tier = ?, monthly_post_limit = ? WHERE id = ?`
    ).bind(new_plan_tier, newLimits.monthlyPosts, auth.org.id).run();

    return c.json({
      success: true,
      new_plan_tier,
      prorated_amount: preview.amount_due / 100,
      message: `Plan changed to ${new_plan_tier}. Changes are effective immediately.`,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

api.post('/billing/cancel', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 400);
  }

  const { immediately = false } = await c.req.json();

  const subscription = await c.env.DB.prepare(
    `SELECT * FROM subscriptions WHERE org_id = ? AND status IN ('active', 'trialing') LIMIT 1`
  ).bind(auth.org.id).first() as any;

  if (!subscription?.stripe_subscription_id) {
    return c.json({ error: 'No active subscription found' }, 400);
  }

  try {
    await cancelSubscription(
      c.env.STRIPE_SECRET_KEY,
      subscription.stripe_subscription_id,
      immediately
    );

    // Update local database
    if (immediately) {
      await c.env.DB.prepare(
        `UPDATE subscriptions SET status = 'canceled', updated_at = datetime('now') WHERE id = ?`
      ).bind(subscription.id).run();

      await c.env.DB.prepare(
        `UPDATE organizations SET plan_tier = 'starter', monthly_post_limit = 10 WHERE id = ?`
      ).bind(auth.org.id).run();
    } else {
      await c.env.DB.prepare(
        `UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = datetime('now') WHERE id = ?`
      ).bind(subscription.id).run();
    }

    return c.json({
      success: true,
      canceled_immediately: immediately,
      message: immediately 
        ? 'Subscription canceled immediately.' 
        : `Subscription will be canceled at the end of the billing period (${subscription.current_period_end}).`,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

api.post('/billing/resume', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 400);
  }

  const subscription = await c.env.DB.prepare(
    `SELECT * FROM subscriptions WHERE org_id = ? AND cancel_at_period_end = 1 LIMIT 1`
  ).bind(auth.org.id).first() as any;

  if (!subscription?.stripe_subscription_id) {
    return c.json({ error: 'No canceled subscription to resume' }, 400);
  }

  try {
    await resumeSubscription(
      c.env.STRIPE_SECRET_KEY,
      subscription.stripe_subscription_id
    );

    await c.env.DB.prepare(
      `UPDATE subscriptions SET cancel_at_period_end = 0, updated_at = datetime('now') WHERE id = ?`
    ).bind(subscription.id).run();

    return c.json({
      success: true,
      message: 'Subscription resumed successfully.',
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

api.get('/billing/invoices', async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  if (!c.env.STRIPE_SECRET_KEY) {
    // Return from local database
    const invoices = await c.env.DB.prepare(
      `SELECT * FROM payment_history WHERE org_id = ? ORDER BY created_at DESC LIMIT 20`
    ).bind(auth.org.id).all();
    return c.json(invoices.results || []);
  }

  const subscription = await c.env.DB.prepare(
    `SELECT stripe_customer_id FROM subscriptions WHERE org_id = ? LIMIT 1`
  ).bind(auth.org.id).first() as any;

  if (!subscription?.stripe_customer_id) {
    return c.json([]);
  }

  try {
    const invoices = await getInvoices(
      c.env.STRIPE_SECRET_KEY,
      subscription.stripe_customer_id,
      20
    );

    return c.json(invoices.map((inv: any) => ({
      id: inv.id,
      amount: inv.amount_paid / 100,
      currency: inv.currency,
      status: inv.status,
      description: inv.lines?.data?.[0]?.description || 'Subscription',
      invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
      created_at: new Date(inv.created * 1000).toISOString(),
    })));
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

api.get('/billing/config', async (c) => {
  // Return public Stripe config
  return c.json({
    stripe_configured: !!c.env.STRIPE_SECRET_KEY,
    publishable_key: c.env.STRIPE_PUBLISHABLE_KEY || null,
    plans: [
      {
        tier: 'starter',
        name: 'Starter',
        price_monthly: 49,
        price_yearly: 470,
        posts_per_month: 10,
        features: ['10 posts/month', 'Basic keyword research', 'Single website', 'Email support'],
      },
      {
        tier: 'growth',
        name: 'Growth',
        price_monthly: 149,
        price_yearly: 1430,
        posts_per_month: 30,
        features: ['30 posts/month', 'Full keyword research', 'Internal linking', 'API access', 'GSC integration', '14-day trial'],
        popular: true,
      },
      {
        tier: 'scale',
        name: 'Scale',
        price_monthly: 349,
        price_yearly: 3350,
        posts_per_month: 60,
        features: ['60+ posts/month', 'Multiple domains', 'Priority support', 'Custom integrations', 'White-label', '14-day trial'],
      },
    ],
  });
});

// Stripe Webhook Handler
api.post('/webhooks/stripe', async (c) => {
  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 400);
  }

  const payload = await c.req.text();
  const signature = c.req.header('stripe-signature');

  if (!signature) {
    return c.json({ error: 'No signature' }, 400);
  }

  // Verify webhook (simplified - in production use proper HMAC verification)
  let event;
  if (c.env.STRIPE_WEBHOOK_SECRET) {
    const result = verifyWebhookSignature(payload, signature, c.env.STRIPE_WEBHOOK_SECRET);
    if (!result.valid) {
      return c.json({ error: 'Invalid signature' }, 400);
    }
    event = result.event;
  } else {
    // Development mode - parse without verification
    try {
      event = JSON.parse(payload);
    } catch {
      return c.json({ error: 'Invalid payload' }, 400);
    }
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orgId = session.metadata?.org_id;
        const planTier = session.metadata?.plan_tier || 'starter';
        
        if (orgId && session.subscription) {
          // Get subscription details
          const stripeSubscription = await getSubscription(
            c.env.STRIPE_SECRET_KEY,
            session.subscription
          );

          // Save subscription to database
          const subscriptionId = crypto.randomUUID();
          await c.env.DB.prepare(
            `INSERT OR REPLACE INTO subscriptions 
             (id, org_id, stripe_customer_id, stripe_subscription_id, plan_tier, status, 
              current_period_start, current_period_end, cancel_at_period_end)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            subscriptionId,
            orgId,
            session.customer,
            session.subscription,
            planTier,
            mapSubscriptionStatus(stripeSubscription.status),
            new Date(stripeSubscription.current_period_start * 1000).toISOString(),
            new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            stripeSubscription.cancel_at_period_end ? 1 : 0
          ).run();

          // Update organization plan
          const limits = getPlanLimits(planTier as 'starter' | 'growth' | 'scale');
          await c.env.DB.prepare(
            `UPDATE organizations SET plan_tier = ?, monthly_post_limit = ?, updated_at = datetime('now') 
             WHERE id = ?`
          ).bind(planTier, limits.monthlyPosts, orgId).run();
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Find subscription in database
        const localSub = await c.env.DB.prepare(
          `SELECT * FROM subscriptions WHERE stripe_subscription_id = ?`
        ).bind(subscription.id).first() as any;

        if (localSub) {
          await c.env.DB.prepare(
            `UPDATE subscriptions SET 
             status = ?, 
             current_period_start = ?, 
             current_period_end = ?,
             cancel_at_period_end = ?,
             updated_at = datetime('now')
             WHERE stripe_subscription_id = ?`
          ).bind(
            mapSubscriptionStatus(subscription.status),
            new Date(subscription.current_period_start * 1000).toISOString(),
            new Date(subscription.current_period_end * 1000).toISOString(),
            subscription.cancel_at_period_end ? 1 : 0,
            subscription.id
          ).run();
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        const localSub = await c.env.DB.prepare(
          `SELECT * FROM subscriptions WHERE stripe_subscription_id = ?`
        ).bind(subscription.id).first() as any;

        if (localSub) {
          await c.env.DB.prepare(
            `UPDATE subscriptions SET status = 'canceled', updated_at = datetime('now') 
             WHERE stripe_subscription_id = ?`
          ).bind(subscription.id).run();

          // Downgrade organization to free tier
          await c.env.DB.prepare(
            `UPDATE organizations SET plan_tier = 'starter', monthly_post_limit = 10 
             WHERE id = ?`
          ).bind(localSub.org_id).run();
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        
        // Find org by customer ID
        const subscription = await c.env.DB.prepare(
          `SELECT org_id FROM subscriptions WHERE stripe_customer_id = ?`
        ).bind(invoice.customer).first() as any;

        if (subscription) {
          // Record payment
          const paymentId = crypto.randomUUID();
          await c.env.DB.prepare(
            `INSERT INTO payment_history 
             (id, org_id, stripe_invoice_id, amount, currency, status, description, invoice_url, invoice_pdf)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            paymentId,
            subscription.org_id,
            invoice.id,
            invoice.amount_paid,
            invoice.currency,
            'paid',
            invoice.lines?.data?.[0]?.description || 'Subscription',
            invoice.hosted_invoice_url,
            invoice.invoice_pdf
          ).run();

          // Reset monthly usage at the start of new billing period
          await c.env.DB.prepare(
            `UPDATE organizations SET posts_used_this_month = 0, billing_cycle_start = date('now')
             WHERE id = ?`
          ).bind(subscription.org_id).run();
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        const subscription = await c.env.DB.prepare(
          `SELECT org_id FROM subscriptions WHERE stripe_customer_id = ?`
        ).bind(invoice.customer).first() as any;

        if (subscription) {
          await c.env.DB.prepare(
            `UPDATE subscriptions SET status = 'past_due', updated_at = datetime('now')
             WHERE org_id = ?`
          ).bind(subscription.org_id).run();
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (e: any) {
    console.error('Webhook error:', e.message);
    return c.json({ error: 'Webhook handler failed' }, 500);
  }
});

export default api;

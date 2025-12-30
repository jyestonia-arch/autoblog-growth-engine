// AutoBlog Growth Engine - Intelligent Internal Linking System
// Automatically analyzes and suggests internal links between articles

import { generateId } from '../utils/helpers';
import type { Article, InternalLink, LinkSuggestion, Bindings } from '../types';

interface LinkAnalysisResult {
  orphanArticles: Article[];
  wellLinkedArticles: Article[];
  suggestions: LinkSuggestion[];
  linkDensityScore: number;
}

interface TopicCluster {
  clusterId: string;
  pillarArticle: Article | null;
  clusterArticles: Article[];
}

/**
 * Analyze internal linking structure and generate suggestions
 */
export async function analyzeInternalLinks(
  db: D1Database,
  orgId: string
): Promise<LinkAnalysisResult> {
  // Get all published articles for the organization
  const articlesResult = await db
    .prepare(
      `SELECT * FROM articles 
       WHERE org_id = ? AND status IN ('published', 'scheduled', 'draft')
       ORDER BY created_at DESC`
    )
    .bind(orgId)
    .all();

  const articles = (articlesResult.results || []) as Article[];

  // Get existing internal links
  const linksResult = await db
    .prepare(
      `SELECT * FROM internal_links 
       WHERE source_article_id IN (SELECT id FROM articles WHERE org_id = ?)
       AND status = 'applied'`
    )
    .bind(orgId)
    .all();

  const existingLinks = (linksResult.results || []) as InternalLink[];

  // Build link graph
  const outboundLinks = new Map<string, Set<string>>();
  const inboundLinks = new Map<string, Set<string>>();

  for (const link of existingLinks) {
    if (!outboundLinks.has(link.source_article_id)) {
      outboundLinks.set(link.source_article_id, new Set());
    }
    outboundLinks.get(link.source_article_id)!.add(link.target_article_id);

    if (!inboundLinks.has(link.target_article_id)) {
      inboundLinks.set(link.target_article_id, new Set());
    }
    inboundLinks.get(link.target_article_id)!.add(link.source_article_id);
  }

  // Identify orphan articles (no inbound links)
  const orphanArticles = articles.filter(
    (article) => !inboundLinks.has(article.id) || inboundLinks.get(article.id)!.size === 0
  );

  // Identify well-linked articles (3+ inbound links)
  const wellLinkedArticles = articles.filter(
    (article) => inboundLinks.has(article.id) && inboundLinks.get(article.id)!.size >= 3
  );

  // Generate link suggestions
  const suggestions = await generateLinkSuggestions(articles, existingLinks, db);

  // Calculate overall link density score
  const totalPossibleLinks = articles.length * (articles.length - 1);
  const actualLinks = existingLinks.length;
  const linkDensityScore = totalPossibleLinks > 0 
    ? Math.min(100, Math.round((actualLinks / (totalPossibleLinks * 0.1)) * 100))
    : 0;

  return {
    orphanArticles,
    wellLinkedArticles,
    suggestions,
    linkDensityScore,
  };
}

/**
 * Generate intelligent link suggestions based on content similarity
 */
async function generateLinkSuggestions(
  articles: Article[],
  existingLinks: InternalLink[],
  db: D1Database
): Promise<LinkSuggestion[]> {
  const suggestions: LinkSuggestion[] = [];
  const existingLinkPairs = new Set(
    existingLinks.map((l) => `${l.source_article_id}:${l.target_article_id}`)
  );

  // Group articles by cluster
  const clusterMap = new Map<string, Article[]>();
  for (const article of articles) {
    if (article.cluster_id) {
      if (!clusterMap.has(article.cluster_id)) {
        clusterMap.set(article.cluster_id, []);
      }
      clusterMap.get(article.cluster_id)!.push(article);
    }
  }

  // Generate cluster-based suggestions (pillar <-> cluster)
  for (const [clusterId, clusterArticles] of clusterMap) {
    // Find the pillar article (usually the first or longest one)
    const pillarArticle = clusterArticles.reduce((a, b) => 
      a.word_count > b.word_count ? a : b
    );

    for (const article of clusterArticles) {
      if (article.id === pillarArticle.id) continue;

      // Suggest pillar -> cluster links
      const pairKey1 = `${pillarArticle.id}:${article.id}`;
      if (!existingLinkPairs.has(pairKey1)) {
        suggestions.push({
          source_article: pillarArticle,
          target_article: article,
          suggested_anchor: extractAnchorFromTitle(article.title),
          relevance_score: 90,
          link_type: 'pillar_to_cluster',
        });
      }

      // Suggest cluster -> pillar links
      const pairKey2 = `${article.id}:${pillarArticle.id}`;
      if (!existingLinkPairs.has(pairKey2)) {
        suggestions.push({
          source_article: article,
          target_article: pillarArticle,
          suggested_anchor: extractAnchorFromTitle(pillarArticle.title),
          relevance_score: 85,
          link_type: 'cluster_to_pillar',
        });
      }
    }
  }

  // Generate cross-cluster related suggestions based on keyword/tag overlap
  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      const article1 = articles[i];
      const article2 = articles[j];

      // Skip if already linked or in same cluster
      const pairKey1 = `${article1.id}:${article2.id}`;
      const pairKey2 = `${article2.id}:${article1.id}`;
      
      if (existingLinkPairs.has(pairKey1) || existingLinkPairs.has(pairKey2)) continue;
      if (article1.cluster_id && article1.cluster_id === article2.cluster_id) continue;

      // Calculate relevance based on tag overlap
      const tags1 = new Set(safeParseArray(article1.tags));
      const tags2 = new Set(safeParseArray(article2.tags));
      const overlap = [...tags1].filter(t => tags2.has(t)).length;

      if (overlap >= 2) {
        const relevanceScore = Math.min(80, 50 + overlap * 10);

        suggestions.push({
          source_article: article1,
          target_article: article2,
          suggested_anchor: extractAnchorFromTitle(article2.title),
          relevance_score: relevanceScore,
          link_type: 'related',
        });

        suggestions.push({
          source_article: article2,
          target_article: article1,
          suggested_anchor: extractAnchorFromTitle(article1.title),
          relevance_score: relevanceScore,
          link_type: 'related',
        });
      }
    }
  }

  // Sort by relevance score
  suggestions.sort((a, b) => b.relevance_score - a.relevance_score);

  // Return top suggestions (limit to prevent overwhelming)
  return suggestions.slice(0, 50);
}

/**
 * Apply internal links to article content
 */
export async function applyInternalLinks(
  db: D1Database,
  articleId: string,
  links: Array<{ targetArticleId: string; anchorText: string; linkType: InternalLink['link_type'] }>
): Promise<{ success: boolean; appliedCount: number; updatedContent: string }> {
  // Get the source article
  const articleResult = await db
    .prepare('SELECT * FROM articles WHERE id = ?')
    .bind(articleId)
    .first();

  if (!articleResult) {
    return { success: false, appliedCount: 0, updatedContent: '' };
  }

  const article = articleResult as Article;
  let content = article.content;
  let appliedCount = 0;

  for (const link of links) {
    // Get target article for URL
    const targetResult = await db
      .prepare('SELECT slug, title FROM articles WHERE id = ?')
      .bind(link.targetArticleId)
      .first();

    if (!targetResult) continue;

    const target = targetResult as { slug: string; title: string };

    // Find a good position to insert the link
    const linkHtml = `<a href="/blog/${target.slug}" title="${target.title}">${link.anchorText}</a>`;

    // Try to find the anchor text in content (case-insensitive)
    const anchorRegex = new RegExp(`(?<!<a[^>]*>)\\b(${escapeRegex(link.anchorText)})\\b(?![^<]*<\\/a>)`, 'i');
    
    if (anchorRegex.test(content)) {
      content = content.replace(anchorRegex, linkHtml);
      appliedCount++;

      // Save the link record
      await db
        .prepare(
          `INSERT INTO internal_links (id, source_article_id, target_article_id, anchor_text, link_type, status, created_at)
           VALUES (?, ?, ?, ?, ?, 'applied', datetime('now'))`
        )
        .bind(
          generateId(),
          articleId,
          link.targetArticleId,
          link.anchorText,
          link.linkType
        )
        .run();
    }
  }

  // Update article content if any links were applied
  if (appliedCount > 0) {
    await db
      .prepare('UPDATE articles SET content = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(content, articleId)
      .run();
  }

  return {
    success: true,
    appliedCount,
    updatedContent: content,
  };
}

/**
 * Get link suggestions for a specific article
 */
export async function getArticleLinkSuggestions(
  db: D1Database,
  articleId: string
): Promise<LinkSuggestion[]> {
  // Get the source article
  const articleResult = await db
    .prepare('SELECT * FROM articles WHERE id = ?')
    .bind(articleId)
    .first();

  if (!articleResult) return [];

  const sourceArticle = articleResult as Article;

  // Get other articles from same org
  const otherArticlesResult = await db
    .prepare(
      `SELECT * FROM articles 
       WHERE org_id = ? AND id != ? AND status IN ('published', 'scheduled', 'draft')`
    )
    .bind(sourceArticle.org_id, articleId)
    .all();

  const otherArticles = (otherArticlesResult.results || []) as Article[];

  // Get existing links from this article
  const existingLinksResult = await db
    .prepare('SELECT target_article_id FROM internal_links WHERE source_article_id = ?')
    .bind(articleId)
    .all();

  const existingTargets = new Set(
    (existingLinksResult.results || []).map((l: any) => l.target_article_id)
  );

  // Generate suggestions
  const suggestions: LinkSuggestion[] = [];
  const sourceTags = new Set(safeParseArray(sourceArticle.tags));

  for (const target of otherArticles) {
    if (existingTargets.has(target.id)) continue;

    const targetTags = new Set(safeParseArray(target.tags));
    const overlap = [...sourceTags].filter(t => targetTags.has(t)).length;

    // Determine link type and relevance
    let linkType: InternalLink['link_type'] = 'contextual';
    let relevanceScore = 30 + overlap * 15;

    if (sourceArticle.cluster_id === target.cluster_id && sourceArticle.cluster_id) {
      // Same cluster - higher relevance
      relevanceScore = Math.min(95, relevanceScore + 30);
      
      // Determine pillar vs cluster relationship based on word count
      if (sourceArticle.word_count > target.word_count * 1.3) {
        linkType = 'pillar_to_cluster';
      } else if (target.word_count > sourceArticle.word_count * 1.3) {
        linkType = 'cluster_to_pillar';
      } else {
        linkType = 'related';
      }
    } else if (overlap >= 2) {
      linkType = 'related';
    }

    if (relevanceScore >= 30) {
      suggestions.push({
        source_article: sourceArticle,
        target_article: target,
        suggested_anchor: extractAnchorFromTitle(target.title),
        relevance_score: Math.min(100, relevanceScore),
        link_type: linkType,
      });
    }
  }

  return suggestions.sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 10);
}

/**
 * Detect and report orphan content
 */
export async function detectOrphanContent(
  db: D1Database,
  orgId: string
): Promise<Article[]> {
  // Get articles with no inbound links
  const result = await db
    .prepare(
      `SELECT a.* FROM articles a
       WHERE a.org_id = ? 
       AND a.status = 'published'
       AND a.id NOT IN (
         SELECT DISTINCT target_article_id FROM internal_links WHERE status = 'applied'
       )`
    )
    .bind(orgId)
    .all();

  return (result.results || []) as Article[];
}

/**
 * Get internal linking stats for dashboard
 */
export async function getInternalLinkingStats(
  db: D1Database,
  orgId: string
): Promise<{
  totalLinks: number;
  avgLinksPerArticle: number;
  orphanCount: number;
  topLinkedArticles: Array<{ title: string; inboundCount: number }>;
}> {
  // Total links
  const totalLinksResult = await db
    .prepare(
      `SELECT COUNT(*) as count FROM internal_links il
       JOIN articles a ON il.source_article_id = a.id
       WHERE a.org_id = ? AND il.status = 'applied'`
    )
    .bind(orgId)
    .first();

  const totalLinks = (totalLinksResult as any)?.count || 0;

  // Article count
  const articleCountResult = await db
    .prepare(
      `SELECT COUNT(*) as count FROM articles WHERE org_id = ? AND status = 'published'`
    )
    .bind(orgId)
    .first();

  const articleCount = (articleCountResult as any)?.count || 1;
  const avgLinksPerArticle = Math.round((totalLinks / articleCount) * 10) / 10;

  // Orphan count
  const orphans = await detectOrphanContent(db, orgId);
  const orphanCount = orphans.length;

  // Top linked articles
  const topLinkedResult = await db
    .prepare(
      `SELECT a.title, COUNT(il.id) as inbound_count
       FROM articles a
       LEFT JOIN internal_links il ON a.id = il.target_article_id AND il.status = 'applied'
       WHERE a.org_id = ? AND a.status = 'published'
       GROUP BY a.id
       ORDER BY inbound_count DESC
       LIMIT 5`
    )
    .bind(orgId)
    .all();

  const topLinkedArticles = (topLinkedResult.results || []).map((r: any) => ({
    title: r.title,
    inboundCount: r.inbound_count,
  }));

  return {
    totalLinks,
    avgLinksPerArticle,
    orphanCount,
    topLinkedArticles,
  };
}

// Helper functions
function safeParseArray(json: string | string[] | null): string[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function extractAnchorFromTitle(title: string): string {
  // Remove common suffixes like year, "guide", etc.
  let anchor = title
    .replace(/\s*\(\d{4}\)\s*$/i, '')
    .replace(/:\s*[^:]+$/i, '')
    .replace(/\s*-\s*[^-]+$/i, '')
    .trim();

  // Truncate if too long
  if (anchor.length > 50) {
    anchor = anchor.substring(0, 47) + '...';
  }

  return anchor;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

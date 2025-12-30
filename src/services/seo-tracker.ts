// AutoBlog Growth Engine - SEO Performance Feedback Loop

import { generateId } from '../utils/helpers';
import type { Article, SEOMetric } from '../types';

interface PerformanceData {
  articleId: string;
  date: string;
  ranking?: number;
  impressions: number;
  clicks: number;
  indexed: boolean;
}

interface SEOHealthReport {
  overallScore: number;
  indexedRate: number;
  avgRanking: number | null;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  recommendations: string[];
  topPerformers: Article[];
  underperformers: Article[];
}

/**
 * Record SEO metrics for an article
 */
export async function recordSEOMetrics(
  db: D1Database,
  data: PerformanceData
): Promise<void> {
  const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;

  await db.prepare(
    `INSERT INTO seo_metrics (id, article_id, date, ranking_position, impressions, clicks, ctr, indexed_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    generateId(),
    data.articleId,
    data.date,
    data.ranking || null,
    data.impressions,
    data.clicks,
    ctr,
    data.indexed ? 'indexed' : 'not_indexed'
  ).run();
}

/**
 * Get SEO health report for organization
 */
export async function getSEOHealthReport(
  db: D1Database,
  orgId: string
): Promise<SEOHealthReport> {
  // Get all published articles
  const articlesResult = await db.prepare(
    `SELECT * FROM articles WHERE org_id = ? AND status = 'published'`
  ).bind(orgId).all();
  
  const articles = (articlesResult.results || []) as Article[];

  // Get latest metrics for each article
  const metricsResult = await db.prepare(
    `SELECT sm.* FROM seo_metrics sm
     INNER JOIN (
       SELECT article_id, MAX(date) as max_date
       FROM seo_metrics GROUP BY article_id
     ) latest ON sm.article_id = latest.article_id AND sm.date = latest.max_date
     WHERE sm.article_id IN (SELECT id FROM articles WHERE org_id = ?)`
  ).bind(orgId).all();

  const metrics = (metricsResult.results || []) as SEOMetric[];

  // Calculate stats
  const indexedCount = metrics.filter(m => m.indexed_status === 'indexed').length;
  const indexedRate = articles.length > 0 ? (indexedCount / articles.length) * 100 : 0;

  const rankings = metrics.filter(m => m.ranking_position !== null).map(m => m.ranking_position!);
  const avgRanking = rankings.length > 0 ? rankings.reduce((a, b) => a + b, 0) / rankings.length : null;

  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (indexedRate < 80) {
    recommendations.push('Low index rate. Submit sitemap to Google Search Console.');
  }
  if (avgRanking && avgRanking > 20) {
    recommendations.push('Average ranking is low. Focus on content quality and backlinks.');
  }
  if (avgCtr < 2) {
    recommendations.push('CTR is below average. Improve meta titles and descriptions.');
  }
  if (articles.length < 10) {
    recommendations.push('Publish more content to build topical authority.');
  }

  // Calculate overall score
  let overallScore = 50;
  if (indexedRate >= 90) overallScore += 20;
  else if (indexedRate >= 70) overallScore += 10;
  if (avgRanking && avgRanking <= 10) overallScore += 20;
  else if (avgRanking && avgRanking <= 20) overallScore += 10;
  if (avgCtr >= 3) overallScore += 10;
  overallScore = Math.min(100, overallScore);

  // Find top performers and underperformers
  const articleMetricsMap = new Map<string, SEOMetric>();
  metrics.forEach(m => articleMetricsMap.set(m.article_id, m));

  const articlesWithMetrics = articles.map(a => ({
    article: a,
    metric: articleMetricsMap.get(a.id),
  }));

  const topPerformers = articlesWithMetrics
    .filter(am => am.metric && am.metric.clicks > 0)
    .sort((a, b) => (b.metric?.clicks || 0) - (a.metric?.clicks || 0))
    .slice(0, 5)
    .map(am => am.article);

  const underperformers = articlesWithMetrics
    .filter(am => am.metric && am.metric.indexed_status === 'indexed' && am.metric.clicks === 0)
    .slice(0, 5)
    .map(am => am.article);

  return {
    overallScore,
    indexedRate,
    avgRanking,
    totalImpressions,
    totalClicks,
    avgCtr,
    recommendations,
    topPerformers,
    underperformers,
  };
}

/**
 * Get article performance history
 */
export async function getArticlePerformance(
  db: D1Database,
  articleId: string,
  days: number = 30
): Promise<SEOMetric[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db.prepare(
    `SELECT * FROM seo_metrics 
     WHERE article_id = ? AND date >= ?
     ORDER BY date ASC`
  ).bind(articleId, startDate.toISOString().split('T')[0]).all();

  return (result.results || []) as SEOMetric[];
}

/**
 * Update keyword priorities based on performance
 */
export async function updateKeywordPriorities(
  db: D1Database,
  orgId: string
): Promise<void> {
  // Get keyword performance (via articles)
  const result = await db.prepare(
    `SELECT k.id as keyword_id, k.priority_score, 
            AVG(sm.ranking_position) as avg_rank,
            SUM(sm.clicks) as total_clicks
     FROM keywords k
     LEFT JOIN articles a ON k.id = a.keyword_id
     LEFT JOIN seo_metrics sm ON a.id = sm.article_id
     WHERE k.org_id = ?
     GROUP BY k.id`
  ).bind(orgId).all();

  const keywordStats = result.results || [];

  for (const stat of keywordStats as any[]) {
    let newPriority = stat.priority_score || 50;

    // Boost priority for keywords with good performance
    if (stat.avg_rank && stat.avg_rank <= 10) newPriority += 10;
    if (stat.total_clicks > 100) newPriority += 15;
    else if (stat.total_clicks > 50) newPriority += 10;
    else if (stat.total_clicks > 10) newPriority += 5;

    // Lower priority for keywords not performing
    if (stat.avg_rank && stat.avg_rank > 50) newPriority -= 10;

    newPriority = Math.max(1, Math.min(100, newPriority));

    await db.prepare(
      `UPDATE keywords SET priority_score = ? WHERE id = ?`
    ).bind(newPriority, stat.keyword_id).run();
  }
}

/**
 * Check indexing status (simulated - in production use Google API)
 */
export async function checkIndexingStatus(
  db: D1Database,
  articleId: string
): Promise<{ indexed: boolean; lastChecked: string }> {
  // In production, this would call Google Search Console API
  // For now, simulate based on article age
  
  const articleResult = await db.prepare(
    `SELECT published_at FROM articles WHERE id = ?`
  ).bind(articleId).first();

  if (!articleResult) {
    return { indexed: false, lastChecked: new Date().toISOString() };
  }

  const publishedAt = new Date((articleResult as any).published_at);
  const daysSincePublish = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);

  // Simulate: articles older than 7 days are usually indexed
  const indexed = daysSincePublish > 7;

  // Record the check
  await db.prepare(
    `UPDATE seo_metrics SET indexed_status = ? WHERE article_id = ? AND date = date('now')`
  ).bind(indexed ? 'indexed' : 'pending', articleId).run();

  return { indexed, lastChecked: new Date().toISOString() };
}

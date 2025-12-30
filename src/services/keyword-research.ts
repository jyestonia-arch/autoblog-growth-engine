// AutoBlog Growth Engine - SaaS-Aware Keyword Research Engine
// This module generates SaaS-focused keywords using AI

import { generateId } from '../utils/helpers';
import type { Keyword, KeywordCluster, KeywordResearchRequest, Bindings } from '../types';

interface KeywordResearchResult {
  clusters: KeywordCluster[];
  keywords: Keyword[];
  contentRoadmap: ContentRoadmapItem[];
}

interface ContentRoadmapItem {
  month: number;
  keywords: string[];
  focus: string;
  expectedArticles: number;
}

// Keyword templates for SaaS companies
const KEYWORD_TEMPLATES = {
  informational: [
    'what is {topic}',
    'how does {topic} work',
    '{topic} explained',
    '{topic} guide for beginners',
    'benefits of {topic}',
    'why use {topic}',
    '{topic} best practices',
    '{topic} tips and tricks',
    'understanding {topic}',
    '{topic} 101',
  ],
  comparison: [
    '{product} vs {competitor}',
    '{product} alternatives',
    'best {category} software',
    '{product} vs {competitor} comparison',
    'top {category} tools {year}',
    '{category} software comparison',
    '{product} competitors',
    'is {product} better than {competitor}',
    '{category} tools ranked',
    'choosing between {product} and {competitor}',
  ],
  problem: [
    'how to solve {problem}',
    '{problem} solutions',
    'fix {problem}',
    'why is {problem} happening',
    '{problem} troubleshooting',
    'common {category} problems',
    'how to avoid {problem}',
    '{problem} best practices',
    'dealing with {problem}',
    '{problem} mistakes to avoid',
  ],
  useCase: [
    '{product} for {use_case}',
    'how to use {product} for {use_case}',
    '{use_case} with {product}',
    '{product} {use_case} tutorial',
    '{use_case} automation',
    'streamline {use_case}',
    '{use_case} workflow',
    'improve {use_case}',
    '{use_case} tools',
    'best way to {use_case}',
  ],
};

// Funnel stage determination based on intent
function determineFunnelStage(intent: string): 'tofu' | 'mofu' | 'bofu' {
  switch (intent) {
    case 'informational':
      return 'tofu';
    case 'comparison':
    case 'problem':
      return 'mofu';
    case 'use_case':
    case 'transactional':
      return 'bofu';
    default:
      return 'tofu';
  }
}

// Calculate priority score based on multiple factors
function calculatePriorityScore(params: {
  intent: string;
  difficulty: number;
  monthlySearches: number;
  funnelStage: string;
}): number {
  let score = 50;

  // Higher priority for BOFU content (closer to conversion)
  if (params.funnelStage === 'bofu') score += 20;
  else if (params.funnelStage === 'mofu') score += 10;

  // Lower difficulty is better
  score += Math.max(0, (100 - params.difficulty) / 5);

  // Search volume bonus (capped)
  score += Math.min(20, params.monthlySearches / 100);

  // Comparison and use-case intents are valuable for SaaS
  if (params.intent === 'comparison') score += 15;
  if (params.intent === 'use_case') score += 10;

  return Math.min(100, Math.round(score));
}

// Simulate keyword difficulty (in production, use real SEO APIs)
function estimateDifficulty(keyword: string): number {
  // Simple heuristic: longer keywords tend to be less competitive
  const wordCount = keyword.split(' ').length;
  let baseDifficulty = 70;

  if (wordCount >= 5) baseDifficulty -= 25;
  else if (wordCount >= 4) baseDifficulty -= 15;
  else if (wordCount >= 3) baseDifficulty -= 5;

  // Add some randomness to simulate real-world variation
  const variance = Math.floor(Math.random() * 20) - 10;
  return Math.max(10, Math.min(95, baseDifficulty + variance));
}

// Simulate monthly searches (in production, use real SEO APIs)
function estimateMonthlySearches(keyword: string): number {
  const wordCount = keyword.split(' ').length;
  let baseSearches = 1000;

  // Longer keywords have lower search volume
  if (wordCount >= 5) baseSearches = 100;
  else if (wordCount >= 4) baseSearches = 300;
  else if (wordCount >= 3) baseSearches = 500;

  // Add variance
  const variance = Math.floor(Math.random() * baseSearches * 0.5);
  return Math.max(10, baseSearches + variance);
}

/**
 * Generate keywords based on SaaS company profile
 */
export async function generateKeywords(
  request: KeywordResearchRequest,
  orgId: string
): Promise<KeywordResearchResult> {
  const clusters: KeywordCluster[] = [];
  const keywords: Keyword[] = [];
  const currentYear = new Date().getFullYear();

  // Extract key terms from the SaaS description
  const productTerms = extractProductTerms(request.saas_description);
  const industryTerms = extractIndustryTerms(request.industry);
  const icpTerms = extractICPTerms(request.target_icp);
  const problemTerms = extractProblemTerms(request.saas_description);

  // 1. Create Informational Cluster (TOFU)
  const infoCluster: KeywordCluster = {
    id: generateId(),
    org_id: orgId,
    pillar_keyword: `${productTerms[0]} guide`,
    cluster_name: 'Educational Content',
    description: 'Top-of-funnel educational content to build awareness',
    funnel_stage: 'tofu',
    status: 'active',
    total_keywords: 0,
    articles_generated: 0,
    created_at: new Date().toISOString(),
  };
  clusters.push(infoCluster);

  // Generate informational keywords
  for (const term of productTerms.slice(0, 3)) {
    for (const template of KEYWORD_TEMPLATES.informational.slice(0, 4)) {
      const keyword = template.replace('{topic}', term);
      const difficulty = estimateDifficulty(keyword);
      const monthlySearches = estimateMonthlySearches(keyword);
      const funnelStage = 'tofu';

      keywords.push({
        id: generateId(),
        cluster_id: infoCluster.id,
        org_id: orgId,
        keyword,
        search_intent: 'informational',
        difficulty_score: difficulty,
        funnel_stage: funnelStage,
        monthly_searches: monthlySearches,
        priority_score: calculatePriorityScore({
          intent: 'informational',
          difficulty,
          monthlySearches,
          funnelStage,
        }),
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      infoCluster.total_keywords++;
    }
  }

  // 2. Create Comparison Cluster (MOFU)
  const comparisonCluster: KeywordCluster = {
    id: generateId(),
    org_id: orgId,
    pillar_keyword: `best ${industryTerms[0]} software`,
    cluster_name: 'Comparison & Alternatives',
    description: 'Middle-of-funnel comparison content for buyers researching options',
    funnel_stage: 'mofu',
    status: 'active',
    total_keywords: 0,
    articles_generated: 0,
    created_at: new Date().toISOString(),
  };
  clusters.push(comparisonCluster);

  // Generate comparison keywords
  const competitors = request.competitors || ['Competitor A', 'Competitor B'];
  for (const competitor of competitors.slice(0, 3)) {
    for (const template of KEYWORD_TEMPLATES.comparison.slice(0, 3)) {
      const keyword = template
        .replace('{product}', productTerms[0])
        .replace('{competitor}', competitor)
        .replace('{category}', industryTerms[0])
        .replace('{year}', currentYear.toString());

      const difficulty = estimateDifficulty(keyword);
      const monthlySearches = estimateMonthlySearches(keyword);
      const funnelStage = 'mofu';

      keywords.push({
        id: generateId(),
        cluster_id: comparisonCluster.id,
        org_id: orgId,
        keyword,
        search_intent: 'comparison',
        difficulty_score: difficulty,
        funnel_stage: funnelStage,
        monthly_searches: monthlySearches,
        priority_score: calculatePriorityScore({
          intent: 'comparison',
          difficulty,
          monthlySearches,
          funnelStage,
        }),
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      comparisonCluster.total_keywords++;
    }
  }

  // 3. Create Problem-Solution Cluster (MOFU)
  const problemCluster: KeywordCluster = {
    id: generateId(),
    org_id: orgId,
    pillar_keyword: `${problemTerms[0]} solutions`,
    cluster_name: 'Problem-Solution Content',
    description: 'Content addressing specific pain points your ICP faces',
    funnel_stage: 'mofu',
    status: 'active',
    total_keywords: 0,
    articles_generated: 0,
    created_at: new Date().toISOString(),
  };
  clusters.push(problemCluster);

  // Generate problem-based keywords
  for (const problem of problemTerms.slice(0, 4)) {
    for (const template of KEYWORD_TEMPLATES.problem.slice(0, 3)) {
      const keyword = template
        .replace('{problem}', problem)
        .replace('{category}', industryTerms[0]);

      const difficulty = estimateDifficulty(keyword);
      const monthlySearches = estimateMonthlySearches(keyword);
      const funnelStage = 'mofu';

      keywords.push({
        id: generateId(),
        cluster_id: problemCluster.id,
        org_id: orgId,
        keyword,
        search_intent: 'problem',
        difficulty_score: difficulty,
        funnel_stage: funnelStage,
        monthly_searches: monthlySearches,
        priority_score: calculatePriorityScore({
          intent: 'problem',
          difficulty,
          monthlySearches,
          funnelStage,
        }),
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      problemCluster.total_keywords++;
    }
  }

  // 4. Create Use-Case Cluster (BOFU)
  const useCaseCluster: KeywordCluster = {
    id: generateId(),
    org_id: orgId,
    pillar_keyword: `${productTerms[0]} use cases`,
    cluster_name: 'Use Cases & Tutorials',
    description: 'Bottom-of-funnel content showing product-led solutions',
    funnel_stage: 'bofu',
    status: 'active',
    total_keywords: 0,
    articles_generated: 0,
    created_at: new Date().toISOString(),
  };
  clusters.push(useCaseCluster);

  // Generate use-case keywords based on ICP
  const useCases = extractUseCases(request.target_icp, request.saas_description);
  for (const useCase of useCases.slice(0, 5)) {
    for (const template of KEYWORD_TEMPLATES.useCase.slice(0, 3)) {
      const keyword = template
        .replace('{product}', productTerms[0])
        .replace('{use_case}', useCase);

      const difficulty = estimateDifficulty(keyword);
      const monthlySearches = estimateMonthlySearches(keyword);
      const funnelStage = 'bofu';

      keywords.push({
        id: generateId(),
        cluster_id: useCaseCluster.id,
        org_id: orgId,
        keyword,
        search_intent: 'use_case',
        difficulty_score: difficulty,
        funnel_stage: funnelStage,
        monthly_searches: monthlySearches,
        priority_score: calculatePriorityScore({
          intent: 'use_case',
          difficulty,
          monthlySearches,
          funnelStage,
        }),
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      useCaseCluster.total_keywords++;
    }
  }

  // Sort keywords by priority score
  keywords.sort((a, b) => b.priority_score - a.priority_score);

  // Generate content roadmap (quarterly planning)
  const contentRoadmap = generateContentRoadmap(keywords, clusters);

  return {
    clusters,
    keywords,
    contentRoadmap,
  };
}

// Helper functions to extract terms from user input
function extractProductTerms(description: string): string[] {
  // In production, use NLP or AI to extract key terms
  const words = description.toLowerCase().split(/\s+/);
  const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'for', 'and', 'or', 'but', 'with', 'to', 'of', 'in', 'on', 'at', 'by']);
  
  const terms = words
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 5);
  
  // Add the main product concept (first noun phrase approximation)
  if (terms.length === 0) {
    return ['software', 'platform', 'tool'];
  }
  
  return terms;
}

function extractIndustryTerms(industry: string): string[] {
  const terms = industry.toLowerCase().split(/[,\s]+/).filter(t => t.length > 2);
  return terms.length > 0 ? terms : ['technology', 'software'];
}

function extractICPTerms(icp: string): string[] {
  const terms = icp.toLowerCase().split(/[,\s]+/).filter(t => t.length > 3);
  return terms.length > 0 ? terms : ['business', 'teams', 'companies'];
}

function extractProblemTerms(description: string): string[] {
  // Look for problem-related phrases
  const problemIndicators = ['solve', 'fix', 'improve', 'automate', 'streamline', 'reduce', 'increase', 'manage', 'track', 'monitor'];
  const words = description.toLowerCase().split(/\s+/);
  
  const problems: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (problemIndicators.some(ind => words[i].includes(ind))) {
      // Capture the context around the problem indicator
      const context = words.slice(Math.max(0, i - 1), i + 3).join(' ');
      problems.push(context);
    }
  }
  
  return problems.length > 0 ? problems : ['efficiency', 'productivity', 'workflow'];
}

function extractUseCases(icp: string, description: string): string[] {
  const combined = `${icp} ${description}`.toLowerCase();
  
  // Common SaaS use cases
  const useCasePatterns = [
    'team collaboration',
    'project management',
    'customer support',
    'sales tracking',
    'marketing automation',
    'data analysis',
    'reporting',
    'workflow automation',
    'lead generation',
    'email marketing',
    'social media management',
    'content creation',
    'inventory management',
    'invoicing',
    'scheduling',
  ];
  
  const matches = useCasePatterns.filter(uc => combined.includes(uc.split(' ')[0]));
  
  if (matches.length === 0) {
    // Extract verb-noun phrases as potential use cases
    const words = combined.split(/\s+/);
    const useCases: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i].length > 3 && words[i + 1].length > 3) {
        useCases.push(`${words[i]} ${words[i + 1]}`);
      }
    }
    return useCases.slice(0, 5);
  }
  
  return matches;
}

function generateContentRoadmap(keywords: Keyword[], clusters: KeywordCluster[]): ContentRoadmapItem[] {
  const roadmap: ContentRoadmapItem[] = [];
  const sortedKeywords = [...keywords].sort((a, b) => b.priority_score - a.priority_score);
  
  // Distribute keywords across 3 months
  const keywordsPerMonth = Math.ceil(sortedKeywords.length / 3);
  
  for (let month = 1; month <= 3; month++) {
    const startIdx = (month - 1) * keywordsPerMonth;
    const endIdx = Math.min(startIdx + keywordsPerMonth, sortedKeywords.length);
    const monthKeywords = sortedKeywords.slice(startIdx, endIdx);
    
    // Determine focus based on dominant funnel stage
    const stageCounts = { tofu: 0, mofu: 0, bofu: 0 };
    monthKeywords.forEach(k => stageCounts[k.funnel_stage]++);
    
    let focus = 'Awareness Building';
    if (stageCounts.mofu > stageCounts.tofu && stageCounts.mofu > stageCounts.bofu) {
      focus = 'Consideration & Comparison';
    } else if (stageCounts.bofu > stageCounts.tofu) {
      focus = 'Conversion & Use Cases';
    }
    
    roadmap.push({
      month,
      keywords: monthKeywords.map(k => k.keyword),
      focus,
      expectedArticles: monthKeywords.length,
    });
  }
  
  return roadmap;
}

/**
 * Save keyword research results to database
 */
export async function saveKeywordResearch(
  db: D1Database,
  result: KeywordResearchResult
): Promise<void> {
  // Save clusters
  for (const cluster of result.clusters) {
    await db
      .prepare(
        `INSERT INTO keyword_clusters (id, org_id, pillar_keyword, cluster_name, description, funnel_stage, status, total_keywords, articles_generated, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        cluster.id,
        cluster.org_id,
        cluster.pillar_keyword,
        cluster.cluster_name,
        cluster.description,
        cluster.funnel_stage,
        cluster.status,
        cluster.total_keywords,
        cluster.articles_generated,
        cluster.created_at
      )
      .run();
  }

  // Save keywords
  for (const keyword of result.keywords) {
    await db
      .prepare(
        `INSERT INTO keywords (id, cluster_id, org_id, keyword, search_intent, difficulty_score, funnel_stage, monthly_searches, priority_score, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        keyword.id,
        keyword.cluster_id,
        keyword.org_id,
        keyword.keyword,
        keyword.search_intent,
        keyword.difficulty_score,
        keyword.funnel_stage,
        keyword.monthly_searches,
        keyword.priority_score,
        keyword.status,
        keyword.created_at
      )
      .run();
  }
}

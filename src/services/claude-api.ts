// AutoBlog Growth Engine - Claude API Integration
// Uses Claude Opus 4 for high-quality content generation

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'; // Claude Sonnet 4 - latest model

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  id: string;
  content: Array<{ type: 'text'; text: string }>;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call Claude API with a prompt
 */
export async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096
): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data: ClaudeResponse = await response.json();
  return data.content[0]?.text || '';
}

/**
 * Generate SEO keywords using Claude
 */
export async function generateKeywordsWithClaude(
  apiKey: string,
  params: {
    saasDescription: string;
    targetIcp: string;
    industry: string;
    competitors: string[];
  }
): Promise<{
  clusters: Array<{
    name: string;
    pillarKeyword: string;
    funnelStage: 'tofu' | 'mofu' | 'bofu';
    keywords: Array<{
      keyword: string;
      intent: 'informational' | 'comparison' | 'problem' | 'use_case';
      difficulty: number;
      priority: number;
    }>;
  }>;
}> {
  const systemPrompt = `You are an expert SaaS SEO strategist and keyword researcher. Your task is to generate highly targeted keyword clusters for SaaS companies.

IMPORTANT: You must respond ONLY with valid JSON, no markdown, no explanation, just the JSON object.

Focus on:
- Search intent clarity over raw volume
- Keywords that indicate buyer intent
- Long-tail keywords with lower competition
- Keywords that align with the SaaS sales funnel (TOFU/MOFU/BOFU)`;

  const userPrompt = `Generate SEO keyword clusters for this SaaS:

**Product Description:** ${params.saasDescription}

**Target ICP (Ideal Customer Profile):** ${params.targetIcp}

**Industry/Niche:** ${params.industry}

**Competitors:** ${params.competitors.join(', ') || 'Not specified'}

Generate 4 keyword clusters:
1. Educational/Informational (TOFU) - 8 keywords
2. Comparison/Alternatives (MOFU) - 6 keywords  
3. Problem-Solution (MOFU) - 6 keywords
4. Use Cases/Tutorials (BOFU) - 5 keywords

For each keyword, estimate:
- Search intent type
- Difficulty score (1-100, lower is easier)
- Priority score (1-100, higher = should target first)

Respond in this exact JSON format:
{
  "clusters": [
    {
      "name": "Cluster Name",
      "pillarKeyword": "main pillar keyword",
      "funnelStage": "tofu|mofu|bofu",
      "keywords": [
        {
          "keyword": "long tail keyword phrase",
          "intent": "informational|comparison|problem|use_case",
          "difficulty": 45,
          "priority": 78
        }
      ]
    }
  ]
}`;

  const response = await callClaude(apiKey, systemPrompt, userPrompt, 4096);
  
  try {
    // Clean response - remove any markdown formatting
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse Claude response:', response);
    throw new Error('Failed to parse keyword research response');
  }
}

/**
 * Generate a full SEO blog article using Claude
 */
export async function generateArticleWithClaude(
  apiKey: string,
  params: {
    keyword: string;
    searchIntent: string;
    funnelStage: string;
    saasDescription?: string;
    targetIcp?: string;
    industry?: string;
  }
): Promise<{
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  excerpt: string;
  faqs: Array<{ question: string; answer: string }>;
  tags: string[];
}> {
  const systemPrompt = `You are a senior SaaS content writer specializing in SEO-optimized blog posts. You write in a clear, direct B2B tone that resonates with startup founders and growth teams.

Your content style:
- No fluff or filler content
- Product-led examples where relevant
- Clear, actionable advice
- Data and statistics when possible
- Professional but approachable tone

IMPORTANT: Respond ONLY with valid JSON, no markdown code blocks, just the raw JSON object.`;

  const userPrompt = `Write a comprehensive SEO blog post for this keyword:

**Target Keyword:** ${params.keyword}
**Search Intent:** ${params.searchIntent}
**Funnel Stage:** ${params.funnelStage}
${params.saasDescription ? `**Our Product Context:** ${params.saasDescription}` : ''}
${params.targetIcp ? `**Target Reader:** ${params.targetIcp}` : ''}
${params.industry ? `**Industry:** ${params.industry}` : ''}

Requirements:
1. Title: Compelling, includes keyword naturally, 50-60 characters
2. Meta Title: SEO optimized, 50-60 characters
3. Meta Description: Compelling with CTA, 150-155 characters
4. Content: 1800-2200 words with proper HTML structure
   - Use <h2> and <h3> headings
   - Include <ul> or <ol> lists
   - Add <strong> for emphasis
   - Include a comparison <table> if relevant
   - Featured snippet optimized sections
5. FAQs: 3-4 relevant questions with concise answers
6. Tags: 5-8 relevant topic tags

Content Structure:
- Hook/Introduction (address the reader's pain point)
- Main sections with H2 headings (3-5 sections)
- Subsections with H3 where needed
- Actionable takeaways
- Conclusion with next steps

Respond in this exact JSON format:
{
  "title": "Article Title Here",
  "metaTitle": "SEO Meta Title | Brand",
  "metaDescription": "Compelling meta description with CTA under 155 chars.",
  "content": "<p>Full HTML content here...</p><h2>Section</h2><p>More content...</p>",
  "excerpt": "2-3 sentence summary of the article.",
  "faqs": [
    {"question": "Question here?", "answer": "Answer here."}
  ],
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const response = await callClaude(apiKey, systemPrompt, userPrompt, 8192);
  
  try {
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse Claude article response:', response);
    throw new Error('Failed to parse article generation response');
  }
}

/**
 * Generate internal link suggestions using Claude
 */
export async function generateLinkSuggestionsWithClaude(
  apiKey: string,
  params: {
    sourceTitle: string;
    sourceExcerpt: string;
    targetArticles: Array<{ id: string; title: string; excerpt: string }>;
  }
): Promise<Array<{
  targetId: string;
  anchorText: string;
  relevanceScore: number;
  reason: string;
}>> {
  const systemPrompt = `You are an SEO expert specializing in internal linking strategies. Your task is to suggest contextual internal links that improve site structure and user experience.

Focus on:
- Natural anchor text that fits the content
- Topical relevance between articles
- User journey optimization
- Avoiding over-optimization

IMPORTANT: Respond ONLY with valid JSON array, no markdown.`;

  const targetList = params.targetArticles
    .map((a, i) => `${i + 1}. ID: ${a.id}\n   Title: ${a.title}\n   About: ${a.excerpt}`)
    .join('\n\n');

  const userPrompt = `Analyze this article and suggest internal links to other articles:

**Source Article:**
Title: ${params.sourceTitle}
Summary: ${params.sourceExcerpt}

**Available Target Articles:**
${targetList}

For each relevant target article, suggest:
1. Natural anchor text (2-5 words that would fit in the source content)
2. Relevance score (0-100)
3. Brief reason why this link makes sense

Only suggest links that are genuinely relevant (score > 50).

Respond as JSON array:
[
  {
    "targetId": "article-id",
    "anchorText": "suggested anchor text",
    "relevanceScore": 75,
    "reason": "Brief explanation"
  }
]`;

  const response = await callClaude(apiKey, systemPrompt, userPrompt, 2048);
  
  try {
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse link suggestions:', response);
    return [];
  }
}

/**
 * Improve/rewrite existing content using Claude
 */
export async function improveContentWithClaude(
  apiKey: string,
  params: {
    currentContent: string;
    keyword: string;
    improvementGoal: 'seo' | 'readability' | 'engagement' | 'update';
  }
): Promise<{
  improvedContent: string;
  changes: string[];
}> {
  const goals = {
    seo: 'Optimize for SEO: better keyword placement, improved headings, featured snippet optimization',
    readability: 'Improve readability: shorter sentences, clearer structure, better formatting',
    engagement: 'Increase engagement: stronger hook, better CTAs, more compelling examples',
    update: 'Update content: refresh statistics, add current trends, modernize examples',
  };

  const systemPrompt = `You are a content optimization expert. Your task is to improve existing content while maintaining its core message and structure.

IMPORTANT: Respond ONLY with valid JSON, no markdown code blocks.`;

  const userPrompt = `Improve this content with the following goal:
**Goal:** ${goals[params.improvementGoal]}
**Target Keyword:** ${params.keyword}

**Current Content:**
${params.currentContent.substring(0, 6000)}

Respond in JSON format:
{
  "improvedContent": "<p>Full improved HTML content...</p>",
  "changes": ["Change 1 description", "Change 2 description"]
}`;

  const response = await callClaude(apiKey, systemPrompt, userPrompt, 8192);
  
  try {
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse improvement response:', response);
    throw new Error('Failed to parse content improvement response');
  }
}

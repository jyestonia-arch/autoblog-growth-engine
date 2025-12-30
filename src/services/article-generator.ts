// AutoBlog Growth Engine - SEO-Optimized Blog Post Generator
// Generates long-form SaaS-native blog posts with proper structure

import { generateId, generateSlug, countWords, calculateReadingTime, calculateSEOScore, generateExcerpt } from '../utils/helpers';
import type { Article, Keyword, FAQ, ArticleGenerationRequest, Bindings } from '../types';

interface GeneratedArticle {
  article: Article;
  seoScore: number;
}

// Article structure templates for different intents
const ARTICLE_STRUCTURES = {
  informational: {
    sections: [
      { type: 'intro', wordTarget: 150 },
      { type: 'what_is', wordTarget: 300 },
      { type: 'how_it_works', wordTarget: 350 },
      { type: 'benefits', wordTarget: 400 },
      { type: 'best_practices', wordTarget: 400 },
      { type: 'common_mistakes', wordTarget: 250 },
      { type: 'conclusion', wordTarget: 150 },
    ],
    totalTarget: 2000,
  },
  comparison: {
    sections: [
      { type: 'intro', wordTarget: 150 },
      { type: 'overview', wordTarget: 300 },
      { type: 'feature_comparison', wordTarget: 500 },
      { type: 'pricing_comparison', wordTarget: 300 },
      { type: 'use_case_fit', wordTarget: 350 },
      { type: 'verdict', wordTarget: 250 },
      { type: 'conclusion', wordTarget: 150 },
    ],
    totalTarget: 2000,
  },
  problem: {
    sections: [
      { type: 'intro', wordTarget: 150 },
      { type: 'problem_definition', wordTarget: 300 },
      { type: 'root_causes', wordTarget: 350 },
      { type: 'solutions', wordTarget: 500 },
      { type: 'step_by_step', wordTarget: 400 },
      { type: 'prevention', wordTarget: 200 },
      { type: 'conclusion', wordTarget: 100 },
    ],
    totalTarget: 2000,
  },
  use_case: {
    sections: [
      { type: 'intro', wordTarget: 150 },
      { type: 'use_case_overview', wordTarget: 250 },
      { type: 'setup_guide', wordTarget: 400 },
      { type: 'implementation', wordTarget: 500 },
      { type: 'advanced_tips', wordTarget: 350 },
      { type: 'results', wordTarget: 200 },
      { type: 'conclusion', wordTarget: 150 },
    ],
    totalTarget: 2000,
  },
};

// SaaS-native writing templates
const CONTENT_TEMPLATES = {
  intro: (keyword: string, context: string) => `
<p>In today's fast-paced business environment, understanding <strong>${keyword}</strong> has become essential for teams looking to stay competitive. ${context}</p>

<p>This comprehensive guide will walk you through everything you need to know, from fundamental concepts to advanced strategies that drive real results.</p>

<p><em>By the end of this article, you'll have actionable insights to implement immediately in your workflow.</em></p>
`,

  what_is: (topic: string) => `
<h2>What Is ${topic}?</h2>

<p>${topic} refers to the systematic approach of optimizing processes, tools, and strategies to achieve better outcomes. In the context of modern SaaS operations, this encompasses:</p>

<ul>
  <li><strong>Process Optimization:</strong> Streamlining workflows to reduce friction and increase throughput</li>
  <li><strong>Data-Driven Decisions:</strong> Leveraging analytics to inform strategic choices</li>
  <li><strong>Automation:</strong> Implementing smart systems that handle repetitive tasks</li>
  <li><strong>Continuous Improvement:</strong> Iterating based on feedback and metrics</li>
</ul>

<p>Understanding these fundamentals is crucial for any team looking to scale efficiently without proportionally increasing overhead.</p>
`,

  how_it_works: (topic: string) => `
<h2>How Does ${topic} Work?</h2>

<p>The mechanics behind ${topic} involve several interconnected components working together seamlessly:</p>

<h3>1. Data Collection & Analysis</h3>
<p>The first step involves gathering relevant data points from your existing systems. This creates a foundation for informed decision-making and helps identify areas for improvement.</p>

<h3>2. Strategy Formulation</h3>
<p>Based on the data collected, teams can formulate strategies that address specific pain points while aligning with broader business objectives.</p>

<h3>3. Implementation & Execution</h3>
<p>With a clear strategy in place, the focus shifts to execution. This phase requires careful coordination and often involves cross-functional collaboration.</p>

<h3>4. Monitoring & Optimization</h3>
<p>Continuous monitoring ensures that implemented solutions deliver expected results. Regular optimization cycles help maintain and improve performance over time.</p>
`,

  benefits: (topic: string) => `
<h2>Key Benefits of ${topic}</h2>

<p>Organizations that effectively implement ${topic} strategies typically see significant improvements across multiple dimensions:</p>

<h3>Increased Efficiency</h3>
<p>By streamlining processes and eliminating redundancies, teams can accomplish more with less. Studies show that well-optimized workflows can improve productivity by 20-40%.</p>

<h3>Cost Reduction</h3>
<p>Automation and process improvements directly translate to cost savings. Reduced manual intervention means lower operational expenses and fewer errors.</p>

<h3>Better Scalability</h3>
<p>Systems designed with scalability in mind can grow with your business. This prevents the common pain of outgrowing your tools and having to undergo costly migrations.</p>

<h3>Improved Team Collaboration</h3>
<p>Clear processes and shared systems enhance team alignment. Everyone knows their responsibilities and how their work connects to the bigger picture.</p>

<h3>Data-Driven Insights</h3>
<p>With proper implementation, you gain visibility into performance metrics that were previously hidden. These insights drive continuous improvement.</p>
`,

  best_practices: (topic: string) => `
<h2>Best Practices for ${topic}</h2>

<p>Based on industry experience and proven methodologies, here are the essential best practices:</p>

<h3>Start with Clear Objectives</h3>
<p>Before implementing any solution, define what success looks like. Establish KPIs that align with your business goals and can be measured objectively.</p>

<h3>Document Everything</h3>
<p>Comprehensive documentation serves multiple purposes: it aids onboarding, ensures consistency, and creates a knowledge base for troubleshooting.</p>

<h3>Iterate in Small Steps</h3>
<p>Rather than attempting a massive overhaul, make incremental improvements. This approach reduces risk and allows for course corrections along the way.</p>

<h3>Involve Stakeholders Early</h3>
<p>Get buy-in from key stakeholders at the beginning of any initiative. Their insights can prevent costly mistakes and their support ensures smoother adoption.</p>

<h3>Measure and Adjust</h3>
<p>Regular measurement against your established KPIs helps identify what's working and what needs adjustment. Don't be afraid to pivot based on data.</p>
`,

  common_mistakes: (topic: string) => `
<h2>Common Mistakes to Avoid</h2>

<p>Even experienced teams can fall into these traps when working with ${topic}:</p>

<ul>
  <li><strong>Over-engineering solutions:</strong> Sometimes simpler is better. Avoid the temptation to build complex systems when straightforward approaches would suffice.</li>
  <li><strong>Ignoring user feedback:</strong> The people using your systems daily often have the best insights. Create channels for feedback and act on it.</li>
  <li><strong>Neglecting training:</strong> New tools and processes require proper training. Underinvesting here leads to poor adoption and wasted resources.</li>
  <li><strong>Failing to plan for scale:</strong> What works for 10 users may break at 100. Consider future growth in your initial design.</li>
  <li><strong>Not setting clear ownership:</strong> Every process needs an owner. Without clear accountability, maintenance and improvements stall.</li>
</ul>
`,

  feature_comparison: (productA: string, productB: string) => `
<h2>Feature-by-Feature Comparison</h2>

<p>Let's break down how ${productA} and ${productB} compare across key functionality areas:</p>

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>${productA}</th>
      <th>${productB}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Core Functionality</td>
      <td>Comprehensive</td>
      <td>Focused</td>
    </tr>
    <tr>
      <td>Ease of Use</td>
      <td>Moderate learning curve</td>
      <td>Beginner-friendly</td>
    </tr>
    <tr>
      <td>Integrations</td>
      <td>100+ native integrations</td>
      <td>50+ integrations</td>
    </tr>
    <tr>
      <td>Customization</td>
      <td>Highly customizable</td>
      <td>Limited options</td>
    </tr>
    <tr>
      <td>Support</td>
      <td>24/7 chat & email</td>
      <td>Business hours only</td>
    </tr>
    <tr>
      <td>API Access</td>
      <td>Full REST API</td>
      <td>Basic API</td>
    </tr>
  </tbody>
</table>

<h3>Core Functionality Analysis</h3>
<p>When it comes to core features, both tools approach the problem from different angles. ${productA} provides a comprehensive suite that covers most use cases out of the box, while ${productB} takes a more focused approach that may require additional tools for complete coverage.</p>
`,

  pricing_comparison: (productA: string, productB: string) => `
<h2>Pricing Comparison</h2>

<p>Understanding the total cost of ownership is crucial when choosing between ${productA} and ${productB}:</p>

<h3>${productA} Pricing</h3>
<ul>
  <li><strong>Starter:</strong> $29/month - Basic features for small teams</li>
  <li><strong>Professional:</strong> $79/month - Advanced features and integrations</li>
  <li><strong>Enterprise:</strong> Custom pricing - Full suite with dedicated support</li>
</ul>

<h3>${productB} Pricing</h3>
<ul>
  <li><strong>Free:</strong> Limited features with usage caps</li>
  <li><strong>Pro:</strong> $49/month - Full feature access</li>
  <li><strong>Business:</strong> $99/month - Team features and priority support</li>
</ul>

<h3>Value Analysis</h3>
<p>While ${productB} may appear cheaper at first glance, consider the features included at each tier. ${productA}'s mid-tier often includes functionality that requires ${productB}'s highest tier, which can make the total cost comparable.</p>
`,

  conclusion: (keyword: string, cta: string) => `
<h2>Conclusion</h2>

<p>Understanding and implementing effective ${keyword} strategies is no longer optional for teams that want to remain competitive. The key is to start with clear objectives, implement incrementally, and continuously optimize based on real data.</p>

<p>Remember, the best solution is one that fits your specific needs and constraints. Don't chase features you won't use – focus on solving your actual problems first.</p>

<p><strong>Ready to take the next step?</strong> ${cta}</p>
`,
};

// FAQ generator based on keyword intent
function generateFAQs(keyword: string, intent: string): FAQ[] {
  const faqs: FAQ[] = [];
  const topic = keyword.split(' ').slice(1).join(' ') || keyword;

  // Common FAQs based on intent
  if (intent === 'informational') {
    faqs.push(
      {
        question: `What are the key benefits of ${topic}?`,
        answer: `The main benefits include improved efficiency, better scalability, reduced operational costs, and enhanced team collaboration. Organizations typically see ROI within 3-6 months of proper implementation.`,
      },
      {
        question: `How long does it take to implement ${topic}?`,
        answer: `Implementation timeline varies based on complexity and team size. Basic setups can be completed in 1-2 weeks, while enterprise implementations may take 2-3 months for full rollout.`,
      },
      {
        question: `Do I need technical expertise for ${topic}?`,
        answer: `While technical knowledge helps, many modern solutions are designed for non-technical users. Most platforms offer intuitive interfaces and comprehensive documentation to help teams get started.`,
      }
    );
  } else if (intent === 'comparison') {
    faqs.push(
      {
        question: `Which option is better for small businesses?`,
        answer: `For small businesses with limited budgets, we recommend starting with the more affordable option and scaling up as needed. Focus on core features rather than advanced functionality initially.`,
      },
      {
        question: `Can I migrate data between these platforms?`,
        answer: `Yes, most modern platforms support data export/import. Many also offer migration assistance or dedicated migration tools. Check with each vendor about their specific migration support.`,
      },
      {
        question: `What factors should I prioritize when choosing?`,
        answer: `Key factors include: your team's technical expertise, integration requirements, scalability needs, budget constraints, and specific feature requirements. Create a weighted scorecard based on your priorities.`,
      }
    );
  } else if (intent === 'problem') {
    faqs.push(
      {
        question: `What causes this problem most commonly?`,
        answer: `The most common causes include inadequate planning, lack of clear processes, insufficient team training, and using tools that don't fit your specific needs. Regular audits can help identify issues early.`,
      },
      {
        question: `How can I prevent this issue from recurring?`,
        answer: `Prevention strategies include: establishing clear SOPs, implementing monitoring systems, conducting regular team training, and scheduling periodic reviews of your processes and tools.`,
      },
      {
        question: `Should I hire an expert to help?`,
        answer: `For complex issues, consulting an expert can save significant time and prevent costly mistakes. However, many common problems can be solved with proper research and incremental testing.`,
      }
    );
  } else {
    faqs.push(
      {
        question: `How do I get started with this use case?`,
        answer: `Start by identifying your specific requirements and success metrics. Then, set up a basic configuration and test with a small pilot group before rolling out to the entire team.`,
      },
      {
        question: `What are the prerequisites for this implementation?`,
        answer: `Prerequisites typically include: existing accounts on required platforms, basic understanding of your current workflow, identified stakeholders, and clear success criteria defined upfront.`,
      },
      {
        question: `How long until I see results?`,
        answer: `Initial results are often visible within the first week of implementation. However, meaningful ROI typically becomes apparent after 30-60 days of consistent use and optimization.`,
      }
    );
  }

  return faqs;
}

/**
 * Generate a full SEO-optimized article for a keyword
 */
export async function generateArticle(
  keyword: Keyword,
  orgId: string,
  options: Partial<ArticleGenerationRequest> = {}
): Promise<GeneratedArticle> {
  const intent = keyword.search_intent || 'informational';
  const structure = ARTICLE_STRUCTURES[intent as keyof typeof ARTICLE_STRUCTURES] || ARTICLE_STRUCTURES.informational;

  // Generate article title
  const title = generateTitle(keyword.keyword, intent);
  const slug = generateSlug(title);

  // Generate content sections
  let content = '';
  const topic = extractTopic(keyword.keyword);

  // Build content based on structure
  content += CONTENT_TEMPLATES.intro(keyword.keyword, `Whether you're a startup founder, growth marketer, or product manager, mastering ${topic} can significantly impact your bottom line.`);

  if (intent === 'informational') {
    content += CONTENT_TEMPLATES.what_is(topic);
    content += CONTENT_TEMPLATES.how_it_works(topic);
    content += CONTENT_TEMPLATES.benefits(topic);
    content += CONTENT_TEMPLATES.best_practices(topic);
    content += CONTENT_TEMPLATES.common_mistakes(topic);
  } else if (intent === 'comparison') {
    const parts = keyword.keyword.split(' vs ');
    const productA = parts[0] || 'Option A';
    const productB = parts[1] || 'Option B';
    content += CONTENT_TEMPLATES.feature_comparison(productA, productB);
    content += CONTENT_TEMPLATES.pricing_comparison(productA, productB);
    content += CONTENT_TEMPLATES.best_practices(`choosing between ${productA} and ${productB}`);
  } else if (intent === 'problem') {
    content += CONTENT_TEMPLATES.what_is(`solving ${topic}`);
    content += CONTENT_TEMPLATES.how_it_works(`${topic} resolution`);
    content += CONTENT_TEMPLATES.best_practices(topic);
    content += CONTENT_TEMPLATES.common_mistakes(topic);
  } else {
    content += CONTENT_TEMPLATES.what_is(topic);
    content += CONTENT_TEMPLATES.how_it_works(topic);
    content += CONTENT_TEMPLATES.best_practices(topic);
  }

  // Add conclusion
  content += CONTENT_TEMPLATES.conclusion(
    topic,
    'Start implementing these strategies today and track your progress over the coming weeks.'
  );

  // Generate FAQs
  const faqs = generateFAQs(keyword.keyword, intent);

  // Add FAQ section to content
  content += `
<h2>Frequently Asked Questions</h2>
${faqs.map(faq => `
<h3>${faq.question}</h3>
<p>${faq.answer}</p>
`).join('')}
`;

  // Generate meta information
  const metaTitle = generateMetaTitle(title);
  const metaDescription = generateMetaDescription(keyword.keyword, intent);

  // Create article object
  const article: Article = {
    id: generateId(),
    org_id: orgId,
    website_id: null,
    keyword_id: keyword.id,
    cluster_id: keyword.cluster_id,
    title,
    slug,
    content,
    meta_title: metaTitle,
    meta_description: metaDescription,
    excerpt: generateExcerpt(content),
    word_count: countWords(content),
    reading_time: calculateReadingTime(content),
    featured_image_url: null,
    categories: [intent],
    tags: keyword.keyword.split(' ').filter(w => w.length > 3),
    faqs,
    status: 'draft',
    scheduled_at: null,
    published_at: null,
    published_url: null,
    cms_post_id: null,
    seo_score: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Calculate SEO score
  article.seo_score = calculateSEOScore({
    title: article.title,
    content: article.content,
    meta_title: article.meta_title,
    meta_description: article.meta_description,
    faqs: JSON.stringify(article.faqs),
  });

  return {
    article,
    seoScore: article.seo_score,
  };
}

// Helper functions
function generateTitle(keyword: string, intent: string): string {
  const year = new Date().getFullYear();
  const templates = {
    informational: [
      `The Complete Guide to ${capitalize(keyword)} (${year})`,
      `${capitalize(keyword)}: Everything You Need to Know`,
      `Mastering ${capitalize(keyword)}: A Comprehensive Guide`,
    ],
    comparison: [
      `${capitalize(keyword)}: Detailed Comparison Guide (${year})`,
      `${capitalize(keyword)} - Which One Should You Choose?`,
      `Honest ${capitalize(keyword)} Review`,
    ],
    problem: [
      `How to Solve ${capitalize(keyword)} Once and For All`,
      `${capitalize(keyword)}: Causes, Solutions & Prevention`,
      `Fix ${capitalize(keyword)} in 5 Simple Steps`,
    ],
    use_case: [
      `How to ${capitalize(keyword)}: Step-by-Step Tutorial`,
      `${capitalize(keyword)} Made Easy: Complete Guide`,
      `Master ${capitalize(keyword)} Like a Pro`,
    ],
  };

  const intentTemplates = templates[intent as keyof typeof templates] || templates.informational;
  return intentTemplates[Math.floor(Math.random() * intentTemplates.length)];
}

function generateMetaTitle(title: string): string {
  // Truncate to ~60 characters
  if (title.length <= 60) return title;
  return title.substring(0, 57) + '...';
}

function generateMetaDescription(keyword: string, intent: string): string {
  const descriptions = {
    informational: `Learn everything about ${keyword} in this comprehensive guide. Discover best practices, expert tips, and actionable strategies to improve your results today.`,
    comparison: `Detailed ${keyword} to help you make the right choice. Compare features, pricing, pros & cons to find the perfect solution for your needs.`,
    problem: `Struggling with ${keyword}? This guide covers root causes, proven solutions, and prevention strategies. Fix the issue once and for all.`,
    use_case: `Step-by-step guide on how to ${keyword} effectively. Includes tutorials, tips, and real-world examples for immediate implementation.`,
  };

  const desc = descriptions[intent as keyof typeof descriptions] || descriptions.informational;
  return desc.substring(0, 155);
}

function extractTopic(keyword: string): string {
  // Remove common prefixes
  const prefixes = ['how to', 'what is', 'why', 'best', 'top', 'guide to'];
  let topic = keyword.toLowerCase();

  for (const prefix of prefixes) {
    if (topic.startsWith(prefix)) {
      topic = topic.substring(prefix.length).trim();
      break;
    }
  }

  return topic;
}

function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Save article to database
 */
export async function saveArticle(db: D1Database, article: Article): Promise<void> {
  await db
    .prepare(
      `INSERT INTO articles (id, org_id, website_id, keyword_id, cluster_id, title, slug, content, meta_title, meta_description, excerpt, word_count, reading_time, featured_image_url, categories, tags, faqs, status, scheduled_at, published_at, published_url, cms_post_id, seo_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      article.id,
      article.org_id,
      article.website_id,
      article.keyword_id,
      article.cluster_id,
      article.title,
      article.slug,
      article.content,
      article.meta_title,
      article.meta_description,
      article.excerpt,
      article.word_count,
      article.reading_time,
      article.featured_image_url,
      JSON.stringify(article.categories),
      JSON.stringify(article.tags),
      JSON.stringify(article.faqs),
      article.status,
      article.scheduled_at,
      article.published_at,
      article.published_url,
      article.cms_post_id,
      article.seo_score,
      article.created_at,
      article.updated_at
    )
    .run();
}

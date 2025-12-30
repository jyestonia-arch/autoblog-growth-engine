// AutoBlog Growth Engine - Utility Functions

/**
 * Generate a unique ID (UUID v4 compatible)
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Count words in content (excluding HTML tags)
 */
export function countWords(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Simple hash function for passwords (in production, use proper bcrypt)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'autoblog-salt-v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

/**
 * Generate session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Parse JSON safely
 */
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Calculate SEO score based on content quality indicators
 */
export function calculateSEOScore(article: {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  faqs?: string;
}): number {
  let score = 0;
  const maxScore = 100;

  // Title length (10-60 chars ideal)
  if (article.title.length >= 10 && article.title.length <= 60) score += 15;
  else if (article.title.length > 0) score += 5;

  // Meta title (50-60 chars ideal)
  if (article.meta_title.length >= 50 && article.meta_title.length <= 60) score += 10;
  else if (article.meta_title.length > 0) score += 5;

  // Meta description (150-160 chars ideal)
  if (article.meta_description.length >= 150 && article.meta_description.length <= 160) score += 10;
  else if (article.meta_description.length > 0) score += 5;

  // Content length (1500-2500 words ideal)
  const wordCount = countWords(article.content);
  if (wordCount >= 1500 && wordCount <= 2500) score += 20;
  else if (wordCount >= 1000) score += 10;
  else if (wordCount >= 500) score += 5;

  // Has H2 headings
  const h2Count = (article.content.match(/<h2/gi) || []).length;
  if (h2Count >= 3) score += 15;
  else if (h2Count >= 1) score += 8;

  // Has H3 headings
  const h3Count = (article.content.match(/<h3/gi) || []).length;
  if (h3Count >= 2) score += 10;
  else if (h3Count >= 1) score += 5;

  // Has FAQs
  const faqs = safeParseJSON(article.faqs || '[]', []);
  if (faqs.length >= 3) score += 10;
  else if (faqs.length >= 1) score += 5;

  // Has internal structure (lists, tables)
  if (article.content.includes('<ul>') || article.content.includes('<ol>')) score += 5;
  if (article.content.includes('<table>')) score += 5;

  return Math.min(score, maxScore);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length - 3) + '...';
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get funnel stage label
 */
export function getFunnelStageLabel(stage: 'tofu' | 'mofu' | 'bofu'): string {
  const labels = {
    tofu: 'Top of Funnel (Awareness)',
    mofu: 'Middle of Funnel (Consideration)',
    bofu: 'Bottom of Funnel (Decision)',
  };
  return labels[stage] || stage;
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  // Remove extra whitespace
  const clean = text.replace(/\s+/g, ' ').trim();
  // Truncate
  return truncate(clean, maxLength);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

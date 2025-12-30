// AutoBlog Growth Engine - WordPress Auto-Publishing Integration

import type { Article, Website } from '../types';

interface PublishResult {
  success: boolean;
  publishedUrl?: string;
  cmsPostId?: string;
  error?: string;
}

/**
 * Test WordPress connection
 */
export async function testWordPressConnection(
  website: Website
): Promise<{ success: boolean; message: string }> {
  try {
    const authHeader = createAuthHeader(website.api_key_encrypted);
    const apiUrl = `${website.api_endpoint}/wp-json/wp/v2/posts?per_page=1`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { success: true, message: 'Connection successful' };
    } else if (response.status === 401) {
      return { success: false, message: 'Authentication failed' };
    } else {
      return { success: false, message: `Failed with status ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}

/**
 * Publish article to WordPress
 */
export async function publishToWordPress(
  article: Article,
  website: Website,
  options: { scheduleAt?: string; categoryIds?: number[]; tagIds?: number[] } = {}
): Promise<PublishResult> {
  try {
    const authHeader = createAuthHeader(website.api_key_encrypted);
    const apiUrl = `${website.api_endpoint}/wp-json/wp/v2/posts`;

    const postData = {
      title: article.title,
      content: article.content,
      status: options.scheduleAt ? 'future' : 'publish',
      slug: article.slug,
      excerpt: article.excerpt,
      categories: options.categoryIds || [],
      tags: options.tagIds || [],
      meta: {
        _yoast_wpseo_title: article.meta_title,
        _yoast_wpseo_metadesc: article.meta_description,
      },
      date: options.scheduleAt,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: `WordPress error: ${errorData.message || response.statusText}` };
    }

    const result = await response.json();
    return { success: true, publishedUrl: result.link, cmsPostId: String(result.id) };
  } catch (error) {
    return { success: false, error: `Publish error: ${error}` };
  }
}

/**
 * Ensure WordPress category exists
 */
export async function ensureWordPressCategory(website: Website, name: string): Promise<number | null> {
  try {
    const authHeader = createAuthHeader(website.api_key_encrypted);
    
    // Find existing
    const searchRes = await fetch(
      `${website.api_endpoint}/wp-json/wp/v2/categories?search=${encodeURIComponent(name)}`,
      { headers: { 'Authorization': authHeader } }
    );
    
    if (searchRes.ok) {
      const cats = await searchRes.json();
      const existing = cats.find((c: any) => c.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
    }

    // Create new
    const createRes = await fetch(`${website.api_endpoint}/wp-json/wp/v2/categories`, {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    
    if (createRes.ok) {
      const result = await createRes.json();
      return result.id;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Full publish workflow
 */
export async function fullPublishWorkflow(
  article: Article,
  website: Website,
  db: D1Database,
  scheduleAt?: string
): Promise<PublishResult> {
  const categories = safeParseArray(article.categories as any);
  const tags = safeParseArray(article.tags as any);

  const categoryIds: number[] = [];
  for (const cat of categories) {
    const id = await ensureWordPressCategory(website, cat);
    if (id) categoryIds.push(id);
  }

  const result = await publishToWordPress(article, website, { scheduleAt, categoryIds });

  if (result.success && result.cmsPostId) {
    const status = scheduleAt ? 'scheduled' : 'published';
    await db.prepare(
      `UPDATE articles SET status=?, cms_post_id=?, published_url=?, published_at=?, website_id=?, updated_at=datetime('now') WHERE id=?`
    ).bind(status, result.cmsPostId, result.publishedUrl, scheduleAt || new Date().toISOString(), website.id, article.id).run();
  }

  return result;
}

function createAuthHeader(key: string): string {
  return `Basic ${key}`;
}

function safeParseArray(json: string | string[] | null): string[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  try { return JSON.parse(json); } catch { return []; }
}

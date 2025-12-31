// Google Search Console API Service
// Handles authentication, data fetching, and performance metrics

interface GSCCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

interface GSCPerformanceRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCPerformanceResponse {
  rows?: GSCPerformanceRow[];
  responseAggregationType?: string;
}

interface ArticlePerformance {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Array<{ query: string; clicks: number; impressions: number; position: number }>;
}

interface SitePerformance {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  topPages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
  topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
  performanceByDate: Array<{ date: string; clicks: number; impressions: number }>;
}

interface IndexingStatus {
  url: string;
  coverageState: string;
  indexingState: string;
  lastCrawlTime?: string;
}

// Get access token from refresh token
async function getAccessToken(credentials: GSCCredentials): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Fetch site performance data
export async function fetchSitePerformance(
  credentials: GSCCredentials,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<SitePerformance> {
  const accessToken = await getAccessToken(credentials);
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  // Fetch overall performance
  const overallResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: [],
        rowLimit: 1,
      }),
    }
  );

  if (!overallResponse.ok) {
    const error = await overallResponse.text();
    throw new Error(`GSC API error: ${error}`);
  }

  const overallData: GSCPerformanceResponse = await overallResponse.json();

  // Fetch top pages
  const pagesResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 20,
        orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
      }),
    }
  );

  const pagesData: GSCPerformanceResponse = await pagesResponse.json();

  // Fetch top queries
  const queriesResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 20,
        orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
      }),
    }
  );

  const queriesData: GSCPerformanceResponse = await queriesResponse.json();

  // Fetch performance by date
  const dateResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 100,
      }),
    }
  );

  const dateData: GSCPerformanceResponse = await dateResponse.json();

  // Calculate totals
  const overall = overallData.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  return {
    totalClicks: overall.clicks,
    totalImpressions: overall.impressions,
    avgCtr: Math.round(overall.ctr * 10000) / 100, // Convert to percentage
    avgPosition: Math.round(overall.position * 10) / 10,
    topPages: (pagesData.rows || []).map(row => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 10000) / 100,
      position: Math.round(row.position * 10) / 10,
    })),
    topQueries: (queriesData.rows || []).map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 10000) / 100,
      position: Math.round(row.position * 10) / 10,
    })),
    performanceByDate: (dateData.rows || []).map(row => ({
      date: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
    })),
  };
}

// Fetch performance for a specific URL
export async function fetchUrlPerformance(
  credentials: GSCCredentials,
  siteUrl: string,
  pageUrl: string,
  startDate: string,
  endDate: string
): Promise<ArticlePerformance> {
  const accessToken = await getAccessToken(credentials);
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  // Fetch page performance
  const pageResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            operator: 'equals',
            expression: pageUrl,
          }],
        }],
      }),
    }
  );

  const pageData: GSCPerformanceResponse = await pageResponse.json();

  // Fetch queries for this page
  const queriesResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            operator: 'equals',
            expression: pageUrl,
          }],
        }],
        rowLimit: 10,
        orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
      }),
    }
  );

  const queriesData: GSCPerformanceResponse = await queriesResponse.json();

  const pageMetrics = pageData.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  return {
    url: pageUrl,
    clicks: pageMetrics.clicks,
    impressions: pageMetrics.impressions,
    ctr: Math.round(pageMetrics.ctr * 10000) / 100,
    position: Math.round(pageMetrics.position * 10) / 10,
    topQueries: (queriesData.rows || []).map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      position: Math.round(row.position * 10) / 10,
    })),
  };
}

// Request indexing for a URL
export async function requestIndexing(
  credentials: GSCCredentials,
  pageUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    const accessToken = await getAccessToken(credentials);

    // Use the Indexing API
    const response = await fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: pageUrl,
          type: 'URL_UPDATED',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, message: `Indexing request failed: ${error}` };
    }

    return { success: true, message: 'Indexing requested successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get list of sitemaps
export async function getSitemaps(
  credentials: GSCCredentials,
  siteUrl: string
): Promise<Array<{ path: string; lastSubmitted: string; isPending: boolean; isSitemapsIndex: boolean; lastDownloaded: string; warnings: number; errors: number }>> {
  const accessToken = await getAccessToken(credentials);
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch sitemaps');
  }

  const data = await response.json();

  return (data.sitemap || []).map((sm: any) => ({
    path: sm.path,
    lastSubmitted: sm.lastSubmitted,
    isPending: sm.isPending,
    isSitemapsIndex: sm.isSitemapsIndex,
    lastDownloaded: sm.lastDownloaded,
    warnings: sm.warnings || 0,
    errors: sm.errors || 0,
  }));
}

// Submit a sitemap
export async function submitSitemap(
  credentials: GSCCredentials,
  siteUrl: string,
  sitemapUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    const accessToken = await getAccessToken(credentials);
    const encodedSiteUrl = encodeURIComponent(siteUrl);
    const encodedSitemapUrl = encodeURIComponent(sitemapUrl);

    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps/${encodedSitemapUrl}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, message: `Failed to submit sitemap: ${error}` };
    }

    return { success: true, message: 'Sitemap submitted successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Sync GSC data to database
export async function syncGSCData(
  db: D1Database,
  credentials: GSCCredentials,
  orgId: string,
  siteUrl: string
): Promise<{ success: boolean; articlesUpdated: number; error?: string }> {
  try {
    // Get date range (last 30 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch site performance
    const performance = await fetchSitePerformance(credentials, siteUrl, startDate, endDate);

    // Get published articles
    const articles = await db.prepare(
      `SELECT id, published_url FROM articles WHERE org_id = ? AND status = 'published' AND published_url IS NOT NULL`
    ).bind(orgId).all();

    let articlesUpdated = 0;

    // Update SEO metrics for each article
    for (const article of (articles.results || [])) {
      const articleUrl = (article as any).published_url;
      if (!articleUrl) continue;

      // Find matching page in GSC data
      const pageData = performance.topPages.find(p => 
        p.page === articleUrl || 
        p.page.includes(articleUrl) || 
        articleUrl.includes(p.page)
      );

      if (pageData) {
        // Check if we already have today's metrics
        const existing = await db.prepare(
          `SELECT id FROM seo_metrics WHERE article_id = ? AND date = ?`
        ).bind((article as any).id, endDate).first();

        if (existing) {
          // Update existing
          await db.prepare(
            `UPDATE seo_metrics SET 
              impressions = ?, clicks = ?, ctr = ?, ranking_position = ?, indexed_status = 'indexed'
             WHERE id = ?`
          ).bind(pageData.impressions, pageData.clicks, pageData.ctr, pageData.position, (existing as any).id).run();
        } else {
          // Insert new
          const metricId = crypto.randomUUID();
          await db.prepare(
            `INSERT INTO seo_metrics (id, article_id, date, impressions, clicks, ctr, ranking_position, indexed_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'indexed')`
          ).bind(metricId, (article as any).id, endDate, pageData.impressions, pageData.clicks, pageData.ctr, pageData.position).run();
        }

        articlesUpdated++;
      }
    }

    // Store site-wide metrics
    await db.prepare(
      `INSERT OR REPLACE INTO gsc_site_metrics (org_id, date, total_clicks, total_impressions, avg_ctr, avg_position)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(orgId, endDate, performance.totalClicks, performance.totalImpressions, performance.avgCtr, performance.avgPosition).run();

    return { success: true, articlesUpdated };
  } catch (error) {
    return { 
      success: false, 
      articlesUpdated: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Generate OAuth URL for GSC authentication
export function generateGSCAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/indexing',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// Get list of verified sites
export async function getVerifiedSites(
  credentials: GSCCredentials
): Promise<Array<{ siteUrl: string; permissionLevel: string }>> {
  const accessToken = await getAccessToken(credentials);

  const response = await fetch(
    'https://www.googleapis.com/webmasters/v3/sites',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch verified sites');
  }

  const data = await response.json();

  return (data.siteEntry || []).map((site: any) => ({
    siteUrl: site.siteUrl,
    permissionLevel: site.permissionLevel,
  }));
}

// Email Service using Resend API
// Handles email notifications for article publishing, weekly reports, etc.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface ArticlePublishedData {
  articleTitle: string;
  articleUrl: string;
  publishedAt: string;
  seoScore: number;
  wordCount: number;
  keyword: string;
}

interface WeeklyReportData {
  organizationName: string;
  articlesPublished: number;
  totalKeywords: number;
  avgSeoScore: number;
  topArticles: Array<{ title: string; url: string; seoScore: number }>;
  weekStart: string;
  weekEnd: string;
}

interface UsageLimitWarningData {
  organizationName: string;
  postsUsed: number;
  postsLimit: number;
  percentUsed: number;
}

// Send email using Resend API
export async function sendEmail(apiKey: string, options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!apiKey) {
    console.log('Email skipped: No Resend API key configured');
    return { success: false, error: 'No API key configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || 'AutoBlog <notifications@autoblog.app>',
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Article Published Notification
export async function sendArticlePublishedEmail(
  apiKey: string,
  to: string,
  data: ArticlePublishedData
): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px 24px; border-radius: 12px;">
        <span style="color: white; font-size: 24px; font-weight: bold;">🚀 AutoBlog</span>
      </div>
    </div>
    
    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <!-- Success Banner -->
      <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">✅</div>
        <h1 style="color: white; margin: 0; font-size: 24px;">Article Published!</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px;">
        <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0; line-height: 1.4;">
          ${escapeHtml(data.articleTitle)}
        </h2>
        
        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
          <div style="background: #EEF2FF; padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #4F46E5;">${data.seoScore}</div>
            <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">SEO Score</div>
          </div>
          <div style="background: #F0FDF4; padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #16A34A;">${data.wordCount.toLocaleString()}</div>
            <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Words</div>
          </div>
          <div style="background: #FEF3C7; padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #D97706;">📈</div>
            <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Live</div>
          </div>
        </div>
        
        <!-- Keyword Badge -->
        <div style="margin-bottom: 24px;">
          <span style="display: inline-block; background: #E0E7FF; color: #4338CA; padding: 8px 16px; border-radius: 9999px; font-size: 14px; font-weight: 500;">
            🔑 ${escapeHtml(data.keyword)}
          </span>
        </div>
        
        <!-- CTA Button -->
        <a href="${data.articleUrl}" style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
          View Published Article →
        </a>
        
        <!-- Footer Info -->
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 24px; text-align: center;">
          Published on ${new Date(data.publishedAt).toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 12px;">
      <p>Powered by AutoBlog Growth Engine</p>
      <p>Automated SEO Content for SaaS Startups</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail(apiKey, {
    to,
    subject: `✅ Published: ${data.articleTitle}`,
    html,
  });
}

// Weekly Report Email
export async function sendWeeklyReportEmail(
  apiKey: string,
  to: string,
  data: WeeklyReportData
): Promise<{ success: boolean; error?: string }> {
  const topArticlesHtml = data.topArticles.map(article => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
      <a href="${article.url}" style="color: #4F46E5; text-decoration: none; font-weight: 500;">${escapeHtml(article.title)}</a>
      <span style="background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 9999px; font-size: 12px;">SEO: ${article.seoScore}</span>
    </div>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px 24px; border-radius: 12px;">
        <span style="color: white; font-size: 24px; font-weight: bold;">📊 AutoBlog</span>
      </div>
    </div>
    
    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Weekly Content Report</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">
          ${data.weekStart} - ${data.weekEnd}
        </p>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px;">
        <p style="color: #6B7280; margin: 0 0 24px 0;">
          Hi ${escapeHtml(data.organizationName)} team! Here's your weekly content performance summary:
        </p>
        
        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
          <div style="background: #F0FDF4; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #16A34A;">${data.articlesPublished}</div>
            <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Articles Published</div>
          </div>
          <div style="background: #EEF2FF; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #4F46E5;">${data.totalKeywords}</div>
            <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Keywords Tracked</div>
          </div>
          <div style="background: #FEF3C7; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #D97706;">${data.avgSeoScore}</div>
            <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Avg SEO Score</div>
          </div>
        </div>
        
        <!-- Top Articles -->
        ${data.topArticles.length > 0 ? `
          <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 16px 0;">🏆 Top Performing Articles</h3>
          <div style="margin-bottom: 24px;">
            ${topArticlesHtml}
          </div>
        ` : ''}
        
        <!-- CTA Button -->
        <a href="https://autoblog.app/dashboard" style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
          View Full Dashboard →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 12px;">
      <p>Powered by AutoBlog Growth Engine</p>
      <p>Automated SEO Content for SaaS Startups</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail(apiKey, {
    to,
    subject: `📊 Weekly Report: ${data.articlesPublished} articles published`,
    html,
  });
}

// Usage Limit Warning Email
export async function sendUsageLimitWarningEmail(
  apiKey: string,
  to: string,
  data: UsageLimitWarningData
): Promise<{ success: boolean; error?: string }> {
  const isNearLimit = data.percentUsed >= 80 && data.percentUsed < 100;
  const isAtLimit = data.percentUsed >= 100;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px 24px; border-radius: 12px;">
        <span style="color: white; font-size: 24px; font-weight: bold;">⚠️ AutoBlog</span>
      </div>
    </div>
    
    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <!-- Warning Banner -->
      <div style="background: ${isAtLimit ? '#DC2626' : '#F59E0B'}; padding: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">${isAtLimit ? '🚫' : '⚠️'}</div>
        <h1 style="color: white; margin: 0; font-size: 24px;">
          ${isAtLimit ? 'Monthly Limit Reached' : 'Approaching Monthly Limit'}
        </h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px;">
        <p style="color: #6B7280; margin: 0 0 24px 0;">
          Hi ${escapeHtml(data.organizationName)} team,
        </p>
        
        <p style="color: #374151; margin: 0 0 24px 0;">
          ${isAtLimit 
            ? "You've reached your monthly post limit. Upgrade your plan to continue generating SEO-optimized content."
            : `You've used ${data.percentUsed}% of your monthly post limit. Consider upgrading to ensure uninterrupted content generation.`
          }
        </p>
        
        <!-- Usage Progress -->
        <div style="background: #F3F4F6; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6B7280; font-size: 14px;">Posts Used</span>
            <span style="color: #1F2937; font-weight: 600;">${data.postsUsed} / ${data.postsLimit}</span>
          </div>
          <div style="background: #E5E7EB; height: 8px; border-radius: 9999px; overflow: hidden;">
            <div style="background: ${isAtLimit ? '#DC2626' : '#F59E0B'}; height: 100%; width: ${Math.min(data.percentUsed, 100)}%; border-radius: 9999px;"></div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <a href="https://autoblog.app/billing" style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Upgrade Your Plan →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 12px;">
      <p>Powered by AutoBlog Growth Engine</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail(apiKey, {
    to,
    subject: isAtLimit 
      ? `🚫 Monthly Limit Reached - ${data.organizationName}`
      : `⚠️ ${data.percentUsed}% of Monthly Limit Used - ${data.organizationName}`,
    html,
  });
}

// Article Scheduled Notification
export async function sendArticleScheduledEmail(
  apiKey: string,
  to: string,
  data: { articleTitle: string; scheduledAt: string; keyword: string }
): Promise<{ success: boolean; error?: string }> {
  const scheduledDate = new Date(data.scheduledAt);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px 24px; border-radius: 12px;">
        <span style="color: white; font-size: 24px; font-weight: bold;">📅 AutoBlog</span>
      </div>
    </div>
    
    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <!-- Banner -->
      <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">📅</div>
        <h1 style="color: white; margin: 0; font-size: 24px;">Article Scheduled!</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px;">
        <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0; line-height: 1.4;">
          ${escapeHtml(data.articleTitle)}
        </h2>
        
        <!-- Schedule Info -->
        <div style="background: #FEF3C7; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 32px;">🗓️</div>
            <div>
              <div style="font-weight: 600; color: #92400E;">Scheduled for</div>
              <div style="font-size: 18px; color: #78350F;">
                ${scheduledDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </div>
              <div style="color: #92400E;">
                at ${scheduledDate.toLocaleTimeString('en-US', { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Keyword Badge -->
        <div style="margin-bottom: 24px;">
          <span style="display: inline-block; background: #E0E7FF; color: #4338CA; padding: 8px 16px; border-radius: 9999px; font-size: 14px; font-weight: 500;">
            🔑 ${escapeHtml(data.keyword)}
          </span>
        </div>
        
        <!-- CTA Button -->
        <a href="https://autoblog.app/calendar" style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
          View Content Calendar →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 12px;">
      <p>Powered by AutoBlog Growth Engine</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail(apiKey, {
    to,
    subject: `📅 Scheduled: ${data.articleTitle}`,
    html,
  });
}

// Helper function
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

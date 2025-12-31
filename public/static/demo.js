// AutoBlog Growth Engine - Demo Mode (No Auth Required)

// Demo data
const DEMO_DATA = {
  stats: {
    total_articles: 24,
    published: 18,
    drafts: 4,
    scheduled: 2,
    keywords: 156,
    avg_seo_score: 87,
    posts_this_month: 8,
    monthly_limit: 30
  },
  keywords: [
    { id: '1', keyword: 'project management software for startups', search_intent: 'commercial', funnel_stage: 'MOFU', difficulty: 45, priority: 92, status: 'completed', cluster: 'Project Management' },
    { id: '2', keyword: 'best task tracking tools 2024', search_intent: 'informational', funnel_stage: 'TOFU', difficulty: 38, priority: 88, status: 'completed', cluster: 'Task Tracking' },
    { id: '3', keyword: 'asana vs monday comparison', search_intent: 'comparison', funnel_stage: 'BOFU', difficulty: 52, priority: 85, status: 'pending', cluster: 'Comparisons' },
    { id: '4', keyword: 'remote team collaboration tips', search_intent: 'informational', funnel_stage: 'TOFU', difficulty: 32, priority: 78, status: 'pending', cluster: 'Remote Work' },
    { id: '5', keyword: 'how to improve team productivity', search_intent: 'informational', funnel_stage: 'TOFU', difficulty: 41, priority: 75, status: 'pending', cluster: 'Productivity' },
    { id: '6', keyword: 'saas project management pricing', search_intent: 'commercial', funnel_stage: 'BOFU', difficulty: 48, priority: 82, status: 'pending', cluster: 'Project Management' },
  ],
  clusters: [
    { id: '1', cluster_name: 'Project Management', pillar_keyword: 'project management software for startups', funnel_stage: 'MOFU', keyword_count: 12 },
    { id: '2', cluster_name: 'Task Tracking', pillar_keyword: 'best task tracking tools 2024', funnel_stage: 'TOFU', keyword_count: 8 },
    { id: '3', cluster_name: 'Comparisons', pillar_keyword: 'asana vs monday comparison', funnel_stage: 'BOFU', keyword_count: 6 },
    { id: '4', cluster_name: 'Remote Work', pillar_keyword: 'remote team collaboration tips', funnel_stage: 'TOFU', keyword_count: 10 },
  ],
  articles: [
    { 
      id: '1', 
      title: 'The Ultimate Guide to Project Management Software for Startups in 2024',
      status: 'published',
      seo_score: 92,
      word_count: 2450,
      excerpt: 'Discover the best project management tools designed specifically for growing startups. Compare features, pricing, and find your perfect match.',
      published_at: '2024-12-28',
      language: 'en'
    },
    { 
      id: '2', 
      title: '15 Best Task Tracking Tools to Boost Your Team Productivity',
      status: 'published',
      seo_score: 88,
      word_count: 2180,
      excerpt: 'From Trello to Notion, we review the top task tracking solutions that will transform how your team manages work.',
      published_at: '2024-12-25',
      language: 'en'
    },
    { 
      id: '3', 
      title: 'Asana vs Monday.com: Which Project Tool is Right for Your Team?',
      status: 'draft',
      seo_score: 85,
      word_count: 2890,
      excerpt: 'An in-depth comparison of two leading project management platforms. Features, pricing, pros & cons revealed.',
      language: 'en'
    },
    { 
      id: '4', 
      title: '2024년 스타트업을 위한 프로젝트 관리 소프트웨어 완벽 가이드',
      status: 'published',
      seo_score: 90,
      word_count: 2650,
      excerpt: '성장하는 스타트업을 위해 특별히 설계된 최고의 프로젝트 관리 도구를 알아보세요.',
      published_at: '2024-12-20',
      language: 'ko'
    },
    { 
      id: '5', 
      title: 'Remote Team Collaboration: 20 Tips for Better Communication',
      status: 'scheduled',
      seo_score: 84,
      word_count: 1980,
      excerpt: 'Master remote work with these proven strategies for seamless team collaboration.',
      scheduled_at: '2025-01-05',
      language: 'en'
    },
    { 
      id: '6', 
      title: 'How to Build a High-Performance Team Culture',
      status: 'draft',
      seo_score: 78,
      word_count: 2100,
      excerpt: 'Learn the secrets behind the most productive teams and how to replicate their success.',
      language: 'en'
    },
  ],
  analytics: {
    impressions: 45230,
    clicks: 2156,
    ctr: 4.77,
    avg_position: 12.3,
    indexed_rate: 94
  },
  topQueries: [
    { query: 'project management software', clicks: 245, impressions: 3450, ctr: 7.1, position: 5.2 },
    { query: 'task tracking tools', clicks: 198, impressions: 2890, ctr: 6.8, position: 7.3 },
    { query: 'remote team tips', clicks: 156, impressions: 2120, ctr: 7.4, position: 4.8 },
    { query: 'saas productivity', clicks: 134, impressions: 1980, ctr: 6.8, position: 9.1 },
    { query: 'team collaboration software', clicks: 112, impressions: 1650, ctr: 6.8, position: 11.2 },
  ]
};

// ==================== INITIALIZATION ====================

// Run immediately when script loads (don't wait for DOMContentLoaded)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDemo);
} else {
  // DOM already loaded
  initDemo();
}

function initDemo() {
  // Load demo data immediately - dashboard is already visible in HTML
  loadDemoDashboard();
}

// Demo banner is now in HTML

function loadDemoDashboard() {
  // Update stats
  updateElement('stat-total-articles', DEMO_DATA.stats.total_articles);
  updateElement('stat-published', DEMO_DATA.stats.published);
  updateElement('stat-keywords', DEMO_DATA.stats.keywords);
  updateElement('stat-seo-score', DEMO_DATA.stats.avg_seo_score);
  
  // Update usage bar
  const usagePercent = (DEMO_DATA.stats.posts_this_month / DEMO_DATA.stats.monthly_limit) * 100;
  updateElement('usage-text', `${DEMO_DATA.stats.posts_this_month}/${DEMO_DATA.stats.monthly_limit}`);
  const usageBar = document.getElementById('usage-bar');
  if (usageBar) usageBar.style.width = `${usagePercent}%`;
  
  // Load top articles
  loadDemoTopArticles();
  
  // Load keywords
  loadDemoKeywords();
  
  // Load articles
  loadDemoArticles();
  
  // Load analytics
  loadDemoAnalytics();
  
  // Load calendar
  loadDemoCalendar();
  
  // Load billing info
  loadDemoBilling();
}

function updateElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function loadDemoTopArticles() {
  const container = document.getElementById('top-articles');
  if (!container) return;
  
  const topArticles = DEMO_DATA.articles.filter(a => a.status === 'published').slice(0, 3);
  
  container.innerHTML = topArticles.map(article => `
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div class="flex-1">
        <h4 class="font-medium text-gray-900 truncate">${article.title}</h4>
        <p class="text-sm text-gray-500">${article.published_at} • ${article.word_count} words</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-lg font-bold text-green-600">${article.seo_score}</p>
          <p class="text-xs text-gray-500">SEO Score</p>
        </div>
      </div>
    </div>
  `).join('');
}

function loadDemoKeywords() {
  const clustersContainer = document.getElementById('keyword-clusters');
  const tableContainer = document.getElementById('keywords-table');
  
  if (clustersContainer) {
    clustersContainer.innerHTML = DEMO_DATA.clusters.map(cluster => `
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">${cluster.cluster_name}</h3>
          <span class="px-2 py-1 text-xs rounded-full ${
            cluster.funnel_stage === 'TOFU' ? 'bg-blue-100 text-blue-700' :
            cluster.funnel_stage === 'MOFU' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }">${cluster.funnel_stage}</span>
        </div>
        <p class="text-sm text-gray-600 mb-3">${cluster.pillar_keyword}</p>
        <p class="text-xs text-gray-500">${cluster.keyword_count} keywords</p>
      </div>
    `).join('');
  }
  
  if (tableContainer) {
    tableContainer.innerHTML = DEMO_DATA.keywords.map(kw => `
      <tr>
        <td class="px-6 py-4">
          <span class="font-medium text-gray-900">${kw.keyword}</span>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 text-xs rounded-full ${
            kw.search_intent === 'informational' ? 'bg-blue-100 text-blue-700' :
            kw.search_intent === 'commercial' ? 'bg-purple-100 text-purple-700' :
            'bg-orange-100 text-orange-700'
          }">${kw.search_intent}</span>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 text-xs rounded-full ${
            kw.funnel_stage === 'TOFU' ? 'bg-blue-100 text-blue-700' :
            kw.funnel_stage === 'MOFU' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }">${kw.funnel_stage}</span>
        </td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <div class="w-16 bg-gray-200 rounded-full h-2">
              <div class="bg-indigo-600 h-2 rounded-full" style="width: ${kw.priority}%"></div>
            </div>
            <span class="text-sm text-gray-600">${kw.priority}</span>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 text-xs rounded-full ${
            kw.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }">${kw.status}</span>
        </td>
        <td class="px-6 py-4">
          ${kw.status === 'pending' ? `
            <button onclick="demoGenerate('${kw.id}')" class="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">
              <i class="fas fa-magic mr-1"></i>Generate
            </button>
          ` : '<span class="text-gray-400 text-sm">Article exists</span>'}
        </td>
      </tr>
    `).join('');
  }
}

function loadDemoArticles() {
  const container = document.getElementById('articles-grid');
  if (!container) return;
  
  container.innerHTML = DEMO_DATA.articles.map(article => `
    <div class="bg-white rounded-xl shadow-sm overflow-hidden card-hover">
      <div class="p-6">
        <div class="flex items-center justify-between mb-3">
          <span class="px-2 py-1 text-xs rounded-full ${
            article.status === 'published' ? 'bg-green-100 text-green-700' :
            article.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }">${article.status}</span>
          <span class="text-sm text-gray-500">${article.word_count} words</span>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">${article.title}</h3>
        <p class="text-sm text-gray-600 line-clamp-2 mb-4">${article.excerpt}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-${article.seo_score >= 85 ? 'green' : article.seo_score >= 70 ? 'yellow' : 'red'}-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-bold text-${article.seo_score >= 85 ? 'green' : article.seo_score >= 70 ? 'yellow' : 'red'}-600">${article.seo_score}</span>
            </div>
            <span class="text-xs text-gray-500">SEO Score</span>
          </div>
          <div class="flex gap-2">
            <button onclick="demoViewArticle('${article.id}')" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <i class="fas fa-eye"></i>
            </button>
            ${article.status === 'draft' ? `
              <button onclick="demoPublish('${article.id}')" class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <i class="fas fa-upload mr-1"></i>Publish
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function loadDemoAnalytics() {
  // GSC stats
  updateElement('gsc-clicks', DEMO_DATA.analytics.clicks.toLocaleString());
  updateElement('gsc-impressions', DEMO_DATA.analytics.impressions.toLocaleString());
  updateElement('gsc-ctr', DEMO_DATA.analytics.ctr + '%');
  updateElement('gsc-position', DEMO_DATA.analytics.avg_position.toFixed(1));
  
  // Traffic metrics
  updateElement('total-impressions', DEMO_DATA.analytics.impressions.toLocaleString());
  updateElement('total-clicks', DEMO_DATA.analytics.clicks.toLocaleString());
  updateElement('avg-ctr', DEMO_DATA.analytics.ctr + '%');
  updateElement('avg-position', DEMO_DATA.analytics.avg_position.toFixed(1));
  
  // Indexed rate
  updateElement('indexed-rate', DEMO_DATA.analytics.indexed_rate + '%');
  const indexedBar = document.getElementById('indexed-bar');
  if (indexedBar) indexedBar.style.width = DEMO_DATA.analytics.indexed_rate + '%';
  
  // Health score
  const healthScore = 82;
  updateElement('health-score', healthScore);
  const healthCircle = document.getElementById('health-circle');
  if (healthCircle) {
    const offset = 352 - (352 * healthScore / 100);
    healthCircle.style.strokeDashoffset = offset;
  }
  
  // GSC status
  const gscStatus = document.getElementById('gsc-status');
  if (gscStatus) {
    gscStatus.textContent = 'Connected (Demo)';
    gscStatus.className = 'px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700';
  }
  
  // Show connected state
  const gscNotConnected = document.getElementById('gsc-not-connected');
  const gscConnected = document.getElementById('gsc-connected');
  if (gscNotConnected) gscNotConnected.classList.add('hidden');
  if (gscConnected) gscConnected.classList.remove('hidden');
  
  // Health recommendations
  const recommendations = document.getElementById('health-recommendations');
  if (recommendations) {
    recommendations.innerHTML = `
      <div class="flex items-center gap-2 text-green-600">
        <i class="fas fa-check-circle"></i>
        <span class="text-sm">94% of articles are indexed</span>
      </div>
      <div class="flex items-center gap-2 text-green-600">
        <i class="fas fa-check-circle"></i>
        <span class="text-sm">Good internal linking structure</span>
      </div>
      <div class="flex items-center gap-2 text-yellow-600">
        <i class="fas fa-exclamation-circle"></i>
        <span class="text-sm">2 articles need meta description updates</span>
      </div>
    `;
  }
  
  // Email status
  const emailStatus = document.getElementById('email-status');
  if (emailStatus) {
    emailStatus.textContent = 'Configured (Demo)';
    emailStatus.className = 'px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700';
  }
}

function loadDemoCalendar() {
  // Current date
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  updateElement('calendar-title', currentMonth);
  
  // Generate calendar grid
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let html = '';
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="p-2 min-h-24"></div>';
  }
  
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = day === now.getDate();
    
    // Check for scheduled articles
    const scheduled = DEMO_DATA.articles.find(a => {
      if (a.scheduled_at) {
        const schedDate = new Date(a.scheduled_at);
        return schedDate.getDate() === day && schedDate.getMonth() === month;
      }
      return false;
    });
    
    // Check for published articles
    const published = DEMO_DATA.articles.find(a => {
      if (a.published_at) {
        const pubDate = new Date(a.published_at);
        return pubDate.getDate() === day && pubDate.getMonth() === month;
      }
      return false;
    });
    
    html += `
      <div class="p-2 min-h-24 border border-gray-100 rounded-lg ${isToday ? 'bg-indigo-50 border-indigo-200' : 'bg-white'} calendar-drop-zone" data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">
        <span class="text-sm font-medium ${isToday ? 'text-indigo-600' : 'text-gray-700'}">${day}</span>
        ${scheduled ? `
          <div class="mt-1 p-1.5 bg-yellow-100 rounded text-xs text-yellow-800 truncate">
            <i class="fas fa-clock mr-1"></i>${scheduled.title.substring(0, 20)}...
          </div>
        ` : ''}
        ${published ? `
          <div class="mt-1 p-1.5 bg-green-100 rounded text-xs text-green-800 truncate">
            <i class="fas fa-check mr-1"></i>${published.title.substring(0, 20)}...
          </div>
        ` : ''}
      </div>
    `;
  }
  
  grid.innerHTML = html;
  
  // Update sidebar panels
  const scheduledArticles = document.getElementById('scheduled-articles');
  const draftArticles = document.getElementById('draft-articles');
  const publishedArticles = document.getElementById('published-articles');
  
  const scheduled = DEMO_DATA.articles.filter(a => a.status === 'scheduled');
  const drafts = DEMO_DATA.articles.filter(a => a.status === 'draft');
  const published = DEMO_DATA.articles.filter(a => a.status === 'published');
  
  updateElement('scheduled-count', scheduled.length);
  updateElement('draft-count', drafts.length);
  updateElement('published-count', published.length);
  
  if (scheduledArticles) {
    scheduledArticles.innerHTML = scheduled.map(a => `
      <div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200 draggable-article cursor-grab">
        <p class="text-sm font-medium text-gray-900 truncate">${a.title}</p>
        <p class="text-xs text-gray-500 mt-1"><i class="fas fa-calendar mr-1"></i>${a.scheduled_at}</p>
      </div>
    `).join('') || '<p class="text-gray-500 text-sm text-center py-4">No scheduled articles</p>';
  }
  
  if (draftArticles) {
    draftArticles.innerHTML = drafts.map(a => `
      <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 draggable-article cursor-grab">
        <p class="text-sm font-medium text-gray-900 truncate">${a.title}</p>
        <p class="text-xs text-gray-500 mt-1"><i class="fas fa-edit mr-1"></i>Draft • ${a.word_count} words</p>
      </div>
    `).join('') || '<p class="text-gray-500 text-sm text-center py-4">No draft articles</p>';
  }
  
  if (publishedArticles) {
    publishedArticles.innerHTML = published.slice(0, 3).map(a => `
      <div class="p-3 bg-green-50 rounded-lg border border-green-200">
        <p class="text-sm font-medium text-gray-900 truncate">${a.title}</p>
        <p class="text-xs text-gray-500 mt-1"><i class="fas fa-check mr-1"></i>${a.published_at}</p>
      </div>
    `).join('') || '<p class="text-gray-500 text-sm text-center py-4">No published articles</p>';
  }
}

function loadDemoBilling() {
  // Update billing info
  updateElement('billing-status', 'Growth Plan');
  const billingStatus = document.getElementById('billing-status');
  if (billingStatus) {
    billingStatus.className = 'px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700';
  }
  
  updateElement('current-plan-name', 'Growth');
  updateElement('current-plan-price', '$149/month');
  updateElement('billing-posts-used', '8');
  updateElement('billing-posts-limit', '30');
  updateElement('billing-period-end', 'Jan 15');
  updateElement('billing-cycle', 'Monthly');
  
  // Show stripe not configured for demo
  const stripeNotConfigured = document.getElementById('stripe-not-configured');
  if (stripeNotConfigured) {
    stripeNotConfigured.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <i class="fas fa-info-circle text-blue-600"></i>
        </div>
        <div>
          <h4 class="font-semibold text-blue-800 mb-2">Demo Mode</h4>
          <p class="text-sm text-blue-700">
            You're viewing sample billing data. Sign up for a real account to manage subscriptions and payments.
          </p>
          <a href="/app?register=true" class="inline-flex items-center gap-2 mt-3 text-blue-800 hover:text-blue-900 font-medium">
            <i class="fas fa-rocket"></i>Start Free Trial
            <i class="fas fa-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
    `;
    stripeNotConfigured.classList.remove('hidden');
    stripeNotConfigured.className = 'bg-blue-50 rounded-xl p-6 border border-blue-200 mt-6';
  }
}

// ==================== DEMO INTERACTIONS ====================

function demoGenerate(keywordId) {
  showDemoToast('Article generation requires a real account', 'info');
}

function demoViewArticle(articleId) {
  const article = DEMO_DATA.articles.find(a => a.id === articleId);
  if (article) {
    showDemoToast(`Viewing: ${article.title.substring(0, 50)}...`, 'info');
  }
}

function demoPublish(articleId) {
  showDemoToast('Publishing requires a real account', 'info');
}

function showDemoToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 ${
    type === 'success' ? 'bg-green-600' : 
    type === 'error' ? 'bg-red-600' : 
    'bg-indigo-600'
  } text-white flex items-center gap-3`;
  
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
    <a href="/app?register=true" class="ml-2 px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition">Sign up →</a>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// ==================== SECTION NAVIGATION ====================

function showSection(section) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  
  // Show target section
  const target = document.getElementById(`section-${section}`);
  if (target) target.classList.remove('hidden');
  
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('bg-gray-800', 'text-white');
    link.classList.add('text-gray-400');
  });
  
  const activeLink = document.querySelector(`.nav-link[onclick*="${section}"]`);
  if (activeLink) {
    activeLink.classList.remove('text-gray-400');
    activeLink.classList.add('bg-gray-800', 'text-white');
  }
}

// ==================== MODALS ====================

function openKeywordResearch() {
  const modal = document.getElementById('keyword-research-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeKeywordResearch() {
  const modal = document.getElementById('keyword-research-modal');
  if (modal) modal.classList.add('hidden');
}

function runKeywordResearch() {
  showDemoToast('Keyword research requires a real account', 'info');
  closeKeywordResearch();
}

function openArticleGenerator() {
  showDemoToast('Article generation requires a real account', 'info');
}

function analyzeLinks() {
  showDemoToast('Link analysis requires a real account', 'info');
}

function handleLogout() {
  window.location.href = '/';
}

// Calendar navigation
let currentCalendarDate = new Date();
let calendarView = 'month';

function navigateCalendar(direction) {
  if (calendarView === 'month') {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
  } else {
    currentCalendarDate.setDate(currentCalendarDate.getDate() + (direction * 7));
  }
  loadDemoCalendar();
}

function changeCalendarView(view) {
  calendarView = view;
  document.getElementById('view-month').className = view === 'month' ? 
    'px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium' : 
    'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300';
  document.getElementById('view-week').className = view === 'week' ? 
    'px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium' : 
    'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300';
  loadDemoCalendar();
}

// Billing
function setBillingCycle(cycle) {
  document.getElementById('cycle-monthly').className = cycle === 'monthly' ?
    'px-4 py-2 rounded-md text-sm font-medium bg-white shadow text-gray-900' :
    'px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900';
  document.getElementById('cycle-yearly').className = cycle === 'yearly' ?
    'px-4 py-2 rounded-md text-sm font-medium bg-white shadow text-gray-900' :
    'px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900';
}

function selectPlan(tier) {
  showDemoToast(`Upgrade to ${tier} plan with a real account`, 'info');
}

function openBillingPortal() {
  showDemoToast('Billing portal requires a real account', 'info');
}

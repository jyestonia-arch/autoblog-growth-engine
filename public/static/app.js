// AutoBlog Growth Engine - Frontend Application

const API_BASE = '/api';
let authToken = localStorage.getItem('autoblog_token');
let currentUser = null;
let currentOrg = null;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

async function checkAuth() {
  const loading = document.getElementById('loading');
  const authScreen = document.getElementById('auth-screen');
  const dashboard = document.getElementById('dashboard');

  if (!authToken) {
    loading.classList.add('hidden');
    authScreen.classList.remove('hidden');
    return;
  }

  try {
    const res = await apiCall('/organization');
    if (res.error) throw new Error(res.error);
    
    currentOrg = res;
    loading.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadDashboardData();
  } catch (e) {
    localStorage.removeItem('autoblog_token');
    authToken = null;
    loading.classList.add('hidden');
    authScreen.classList.remove('hidden');
  }
}

// ==================== API HELPER ====================

async function apiCall(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    return { error: e.message };
  }
}

// ==================== AUTH FUNCTIONS ====================

function showLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}

async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  const res = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  authToken = res.token;
  localStorage.setItem('autoblog_token', authToken);
  currentUser = res.user;
  currentOrg = res.org;

  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  loadDashboardData();
}

async function handleRegister() {
  const name = document.getElementById('reg-name').value;
  const company = document.getElementById('reg-company').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const industry = document.getElementById('reg-industry').value;

  if (!name || !company || !email || !password) {
    alert('Please fill in all required fields');
    return;
  }

  const res = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, company, email, password, industry }),
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  authToken = res.token;
  localStorage.setItem('autoblog_token', authToken);
  currentUser = res.user;
  currentOrg = res.org;

  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  loadDashboardData();
}

async function handleLogout() {
  await apiCall('/auth/logout', { method: 'POST' });
  localStorage.removeItem('autoblog_token');
  authToken = null;
  currentUser = null;
  currentOrg = null;
  
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

// ==================== NAVIGATION ====================

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  
  // Show target section
  const target = document.getElementById(`section-${sectionId}`);
  if (target) target.classList.remove('hidden');

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('bg-gray-800', 'text-white');
    link.classList.add('text-gray-400');
  });
  
  const activeLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
  if (activeLink) {
    activeLink.classList.add('bg-gray-800', 'text-white');
    activeLink.classList.remove('text-gray-400');
  }

  // Load section data
  switch (sectionId) {
    case 'overview': loadDashboardData(); break;
    case 'keywords': loadKeywords(); break;
    case 'articles': loadArticles(); break;
    case 'calendar': loadCalendar(); break;
    case 'linking': loadLinkingStats(); break;
    case 'publishing': loadWebsites(); break;
    case 'analytics': loadSEOHealth(); break;
  }
}

// ==================== DASHBOARD ====================

async function loadDashboardData() {
  const stats = await apiCall('/dashboard/stats');
  if (stats.error) return;

  document.getElementById('stat-total-articles').textContent = stats.total_articles || 0;
  document.getElementById('stat-published').textContent = stats.published_articles || 0;
  document.getElementById('stat-keywords').textContent = stats.total_keywords || 0;
  document.getElementById('stat-seo-score').textContent = stats.avg_seo_score || 0;

  // Update usage bar
  const used = stats.posts_this_month || 0;
  const limit = stats.monthly_limit || 10;
  const percentage = Math.round((used / limit) * 100);
  
  document.getElementById('usage-text').textContent = `${used}/${limit}`;
  document.getElementById('usage-bar').style.width = `${percentage}%`;

  // Top performers
  const topArticles = stats.top_performers || [];
  const container = document.getElementById('top-articles');
  
  if (topArticles.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">No articles yet. Start by researching keywords!</p>';
  } else {
    container.innerHTML = topArticles.map(a => `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p class="font-medium text-gray-900">${escapeHtml(a.title)}</p>
          <p class="text-sm text-gray-500">${a.published_at ? formatDate(a.published_at) : 'Draft'}</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            SEO: ${a.seo_score}
          </span>
          ${a.published_url ? `<a href="${a.published_url}" target="_blank" class="text-indigo-600 hover:text-indigo-700"><i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>
      </div>
    `).join('');
  }
}

// ==================== KEYWORDS ====================

function openKeywordResearch() {
  document.getElementById('keyword-research-modal').classList.remove('hidden');
}

function closeKeywordResearch() {
  document.getElementById('keyword-research-modal').classList.add('hidden');
}

async function runKeywordResearch() {
  const btn = document.getElementById('kr-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Researching...';

  const data = {
    saas_description: document.getElementById('kr-description').value,
    target_icp: document.getElementById('kr-icp').value,
    industry: document.getElementById('kr-industry').value,
    competitors: document.getElementById('kr-competitors').value.split(',').map(s => s.trim()).filter(Boolean),
  };

  const res = await apiCall('/keywords/research', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-search mr-2"></i> Generate Keywords';

  if (res.error) {
    alert(res.error);
    return;
  }

  closeKeywordResearch();
  loadKeywords();
  alert(`Generated ${res.total_keywords} keywords across ${res.clusters.length} clusters!`);
}

async function loadKeywords() {
  // Load clusters
  const clusters = await apiCall('/keywords/clusters');
  const clustersContainer = document.getElementById('keyword-clusters');
  
  if (!clusters.error && clusters.length > 0) {
    clustersContainer.innerHTML = clusters.map(c => `
      <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h4 class="font-semibold text-gray-900">${escapeHtml(c.cluster_name)}</h4>
            <p class="text-sm text-gray-500">${escapeHtml(c.pillar_keyword)}</p>
          </div>
          <span class="px-3 py-1 text-xs font-medium rounded-full ${getFunnelColor(c.funnel_stage)}">
            ${c.funnel_stage.toUpperCase()}
          </span>
        </div>
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span><i class="fas fa-key mr-1"></i> ${c.total_keywords} keywords</span>
          <span><i class="fas fa-file-alt mr-1"></i> ${c.articles_generated} articles</span>
        </div>
      </div>
    `).join('');
  } else {
    clustersContainer.innerHTML = '';
  }

  // Load keywords table
  const keywords = await apiCall('/keywords');
  const tbody = document.getElementById('keywords-table');
  
  if (!keywords.error && keywords.length > 0) {
    tbody.innerHTML = keywords.map(k => `
      <tr>
        <td class="px-6 py-4">
          <p class="font-medium text-gray-900">${escapeHtml(k.keyword)}</p>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">${k.search_intent}</span>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${getFunnelColor(k.funnel_stage)}">${k.funnel_stage}</span>
        </td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <div class="w-16 bg-gray-200 rounded-full h-2">
              <div class="bg-indigo-600 h-2 rounded-full" style="width: ${k.priority_score}%"></div>
            </div>
            <span class="text-sm text-gray-600">${k.priority_score}</span>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(k.status)}">${k.status}</span>
        </td>
        <td class="px-6 py-4">
          ${k.status === 'pending' ? `
            <button onclick="generateFromKeyword('${k.id}')" class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition">
              Generate
            </button>
          ` : '-'}
        </td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No keywords yet. Run keyword research to get started.</td></tr>';
  }
}

async function generateFromKeyword(keywordId) {
  if (!confirm('Generate an article for this keyword? This will use 1 post from your monthly limit.')) return;

  const res = await apiCall('/articles/generate', {
    method: 'POST',
    body: JSON.stringify({ keyword_id: keywordId }),
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  alert('Article generated successfully!');
  loadKeywords();
  loadDashboardData();
}

// ==================== ARTICLES ====================

async function loadArticles() {
  const filter = document.getElementById('article-filter').value;
  const endpoint = filter ? `/articles?status=${filter}` : '/articles';
  
  const res = await apiCall(endpoint);
  const container = document.getElementById('articles-grid');
  
  if (res.error || !res.articles || res.articles.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No articles found.</div>';
    return;
  }

  container.innerHTML = res.articles.map(a => `
    <div class="bg-white rounded-xl shadow-sm overflow-hidden card-hover">
      <div class="p-6">
        <div class="flex items-start justify-between mb-3">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(a.status)}">${a.status}</span>
          <span class="text-sm text-gray-500">${a.word_count} words</span>
        </div>
        <h4 class="font-semibold text-gray-900 mb-2 line-clamp-2">${escapeHtml(a.title)}</h4>
        <p class="text-sm text-gray-500 mb-4 line-clamp-2">${escapeHtml(a.excerpt || '')}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">SEO: ${a.seo_score}</span>
            <span class="text-xs text-gray-500"><i class="fas fa-clock mr-1"></i>${a.reading_time} min</span>
          </div>
          <div class="flex gap-2">
            <button onclick="viewArticle('${a.id}')" class="p-2 text-gray-400 hover:text-indigo-600 transition">
              <i class="fas fa-eye"></i>
            </button>
            ${a.status === 'draft' ? `
              <button onclick="publishArticle('${a.id}')" class="p-2 text-gray-400 hover:text-green-600 transition">
                <i class="fas fa-upload"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function openArticleGenerator() {
  showSection('keywords');
  alert('Select a keyword to generate an article, or run new keyword research first.');
}

async function viewArticle(articleId) {
  const article = await apiCall(`/articles/${articleId}`);
  if (article.error) {
    alert(article.error);
    return;
  }

  // Open article viewer modal (simplified)
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <div class="p-6 border-b flex justify-between items-center">
        <h3 class="text-xl font-bold">${escapeHtml(article.title)}</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      <div class="p-6 overflow-y-auto max-h-[70vh] prose max-w-none">
        ${article.content}
      </div>
      <div class="p-6 border-t bg-gray-50 flex justify-between">
        <div class="text-sm text-gray-500">
          <span class="mr-4">SEO Score: ${article.seo_score}</span>
          <span>${article.word_count} words</span>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
          Close
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function publishArticle(articleId) {
  const websites = await apiCall('/websites');
  if (websites.error || websites.length === 0) {
    alert('Please connect a WordPress site first in the Publishing section.');
    showSection('publishing');
    return;
  }

  const websiteId = websites[0].id;
  if (!confirm(`Publish this article to ${websites[0].name}?`)) return;

  const res = await apiCall(`/articles/${articleId}/publish`, {
    method: 'POST',
    body: JSON.stringify({ website_id: websiteId }),
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  alert(`Published successfully! URL: ${res.publishedUrl}`);
  loadArticles();
}

// ==================== INTERNAL LINKING ====================

async function loadLinkingStats() {
  const stats = await apiCall('/internal-links/stats');
  if (stats.error) return;

  document.getElementById('link-total').textContent = stats.totalLinks || 0;
  document.getElementById('link-avg').textContent = stats.avgLinksPerArticle || 0;
  document.getElementById('link-orphans').textContent = stats.orphanCount || 0;
}

async function analyzeLinks() {
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Analyzing...';

  const res = await apiCall('/internal-links/analyze', { method: 'POST' });

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i> Analyze';

  if (res.error) {
    alert(res.error);
    return;
  }

  document.getElementById('link-density').textContent = `${res.link_density_score}%`;
  
  const container = document.getElementById('link-suggestions');
  if (res.top_suggestions && res.top_suggestions.length > 0) {
    container.innerHTML = res.top_suggestions.map(s => `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <p class="text-sm text-gray-600">
            <span class="font-medium text-gray-900">${escapeHtml(s.source_title)}</span>
            <i class="fas fa-arrow-right mx-2 text-gray-400"></i>
            <span class="font-medium text-gray-900">${escapeHtml(s.target_title)}</span>
          </p>
          <p class="text-xs text-gray-500 mt-1">Anchor: "${escapeHtml(s.anchor)}" | Type: ${s.type}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">${s.relevance}% match</span>
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">No link suggestions available. Generate more content first.</p>';
  }

  loadLinkingStats();
}

// ==================== PUBLISHING ====================

async function loadWebsites() {
  const websites = await apiCall('/websites');
  const container = document.getElementById('websites-list');
  
  if (websites.error || websites.length === 0) {
    container.innerHTML = `
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <i class="fas fa-plus-circle text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600 mb-4">Connect your first WordPress site</p>
        <button onclick="openWebsiteModal()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Add Website
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = websites.map(w => `
    <div class="flex items-center justify-between p-4 border rounded-lg">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <i class="fab fa-wordpress text-blue-600 text-xl"></i>
        </div>
        <div>
          <p class="font-medium text-gray-900">${escapeHtml(w.name)}</p>
          <p class="text-sm text-gray-500">${escapeHtml(w.url)}</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="px-3 py-1 rounded-full text-sm font-medium ${w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
          ${w.status}
        </span>
        ${w.auto_publish ? '<span class="text-xs text-gray-500"><i class="fas fa-robot mr-1"></i>Auto</span>' : ''}
      </div>
    </div>
  `).join('') + `
    <button onclick="openWebsiteModal()" class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition">
      <i class="fas fa-plus mr-2"></i> Add Another Website
    </button>
  `;

  // Load publishing queue
  loadPublishingQueue();
}

async function loadPublishingQueue() {
  const res = await apiCall('/articles?status=scheduled');
  const container = document.getElementById('publishing-queue');
  
  if (res.error || !res.articles || res.articles.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">No articles scheduled for publishing.</p>';
    return;
  }

  container.innerHTML = res.articles.map(a => `
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p class="font-medium text-gray-900">${escapeHtml(a.title)}</p>
        <p class="text-sm text-gray-500">Scheduled: ${formatDate(a.scheduled_at)}</p>
      </div>
      <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Pending</span>
    </div>
  `).join('');
}

function openWebsiteModal() {
  document.getElementById('website-modal').classList.remove('hidden');
}

function closeWebsiteModal() {
  document.getElementById('website-modal').classList.add('hidden');
}

async function testWebsiteConnection() {
  alert('Connection test would verify WordPress API credentials. For demo, assuming success.');
}

async function saveWebsite() {
  const data = {
    name: document.getElementById('ws-name').value,
    url: document.getElementById('ws-url').value,
    api_key: document.getElementById('ws-api-key').value,
    auto_publish: document.getElementById('ws-auto-publish').checked,
  };

  if (!data.name || !data.url || !data.api_key) {
    alert('Please fill in all required fields');
    return;
  }

  const res = await apiCall('/websites', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  closeWebsiteModal();
  loadWebsites();
  alert('Website added successfully!');
}

// ==================== ANALYTICS ====================

async function loadSEOHealth() {
  const health = await apiCall('/analytics/seo-health');
  if (health.error) return;

  // Update health score circle
  const score = health.overallScore || 0;
  const circle = document.getElementById('health-circle');
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (score / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  
  document.getElementById('health-score').textContent = score;

  // Update recommendations
  const recsContainer = document.getElementById('health-recommendations');
  if (health.recommendations && health.recommendations.length > 0) {
    recsContainer.innerHTML = health.recommendations.map(r => `
      <div class="flex items-start gap-2">
        <i class="fas fa-lightbulb text-yellow-500 mt-1"></i>
        <p class="text-sm text-gray-600">${escapeHtml(r)}</p>
      </div>
    `).join('');
  } else {
    recsContainer.innerHTML = '<p class="text-green-600"><i class="fas fa-check-circle mr-2"></i>All systems optimal!</p>';
  }

  // Update metrics
  document.getElementById('indexed-rate').textContent = `${Math.round(health.indexedRate || 0)}%`;
  document.getElementById('indexed-bar').style.width = `${health.indexedRate || 0}%`;
  document.getElementById('total-impressions').textContent = formatNumber(health.totalImpressions || 0);
  document.getElementById('total-clicks').textContent = formatNumber(health.totalClicks || 0);
  document.getElementById('avg-ctr').textContent = `${(health.avgCtr || 0).toFixed(1)}%`;
  document.getElementById('avg-position').textContent = health.avgRanking ? Math.round(health.avgRanking) : '-';
}

// ==================== UTILITIES ====================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function getFunnelColor(stage) {
  const colors = {
    tofu: 'bg-blue-100 text-blue-700',
    mofu: 'bg-yellow-100 text-yellow-700',
    bofu: 'bg-green-100 text-green-700',
  };
  return colors[stage] || 'bg-gray-100 text-gray-700';
}

function getStatusColor(status) {
  const colors = {
    pending: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
    skipped: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

// ==================== CONTENT CALENDAR ====================

let calendarDate = new Date();
let calendarView = 'month';
let calendarArticles = [];
let draggedArticle = null; // For drag and drop

async function loadCalendar() {
  // Load all articles for calendar
  const res = await apiCall('/articles?limit=100');
  if (!res.error) {
    calendarArticles = res.articles || [];
  }
  
  renderCalendar();
  loadCalendarSidebar();
}

function changeCalendarView(view) {
  calendarView = view;
  
  // Update view buttons
  document.getElementById('view-month').className = view === 'month' 
    ? 'px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium'
    : 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300';
  document.getElementById('view-week').className = view === 'week'
    ? 'px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium'
    : 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300';
  
  // Show/hide views
  document.getElementById('calendar-month-view').classList.toggle('hidden', view !== 'month');
  document.getElementById('calendar-week-view').classList.toggle('hidden', view !== 'week');
  
  renderCalendar();
}

function navigateCalendar(direction) {
  if (calendarView === 'month') {
    calendarDate.setMonth(calendarDate.getMonth() + direction);
  } else {
    calendarDate.setDate(calendarDate.getDate() + (direction * 7));
  }
  renderCalendar();
}

function renderCalendar() {
  // Update title
  const titleEl = document.getElementById('calendar-title');
  if (calendarView === 'month') {
    titleEl.textContent = calendarDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    renderMonthView();
  } else {
    const weekStart = getWeekStart(calendarDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    titleEl.textContent = `${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)}`;
    renderWeekView();
  }
}

function renderMonthView() {
  const grid = document.getElementById('calendar-grid');
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let html = '';
  
  // Empty cells for days before month starts
  for (let i = 0; i < startDay; i++) {
    html += '<div class="min-h-24 p-2 bg-gray-50 rounded-lg"></div>';
  }
  
  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    
    // Find articles for this day
    const dayArticles = calendarArticles.filter(a => {
      const articleDate = a.scheduled_at || a.published_at;
      if (!articleDate) return false;
      return articleDate.split('T')[0] === dateStr;
    });
    
    // Add calendar-drop-zone class for drag & drop (only for future/today dates)
    const dropZoneClass = !isPast ? 'calendar-drop-zone' : '';
    
    html += `
      <div class="min-h-24 p-2 ${isToday ? 'bg-indigo-50 ring-2 ring-indigo-500' : isPast ? 'bg-gray-50' : 'bg-white'} rounded-lg border border-gray-100 hover:border-indigo-300 transition cursor-pointer ${dropZoneClass}"
           onclick="openDayView('${dateStr}')"
           ondragover="handleDragOver(event)"
           ondragleave="handleDragLeave(event)"
           ondrop="handleDrop(event, '${dateStr}')"
           data-date="${dateStr}">
        <div class="flex justify-between items-start mb-1">
          <span class="text-sm font-medium ${isToday ? 'text-indigo-600' : isPast ? 'text-gray-400' : 'text-gray-900'}">${day}</span>
          ${dayArticles.length > 0 ? `<span class="w-2 h-2 bg-indigo-500 rounded-full"></span>` : ''}
        </div>
        <div class="space-y-1 pointer-events-none">
          ${dayArticles.slice(0, 2).map(a => `
            <div class="text-xs p-1 rounded truncate ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
              ${escapeHtml(a.title.substring(0, 20))}${a.title.length > 20 ? '...' : ''}
            </div>
          `).join('')}
          ${dayArticles.length > 2 ? `<div class="text-xs text-gray-500">+${dayArticles.length - 2} more</div>` : ''}
        </div>
      </div>
    `;
  }
  
  grid.innerHTML = html;
}

function renderWeekView() {
  const grid = document.getElementById('week-grid');
  const weekStart = getWeekStart(calendarDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let html = '';
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    
    // Find articles for this day
    const dayArticles = calendarArticles.filter(a => {
      const articleDate = a.scheduled_at || a.published_at;
      if (!articleDate) return false;
      return articleDate.split('T')[0] === dateStr;
    });
    
    // Add calendar-drop-zone class for drag & drop (only for future/today dates)
    const dropZoneClass = !isPast ? 'calendar-drop-zone' : '';
    
    html += `
      <div class="flex gap-4 p-4 ${isToday ? 'bg-indigo-50' : 'bg-white'} rounded-lg border border-gray-100 ${dropZoneClass}"
           ondragover="handleDragOver(event)"
           ondragleave="handleDragLeave(event)"
           ondrop="handleDrop(event, '${dateStr}')"
           data-date="${dateStr}">
        <div class="w-16 text-center">
          <div class="text-sm text-gray-500">${dayName}</div>
          <div class="text-2xl font-bold ${isToday ? 'text-indigo-600' : 'text-gray-900'}">${dayNum}</div>
        </div>
        <div class="flex-1 space-y-2">
          ${dayArticles.length === 0 ? `
            <div class="text-sm text-gray-400 py-2 ${!isPast ? 'drop-hint' : ''}">
              ${!isPast ? '<i class="fas fa-hand-point-left mr-1"></i>Drop article here or ' : ''}No content scheduled
            </div>
          ` : dayArticles.map(a => `
            <div class="flex items-center justify-between p-3 ${a.status === 'published' ? 'bg-green-50' : 'bg-yellow-50'} rounded-lg draggable-article cursor-move"
                 draggable="${a.status !== 'published'}"
                 data-article-id="${a.id}"
                 data-article-title="${escapeHtml(a.title)}"
                 data-article-status="${a.status}"
                 ondragstart="handleDragStart(event)"
                 ondragend="handleDragEnd(event)">
              <div class="flex items-center gap-2">
                ${a.status !== 'published' ? '<i class="fas fa-grip-vertical text-gray-400 text-xs"></i>' : ''}
                <div>
                  <p class="font-medium text-gray-900">${escapeHtml(a.title)}</p>
                  <p class="text-sm text-gray-500">${a.status === 'published' ? 'Published' : 'Scheduled - drag to reschedule'}</p>
                </div>
              </div>
              <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(a.status)}">${a.status}</span>
            </div>
          `).join('')}
          ${!isPast ? `
            <button onclick="openScheduleModal('${dateStr}')" class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition text-sm">
              <i class="fas fa-plus mr-1"></i> Add Content
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  grid.innerHTML = html;
}

async function loadCalendarSidebar() {
  // Scheduled articles - draggable to reschedule
  const scheduled = calendarArticles.filter(a => a.status === 'scheduled');
  const scheduledContainer = document.getElementById('scheduled-articles');
  document.getElementById('scheduled-count').textContent = scheduled.length;
  
  if (scheduled.length > 0) {
    scheduledContainer.innerHTML = scheduled.map(a => `
      <div class="p-3 bg-yellow-50 rounded-lg cursor-move draggable-article hover:ring-2 hover:ring-yellow-400 transition"
           draggable="true"
           data-article-id="${a.id}"
           data-article-title="${escapeHtml(a.title)}"
           data-article-status="scheduled"
           ondragstart="handleDragStart(event)"
           ondragend="handleDragEnd(event)">
        <div class="flex items-center gap-2">
          <i class="fas fa-grip-vertical text-yellow-400 text-xs"></i>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 text-sm truncate">${escapeHtml(a.title)}</p>
            <p class="text-xs text-gray-500 mt-1"><i class="fas fa-calendar mr-1"></i>${formatDate(a.scheduled_at)}</p>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    scheduledContainer.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No scheduled articles</p>';
  }
  
  // Draft articles - draggable to schedule
  const drafts = calendarArticles.filter(a => a.status === 'draft');
  const draftContainer = document.getElementById('draft-articles');
  document.getElementById('draft-count').textContent = drafts.length;
  
  if (drafts.length > 0) {
    draftContainer.innerHTML = drafts.map(a => `
      <div class="p-3 bg-gray-50 rounded-lg cursor-move draggable-article hover:ring-2 hover:ring-indigo-400 transition"
           draggable="true"
           data-article-id="${a.id}"
           data-article-title="${escapeHtml(a.title)}"
           data-article-status="draft"
           ondragstart="handleDragStart(event)"
           ondragend="handleDragEnd(event)">
        <div class="flex items-center gap-2">
          <i class="fas fa-grip-vertical text-gray-400 text-xs"></i>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 text-sm truncate">${escapeHtml(a.title)}</p>
            <p class="text-xs text-indigo-500 mt-1"><i class="fas fa-arrows-alt mr-1"></i>Drag to schedule</p>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    draftContainer.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No draft articles</p>';
  }
  
  // Published articles
  const published = calendarArticles.filter(a => a.status === 'published').slice(0, 10);
  const publishedContainer = document.getElementById('published-articles');
  document.getElementById('published-count').textContent = calendarArticles.filter(a => a.status === 'published').length;
  
  if (published.length > 0) {
    publishedContainer.innerHTML = published.map(a => `
      <div class="p-3 bg-green-50 rounded-lg">
        <p class="font-medium text-gray-900 text-sm truncate">${escapeHtml(a.title)}</p>
        <p class="text-xs text-gray-500 mt-1"><i class="fas fa-check-circle mr-1"></i>${formatDate(a.published_at)}</p>
      </div>
    `).join('');
  } else {
    publishedContainer.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No published articles</p>';
  }
}

function openDayView(dateStr) {
  openScheduleModal(dateStr);
}

function openScheduleModal(dateStr) {
  // Populate draft articles dropdown
  const select = document.getElementById('schedule-article');
  const drafts = calendarArticles.filter(a => a.status === 'draft');
  
  select.innerHTML = '<option value="">Select an article...</option>' + 
    drafts.map(a => `<option value="${a.id}">${escapeHtml(a.title)}</option>`).join('');
  
  // Set date
  if (dateStr) {
    document.getElementById('schedule-date').value = dateStr;
  } else {
    document.getElementById('schedule-date').value = new Date().toISOString().split('T')[0];
  }
  
  document.getElementById('schedule-modal').classList.remove('hidden');
}

function openScheduleModalForArticle(articleId) {
  openScheduleModal();
  document.getElementById('schedule-article').value = articleId;
}

function closeScheduleModal() {
  document.getElementById('schedule-modal').classList.add('hidden');
}

async function confirmSchedule() {
  const articleId = document.getElementById('schedule-article').value;
  const date = document.getElementById('schedule-date').value;
  const time = document.getElementById('schedule-time').value;
  
  if (!articleId || !date) {
    alert('Please select an article and date');
    return;
  }
  
  const scheduledAt = `${date}T${time}:00.000Z`;
  
  const res = await apiCall(`/articles/${articleId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'scheduled', scheduled_at: scheduledAt }),
  });
  
  if (res.error) {
    alert(res.error);
    return;
  }
  
  closeScheduleModal();
  loadCalendar();
  alert('Article scheduled successfully!');
}

// ==================== DRAG AND DROP ====================

function handleDragStart(event) {
  const target = event.target.closest('.draggable-article');
  if (!target) return;
  
  draggedArticle = {
    id: target.dataset.articleId,
    title: target.dataset.articleTitle,
    status: target.dataset.articleStatus
  };
  
  // Visual feedback
  target.classList.add('opacity-50', 'scale-95');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', draggedArticle.id);
  
  // Add drop zones highlight to calendar
  setTimeout(() => {
    document.querySelectorAll('.calendar-drop-zone').forEach(zone => {
      zone.classList.add('ring-2', 'ring-dashed', 'ring-indigo-300');
    });
  }, 0);
}

function handleDragEnd(event) {
  const target = event.target.closest('.draggable-article');
  if (target) {
    target.classList.remove('opacity-50', 'scale-95');
  }
  
  // Remove drop zones highlight
  document.querySelectorAll('.calendar-drop-zone').forEach(zone => {
    zone.classList.remove('ring-2', 'ring-dashed', 'ring-indigo-300', 'bg-indigo-100');
  });
  
  draggedArticle = null;
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  
  const target = event.target.closest('.calendar-drop-zone');
  if (target) {
    target.classList.add('bg-indigo-100');
  }
}

function handleDragLeave(event) {
  const target = event.target.closest('.calendar-drop-zone');
  if (target) {
    target.classList.remove('bg-indigo-100');
  }
}

async function handleDrop(event, dateStr) {
  event.preventDefault();
  
  const target = event.target.closest('.calendar-drop-zone');
  if (target) {
    target.classList.remove('bg-indigo-100', 'ring-2', 'ring-dashed', 'ring-indigo-300');
  }
  
  if (!draggedArticle) return;
  
  // Schedule the article for this date (default time 09:00)
  const scheduledAt = `${dateStr}T09:00:00.000Z`;
  
  // Show loading indicator
  showDropFeedback(target, 'loading');
  
  const res = await apiCall(`/articles/${draggedArticle.id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'scheduled', scheduled_at: scheduledAt }),
  });
  
  if (res.error) {
    showDropFeedback(target, 'error');
    showToast(`Failed to schedule: ${res.error}`, 'error');
  } else {
    showDropFeedback(target, 'success');
    showToast(`"${draggedArticle.title}" scheduled for ${formatDate(dateStr)}`, 'success');
    loadCalendar();
  }
  
  draggedArticle = null;
}

function showDropFeedback(target, type) {
  if (!target) return;
  
  const feedbackClass = {
    loading: 'bg-blue-100',
    success: 'bg-green-100',
    error: 'bg-red-100'
  }[type];
  
  target.classList.add(feedbackClass);
  setTimeout(() => {
    target.classList.remove(feedbackClass);
  }, 500);
}

function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.toast-notification').forEach(t => t.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast-notification fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 transform transition-all duration-300 translate-y-full opacity-0`;
  
  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-indigo-600'
  }[type] || 'bg-gray-800';
  
  const icon = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  }[type] || 'fa-info-circle';
  
  toast.classList.add(bgColor, 'text-white');
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-full', 'opacity-0');
  });
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Helper functions
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function formatDateShort(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

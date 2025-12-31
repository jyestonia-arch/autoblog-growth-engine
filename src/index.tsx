// AutoBlog Growth Engine - Main Application Entry

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import api from './routes/api';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('/*', cors());

// Mount API routes
app.route('/api', api);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Main dashboard HTML
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoBlog Growth Engine - Automated SEO Blog Marketing for SaaS</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    .pulse-dot { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .sidebar { width: 260px; min-height: 100vh; }
    .main-content { margin-left: 260px; }
    @media (max-width: 1024px) { .sidebar { display: none; } .main-content { margin-left: 0; } }
  </style>
</head>
<body class="bg-gray-50">
  <div id="app">
    <!-- Loading State -->
    <div id="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
        <p class="text-gray-600">Loading AutoBlog...</p>
      </div>
    </div>

    <!-- Auth Screen -->
    <div id="auth-screen" class="hidden min-h-screen gradient-bg flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <i class="fas fa-rocket text-2xl text-indigo-600"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">AutoBlog Growth Engine</h1>
          <p class="text-gray-500 mt-2">Automated SEO Content for SaaS Startups</p>
        </div>

        <div id="login-form">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="login-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="you@company.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" id="login-password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="••••••••">
            </div>
            <button onclick="handleLogin()" class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              Sign In
            </button>
          </div>
          <p class="text-center mt-6 text-gray-600">
            Don't have an account? <button onclick="showRegister()" class="text-indigo-600 font-semibold hover:underline">Sign up</button>
          </p>
        </div>

        <div id="register-form" class="hidden">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input type="text" id="reg-name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="John Doe">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input type="text" id="reg-company" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Acme Inc">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="reg-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="you@company.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" id="reg-password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="••••••••">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select id="reg-industry" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">Select industry...</option>
                <option value="saas">SaaS / Software</option>
                <option value="fintech">Fintech</option>
                <option value="healthtech">Healthtech</option>
                <option value="ecommerce">E-commerce</option>
                <option value="martech">Martech</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button onclick="handleRegister()" class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              Create Account
            </button>
          </div>
          <p class="text-center mt-6 text-gray-600">
            Already have an account? <button onclick="showLogin()" class="text-indigo-600 font-semibold hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>

    <!-- Main Dashboard -->
    <div id="dashboard" class="hidden">
      <!-- Sidebar -->
      <aside class="sidebar fixed left-0 top-0 bg-gray-900 text-white p-6">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <i class="fas fa-rocket"></i>
          </div>
          <div>
            <h1 class="font-bold text-lg">AutoBlog</h1>
            <p class="text-xs text-gray-400">Growth Engine</p>
          </div>
        </div>

        <nav class="space-y-2">
          <a href="#" onclick="showSection('overview')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white">
            <i class="fas fa-chart-line w-5"></i> Overview
          </a>
          <a href="#" onclick="showSection('keywords')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-key w-5"></i> Keywords
          </a>
          <a href="#" onclick="showSection('articles')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-file-alt w-5"></i> Articles
          </a>
          <a href="#" onclick="showSection('calendar')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-calendar-alt w-5"></i> Calendar
          </a>
          <a href="#" onclick="showSection('linking')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-link w-5"></i> Internal Links
          </a>
          <a href="#" onclick="showSection('publishing')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-upload w-5"></i> Publishing
          </a>
          <a href="#" onclick="showSection('analytics')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-chart-bar w-5"></i> Analytics
          </a>
        </nav>

        <div class="absolute bottom-6 left-6 right-6">
          <div class="bg-gray-800 rounded-lg p-4 mb-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-400">Posts Used</span>
              <span id="usage-text" class="text-white font-medium">0/10</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div id="usage-bar" class="bg-indigo-500 h-2 rounded-full" style="width: 0%"></div>
            </div>
          </div>
          <button onclick="handleLogout()" class="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <i class="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content min-h-screen p-8">
        <!-- Overview Section -->
        <section id="section-overview" class="section">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p class="text-gray-500">Your content growth at a glance</p>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-file-alt text-blue-600 text-xl"></i>
                </div>
                <span class="text-green-500 text-sm font-medium"><i class="fas fa-arrow-up"></i> 12%</span>
              </div>
              <h3 id="stat-total-articles" class="text-3xl font-bold text-gray-900">0</h3>
              <p class="text-gray-500">Total Articles</p>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <span class="pulse-dot w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
              <h3 id="stat-published" class="text-3xl font-bold text-gray-900">0</h3>
              <p class="text-gray-500">Published</p>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-key text-purple-600 text-xl"></i>
                </div>
              </div>
              <h3 id="stat-keywords" class="text-3xl font-bold text-gray-900">0</h3>
              <p class="text-gray-500">Keywords</p>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-star text-orange-600 text-xl"></i>
                </div>
              </div>
              <h3 id="stat-seo-score" class="text-3xl font-bold text-gray-900">0</h3>
              <p class="text-gray-500">Avg SEO Score</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onclick="showSection('keywords'); openKeywordResearch()" class="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-search text-indigo-600"></i>
                </div>
                <div class="text-left">
                  <p class="font-medium text-gray-900">Keyword Research</p>
                  <p class="text-sm text-gray-500">Find new content opportunities</p>
                </div>
              </button>

              <button onclick="showSection('articles'); openArticleGenerator()" class="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-magic text-green-600"></i>
                </div>
                <div class="text-left">
                  <p class="font-medium text-gray-900">Generate Article</p>
                  <p class="text-sm text-gray-500">Create SEO-optimized content</p>
                </div>
              </button>

              <button onclick="showSection('linking'); analyzeLinks()" class="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-link text-purple-600"></i>
                </div>
                <div class="text-left">
                  <p class="font-medium text-gray-900">Analyze Links</p>
                  <p class="text-sm text-gray-500">Optimize internal linking</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Top Performers -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Performing Articles</h3>
            <div id="top-articles" class="space-y-3">
              <p class="text-gray-500 text-center py-8">No articles yet. Start by researching keywords!</p>
            </div>
          </div>
        </section>

        <!-- Keywords Section -->
        <section id="section-keywords" class="section hidden">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Keyword Research</h2>
              <p class="text-gray-500">Discover high-impact keywords for your SaaS</p>
            </div>
            <button onclick="openKeywordResearch()" class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              <i class="fas fa-plus mr-2"></i> New Research
            </button>
          </div>

          <!-- Keyword Research Modal -->
          <div id="keyword-research-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div class="p-6 border-b">
                <div class="flex justify-between items-center">
                  <h3 class="text-xl font-bold">SaaS Keyword Research</h3>
                  <button onclick="closeKeywordResearch()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Describe Your SaaS Product</label>
                  <textarea id="kr-description" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g., A project management tool that helps remote teams collaborate and track tasks efficiently"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Target ICP (Ideal Customer Profile)</label>
                  <input type="text" id="kr-icp" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Remote teams, startups, project managers">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Industry/Niche</label>
                  <input type="text" id="kr-industry" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Project management, productivity, SaaS">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Competitors (comma-separated)</label>
                  <input type="text" id="kr-competitors" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Asana, Monday.com, Trello">
                </div>
              </div>
              <div class="p-6 border-t bg-gray-50 rounded-b-2xl">
                <button onclick="runKeywordResearch()" id="kr-submit" class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                  <i class="fas fa-search mr-2"></i> Generate Keywords
                </button>
              </div>
            </div>
          </div>

          <!-- Keyword Clusters -->
          <div id="keyword-clusters" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Clusters will be loaded here -->
          </div>

          <!-- Keywords Table -->
          <div class="bg-white rounded-xl shadow-sm">
            <div class="p-6 border-b">
              <h3 class="text-lg font-semibold">All Keywords</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funnel</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody id="keywords-table" class="divide-y divide-gray-200">
                  <tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No keywords yet. Run keyword research to get started.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Articles Section -->
        <section id="section-articles" class="section hidden">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Content Library</h2>
              <p class="text-gray-500">Manage your SEO-optimized blog posts</p>
            </div>
            <div class="flex gap-3">
              <select id="article-filter" onchange="loadArticles()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">All Status</option>
                <option value="draft">Drafts</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <!-- Articles Grid -->
          <div id="articles-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="col-span-full text-center py-12 text-gray-500">
              No articles yet. Generate your first article from a keyword!
            </div>
          </div>
        </section>

        <!-- Internal Linking Section -->
        <section id="section-linking" class="section hidden">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Internal Linking</h2>
            <p class="text-gray-500">Optimize your site structure for SEO</p>
          </div>

          <!-- Link Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h4 class="text-sm text-gray-500 mb-2">Total Links</h4>
              <p id="link-total" class="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h4 class="text-sm text-gray-500 mb-2">Avg Links/Article</h4>
              <p id="link-avg" class="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h4 class="text-sm text-gray-500 mb-2">Orphan Articles</h4>
              <p id="link-orphans" class="text-3xl font-bold text-orange-600">0</p>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h4 class="text-sm text-gray-500 mb-2">Link Density</h4>
              <p id="link-density" class="text-3xl font-bold text-green-600">0%</p>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold">Link Suggestions</h3>
              <button onclick="analyzeLinks()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                <i class="fas fa-sync-alt mr-2"></i> Analyze
              </button>
            </div>
            <div id="link-suggestions" class="space-y-3">
              <p class="text-gray-500 text-center py-8">Click "Analyze" to get internal linking suggestions.</p>
            </div>
          </div>
        </section>

        <!-- Publishing Section -->
        <section id="section-publishing" class="section hidden">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Publishing</h2>
            <p class="text-gray-500">Connect your WordPress site and automate publishing</p>
          </div>

          <!-- Website Connection -->
          <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h3 class="text-lg font-semibold mb-4">Connected Websites</h3>
            <div id="websites-list" class="space-y-4">
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <i class="fas fa-plus-circle text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600 mb-4">Connect your first WordPress site</p>
                <button onclick="openWebsiteModal()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  Add Website
                </button>
              </div>
            </div>
          </div>

          <!-- Website Modal -->
          <div id="website-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl w-full max-w-lg">
              <div class="p-6 border-b">
                <div class="flex justify-between items-center">
                  <h3 class="text-xl font-bold">Add WordPress Site</h3>
                  <button onclick="closeWebsiteModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input type="text" id="ws-name" class="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="My Blog">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">WordPress URL</label>
                  <input type="url" id="ws-url" class="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="https://myblog.com">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Application Password</label>
                  <input type="password" id="ws-api-key" class="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Base64 encoded username:password">
                  <p class="text-xs text-gray-500 mt-1">Generate this in WordPress > Users > Application Passwords</p>
                </div>
                <label class="flex items-center gap-3">
                  <input type="checkbox" id="ws-auto-publish" class="w-4 h-4 text-indigo-600 rounded">
                  <span class="text-sm text-gray-700">Enable auto-publishing (no approval needed)</span>
                </label>
              </div>
              <div class="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3">
                <button onclick="testWebsiteConnection()" class="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Test Connection
                </button>
                <button onclick="saveWebsite()" class="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                  Save Website
                </button>
              </div>
            </div>
          </div>

          <!-- Scheduled Posts -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Publishing Queue</h3>
            <div id="publishing-queue" class="space-y-3">
              <p class="text-gray-500 text-center py-8">No articles scheduled for publishing.</p>
            </div>
          </div>
        </section>

        <!-- Analytics Section -->
        <section id="section-analytics" class="section hidden">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">SEO Analytics</h2>
            <p class="text-gray-500">Track your organic growth performance</p>
          </div>

          <!-- SEO Health Score -->
          <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">SEO Health Score</h3>
              <button onclick="loadSEOHealth()" class="text-indigo-600 hover:text-indigo-700">
                <i class="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
            <div class="flex items-center gap-8">
              <div class="relative w-32 h-32">
                <svg class="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#E5E7EB" stroke-width="12" fill="none"></circle>
                  <circle id="health-circle" cx="64" cy="64" r="56" stroke="#10B981" stroke-width="12" fill="none"
                    stroke-dasharray="352" stroke-dashoffset="352" stroke-linecap="round"></circle>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span id="health-score" class="text-3xl font-bold text-gray-900">0</span>
                </div>
              </div>
              <div class="flex-1">
                <div id="health-recommendations" class="space-y-2">
                  <p class="text-gray-500">Loading recommendations...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h3 class="text-lg font-semibold mb-4">Index Status</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Indexed Rate</span>
                  <span id="indexed-rate" class="font-semibold text-green-600">0%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div id="indexed-bar" class="bg-green-500 h-2 rounded-full" style="width: 0%"></div>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h3 class="text-lg font-semibold mb-4">Traffic Metrics</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Impressions</p>
                  <p id="total-impressions" class="text-2xl font-bold">0</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Clicks</p>
                  <p id="total-clicks" class="text-2xl font-bold">0</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Avg CTR</p>
                  <p id="avg-ctr" class="text-2xl font-bold">0%</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Avg Position</p>
                  <p id="avg-position" class="text-2xl font-bold">-</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Calendar Section -->
        <section id="section-calendar" class="section hidden">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Content Calendar</h2>
              <p class="text-gray-500">Plan and schedule your content pipeline</p>
            </div>
            <div class="flex gap-3">
              <button onclick="changeCalendarView('month')" id="view-month" class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
                Month
              </button>
              <button onclick="changeCalendarView('week')" id="view-week" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
                Week
              </button>
            </div>
          </div>

          <!-- Calendar Navigation -->
          <div class="bg-white rounded-xl shadow-sm mb-6">
            <div class="flex items-center justify-between p-4 border-b">
              <button onclick="navigateCalendar(-1)" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <i class="fas fa-chevron-left text-gray-600"></i>
              </button>
              <h3 id="calendar-title" class="text-lg font-semibold text-gray-900">December 2024</h3>
              <button onclick="navigateCalendar(1)" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <i class="fas fa-chevron-right text-gray-600"></i>
              </button>
            </div>

            <!-- Month View -->
            <div id="calendar-month-view" class="p-4">
              <!-- Days Header -->
              <div class="grid grid-cols-7 gap-1 mb-2">
                <div class="text-center text-sm font-medium text-gray-500 py-2">Sun</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">Mon</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">Tue</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">Wed</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">Thu</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">Fri</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">Sat</div>
              </div>
              <!-- Calendar Grid -->
              <div id="calendar-grid" class="grid grid-cols-7 gap-1">
                <!-- Days will be populated by JavaScript -->
              </div>
            </div>

            <!-- Week View -->
            <div id="calendar-week-view" class="p-4 hidden">
              <div id="week-grid" class="space-y-2">
                <!-- Week days will be populated by JavaScript -->
              </div>
            </div>
          </div>

          <!-- Upcoming Content -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Scheduled Articles -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900">
                  <i class="fas fa-clock text-yellow-500 mr-2"></i>Scheduled
                </h3>
                <span id="scheduled-count" class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">0</span>
              </div>
              <div id="scheduled-articles" class="space-y-3 max-h-80 overflow-y-auto">
                <p class="text-gray-500 text-sm text-center py-4">No scheduled articles</p>
              </div>
            </div>

            <!-- Draft Articles -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900">
                  <i class="fas fa-edit text-gray-500 mr-2"></i>Drafts
                </h3>
                <span id="draft-count" class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">0</span>
              </div>
              <div id="draft-articles" class="space-y-3 max-h-80 overflow-y-auto">
                <p class="text-gray-500 text-sm text-center py-4">No draft articles</p>
              </div>
            </div>

            <!-- Recently Published -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900">
                  <i class="fas fa-check-circle text-green-500 mr-2"></i>Published
                </h3>
                <span id="published-count" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">0</span>
              </div>
              <div id="published-articles" class="space-y-3 max-h-80 overflow-y-auto">
                <p class="text-gray-500 text-sm text-center py-4">No published articles</p>
              </div>
            </div>
          </div>

          <!-- Schedule Modal -->
          <div id="schedule-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl w-full max-w-md">
              <div class="p-6 border-b">
                <div class="flex justify-between items-center">
                  <h3 class="text-xl font-bold">Schedule Article</h3>
                  <button onclick="closeScheduleModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Article</label>
                  <select id="schedule-article" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select an article...</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
                  <input type="date" id="schedule-date" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Publish Time</label>
                  <input type="time" id="schedule-time" value="09:00" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>
              <div class="p-6 border-t bg-gray-50 rounded-b-2xl">
                <button onclick="confirmSchedule()" class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                  <i class="fas fa-calendar-check mr-2"></i>Schedule Article
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>

  <script src="/static/app.js"></script>
</body>
</html>`);
});

export default app;

// SaaSBlogPilot - Main Application Entry

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

// Landing page (public)
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaSBlogPilot - Autopilot Your SaaS Blog Marketing</title>
  <meta name="description" content="Put your SaaS blog marketing on autopilot. AI generates SEO content, schedules posts, and publishes automatically—so you can focus on building your product.">
  <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); }
    .feature-icon { background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    .float-animation { animation: float 3s ease-in-out infinite; }
    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); } 50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.6); } }
    .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
  </style>
</head>
<body class="bg-gray-50">
  <!-- Navigation -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-plane text-white"></i>
          </div>
          <span class="font-bold text-xl text-gray-900">SaaSBlog<span class="text-indigo-600">Pilot</span></span>
        </div>
        <div class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-gray-600 hover:text-gray-900 transition">Features</a>
          <a href="#how-it-works" class="text-gray-600 hover:text-gray-900 transition">How it Works</a>
          <a href="#pricing" class="text-gray-600 hover:text-gray-900 transition">Pricing</a>
          <a href="/demo" class="text-gray-600 hover:text-gray-900 transition">Demo</a>
        </div>
        <div class="flex items-center gap-3">
          <a href="/app" class="text-gray-600 hover:text-gray-900 font-medium">Sign In</a>
          <a href="/app?register=true" class="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
            Start Free
          </a>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="pt-32 pb-20 px-4 gradient-bg relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
    </div>
    <div class="max-w-7xl mx-auto text-center relative z-10">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
        <i class="fas fa-plane"></i>
        <span>Blog Marketing on Autopilot for SaaS Founders</span>
      </div>
      <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
        Stop Writing Blogs.<br/>
        <span class="text-yellow-300">Start Growing Your SaaS.</span>
      </h1>
      <p class="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
        You're a SaaS founder, not a content marketer. <strong>SaaSBlogPilot</strong> handles your entire blog—from keyword research to publishing—<br class="hidden md:block"/>
        so you can focus on what matters: building your product.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <a href="/app?register=true" class="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl pulse-glow">
          <i class="fas fa-plane mr-2"></i>Start Free Trial
        </a>
        <a href="/demo" class="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/30 transition border border-white/30">
          <i class="fas fa-play-circle mr-2"></i>Try Live Demo
        </a>
      </div>
      <p class="text-white/70 text-sm">
        <i class="fas fa-check-circle mr-1"></i>No credit card required
        <span class="mx-3">•</span>
        <i class="fas fa-check-circle mr-1"></i>14-day free trial
        <span class="mx-3">•</span>
        <i class="fas fa-check-circle mr-1"></i>Cancel anytime
      </p>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-12 bg-white border-b">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <p class="text-4xl font-bold gradient-text">40+</p>
          <p class="text-gray-500">Hours Saved / Month</p>
        </div>
        <div>
          <p class="text-4xl font-bold gradient-text">100%</p>
          <p class="text-gray-500">Hands-Free Publishing</p>
        </div>
        <div>
          <p class="text-4xl font-bold gradient-text">3x</p>
          <p class="text-gray-500">More Content Output</p>
        </div>
        <div>
          <p class="text-4xl font-bold gradient-text">8</p>
          <p class="text-gray-500">Languages for Global Reach</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-20 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Your <span class="gradient-text">Full-Stack Content Team</span>,<br class="hidden md:block"/> Powered by AI
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          No more hiring writers, SEO experts, or content managers.
          SaaSBlogPilot does it all—automatically.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="bg-white rounded-2xl p-8 shadow-sm card-hover border border-gray-100">
          <div class="w-14 h-14 feature-icon rounded-xl flex items-center justify-center mb-6">
            <i class="fas fa-key text-2xl text-indigo-600"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">AI Keyword Research</h3>
          <p class="text-gray-600 mb-4">
            Discover high-intent keywords tailored to your SaaS niche. Analyze competition, search volume, and buyer intent automatically.
          </p>
          <ul class="space-y-2 text-sm text-gray-500">
            <li><i class="fas fa-check text-green-500 mr-2"></i>TOFU/MOFU/BOFU mapping</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Competitor analysis</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Long-tail opportunities</li>
          </ul>
        </div>

        <!-- Feature 2 -->
        <div class="bg-white rounded-2xl p-8 shadow-sm card-hover border border-gray-100">
          <div class="w-14 h-14 feature-icon rounded-xl flex items-center justify-center mb-6">
            <i class="fas fa-magic text-2xl text-purple-600"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">AI Article Generation</h3>
          <p class="text-gray-600 mb-4">
            Generate 2,000+ word SEO-optimized articles with proper structure, FAQs, and featured snippet targeting.
          </p>
          <ul class="space-y-2 text-sm text-gray-500">
            <li><i class="fas fa-check text-green-500 mr-2"></i>Claude Sonnet 4 powered</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>SEO best practices</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>8 languages supported</li>
          </ul>
        </div>

        <!-- Feature 3 -->
        <div class="bg-white rounded-2xl p-8 shadow-sm card-hover border border-gray-100">
          <div class="w-14 h-14 feature-icon rounded-xl flex items-center justify-center mb-6">
            <i class="fas fa-link text-2xl text-blue-600"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Internal Linking</h3>
          <p class="text-gray-600 mb-4">
            Automatically analyze and suggest internal links to improve site structure and SEO performance.
          </p>
          <ul class="space-y-2 text-sm text-gray-500">
            <li><i class="fas fa-check text-green-500 mr-2"></i>Orphan page detection</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Smart anchor text</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Pillar/cluster model</li>
          </ul>
        </div>

        <!-- Feature 4 -->
        <div class="bg-white rounded-2xl p-8 shadow-sm card-hover border border-gray-100">
          <div class="w-14 h-14 feature-icon rounded-xl flex items-center justify-center mb-6">
            <i class="fas fa-calendar-alt text-2xl text-green-600"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Content Calendar</h3>
          <p class="text-gray-600 mb-4">
            Plan and schedule your content pipeline with drag-and-drop calendar. Never miss a publishing date.
          </p>
          <ul class="space-y-2 text-sm text-gray-500">
            <li><i class="fas fa-check text-green-500 mr-2"></i>Drag & drop scheduling</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Month/week views</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Auto-reminders</li>
          </ul>
        </div>

        <!-- Feature 5 -->
        <div class="bg-white rounded-2xl p-8 shadow-sm card-hover border border-gray-100">
          <div class="w-14 h-14 feature-icon rounded-xl flex items-center justify-center mb-6">
            <i class="fab fa-wordpress text-2xl text-blue-800"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Auto-Publishing</h3>
          <p class="text-gray-600 mb-4">
            Connect your WordPress site and automatically publish scheduled content with proper formatting.
          </p>
          <ul class="space-y-2 text-sm text-gray-500">
            <li><i class="fas fa-check text-green-500 mr-2"></i>WordPress integration</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Auto meta tags</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Category mapping</li>
          </ul>
        </div>

        <!-- Feature 6 -->
        <div class="bg-white rounded-2xl p-8 shadow-sm card-hover border border-gray-100">
          <div class="w-14 h-14 feature-icon rounded-xl flex items-center justify-center mb-6">
            <i class="fas fa-chart-line text-2xl text-red-600"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">SEO Analytics</h3>
          <p class="text-gray-600 mb-4">
            Track rankings, impressions, and clicks with Google Search Console integration. Real-time insights.
          </p>
          <ul class="space-y-2 text-sm text-gray-500">
            <li><i class="fas fa-check text-green-500 mr-2"></i>GSC integration</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Ranking tracking</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>SEO health score</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- How it Works Section -->
  <section id="how-it-works" class="py-20 px-4 bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Set It Once. <span class="text-yellow-400">Let It Run Forever.</span>
        </h2>
        <p class="text-xl text-gray-400">Your blog marketing on true autopilot—no daily work required</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="text-center relative">
          <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
          <h3 class="text-xl font-bold mb-3">Connect Your Blog</h3>
          <p class="text-gray-400">Link your WordPress—takes 2 minutes. We handle the rest.</p>
          <div class="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-indigo-600 to-transparent -z-10"></div>
        </div>
        <div class="text-center relative">
          <div class="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
          <h3 class="text-xl font-bold mb-3">AI Finds Keywords</h3>
          <p class="text-gray-400">Automatic keyword research based on your SaaS niche and competitors</p>
          <div class="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-600 to-transparent -z-10"></div>
        </div>
        <div class="text-center relative">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
          <h3 class="text-xl font-bold mb-3">AI Writes Content</h3>
          <p class="text-gray-400">SEO-optimized articles created automatically on your schedule</p>
          <div class="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-transparent -z-10"></div>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">4</div>
          <h3 class="text-xl font-bold mb-3">Auto-Published</h3>
          <p class="text-gray-400">Posts go live on schedule. You don't lift a finger.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Demo Preview Section -->
  <section id="demo" class="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          See It In Action
        </h2>
        <p class="text-xl text-gray-600 mb-8">
          Try the live demo—no signup required
        </p>
        <a href="/demo" class="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg">
          <i class="fas fa-play-circle"></i>
          Launch Interactive Demo
        </a>
      </div>

      <!-- Dashboard Preview Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-file-alt text-blue-600"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">24</p>
              <p class="text-sm text-gray-500">Articles Generated</p>
            </div>
          </div>
          <div class="flex items-center text-green-600 text-sm">
            <i class="fas fa-arrow-up mr-1"></i>
            <span>+8 this month</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-key text-purple-600"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">156</p>
              <p class="text-sm text-gray-500">Keywords Tracked</p>
            </div>
          </div>
          <div class="flex items-center text-green-600 text-sm">
            <i class="fas fa-arrow-up mr-1"></i>
            <span>32 ranking top 10</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-chart-line text-green-600"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">45.2K</p>
              <p class="text-sm text-gray-500">Monthly Visitors</p>
            </div>
          </div>
          <div class="flex items-center text-green-600 text-sm">
            <i class="fas fa-arrow-up mr-1"></i>
            <span>+127% vs last month</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pain Point Section -->
  <section class="py-20 px-4 bg-gray-900 text-white">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Sound Familiar?
        </h2>
        <p class="text-xl text-gray-400">The content marketing struggle every SaaS founder knows</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div class="bg-red-900/30 border border-red-500/30 rounded-xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1">
              <i class="fas fa-times text-red-400"></i>
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">"I know we need content, but who has time?"</h3>
              <p class="text-gray-400 text-sm">You're busy shipping features, fixing bugs, and talking to customers. Blog posts keep getting pushed to "next week."</p>
            </div>
          </div>
        </div>
        
        <div class="bg-red-900/30 border border-red-500/30 rounded-xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1">
              <i class="fas fa-times text-red-400"></i>
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">"Freelance writers don't get our product"</h3>
              <p class="text-gray-400 text-sm">You've tried hiring writers, but explaining B2B SaaS to them takes longer than writing it yourself.</p>
            </div>
          </div>
        </div>
        
        <div class="bg-red-900/30 border border-red-500/30 rounded-xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1">
              <i class="fas fa-times text-red-400"></i>
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">"Our competitors are outranking us"</h3>
              <p class="text-gray-400 text-sm">They publish 3x more content than you. Their blog brings in leads while yours collects dust.</p>
            </div>
          </div>
        </div>
        
        <div class="bg-red-900/30 border border-red-500/30 rounded-xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1">
              <i class="fas fa-times text-red-400"></i>
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">"SEO feels like a black box"</h3>
              <p class="text-gray-400 text-sm">Keyword research, internal linking, meta tags... You know it matters, but it's overwhelming.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-8 text-center">
        <h3 class="text-2xl font-bold mb-4">
          <i class="fas fa-check-circle mr-2"></i>
          SaaSBlogPilot Fixes All of This
        </h3>
        <p class="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
          One tool that handles keyword research, content creation, SEO optimization, and publishing—automatically. 
          Finally, a blog that grows your SaaS without stealing your time.
        </p>
        <a href="/demo" class="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition">
          <i class="fas fa-play-circle"></i>
          See How It Works
        </a>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="pricing" class="py-20 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Invest in Growth, Not <span class="gradient-text">Content Production</span>
        </h2>
        <p class="text-xl text-gray-600">Less than the cost of one freelance article per month</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <!-- Starter -->
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 card-hover">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Starter</h3>
          <p class="text-gray-500 mb-6">For small blogs getting started</p>
          <div class="mb-6">
            <span class="text-4xl font-bold text-gray-900">$49</span>
            <span class="text-gray-500">/month</span>
          </div>
          <ul class="space-y-3 mb-8">
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>10 posts/month
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>Basic keyword research
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>Single website
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>Email support
            </li>
          </ul>
          <a href="/app?register=true&plan=starter" class="block w-full py-3 text-center border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition">
            Get Started
          </a>
        </div>

        <!-- Growth -->
        <div class="bg-white rounded-2xl p-8 shadow-lg border-2 border-indigo-500 card-hover relative">
          <div class="absolute -top-4 left-1/2 -translate-x-1/2">
            <span class="px-4 py-1 bg-indigo-500 text-white text-sm font-bold rounded-full">MOST POPULAR</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Growth</h3>
          <p class="text-gray-500 mb-6">For growing SaaS companies</p>
          <div class="mb-6">
            <span class="text-4xl font-bold text-gray-900">$149</span>
            <span class="text-gray-500">/month</span>
          </div>
          <ul class="space-y-3 mb-8">
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>30 posts/month
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>Full keyword research
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>Internal linking AI
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>GSC integration
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>API access
            </li>
            <li class="flex items-center gap-2 text-indigo-600 font-medium">
              <i class="fas fa-gift text-indigo-500"></i>14-day free trial
            </li>
          </ul>
          <a href="/app?register=true&plan=growth" class="block w-full py-3 text-center bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
            Start Free Trial
          </a>
        </div>

        <!-- Scale -->
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 card-hover">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Scale</h3>
          <p class="text-gray-500 mb-6">For content-heavy operations</p>
          <div class="mb-6">
            <span class="text-4xl font-bold text-gray-900">$349</span>
            <span class="text-gray-500">/month</span>
          </div>
          <ul class="space-y-3 mb-8">
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>60+ posts/month
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>Multiple domains
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>Priority support
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>White-label
            </li>
            <li class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-check text-green-500"></i>Custom integrations
            </li>
            <li class="flex items-center gap-2 text-indigo-600 font-medium">
              <i class="fas fa-gift text-indigo-500"></i>14-day free trial
            </li>
          </ul>
          <a href="/app?register=true&plan=scale" class="block w-full py-3 text-center border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition">
            Start Free Trial
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-20 px-4 gradient-bg">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
        Ready to 10x Your Organic Traffic?
      </h2>
      <p class="text-xl text-white/90 mb-8">
        Join 500+ SaaS companies using SaaSBlogPilot to automate their content marketing.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/app?register=true" class="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl">
          Start Your Free Trial
        </a>
        <a href="/demo" class="px-8 py-4 bg-transparent text-white rounded-xl font-bold text-lg hover:bg-white/10 transition border-2 border-white">
          Try Demo First
        </a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-400 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-plane text-white text-sm"></i>
            </div>
            <span class="font-bold text-white">SaaSBlog<span class="text-indigo-400">Pilot</span></span>
          </div>
          <p class="text-sm">AI-powered content marketing for SaaS growth.</p>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Product</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#features" class="hover:text-white transition">Features</a></li>
            <li><a href="#pricing" class="hover:text-white transition">Pricing</a></li>
            <li><a href="/demo" class="hover:text-white transition">Demo</a></li>
            <li><a href="/app" class="hover:text-white transition">Login</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Languages</h4>
          <ul class="space-y-2 text-sm">
            <li>🇺🇸 English</li>
            <li>🇰🇷 한국어</li>
            <li>🇯🇵 日本語</li>
            <li>🇨🇳 简体中文</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Support</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white transition">Documentation</a></li>
            <li><a href="#" class="hover:text-white transition">API Reference</a></li>
            <li><a href="#" class="hover:text-white transition">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-800 pt-8 text-center text-sm">
        <p>&copy; 2024 SaaSBlogPilot. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`);
});

// Demo page (with sample data, no auth required)
app.get('/demo', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaSBlogPilot - Automated SEO Blog Marketing for SaaS</title>
  <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
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
    
    /* Drag and Drop Styles */
    .draggable-article { touch-action: none; user-select: none; }
    .draggable-article:active { cursor: grabbing; }
    .calendar-drop-zone { transition: all 0.2s ease; }
    .calendar-drop-zone.drag-over { background-color: #EEF2FF !important; transform: scale(1.02); }
    .drop-hint { animation: hint-pulse 2s infinite; }
    @keyframes hint-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
    .sidebar { padding-top: 60px !important; }
    .main-content { padding-top: 60px !important; }
  </style>
</head>
<body class="bg-gray-50">
  <!-- Demo Banner -->
  <div class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 px-4">
    <div class="flex items-center justify-center gap-4 flex-wrap">
      <span class="flex items-center gap-2">
        <i class="fas fa-play-circle"></i>
        <strong>Demo Mode</strong> - Exploring with sample data
      </span>
      <a href="/app?register=true" class="px-4 py-1.5 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition text-sm">
        Start Free Trial
      </a>
      <a href="/" class="text-white/80 hover:text-white text-sm underline">
        ← Back to Home
      </a>
    </div>
  </div>

  <div id="app">
    <!-- Hidden elements for JS compatibility -->
    <div id="loading" class="hidden"></div>
    <div id="auth-screen" class="hidden"></div>

    <!-- Main Dashboard - Visible by default for demo -->
    <div id="dashboard" class="pt-12">
      <!-- Sidebar -->
      <aside class="sidebar fixed left-0 top-0 bg-gray-900 text-white p-6">
        <a href="/" class="flex items-center gap-3 mb-8 hover:opacity-80 transition">
          <div class="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <i class="fas fa-plane"></i>
          </div>
          <div>
            <h1 class="font-bold text-lg">SaaSBlog<span class="text-indigo-400">Pilot</span></h1>
            <p class="text-xs text-gray-400">Blog on Autopilot</p>
          </div>
        </a>

        <nav class="space-y-2">
          <a href="/" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-home w-5"></i> Home
          </a>
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
          <a href="#" onclick="showSection('billing')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-credit-card w-5"></i> Billing
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-globe mr-1"></i> Content Language
                  </label>
                  <select id="kr-language" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="en">🇺🇸 English</option>
                    <option value="ko">🇰🇷 한국어 (Korean)</option>
                    <option value="ja">🇯🇵 日本語 (Japanese)</option>
                    <option value="zh">🇨🇳 简体中文 (Chinese)</option>
                    <option value="es">🇪🇸 Español (Spanish)</option>
                    <option value="de">🇩🇪 Deutsch (German)</option>
                    <option value="fr">🇫🇷 Français (French)</option>
                    <option value="pt">🇧🇷 Português (Portuguese)</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">Keywords will be generated in the selected language</p>
                </div>
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

          <!-- Language Picker Modal for Article Generation -->
          <div id="language-picker-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl w-full max-w-md">
              <div class="p-6 border-b">
                <div class="flex justify-between items-center">
                  <h3 class="text-xl font-bold"><i class="fas fa-globe mr-2"></i>Choose Language</h3>
                  <button onclick="closeLanguagePicker()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div class="p-6">
                <p class="text-sm text-gray-600 mb-4">Select the language for your article. This uses 1 post from your monthly limit.</p>
                <div class="grid grid-cols-2 gap-3">
                  <button onclick="generateWithLanguage('en')" class="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
                    <span class="text-2xl mb-1 block">🇺🇸</span>
                    <span class="font-medium text-gray-900">English</span>
                  </button>
                  <button onclick="generateWithLanguage('ko')" class="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
                    <span class="text-2xl mb-1 block">🇰🇷</span>
                    <span class="font-medium text-gray-900">한국어</span>
                  </button>
                  <button onclick="generateWithLanguage('ja')" class="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
                    <span class="text-2xl mb-1 block">🇯🇵</span>
                    <span class="font-medium text-gray-900">日本語</span>
                  </button>
                  <button onclick="generateWithLanguage('zh')" class="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
                    <span class="text-2xl mb-1 block">🇨🇳</span>
                    <span class="font-medium text-gray-900">简体中文</span>
                  </button>
                  <button onclick="generateWithLanguage('es')" class="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
                    <span class="text-2xl mb-1 block">🇪🇸</span>
                    <span class="font-medium text-gray-900">Español</span>
                  </button>
                  <button onclick="generateWithLanguage('de')" class="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
                    <span class="text-2xl mb-1 block">🇩🇪</span>
                    <span class="font-medium text-gray-900">Deutsch</span>
                  </button>
                  <button onclick="generateWithLanguage('fr')" class="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
                    <span class="text-2xl mb-1 block">🇫🇷</span>
                    <span class="font-medium text-gray-900">Français</span>
                  </button>
                  <button onclick="generateWithLanguage('pt')" class="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
                    <span class="text-2xl mb-1 block">🇧🇷</span>
                    <span class="font-medium text-gray-900">Português</span>
                  </button>
                </div>
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

          <!-- Google Search Console Connection -->
          <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fab fa-google text-blue-600"></i>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Google Search Console</h3>
                  <p class="text-sm text-gray-500">Connect for real search performance data</p>
                </div>
              </div>
              <span id="gsc-status" class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                Checking...
              </span>
            </div>

            <div id="gsc-not-connected" class="hidden">
              <div class="bg-blue-50 rounded-lg p-4 mb-4">
                <p class="text-sm text-blue-800">
                  <i class="fas fa-info-circle mr-2"></i>
                  Connect your Google Search Console to see real clicks, impressions, and keyword rankings.
                </p>
              </div>
              <button onclick="connectGSC()" id="gsc-connect-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                <i class="fab fa-google mr-2"></i>Connect Google Search Console
              </button>
            </div>

            <div id="gsc-connected" class="hidden">
              <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg mb-4">
                <div class="flex items-center gap-3">
                  <i class="fas fa-check-circle text-green-600 text-xl"></i>
                  <div>
                    <p class="font-medium text-gray-900" id="gsc-site-url">Connected</p>
                    <p class="text-sm text-gray-500">Last sync: <span id="gsc-last-sync">Never</span></p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button onclick="syncGSC()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    <i class="fas fa-sync-alt mr-2"></i>Sync Now
                  </button>
                  <button onclick="disconnectGSC()" class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition">
                    Disconnect
                  </button>
                </div>
              </div>

              <!-- GSC Real-time Stats -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                  <p class="text-2xl font-bold text-indigo-600" id="gsc-clicks">0</p>
                  <p class="text-sm text-gray-500">Clicks (30d)</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                  <p class="text-2xl font-bold text-blue-600" id="gsc-impressions">0</p>
                  <p class="text-sm text-gray-500">Impressions</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                  <p class="text-2xl font-bold text-green-600" id="gsc-ctr">0%</p>
                  <p class="text-sm text-gray-500">Avg CTR</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                  <p class="text-2xl font-bold text-orange-600" id="gsc-position">-</p>
                  <p class="text-sm text-gray-500">Avg Position</p>
                </div>
              </div>
            </div>

            <div id="gsc-not-configured" class="hidden">
              <div class="bg-yellow-50 rounded-lg p-4">
                <p class="text-sm text-yellow-800">
                  <i class="fas fa-exclamation-triangle mr-2"></i>
                  GSC integration requires configuration. Set <code class="bg-yellow-100 px-1 rounded">GSC_CLIENT_ID</code> and <code class="bg-yellow-100 px-1 rounded">GSC_CLIENT_SECRET</code> environment variables.
                </p>
              </div>
            </div>
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

          <!-- Email Notifications Section -->
          <div class="bg-white rounded-xl p-6 shadow-sm mt-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-semibold">Email Notifications</h3>
                <p class="text-sm text-gray-500">Get notified when important events happen</p>
              </div>
              <span id="email-status" class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                Checking...
              </span>
            </div>

            <div id="notification-types" class="space-y-4">
              <!-- Will be populated by JavaScript -->
            </div>

            <div class="mt-6 pt-6 border-t">
              <button onclick="sendTestEmail()" id="test-email-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-paper-plane mr-2"></i>Send Test Email
              </button>
              <p class="text-xs text-gray-500 mt-2">
                <i class="fas fa-info-circle mr-1"></i>
                Email notifications powered by Resend. Configure RESEND_API_KEY in environment variables.
              </p>
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

          <!-- Drag & Drop Instructions -->
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-hand-pointer text-indigo-600"></i>
              </div>
              <div>
                <p class="font-medium text-gray-900">Drag & Drop Scheduling</p>
                <p class="text-sm text-gray-600">Drag articles from the panels below and drop them onto calendar dates to schedule instantly.</p>
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
              <p class="text-xs text-gray-500 mb-3"><i class="fas fa-arrows-alt mr-1"></i>Drag to reschedule</p>
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
              <p class="text-xs text-indigo-600 mb-3"><i class="fas fa-arrows-alt mr-1"></i>Drag to calendar to schedule</p>
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

        <!-- Billing Section -->
        <section id="section-billing" class="section hidden">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
            <p class="text-gray-500">Manage your subscription and payment methods</p>
          </div>

          <!-- Current Subscription -->
          <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">Current Plan</h3>
              <span id="billing-status" class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                Loading...
              </span>
            </div>

            <div id="subscription-details">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <i id="plan-icon" class="fas fa-plane text-2xl text-indigo-600"></i>
                </div>
                <div>
                  <h4 id="current-plan-name" class="text-2xl font-bold text-gray-900">Starter</h4>
                  <p id="current-plan-price" class="text-gray-500">$49/month</p>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-indigo-600" id="billing-posts-used">0</p>
                  <p class="text-sm text-gray-500">Posts Used</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-gray-900" id="billing-posts-limit">10</p>
                  <p class="text-sm text-gray-500">Posts Limit</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-green-600" id="billing-period-end">-</p>
                  <p class="text-sm text-gray-500">Renews On</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-gray-900" id="billing-cycle">Monthly</p>
                  <p class="text-sm text-gray-500">Billing Cycle</p>
                </div>
              </div>

              <div id="subscription-actions" class="flex gap-3">
                <button onclick="openBillingPortal()" id="manage-billing-btn" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
                  <i class="fas fa-cog mr-2"></i>Manage Billing
                </button>
                <button onclick="showCancelModal()" id="cancel-sub-btn" class="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition hidden">
                  Cancel Subscription
                </button>
              </div>
            </div>

            <div id="no-subscription" class="hidden text-center py-8">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-credit-card text-3xl text-gray-400"></i>
              </div>
              <h4 class="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h4>
              <p class="text-gray-500 mb-6">You're on the free tier. Upgrade to unlock more posts and features.</p>
            </div>
          </div>

          <!-- Pricing Plans -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">Available Plans</h3>
              <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button onclick="setBillingCycle('monthly')" id="cycle-monthly" class="px-4 py-2 rounded-md text-sm font-medium bg-white shadow text-gray-900">
                  Monthly
                </button>
                <button onclick="setBillingCycle('yearly')" id="cycle-yearly" class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
                  Yearly <span class="text-green-600">-20%</span>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="pricing-plans">
              <!-- Starter Plan -->
              <div class="bg-white rounded-xl p-6 shadow-sm border-2 border-transparent hover:border-indigo-200 transition">
                <div class="text-center mb-6">
                  <h4 class="text-xl font-bold text-gray-900">Starter</h4>
                  <div class="mt-4">
                    <span class="text-4xl font-bold text-gray-900">$49</span>
                    <span class="text-gray-500">/month</span>
                  </div>
                </div>
                <ul class="space-y-3 mb-6">
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>10 posts/month
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>Basic keyword research
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>Single website
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>Email support
                  </li>
                </ul>
                <button onclick="selectPlan('starter')" class="w-full py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition plan-btn" data-tier="starter">
                  Select Plan
                </button>
              </div>

              <!-- Growth Plan -->
              <div class="bg-white rounded-xl p-6 shadow-sm border-2 border-indigo-500 relative">
                <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span class="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">MOST POPULAR</span>
                </div>
                <div class="text-center mb-6">
                  <h4 class="text-xl font-bold text-gray-900">Growth</h4>
                  <div class="mt-4">
                    <span class="text-4xl font-bold text-gray-900">$149</span>
                    <span class="text-gray-500">/month</span>
                  </div>
                </div>
                <ul class="space-y-3 mb-6">
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>30 posts/month
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>Full keyword research
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>Internal linking
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>API access
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>GSC integration
                  </li>
                  <li class="flex items-center gap-2 text-indigo-600 font-medium">
                    <i class="fas fa-gift text-indigo-500"></i>14-day free trial
                  </li>
                </ul>
                <button onclick="selectPlan('growth')" class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition plan-btn" data-tier="growth">
                  Start Free Trial
                </button>
              </div>

              <!-- Scale Plan -->
              <div class="bg-white rounded-xl p-6 shadow-sm border-2 border-transparent hover:border-indigo-200 transition">
                <div class="text-center mb-6">
                  <h4 class="text-xl font-bold text-gray-900">Scale</h4>
                  <div class="mt-4">
                    <span class="text-4xl font-bold text-gray-900">$349</span>
                    <span class="text-gray-500">/month</span>
                  </div>
                </div>
                <ul class="space-y-3 mb-6">
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>60+ posts/month
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>Multiple domains
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>Priority support
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>Custom integrations
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-check text-green-500"></i>White-label
                  </li>
                  <li class="flex items-center gap-2 text-indigo-600 font-medium">
                    <i class="fas fa-gift text-indigo-500"></i>14-day free trial
                  </li>
                </ul>
                <button onclick="selectPlan('scale')" class="w-full py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition plan-btn" data-tier="scale">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>

          <!-- Payment History -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Payment History</h3>
            <div id="payment-history" class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  </tr>
                </thead>
                <tbody id="invoices-table" class="divide-y divide-gray-200">
                  <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">No payment history yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Cancel Subscription Modal -->
          <div id="cancel-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl w-full max-w-md">
              <div class="p-6 border-b">
                <div class="flex justify-between items-center">
                  <h3 class="text-xl font-bold text-red-600">Cancel Subscription</h3>
                  <button onclick="closeCancelModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                  </div>
                  <p class="text-gray-600">Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.</p>
                </div>
                <div class="space-y-3">
                  <button onclick="cancelSubscription(false)" class="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                    Cancel at Period End
                  </button>
                  <button onclick="cancelSubscription(true)" class="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                    Cancel Immediately
                  </button>
                  <button onclick="closeCancelModal()" class="w-full py-3 text-gray-500 hover:text-gray-700 transition">
                    Keep My Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Stripe Not Configured Notice -->
          <div id="stripe-not-configured" class="hidden bg-yellow-50 rounded-xl p-6 border border-yellow-200 mt-6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-yellow-600"></i>
              </div>
              <div>
                <h4 class="font-semibold text-yellow-800 mb-2">Stripe Not Configured</h4>
                <p class="text-sm text-yellow-700 mb-3">
                  Payment processing requires Stripe configuration. Set the following environment variables:
                </p>
                <ul class="text-sm text-yellow-700 space-y-1">
                  <li><code class="bg-yellow-100 px-1 rounded">STRIPE_SECRET_KEY</code> - Your Stripe secret key</li>
                  <li><code class="bg-yellow-100 px-1 rounded">STRIPE_PUBLISHABLE_KEY</code> - Your Stripe publishable key</li>
                  <li><code class="bg-yellow-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> - For webhook signature verification</li>
                </ul>
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" class="inline-flex items-center gap-2 mt-3 text-yellow-800 hover:text-yellow-900 font-medium">
                  <i class="fab fa-stripe-s"></i>Get Stripe API Keys
                  <i class="fas fa-external-link-alt text-xs"></i>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>

  <script src="/static/demo.js?v=${Date.now()}"></script>
</body>
</html>`);
});

// Main App (requires auth)
app.get('/app', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaSBlogPilot - Dashboard</title>
  <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
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
    .draggable-article { touch-action: none; user-select: none; }
    .draggable-article:active { cursor: grabbing; }
    .calendar-drop-zone { transition: all 0.2s ease; }
    .calendar-drop-zone.drag-over { background-color: #EEF2FF !important; transform: scale(1.02); }
  </style>
</head>
<body class="bg-gray-50">
  <div id="app">
    <!-- Loading State -->
    <div id="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
        <p class="text-gray-600">Loading SaaSBlogPilot...</p>
      </div>
    </div>

    <!-- Auth Screen -->
    <div id="auth-screen" class="hidden min-h-screen gradient-bg flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <a href="/" class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4 hover:bg-indigo-200 transition">
            <i class="fas fa-plane text-2xl text-indigo-600"></i>
          </a>
          <h1 class="text-2xl font-bold text-gray-900">SaaSBlogPilot</h1>
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
          <div class="text-center mt-4">
            <a href="/demo" class="text-sm text-indigo-600 hover:underline">
              <i class="fas fa-play-circle mr-1"></i>Try Demo First
            </a>
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

    <!-- Dashboard placeholder - will use same structure as demo -->
    <div id="dashboard" class="hidden">
      <aside class="sidebar fixed left-0 top-0 bg-gray-900 text-white p-6">
        <a href="/" class="flex items-center gap-3 mb-8 hover:opacity-80 transition">
          <div class="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <i class="fas fa-plane"></i>
          </div>
          <div>
            <h1 class="font-bold text-lg">SaaSBlog<span class="text-indigo-400">Pilot</span></h1>
            <p class="text-xs text-gray-400">Blog on Autopilot</p>
          </div>
        </a>

        <nav class="space-y-2">
          <a href="/" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-home w-5"></i> Home
          </a>
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
          <a href="#" onclick="showSection('analytics')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-chart-bar w-5"></i> Analytics
          </a>
          <a href="#" onclick="showSection('billing')" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <i class="fas fa-credit-card w-5"></i> Billing
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

      <main class="main-content min-h-screen p-8">
        <section id="section-overview" class="section">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p class="text-gray-500">Your content growth at a glance</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-file-alt text-blue-600 text-xl"></i>
                </div>
              </div>
              <h3 id="stat-total-articles" class="text-3xl font-bold text-gray-900">0</h3>
              <p class="text-gray-500">Total Articles</p>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
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

          <!-- Quick Start Guide -->
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white mb-8">
            <h3 class="text-xl font-bold mb-4">🚀 Get Started in 3 Steps</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 class="font-semibold">Keyword Research</h4>
                  <p class="text-white/80 text-sm">Describe your SaaS and get AI-generated keyword clusters</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 class="font-semibold">Generate Articles</h4>
                  <p class="text-white/80 text-sm">One-click to create SEO-optimized blog posts</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 class="font-semibold">Publish & Track</h4>
                  <p class="text-white/80 text-sm">Auto-publish to WordPress and monitor rankings</p>
                </div>
              </div>
            </div>
            <div class="mt-6">
              <button onclick="showSection('keywords'); openKeywordResearch()" class="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                <i class="fas fa-search mr-2"></i>Start Keyword Research
              </button>
            </div>
          </div>

          <div id="top-articles" class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Performing Articles</h3>
            <p class="text-gray-500 text-center py-8">No articles yet. Start by researching keywords!</p>
          </div>
        </section>

        <section id="section-keywords" class="section hidden">
          <p class="text-gray-500 text-center py-12">Keywords section loading...</p>
        </section>

        <section id="section-articles" class="section hidden">
          <p class="text-gray-500 text-center py-12">Articles section loading...</p>
        </section>

        <section id="section-calendar" class="section hidden">
          <p class="text-gray-500 text-center py-12">Calendar section loading...</p>
        </section>

        <section id="section-analytics" class="section hidden">
          <p class="text-gray-500 text-center py-12">Analytics section loading...</p>
        </section>

        <section id="section-billing" class="section hidden">
          <p class="text-gray-500 text-center py-12">Billing section loading...</p>
        </section>
      </main>
    </div>
  </div>

  <script src="/static/app.js?v=${Date.now()}"></script>
</body>
</html>`);
});

export default app;

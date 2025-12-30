# AutoBlog Growth Engine

> Automated SEO Blog Marketing AI for SaaS Startups

Turn your SaaS website into an always-on organic traffic machine.

## Live Demo

**Production URL**: https://3000-igrulhj92esnfcfrsds88-0e616f0a.sandbox.novita.ai

## Overview

AutoBlog Growth Engine is a fully automated content growth engine specialized for SaaS companies. It runs a complete pipeline from keyword research to publishing with minimal human intervention.

### Core Features

1. **SaaS-Aware Keyword Research Engine**
   - Accepts SaaS description, ICP, industry, and competitors
   - Generates informational, comparison, problem-based, and use-case keywords
   - Scores keywords by search intent, difficulty, and funnel stage (TOFU/MOFU/BOFU)
   - Creates monthly content roadmaps with keyword clusters

2. **SEO-Optimized Blog Post Generator**
   - Long-form articles (1,500-2,500 words)
   - Proper H1 → H2 → H3 hierarchy
   - Featured snippet-ready sections
   - FAQs with schema-ready format
   - Comparison tables where relevant
   - SaaS-native B2B writing style

3. **Intelligent Internal Linking System**
   - Analyzes existing blog posts
   - Detects orphan content
   - Suggests contextual internal links
   - Maintains pillar → cluster relationships
   - Natural anchor text variation

4. **Auto-Publishing & CMS Integration**
   - WordPress REST API integration (mandatory)
   - Scheduled publishing
   - Category & tag assignment
   - Slug optimization
   - Meta title & description auto-generation

5. **SEO Performance Feedback Loop**
   - Tracks published URLs
   - Monitors keyword rankings
   - Checks indexing status
   - Adjusts future keyword priorities based on performance

## Tech Stack

- **Backend**: Hono (TypeScript)
- **Frontend**: Vanilla JS + TailwindCSS
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages/Workers
- **Icons**: FontAwesome 6.4

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

### Organization
- `GET /api/organization` - Get organization details
- `PUT /api/organization` - Update organization profile

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Keywords
- `POST /api/keywords/research` - Run keyword research
- `GET /api/keywords/clusters` - List keyword clusters
- `GET /api/keywords/clusters/:id` - Get cluster details
- `GET /api/keywords` - List all keywords

### Articles
- `POST /api/articles/generate` - Generate article from keyword
- `GET /api/articles` - List articles
- `GET /api/articles/:id` - Get article details
- `PUT /api/articles/:id` - Update article
- `POST /api/articles/:id/publish` - Publish to WordPress

### Websites
- `GET /api/websites` - List connected websites
- `POST /api/websites` - Add new website
- `POST /api/websites/:id/test` - Test connection

### Internal Links
- `POST /api/internal-links/analyze` - Analyze link structure
- `GET /api/internal-links/stats` - Get linking statistics
- `GET /api/articles/:id/link-suggestions` - Get suggestions for article
- `POST /api/articles/:id/apply-links` - Apply links to article

### Analytics
- `GET /api/analytics/seo-health` - Get SEO health report
- `GET /api/analytics/articles/:id/performance` - Get article performance

### Billing
- `GET /api/billing/usage` - Get current usage
- `GET /api/billing/plans` - List available plans

## Pricing Tiers

| Feature | Starter ($49/mo) | Growth ($149/mo) | Scale ($349/mo) |
|---------|------------------|------------------|-----------------|
| Posts/Month | 10 | 30 | 60+ |
| Keyword Research | Limited | Full | Full |
| Internal Linking | No | Yes | Yes |
| Multiple Websites | No | No | Yes |
| Priority Support | No | No | Yes |
| API Access | No | Yes | Yes |

## Database Schema

### Core Tables
- `organizations` - SaaS companies using the platform
- `users` - User accounts with roles
- `websites` - Connected WordPress sites
- `keyword_clusters` - Pillar content organization
- `keywords` - Individual keywords with scoring
- `articles` - Generated blog posts
- `internal_links` - Link relationships
- `seo_metrics` - Performance tracking
- `content_jobs` - Background job queue
- `sessions` - Auth sessions

## Local Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Apply database migrations
npm run db:migrate:local

# Start development server
npm run dev:sandbox

# Or use PM2
pm2 start ecosystem.config.cjs
```

## Deployment to Cloudflare

```bash
# Create D1 database
npx wrangler d1 create autoblog-production

# Update wrangler.jsonc with the database ID

# Deploy
npm run deploy:prod
```

## User Guide

### Getting Started
1. Sign up with your email and company details
2. Complete your organization profile (SaaS description, ICP, industry)
3. Run keyword research to generate content opportunities
4. Generate articles from high-priority keywords
5. Connect your WordPress site
6. Publish and monitor performance

### Workflow
1. **Research** → Generates keyword clusters based on your SaaS profile
2. **Generate** → Creates SEO-optimized articles for selected keywords
3. **Optimize** → Analyzes and suggests internal links
4. **Publish** → Pushes to WordPress automatically
5. **Track** → Monitors performance and adjusts priorities

## Project Structure

```
webapp/
├── src/
│   ├── index.tsx          # Main Hono application
│   ├── routes/
│   │   └── api.ts         # API route handlers
│   ├── services/
│   │   ├── keyword-research.ts    # Keyword engine
│   │   ├── article-generator.ts   # Content generator
│   │   ├── internal-linking.ts    # Link analyzer
│   │   ├── wordpress-publisher.ts # CMS integration
│   │   └── seo-tracker.ts         # Performance tracking
│   ├── types/
│   │   └── index.ts       # TypeScript definitions
│   └── utils/
│       └── helpers.ts     # Utility functions
├── public/
│   └── static/
│       └── app.js         # Frontend JavaScript
├── migrations/
│   └── 0001_initial_schema.sql
├── ecosystem.config.cjs    # PM2 configuration
├── wrangler.jsonc         # Cloudflare config
├── vite.config.ts         # Vite config
└── package.json
```

## Roadmap

### V1 (Current)
- [x] Core keyword research engine
- [x] Article generation
- [x] Internal linking system
- [x] WordPress publishing
- [x] Basic SEO tracking
- [x] SaaS dashboard

### V2 (Planned)
- [ ] AI-powered content enhancement (OpenAI/Anthropic)
- [ ] Google Search Console integration
- [ ] Multi-language support
- [ ] A/B testing for titles
- [ ] Content calendar view
- [ ] Team collaboration features
- [ ] Headless CMS support (Strapi, Contentful)
- [ ] Webhook notifications

### V3 (Future)
- [ ] AI content refresher for old posts
- [ ] Competitor content gap analysis
- [ ] SERP position tracking
- [ ] Backlink monitoring
- [ ] Custom AI training per brand voice

## License

MIT

---

Built for SaaS founders who want to grow organic traffic without hiring a content team.

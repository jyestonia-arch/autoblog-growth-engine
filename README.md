# AutoBlog Growth Engine

> Automated SEO Blog Marketing AI for SaaS Startups

Turn your SaaS website into an always-on organic traffic machine.

## Live Demo

**Production URL**: https://autoblog-growth-engine.genspark.space (배포된 URL로 업데이트 필요)

**Sandbox URL**: https://3000-igrulhj92esnfcfrsds88-0e616f0a.sandbox.novita.ai

## Overview

AutoBlog Growth Engine is a fully automated content growth engine specialized for SaaS companies. It runs a complete pipeline from keyword research to publishing with minimal human intervention.

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **AI Keyword Research** | Claude Sonnet 4 기반 SaaS 맞춤 키워드 분석 |
| 📝 **SEO Article Generation** | 1,800-2,200 단어 완벽한 SEO 최적화 콘텐츠 |
| 🌍 **Multilingual Support** | 8개 언어 지원 (EN, KO, JA, ZH, ES, DE, FR, PT) |
| 📅 **Content Calendar** | 드래그 앤 드롭 스케줄링, 월간/주간 뷰 |
| 🔗 **Internal Linking** | AI 기반 내부 링크 제안 및 자동 적용 |
| 📊 **Google Search Console** | 실제 SEO 데이터 연동 |
| 💳 **Stripe Payments** | 구독 결제, 플랜 관리, 청구서 |
| 📧 **Email Notifications** | Resend API - 발행/스케줄/사용량 알림 |
| 🚀 **WordPress Publishing** | 원클릭 WordPress 발행 |

## Supported Languages

| 언어 | Language | Flag |
|------|----------|------|
| English | English | 🇺🇸 |
| 한국어 | Korean | 🇰🇷 |
| 日本語 | Japanese | 🇯🇵 |
| 简体中文 | Chinese | 🇨🇳 |
| Español | Spanish | 🇪🇸 |
| Deutsch | German | 🇩🇪 |
| Français | French | 🇫🇷 |
| Português | Portuguese | 🇧🇷 |

## Tech Stack

- **Backend**: Hono (TypeScript) + Cloudflare Workers
- **Frontend**: Vanilla JS + TailwindCSS
- **Database**: Cloudflare D1 (SQLite)
- **AI**: Claude Sonnet 4 (Anthropic API)
- **Payments**: Stripe
- **Email**: Resend
- **Analytics**: Google Search Console API
- **Deployment**: Cloudflare Pages / GenSpark Deploy

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | 계정 생성 |
| `/api/auth/login` | POST | 로그인 |
| `/api/auth/logout` | POST | 로그아웃 |

### Keywords
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/keywords/research` | POST | 키워드 리서치 (영어) |
| `/api/keywords/research/multilingual` | POST | 다국어 키워드 리서치 |
| `/api/keywords/clusters` | GET | 클러스터 목록 |
| `/api/keywords` | GET | 키워드 목록 |

### Articles
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/articles/generate` | POST | 아티클 생성 (영어) |
| `/api/articles/generate/multilingual` | POST | 다국어 아티클 생성 |
| `/api/articles/:id/translate` | POST | 아티클 번역 |
| `/api/articles` | GET | 아티클 목록 |
| `/api/articles/:id` | GET/PUT | 아티클 조회/수정 |
| `/api/articles/:id/publish` | POST | WordPress 발행 |

### Internal Linking
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/internal-links/analyze` | POST | 링크 구조 분석 |
| `/api/internal-links/stats` | GET | 링킹 통계 |
| `/api/articles/:id/link-suggestions` | GET | 링크 제안 |

### Google Search Console
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gsc/auth-url` | GET | OAuth URL 생성 |
| `/api/gsc/callback` | GET | OAuth 콜백 |
| `/api/gsc/status` | GET | 연동 상태 |
| `/api/gsc/performance` | GET | 검색 성능 데이터 |
| `/api/gsc/sync` | POST | 데이터 동기화 |

### Billing (Stripe)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/billing/config` | GET | 요금제 정보 |
| `/api/billing/subscription` | GET | 구독 상태 |
| `/api/billing/create-checkout` | POST | 결제 세션 생성 |
| `/api/billing/portal` | POST | 결제 포털 |
| `/api/billing/invoices` | GET | 결제 내역 |

### Notifications
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications/status` | GET | 알림 설정 상태 |
| `/api/notifications/test` | POST | 테스트 이메일 |

### Languages
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/languages` | GET | 지원 언어 목록 |

## Pricing Tiers

| Feature | Starter ($49/mo) | Growth ($149/mo) | Scale ($349/mo) |
|---------|------------------|------------------|-----------------|
| Posts/Month | 10 | 30 | 60+ |
| Keyword Research | Limited | Full | Full |
| Internal Linking | ❌ | ✅ | ✅ |
| Multiple Websites | ❌ | ❌ | ✅ |
| API Access | ❌ | ✅ | ✅ |
| GSC Integration | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |
| Free Trial | ❌ | 14 days | 14 days |

## Environment Variables

```env
# Required: Claude AI for content generation
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional: Email notifications
RESEND_API_KEY=re_xxxxx

# Optional: Google Search Console
GSC_CLIENT_ID=xxxxx.apps.googleusercontent.com
GSC_CLIENT_SECRET=GOCSPX-xxxxx

# Optional: Stripe payments
STRIPE_SECRET_KEY=sk_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

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

## Database Schema

### Core Tables
| Table | Description |
|-------|-------------|
| `organizations` | SaaS 회사 정보 |
| `users` | 사용자 계정 |
| `sessions` | 인증 세션 |
| `websites` | WordPress 연결 |
| `keyword_clusters` | 키워드 클러스터 |
| `keywords` | 개별 키워드 |
| `articles` | 생성된 아티클 |
| `internal_links` | 내부 링크 |
| `seo_metrics` | SEO 성과 추적 |
| `gsc_connections` | GSC 연결 정보 |
| `gsc_site_metrics` | GSC 메트릭 |
| `subscriptions` | Stripe 구독 |
| `payment_history` | 결제 내역 |

## Project Structure

```
webapp/
├── src/
│   ├── index.tsx              # Main Hono application + HTML
│   ├── routes/
│   │   └── api.ts             # API route handlers
│   ├── services/
│   │   ├── claude-api.ts      # Claude AI integration + multilingual
│   │   ├── keyword-research.ts
│   │   ├── article-generator.ts
│   │   ├── internal-linking.ts
│   │   ├── wordpress-publisher.ts
│   │   ├── seo-tracker.ts
│   │   ├── email-service.ts   # Resend email
│   │   ├── google-search-console.ts
│   │   └── stripe-service.ts  # Stripe payments
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
├── public/
│   └── static/
│       └── app.js             # Frontend JavaScript
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_gsc_integration.sql
│   └── 0003_stripe_billing.sql
├── ecosystem.config.cjs
├── wrangler.jsonc
├── vite.config.ts
├── .dev.vars.example
└── package.json
```

## User Guide

### 시작하기
1. 이메일과 회사 정보로 회원가입
2. 조직 프로필 완성 (SaaS 설명, ICP, 산업)
3. 키워드 리서치 실행 (언어 선택 가능)
4. 우선순위 높은 키워드에서 아티클 생성
5. WordPress 사이트 연결
6. 발행 및 성과 모니터링

### 다국어 콘텐츠 생성
1. **키워드 리서치**: 언어 드롭다운에서 원하는 언어 선택
2. **아티클 생성**: Generate 버튼 클릭 후 언어 선택
3. **번역**: 기존 아티클의 번역 버튼 클릭 후 대상 언어 선택

### 콘텐츠 캘린더
1. Calendar 메뉴로 이동
2. Month/Week 뷰 전환
3. 드래프트 아티클을 날짜에 드래그 앤 드롭으로 스케줄링
4. 또는 날짜 클릭 후 모달에서 스케줄링

## Feature Status

### ✅ Completed (V1)
- [x] Claude Sonnet 4 AI 키워드 리서치
- [x] Claude Sonnet 4 AI 아티클 생성
- [x] 다국어 지원 (8개 언어)
- [x] 아티클 번역 기능
- [x] 콘텐츠 캘린더 (월간/주간 뷰)
- [x] 드래그 앤 드롭 스케줄링
- [x] 내부 링킹 시스템
- [x] WordPress 발행
- [x] Google Search Console 연동
- [x] Stripe 결제 연동
- [x] Resend 이메일 알림
- [x] SEO 성과 추적

### 🔮 Planned (V2)
- [ ] A/B 테스트 (제목)
- [ ] 팀 협업 기능
- [ ] Headless CMS 지원 (Strapi, Contentful)
- [ ] Webhook 알림
- [ ] 콘텐츠 자동 새로고침

### 🚀 Future (V3)
- [ ] 경쟁사 콘텐츠 갭 분석
- [ ] SERP 순위 추적
- [ ] 백링크 모니터링
- [ ] 브랜드 보이스 AI 커스텀 트레이닝

## License

MIT

---

Built for SaaS founders who want to grow organic traffic without hiring a content team.

**GenSpark AI** 🚀

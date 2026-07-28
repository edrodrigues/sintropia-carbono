# Sintropia Design Document

## Overview

Sintropia is a professional social network and market data platform for environmental markets — carbon credits, renewable energy (I-REC), ESG, and sustainability. It combines social features (posts, comments, karma, gamification) with market intelligence dashboards and stakeholder directories.

**URL:** https://sintropia.space

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| UI Library | React 18.3.1 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3.7 |
| Icons | Remixicon + Lucide React |
| Font | Inter (headings + body) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth) |
| i18n | next-intl 4 (pt, en, es) |
| Email | Resend |
| E2E Tests | Playwright |
| Deployment | Vercel |

---

## Architecture

### Routing Structure (Next.js App Router)

```
[locale]/                          # i18n prefix (pt/en/es, as-needed)
├── (public)/                      # Open pages, no auth required
│   ├── page.tsx                   # Landing page
│   ├── u/[username]               # Public user profile
│   ├── carbono/                   # Carbon market hub + sub-pages
│   │   ├── ranking-brasil/        # Brazil stakeholder rankings
│   │   ├── ranking-mundo/         # Global stakeholder rankings
│   │   ├── setores/               # Sector analysis
│   │   ├── precos/                # Carbon price history
│   │   └── projetos/              # Carbon projects directory
│   ├── energia/                   # I-REC energy hub + sub-pages
│   │   ├── ranking-brasil/
│   │   ├── ranking-mundo/
│   │   ├── setores/
│   │   └── precos/
│   ├── certificadoras/            # Certifying bodies
│   ├── categorias/                # All categories
│   ├── contribuir/                # Contribute/partner page
│   ├── termos/                    # Terms of service
│   └── privacidade/               # Privacy policy
├── (auth)/                        # Authentication flow
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   └── onboarding/                # Multi-step profile setup
├── (dashboard)/                   # Authenticated user area
│   ├── dashboard/                 # User home dashboard
│   ├── feed/                      # Community news feed
│   ├── profile/ + edit/           # User profile management
│   ├── posts/                     # User's posts
│   ├── profiles/                  # Community directory
│   ├── leaderboard/               # Karma ranking
│   ├── conquistas/                # Achievements
│   ├── mod/                       # Moderation panel
│   └── admin/scripts/             # Admin script runner
└── (debug)/                       # Debug tools

api/                               # API routes
├── auth/confirm + callback        # Supabase auth callbacks
├── carbon-projects                # Public carbon projects API
├── carbon-plan/upload/*           # Data import endpoints
└── admin/scripts/run              # Admin script execution
```

### Route Group Layouts

- **Public pages** are wrapped in the root `[locale]/layout.tsx` with Header + Footer.
- **Dashboard pages** use a nested `(dashboard)/layout.tsx` adding breadcrumbs and dashboard-specific navigation.
- **Auth pages** have a minimal layout (no header/footer).
- **Middleware** chains: locale routing → Supabase session check → profile completeness redirect (dashboard routes only).

---

## Design System

### Brand Colors

Defined in `src/app/globals.css` (`@theme` block).

| Token | Hex | Usage |
|-------|-----|-------|
| `deep-forest` | `#0A382C` | Headers, primary buttons, brand elements |
| `sage-green` | `#A8C3A0` | Backgrounds, highlights |
| `electric-emerald` | `#0CF570` | Accent, interactive states, logo mark |
| `charcoal-ink` | `#23282D` | Dark backgrounds, neutral dark text |
| `mint-tint` | `#DDF5E6` | Light page background tint |

### Logo

- **Mark:** Geometric sprout (two leaves + stem) in Electric Emerald on a Deep Forest rounded-square tile; wordmark "SINTROPIA" in bold.
- **Concept:** Merging growth, network, and data. Style: clean, geometric, professional.
- **Component:** `src/components/ui/Logo.tsx` (`Logo` tile + wordmark, `LogoMark` standalone SVG).
- **Usage:** Navigation bars, dark/light backgrounds (footer uses `dark` variant), favicon (`public/favicon.svg`).

### Typography

- **Family:** Inter (single family for headings and body), loaded via `next/font/google` as `--font-inter`, mapped to Tailwind `--font-sans`.
- **Headings:** Bold, 32pt/48pt scale (`text-3xl`/`text-5xl`), `text-deep-forest`.
- **Body:** Inter Regular/Medium, 16pt/24pt.
- **Data:** `tabular-nums` on metrics, stat cards, and numeric table cells.

### Photography & Visual Style

- **Style:** Authentic, hopeful, analytical.
- **Mood:** Forward-thinking, collaborative, professional.
- **Subjects:** Real people in renewable-energy/agro contexts, network/data overlays on landscapes, growth metaphors (seedlings).

### Component Primitives

The project uses **custom-built Tremor-inspired components** (not the npm package). Located in `src/components/ui/tremor/`:

| Component | Description |
|-----------|-------------|
| `Card` | White bg, rounded-xl, border, shadow-sm, dark variant |
| `Badge` | Inline status indicator with color variants |
| `Metric` | Large statistic display with label |
| `Title` | Section heading |
| `Table` | Data table with head/body/row/cell |
| `Select` | Styled dropdown |
| `TextInput` | Styled input |
| `BarChart` | Recharts BarChart wrapper |
| `LineChart` | Recharts LineChart wrapper |
| `DonutChart` | Recharts PieChart (donut) wrapper |
| `Callout` | Alert/info message box |
| `Tooltip` | Hover tooltip |

### Visual Patterns

- **Cards:** `bg-white rounded-xl border border-gray-200 p-6 shadow-sm` (consistent across all sections)
- **Buttons:** Deep forest `bg-deep-forest` for primary, ghost/outline for secondary
- **Charts:** Recharts with a centralized brand palette (`brandChartPalette` in `src/lib/utils.ts`), anchored on deep forest / electric emerald / sage / charcoal
- **Glass effect:** `bg-white/70 backdrop-blur-md` (`.glass` utility class)
- **Animations:** 12 custom keyframe animations (dialog overlays, slide-in drawers, accordion, fade)
- **Dark mode:** Supported via `.dark` class variant with `dark:` Tailwind prefixes
- **Responsive:** Mobile-first with `lg:` breakpoints; mobile drawer replaces desktop dropdown nav

### Custom UI Components

- `StatsCard` — Data point with icon, label, value
- `SectorFilter` — Market sector selector
- `SearchInput` — Debounced search
- `MobileTable` — Horizontal scroll responsive table
- `LastUpdated` — Timestamp display
- `DataSources` — Source attribution
- `DataExportButton` — CSV export
- `YearToggle` — Year range selector
- `Breadcrumb` — Breadcrumb navigation

---

## Component Architecture

### Component Tree (top-level)

```
<RootLayout>                       # Fonts, metadata, GA, Schema.org
  <NextIntlClientProvider>         # i18n context
    <Header>                       # Nav bar (desktop dropdowns / mobile drawer)
      <LanguageSwitcher>
      <NotificationBell>           # Authenticated only
    <Breadcrumb>                   # Dashboard layout only
    <main>
      {children}                   # Page content
    </main>
    <Footer>
```

### Social Features

| Component | Responsibility |
|-----------|---------------|
| `PostCard` | Post display with content, author, timestamp |
| `FeedPostCard` | Feed-specific post with discussion context |
| `CreatePostButton` / `PostModal` | Post creation flow |
| `TopicTags` | Topic filtering |
| `VoteButtons` | Upvote/downvote with karma calculation |
| `CommentSection` | Threaded comments |
| `ReportButton` | Content reporting |

### Gamification

- **Karma system:** Post/comment voting drives user karma score
- **Achievements:** Defined in `src/lib/achievements.ts`, displayed via `AchievementBadges`
- **Leaderboard:** `/leaderboard` page ranks users by karma

### Moderation System

- Actions: Ban, Warn, Delete, Promote
- UI: `ReportsList`, `UsersList`, `PostsList`, `ModSearch`
- Server actions in `src/lib/mod-actions.ts`
- Mod panel at `/mod`

---

## Data Flow

### Auth Flow

```
User → Login/Register → Supabase Auth → Session cookie (ssr)
  → Middleware checks session on dashboard routes
  → Redirect to /onboarding if profile incomplete
  → Redirect to /login if unauthenticated
```

### Data Fetching Pattern

- **Server components:** Direct Supabase queries using `createClient()` from `src/lib/supabase/server.ts`
- **Client components:** Supabase browser client from `src/lib/supabase/client.ts`
- **Server actions:** `"use server"` functions for mutations (posts, votes, profile edits)
- **API routes:** Next.js route handlers for external data access (carbon projects, admin scripts)

### Market Data Pipeline

```
CSV files (dados/) → Administrative scripts (scripts/) → Supabase DB
  → Server components query DB → Render charts (Recharts)
  → API routes expose public data
```

---

## i18n Architecture

| Aspect | Detail |
|--------|--------|
| Library | next-intl v4 |
| Locales | pt (default), en, es |
| File format | JSON key-value in `messages/{locale}.json` (~1200+ keys each) |
| Routing | `as-needed` prefix — default locale (`pt`) has no prefix |
| Middleware | Combined intl + auth + profile check in single middleware |

---

## Database Schema (Supabase)

Tables: `profiles`, `posts`, `comments`, `votes`, `notifications`, `mod_actions`, `carbono_stakeholders`, `carbono_prices`, `carbono_projetos`, `irec_stakeholders`, `irec_prices`, `energy_stakeholders`, `categories`, `category_follows`, `reports`, `achievements`, `user_achievements`, `scripts`, `drip_campaign`, `contacts`, and more.

Full schema defined via SQL migrations in `supabase/migrations/` (11 migrations).

---

## Key Libraries & Utilities

| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server component client |
| `src/lib/supabase/middleware.ts` | Middleware client |
| `src/lib/supabase/admin.ts` | Service-role admin client |
| `src/lib/utils.ts` | `cx()` class merging, chart colors |
| `src/lib/validation.ts` | Zod schemas for forms |
| `src/lib/email.ts` | Resend transactional email templates |
| `src/lib/rate-limiter.ts` | In-memory rate limiting |
| `src/lib/mod-actions.ts` | Moderation server actions |
| `src/lib/utils/sanitize.ts` | XSS sanitization (DOMPurify) |
| `src/lib/utils/logger.ts` | Structured logging |
| `src/lib/utils/monitoring.ts` | Performance monitoring wrapper |

---

## Accessibility & SEO

- Skip-to-content link
- Semantic HTML (landmarks, headings)
- ARIA labels on interactive elements
- Schema.org JSON-LD (Organization + WebSite)
- OG tags for all pages
- Sitemap generation
- Robots.txt

---

## Testing

| Type | Tool | Location |
|------|------|----------|
| E2E | Playwright | `e2e/app.spec.ts`, `e2e/security.spec.ts` |
| Linting | ESLint | `eslint.config.mjs` (strict TS rules) |
| Git hooks | Husky + lint-staged | Lint fix on staged files |

---

## Security

- XSS prevention via DOMPurify (server-side sanitization)
- Rate limiting on auth/contribution endpoints
- Supabase RLS policies on all tables
- Service role key restricted to admin scripts/API routes
- Environment variables for all secrets
- Input validation via Zod schemas

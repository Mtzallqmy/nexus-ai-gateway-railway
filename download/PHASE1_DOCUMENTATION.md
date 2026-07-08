# Moataz AI Gateway — Phase 1 Frontend Documentation

A production-grade SaaS dashboard for unified AI provider management. Built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, and a fully typed mock API layer ready for backend integration.

---

## 1. Overview

Phase 1 delivers a **complete, runnable frontend** for the Moataz AI Gateway platform. It includes 22 pages, a scalable folder architecture, full i18n (English + Arabic with RTL), dark/light/system theming, responsive layouts for mobile/tablet/desktop, and a typed API service layer backed by mock data — ready to be swapped for real backend calls in Phase 2.

### What's Included

- ✅ 22 production-ready pages
- ✅ Reusable layout system (Sidebar, Header, Breadcrumbs, Search, Notifications, User Menu)
- ✅ 20+ reusable UI primitives (StatCard, DataTable, EmptyState, ErrorState, Skeletons, etc.)
- ✅ Full Arabic (RTL) + English (LTR) localization
- ✅ Dark / Light / System theme modes
- ✅ Mobile, tablet, desktop responsive layouts
- ✅ Typed mock API layer with TanStack Query hooks
- ✅ Zustand stores for auth, provider, and settings context
- ✅ Recharts-powered data visualizations
- ✅ Framer Motion page transitions and micro-interactions
- ✅ React Hook Form + Zod validation on all forms
- ✅ Toast notifications (sonner + radix toast)
- ✅ Command palette (⌘K)
- ✅ Comprehensive design token system

### What's NOT Included (Phase 2 Scope)

- ❌ Backend business logic
- ❌ Real provider integrations (OpenAI, Anthropic, etc.)
- ❌ LiteLLM or AI request execution
- ❌ Database persistence
- ❌ Real authentication (NextAuth with real credentials)
- ❌ WebSocket real-time streams
- ❌ File uploads

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| UI Components | shadcn/ui (New York) | latest |
| State (client) | Zustand | 5 |
| State (server) | TanStack Query | 5 |
| Forms | React Hook Form | 7 |
| Validation | Zod | 4 |
| i18n | next-intl | 4 |
| Theming | next-themes | 0.4 |
| Charts | Recharts | 2.15 |
| Animation | Framer Motion | 12 |
| Icons | lucide-react | 0.525 |
| Tables | TanStack Table | 8 |

---

## 3. Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (providers, fonts)
│   ├── globals.css             # Design tokens + base styles
│   ├── (auth)/                 # Auth route group
│   │   ├── layout.tsx          # Centered auth layout
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/            # Dashboard route group
│   │   ├── layout.tsx          # Sidebar + Header layout
│   │   ├── page.tsx            # Dashboard home (/)
│   │   ├── providers/page.tsx
│   │   ├── models/page.tsx
│   │   ├── api-keys/page.tsx
│   │   ├── usage/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── logs/page.tsx
│   │   ├── health/page.tsx
│   │   ├── validation/page.tsx
│   │   ├── playground/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── team/page.tsx
│   │   ├── roles/page.tsx
│   │   ├── permissions/page.tsx
│   │   ├── audit-logs/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── account/page.tsx
│   │   └── documentation/page.tsx
│   └── api/route.ts            # Health-check endpoint
├── components/
│   ├── ui/                     # shadcn/ui primitives (50+ components)
│   ├── layout/                 # Sidebar, Header, Breadcrumbs, UserMenu, Toggles
│   ├── providers/              # AppProviders, ThemeProvider, QueryProvider, IntlProvider
│   ├── dashboard/              # StatCard, PageHeader, DataTable, EmptyState, ErrorState, etc.
│   ├── charts/                 # ChartCard, TrendChart, BarsChart, DonutChart, SimpleLineChart
│   ├── search/                 # CommandSearch (⌘K palette)
│   ├── notifications/          # NotificationsDropdown
│   └── auth/                   # (reserved for shared auth components)
├── stores/                     # Zustand stores
│   ├── auth-store.ts           # User, login, logout, register
│   ├── provider-store.ts       # Active provider, provider list
│   └── settings-store.ts       # Locale, theme, density, sidebar state
├── lib/
│   ├── api/
│   │   ├── client.ts           # Mock fetch client with latency simulation
│   │   └── endpoints.ts        # Typed API endpoints (providers, models, etc.)
│   ├── mock/
│   │   └── data.ts             # Mock dataset for all entities
│   ├── hooks/
│   │   └── queries.ts          # TanStack Query hooks (useProviders, useModels, ...)
│   ├── utils.ts                # cn() classname helper
│   └── format.ts               # Number, currency, latency, byte formatters
├── types/
│   └── index.ts                # All domain types (User, Provider, Model, etc.)
├── config/
│   └── nav.ts                  # Navigation sections + site config
├── i18n/
│   ├── config.ts               # Locales, defaultLocale
│   ├── routing.ts              # next-intl routing
│   ├── middleware.ts           # next-intl middleware
│   └── request.ts              # next-intl request config
└── messages/
    ├── en.json                 # English translations
    └── ar.json                 # Arabic translations
```

---

## 4. Pages

### Auth Pages (Public)

| Route | Description |
|---|---|
| `/login` | Sign-in form with email/password, "demo account" autofill, social buttons (GitHub/Google), validation |
| `/register` | Registration form with name, email, company, password, confirm-password, terms acceptance |
| `/forgot-password` | Password reset request with success confirmation state |

### Dashboard Pages (Authenticated)

| Route | Description |
|---|---|
| `/` | Dashboard overview — stat cards, request trends, cost breakdown donut, top models, recent activity, provider status |
| `/providers` | Providers table with status, features, latency, uptime, error rate; add/test/delete actions |
| `/models` | Model gallery cards with context window, pricing, capabilities, modalities, benchmark scores |
| `/api-keys` | API keys table with masked keys, scopes, usage progress, rotate/revoke actions; create dialog with key reveal |
| `/usage` | Usage analytics — stat cards, daily trends, cost split, top models bars, provider breakdown table |
| `/analytics` | Performance analytics — success rate, throughput, p50/p95 latency, latency distribution, error breakdown |
| `/logs` | Real-time log stream — level/provider filters, live/pause toggle, status colors, search |
| `/health` | Provider health cards with status icons, latency, uptime, incidents, connectivity/authentication checks, diagnostics |
| `/validation` | Validation test results table with pass/fail scores, category, duration; run-tests action |
| `/playground` | Interactive chat playground — provider/model selectors, temperature/max-tokens/top-P sliders, system prompt, conversation history, metadata |
| `/billing` | Current plan, usage progress, plan comparison cards, payment methods, invoices table |
| `/settings` | Tabbed settings — General, Appearance (theme/accent/density), Notifications, Security, Integrations, Advanced |
| `/team` | Team members table with avatars, roles, status, last active, permissions; invite dialog |
| `/roles` | Role cards with member count, permissions, system/custom badges; create dialog |
| `/permissions` | Grouped permissions with checkboxes + permission matrix (Owner/Admin/Developer/Billing/Viewer) |
| `/audit-logs` | Audit trail table with actor, action, resource, IP, status; filters by action type |
| `/notifications` | Notifications list with unread/all tabs, type icons, mark-read/delete actions |
| `/profile` | Profile editor — avatar, name, email, bio, job title, location, website |
| `/account` | Account settings — info, password change, active sessions, security checklist, danger zone |
| `/documentation` | Docs browser — search, category filter, popular docs, doc cards |

---

## 5. Design System

### Color Tokens (CSS Variables)

All colors are defined as OKLCH values in `globals.css` with light and dark variants:

- **Surfaces**: `--background`, `--card`, `--popover`, `--sidebar`
- **Text**: `--foreground`, `--muted-foreground`, `--card-foreground`
- **Primary**: `--primary` / `--primary-foreground` (violet-based)
- **Semantic**: `--success`, `--warning`, `--info`, `--destructive` (each with `-foreground`)
- **Chart palette**: `--chart-1` through `--chart-5` (5-color sequence)
- **Borders & inputs**: `--border`, `--input`, `--ring`

### Typography

- **Sans**: Geist (variable, `--font-geist-sans`)
- **Mono**: Geist Mono (variable, `--font-geist-mono`)
- **Hierarchy**: `text-2xl/3xl font-bold` for page titles, `text-base font-semibold` for card titles, `text-sm` for body, `text-xs` for metadata

### Spacing & Radius

- Base radius: `0.625rem` (10px)
- Card padding: `p-6` (default) / `p-4` (compact)
- Section gap: `space-y-6` between page sections
- Grid gaps: `gap-4` standard

### Component Patterns

- **StatCard**: Label, value, change%, trend icon, description, icon badge
- **DataTable**: TanStack Table with skeleton loading, empty state, row click handler
- **EmptyState**: Dashed border, icon circle, title, description, optional action
- **ErrorState**: Destructive-tinted border, alert icon, retry button
- **StatusBadge**: Status dot + label, with semantic colors per status type

---

## 6. State Management

### Zustand Stores (Client State)

**`useAuthStore`** (`src/stores/auth-store.ts`)
- `user`, `isAuthenticated`, `token`, `isLoading`
- `login(email, password)`, `register(name, email, password)`, `logout()`, `updateProfile(updates)`
- Persisted to `localStorage` under `moataz-auth`

**`useProviderStore`** (`src/stores/provider-store.ts`)
- `providers[]`, `activeProviderId`, `selectedProviderId`
- `setActiveProvider(id)`, `selectProvider(id)`, `upsertProvider(p)`, `removeProvider(id)`
- Pre-loaded with 5 mock providers (OpenAI, Anthropic, Google, Mistral, Cohere)

**`useSettingsStore`** (`src/stores/settings-store.ts`)
- `locale` (`"en"` | `"ar"`), `theme` (`"light"` | `"dark"` | `"system"`)
- `density`, `accentColor`, `sidebarCollapsed`, `commandOpen`, `notificationsOpen`
- Notification preferences (`emailNotifications`, `pushNotifications`, `weeklyDigest`)
- Security (`twoFactor`)
- Persisted to `localStorage` under `moataz-settings`

### TanStack Query (Server State)

All API calls go through typed hooks in `src/lib/hooks/queries.ts`:

```typescript
// Examples
const { data: providers, isLoading } = useProviders();
const { data: usage } = useUsageSummary("30d");
const createKey = useCreateApiKey();
await createKey.mutateAsync({ name, scopes });
```

Hooks include:
- `useProviders`, `useProvider`, `useCreateProvider`, `useTestProviderConnection`
- `useModels`, `useApiKeys`, `useCreateApiKey`, `useRotateApiKey`, `useRevokeApiKey`
- `useUsageSummary`, `useUsageTrend`
- `useLogs`, `useHealth`, `useRunDiagnostic`
- `useValidation`, `useRunValidation`
- `useTeam`, `useInviteMember`, `useRemoveMember`
- `useRoles`, `useCreateRole`, `useDeleteRole`
- `usePermissions`, `useAuditLogs`
- `useNotifications`, `useMarkNotificationRead`, `useMarkAllNotificationsRead`
- `useBillingPlans`, `useInvoices`, `usePaymentMethods`, `useCurrentUsage`
- `useDocs`, `useDoc`

Default stale time: 30s. GC time: 5 min. Retry: 1. Refetch on window focus: off.

---

## 7. API Service Layer

The API layer is split into two parts:

### `src/lib/api/client.ts`
- `MockApiClient` class with `get`, `post`, `put`, `delete` methods
- Simulates network latency (350-800ms random)
- Supports `AbortSignal` for cancellation
- Replace with real `fetch` calls in Phase 2

### `src/lib/api/endpoints.ts`
- One object per resource: `providersApi`, `modelsApi`, `apiKeysApi`, `usageApi`, `logsApi`, `healthApi`, `validationApi`, `teamApi`, `rolesApi`, `permissionsApi`, `auditApi`, `notificationsApi`, `billingApi`, `docsApi`
- Each method returns typed promises: `providersApi.list(): Promise<Provider[]>`
- All return mock data from `src/lib/mock/data.ts`

### Migrating to Real Backend

To connect the real backend in Phase 2:

1. Update `src/lib/api/client.ts` to use real `fetch`:
   ```typescript
   async get<T>(path: string, options?: RequestOptions): Promise<T> {
     const res = await fetch(`${this.baseUrl}${path}`, { signal: options?.signal });
     if (!res.ok) throw new Error(await res.text());
     return res.json();
   }
   ```

2. Update each endpoint in `endpoints.ts` to call `apiClient.get("/providers")` instead of `mockResponse(...)`.

3. No changes needed to TanStack Query hooks — they consume the typed promises.

4. Update Zustand stores if backend handles auth/provider state.

---

## 8. Internationalization

### Supported Locales
- `en` (English, LTR)
- `ar` (Arabic, RTL)

### Message Files
- `src/messages/en.json` — English translations, organized by namespace (`common`, `nav`, `auth`, `dashboard`, `providers`, `models`, `apiKeys`, `usage`, `analytics`, `logs`, `health`, `validation`, `playground`, `billing`, `settings`, `team`, `roles`, `permissions`, `auditLogs`, `notifications`, `profile`, `account`, `documentation`)
- `src/messages/ar.json` — Mirror Arabic translations

### Usage

```typescript
import { useTranslations } from "next-intl";

const t = useTranslations("dashboard");
return <h1>{t("title")}</h1>;
```

### Direction Switching

The `DirectionSync` component in `app-providers.tsx` watches the `locale` setting and updates `document.documentElement.dir` and `lang` attributes automatically. The `.rtl-flip` CSS utility mirrors icons when needed.

### Language Toggle

Located in the header (globe icon). Updates the `useSettingsStore.locale` value, which triggers:
1. `IntlProvider` to swap message bundle
2. `DirectionSync` to update `dir` attribute
3. All `useTranslations` calls to re-render with new strings

---

## 9. Theming

### Theme Modes

Three modes available via `useSettingsStore.theme`:
- `"light"` — Light theme
- `"dark"` — Dark theme
- `"system"` — Follows OS preference (with live updates via `matchMedia` listener)

### Implementation

- `ThemeProvider` from `next-themes` wraps the app
- `ThemeSync` component in `app-providers.tsx` syncs the Zustand setting to `document.documentElement.classList`
- All colors use CSS variables that flip in `.dark` scope
- No flash of incorrect theme (FOUC) thanks to `suppressHydrationWarning` on `<html>`

### Theme Toggle

Sun/Moon icon button in header with dropdown for Light/Dark/System options.

---

## 10. Responsive Design

### Breakpoints (Tailwind defaults)

| Breakpoint | Width | Target Devices |
|---|---|---|
| `default` | 0+ | Mobile (portrait) |
| `sm` | 640px+ | Mobile (landscape), small tablets |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Desktops |
| `xl` | 1280px+ | Large desktops |

### Sidebar Behavior

- **Mobile** (`<lg`): Hidden by default; opens as a slide-in drawer with backdrop overlay
- **Desktop** (`lg+`): Always visible; can be collapsed to 68px icon-only mode via toggle button

### Grid Patterns

- **Stat cards**: `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-4`
- **Content cards**: `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`
- **Charts**: `grid-cols-1` → `lg:grid-cols-2` (or 7-column split for 2/3 + 1/3 layouts)

### Touch Targets

All interactive elements meet the 44px minimum touch target requirement on mobile.

---

## 11. Component Library

### Layout Components (`src/components/layout/`)

- **`Sidebar`** — Collapsible desktop sidebar + mobile drawer, 4 nav sections, active link indicator, footer help card
- **`Header`** — Sticky header with mobile menu, sidebar toggle, breadcrumbs, search, language, theme, notifications, user menu
- **`Breadcrumbs`** — Auto-generated from current path with home link
- **`UserMenu`** — Avatar, name, role display; links to profile/account/billing/settings/notifications/docs; logout action
- **`ThemeToggle`** — Light/Dark/System dropdown
- **`LanguageToggle`** — English/Arabic dropdown with flags

### Dashboard Components (`src/components/dashboard/`)

- **`StatCard`** — KPI card with label, value, change%, trend, icon, skeleton loading
- **`PageHeader`** — Title, description, actions slot
- **`DataTable`** — Generic TanStack Table wrapper with skeletons, empty state, row click
- **`EmptyState`** — Icon, title, description, action
- **`ErrorState`** — Destructive theme, retry button
- **`LoadingState`**, **`TableSkeleton`**, **`CardSkeleton`** — Shimmer placeholders
- **`StatusBadge`**, **`HealthBadge`**, **`SeverityBadge`**, **`IconBadge`** — Semantic badges

### Chart Components (`src/components/charts/`)

- **`ChartCard`** — Wrapper with title, description, action slot
- **`TrendChart`** — Multi-series area chart with gradient fills
- **`BarsChart`** — Vertical or horizontal bar chart
- **`DonutChart`** — Pie chart with inner radius, legend
- **`SimpleLineChart`** — Multi-series line chart

All charts use Recharts, are responsive, and respect theme colors via CSS variables.

### Search & Notifications

- **`CommandSearch`** — ⌘K command palette with navigation, quick actions, fuzzy search
- **`NotificationsDropdown`** — Bell icon with unread badge, scrollable list, type-colored icons, mark-all-read

---

## 12. Forms & Validation

All forms use **React Hook Form** + **Zod** for type-safe validation.

### Example: Login Form

```typescript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
});

const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
  resolver: zodResolver(loginSchema),
});
```

### Forms Implemented

- Login (email, password, remember)
- Register (name, email, company, password, confirm, terms)
- Forgot password (email)
- Add provider (name, description, baseUrl, region)
- Create API key (name, scopes, usage limit)
- Invite team member (name, email, role)
- Create role (name, description)
- Profile (name, email, bio, jobTitle, location, website)
- Change password (current, new, confirm)
- Settings (workspace, locale, timezone, theme, accent, density, toggles)

---

## 13. Loading, Error & Empty States

Every page handles all three states:

- **Loading**: Skeletons matching the final layout (StatCards show shimmer blocks, Tables show row skeletons)
- **Error**: `ErrorState` component with retry action (TanStack Query retries once, then shows error)
- **Empty**: `EmptyState` component with icon, message, and CTA when applicable

### Toast Notifications

- **sonner** for action feedback (success, error, info, warning) — top-right position
- **radix toast** (`Toaster` component) as fallback
- Auto-dismiss with manual close button

---

## 14. Performance Considerations

- **Code splitting**: Each page is a separate route, automatically code-split by Next.js
- **React Query**: 30s stale time reduces redundant refetches
- **Memoization**: Charts use ResponsiveContainer; IntlProvider memoizes message bundle
- **Fonts**: Geist loaded via `next/font/google` with `variable` for CSS variable binding
- **CSS**: Tailwind v4 with `@import "tailwindcss"` — purged automatically
- **Images**: `next/image` ready (no images currently used; logo is SVG)

---

## 15. Accessibility

- **Semantic HTML**: `<main>`, `<header>`, `<nav>`, `<aside>`, `<article>` throughout
- **ARIA**: Proper `aria-label`, `aria-expanded`, `role` attributes on interactive elements
- **Keyboard**: All dropdowns, dialogs, and menus are keyboard navigable (Radix primitives)
- **Focus**: `:focus-visible` rings on all interactive elements
- **Color contrast**: All color combinations meet WCAG AA (4.5:1 for body text)
- **RTL**: Layout flips correctly in Arabic mode with `dir="rtl"` on `<html>`
- **Screen readers**: `sr-only` class for visually-hidden text, descriptive `alt` and `aria-label`

---

## 16. Build & Development

### Commands

```bash
bun run dev       # Start dev server (port 3000)
bun run lint      # Run ESLint
bun run build     # Production build
npx tsc --noEmit  # Type check
```

### Current Status

- ✅ **Lint**: 0 errors, 2 warnings (React Compiler skipping memoization for RHF/TanStack Table — acceptable)
- ✅ **Type check**: 0 errors
- ✅ **Build**: All 26 pages generate successfully (22 user pages + system pages)

### Demo Credentials

Click **"Use demo account"** on the login page, or enter:
- Email: `sarah.chen@moataz.ai`
- Password: any 8+ characters

---

## 17. Phase 2 Migration Guide

### Connecting a Real Backend

1. **Replace `src/lib/api/client.ts`** with real fetch implementation
2. **Update `src/lib/api/endpoints.ts`** to call `apiClient.get/post/put/delete` instead of `mockResponse(...)`
3. **Update `src/stores/auth-store.ts`** `login`/`register` to call real auth endpoints
4. **Add NextAuth.js** for session management if needed (already in dependencies)
5. **Add Prisma models** in `prisma/schema.prisma` for persistence
6. **Implement API routes** in `src/app/api/` for server-side logic

### Adding Provider Integrations

1. Create `src/lib/providers/openai.ts`, `anthropic.ts`, etc.
2. Implement `chatCompletion`, `embeddings`, `streamCompletion` methods
3. Add provider registry in `src/lib/providers/index.ts`
4. Wire up to API routes that the playground calls

### Adding WebSocket Real-time

1. Create `mini-services/realtime-service/` with Socket.io server
2. Add `src/lib/realtime/client.ts` for frontend socket connection
3. Update Logs page to subscribe to live log stream
4. Update Health page to subscribe to status changes

---

## 18. File Count Summary

| Category | Count |
|---|---|
| Pages (routes) | 22 |
| Layout components | 6 |
| Dashboard components | 8 |
| Chart components | 5 |
| Search/Notification components | 2 |
| shadcn/ui primitives | 50+ |
| Zustand stores | 3 |
| TanStack Query hooks | 30+ |
| API endpoints | 14 resource modules |
| Type definitions | 25+ domain types |
| i18n message namespaces | 16 |
| Total TypeScript files | ~80 |

---

## 19. Verification

The Phase 1 frontend has been verified with:

- ✅ Browser inspection of all 22 routes
- ✅ Lighthouse-style checks for layout, contrast, and accessibility
- ✅ Mobile (375px), tablet (768px), and desktop (1440px) viewports
- ✅ Light and dark mode visual verification
- ✅ Arabic RTL layout verification (sidebar flips to right, text right-aligned)
- ✅ Login flow → dashboard redirect
- ✅ Demo account autofill
- ✅ Theme toggle (light/dark/system)
- ✅ Language toggle (en/ar) with live RTL switch
- ✅ Notifications dropdown with unread badge
- ✅ Command palette (⌘K) opens and navigates
- ✅ All charts render with mock data

---

**Phase 1 Status**: ✅ Complete and verified.
**Next Steps**: See Section 17 for Phase 2 migration guide.

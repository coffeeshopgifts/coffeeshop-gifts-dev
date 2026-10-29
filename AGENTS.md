<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# waivio-pages-starter — agent rules

Standalone Next.js starter (not part of the [open-data-layer](https://github.com/Waiviogit/open-data-layer) Nx monorepo). Purpose: let anyone fork this repo and ship a **static GitHub Pages site** that reads data from **query-api** and signs/broadcasts Hive operations via **Hive Keychain** — without auth-api, without a backend, without a Node server at runtime.

Reference implementation patterns come from [open-data-layer `apps/web`](https://github.com/Waiviogit/open-data-layer/tree/main/apps/web), adapted for browser-only static export.

## What this app is for

| Goal | How |
|------|-----|
| Read Waivio/ODL data | Browser `fetch` → `{QUERY_API_URL}/query/v1/...` via `src/modules/query-api/` |
| Personalized reads | Connected Hive username sent as `X-Viewer` header |
| Write to chain | `window.hive_keychain.requestBroadcast` via `src/modules/wallet/` |
| Deploy | `pnpm build` → `out/` → GitHub Pages (see `.github/workflows/deploy.yml`) |
| Agent-assisted projects | Humans/agents extend this template; query-api MCP (`POST /query/mcp`) is documented in README, not wired here |

## Hard constraints (never violate)

This is a **static export** app. The following are **forbidden**:

| Forbidden | Why |
|-----------|-----|
| `output: 'standalone'` or any server runtime | Site is static files on GitHub Pages |
| Server Actions (`'use server'`) | No server to execute them |
| `src/app/api/**` route handlers | No API layer in this repo |
| `middleware.ts` / `proxy.ts` | No per-request server logic |
| SSR data fetching in Server Components | No runtime server; pages are pre-rendered at build |
| `next.revalidate`, `revalidateTag`, `router.refresh()` for data | No Next Data Cache / ISR |
| auth-api integration (challenge/verify, JWT cookies) | Auth is Keychain-only: connect username + broadcast |
| `import 'server-only'` | Everything runs in the browser |
| Direct `ioredis`, `@hiveio/dhive` in UI code | Keychain broadcasts; dhive only if you add explicit client-side chain reads |
| BFF proxy pattern (`fetch('/api/...')` → query-api) | Call query-api directly from the browser |

Allowed and required:

- `output: 'export'` in `next.config.ts`
- `images: { unoptimized: true }`
- `trailingSlash: true` (GitHub Pages friendly)
- `basePath` / `assetPrefix` from `NEXT_PUBLIC_BASE_PATH`
- `'use client'` for interactive routes and data fetching
- All deploy config via **`NEXT_PUBLIC_*`** (baked at build time)

## Stack

- **Next.js 16** App Router (`src/app/`)
- **React 19**
- **TypeScript** strict
- **Tailwind CSS 4** + semantic tokens in `src/styles/theme.css`
- **Zod** for env-shaped API boundaries
- **pnpm** package manager

## Configuration

Read runtime URLs only from `src/config/runtime.ts` (backed by `NEXT_PUBLIC_*`). Do not scatter `process.env` in feature modules.

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_QUERY_API_URL` | query-api origin (default `http://localhost:7000`) |
| `NEXT_PUBLIC_QUERY_API_VERSION` | URI version segment (default `1`) |
| `NEXT_PUBLIC_BASE_PATH` | GitHub project pages prefix, e.g. `/repo-name`; empty for user/org pages |
| `NEXT_PUBLIC_ODL_NETWORK` | ODL network id |
| `NEXT_PUBLIC_HIVE_CUSTOM_JSON_ID` | Hive `custom_json` id for ODL ops |

Document new keys in `.env.example`.

## query-api client

- Base path: `{NEXT_PUBLIC_QUERY_API_URL}/query/v{version}`
- Client: `src/modules/query-api/infrastructure/query-api.client.ts`
- Headers injected automatically: `Accept-Language`, `X-Locale`, `X-Viewer` (when wallet connected), optional `Authorization`, `X-Governance-Object-Id`
- Every response validated with Zod (`safeParse`); return `Result<T, QueryApiError>` — do not throw on expected HTTP/network failures
- Types: hand-maintained Zod schemas in `src/modules/query-api/domain/` (not codegen from OpenAPI)
- JWT-only endpoints (drafts, advanced/generated wallet reports): **out of scope** unless caller supplies `Authorization` explicitly

query-api must allow browser CORS including **`X-Viewer`** in `allowedHeaders` (see [open-data-layer `apps/query-api`](https://github.com/Waiviogit/open-data-layer/tree/main/apps/query-api)).

## Wallet / Keychain (no auth-api)

Login = **connect username** stored in `localStorage` + Keychain extension present. No challenge/verify, no cookies, no JWT session.

| Piece | Path |
|-------|------|
| Keychain types + `requestSignBuffer` | `modules/wallet/infrastructure/keychain-provider.ts` |
| Broadcast signer | `modules/wallet/infrastructure/keychain-signer.ts` |
| Posting vs Active key | `modules/wallet/infrastructure/hive-operation-signing.ts` |
| Op builders (vote, transfer, ODL `custom_json`, …) | `modules/wallet/hive-broadcast/` |
| Facade | `modules/wallet/infrastructure/wallet-facade.ts` |
| React context | `modules/wallet/presentation/wallet-provider.tsx` |

Flow: `build*Op(...)` → `useWallet().broadcast([op])` → `requestBroadcast` → show `transactionId`. After broadcast, **refetch client-side** (no server revalidation).

`required_posting_auths` on ODL ops must include the connected username.

## Project layout

```
src/
  app/                 # thin routes; prefer 'use client' for data/mutations
  components/          # AppProviders, SiteNav
  config/              # NEXT_PUBLIC_* getters
  i18n/                # client-only locale (no [locale] URL segment)
  modules/
    query-api/         # domain/ application/ infrastructure/ + index.ts barrel
    wallet/            # keychain + hive-broadcast + presentation/
  shared/              # Result<T,E>, safeFetch, useInfiniteScroll
  styles/              # theme.css design tokens
```

**Module rules** (ported from [open-data-layer `apps/web`](https://github.com/Waiviogit/open-data-layer/tree/main/apps/web)):

- `domain/` — types, Zod schemas, pure logic
- `application/` — query functions, mappers
- `infrastructure/` — fetch clients, Keychain adapters
- `presentation/` — React components and hooks
- `index.ts` — public barrel; cross-module imports only from barrels

Controllers/route files must not contain business logic.

## i18n

Custom client i18n (not `next-intl`). Catalogs: `src/i18n/locales/*.json`.

- **Strict UTF-8, no BOM**, valid JSON
- Locale is **not** a URL segment — no `[locale]` routing
- Resolve locale client-side (`localStorage` + `navigator.language`) via `src/i18n/runtime/client-locale.ts`
- `I18nProvider` + `useI18n().t(key)`; RTL via `isRtl()` → `dir` on `<html>`
- Add new keys to **all** locale files in the same change

## Styling

- Token source: `src/styles/theme.css` (`[data-theme]` CSS variables)
- Use semantic utilities from `globals.css` (`bg-bg`, `text-fg`, `rounded-btn`, `px-gutter`, …)
- Avoid raw Tailwind scale colors when a semantic token exists

## Data fetching & mutations

| Do | Don't |
|----|-------|
| `useState` + `useEffect` / event handlers for loads | RSC `async` pages that fetch query-api |
| `queryApiFetch` + Zod parse | Raw `fetch` without validation |
| `Result<T,E>` for outcomes | Throw to UI on network errors |
| `useInfiniteScroll` for paginated feeds | Server-seeded list state without client sync |
| Zod-validate forms before `build*Op` | Broadcast unvalidated user input |

## Hydration

- Nav `<Link>` elements: `suppressHydrationWarning` (Keychain/password managers inject DOM attrs)
- Do not use `suppressHydrationWarning` to hide real app bugs
- Client-only values (`localStorage`, Keychain): lazy `useState` initializers, not sync `setState` in `useEffect` on mount

## Verification

Before considering a change done:

```bash
pnpm typecheck
pnpm lint
pnpm build    # must produce out/ with static routes only
```

Confirm no new `'use server'`, `app/api/`, or `middleware` files.

## What not to port from [open-data-layer `apps/web`](https://github.com/Waiviogit/open-data-layer/tree/main/apps/web)

- Server-side `queryApiFetch` + Next cache tags
- BFF `/api/*` routes and cookie JWT auth
- `proxy.ts` session refresh
- `router.refresh()` / `refreshAfterBroadcast` / WS trx confirmation
- Server locale cookies (`setCookieLocale` action)
- `generateMetadata` with live query-api fetches (static metadata only unless build-time data is acceptable)

## Dependencies

- Add packages with `pnpm add` at project root only
- Do not add `axios` — use `fetch`
- Do not add auth-api client or hivesigner unless explicitly extending beyond Keychain-only scope
- Keep `hive-broadcast` self-contained under `modules/wallet/hive-broadcast/` (no `@opden-data-layer/*` workspace imports from [open-data-layer](https://github.com/Waiviogit/open-data-layer); copy/adapt sources when syncing)

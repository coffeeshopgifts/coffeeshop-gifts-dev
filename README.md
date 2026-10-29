# Waivio Pages Starter

Static [Next.js](https://nextjs.org/) starter kit for building GitHub Pages sites on top of **[query-api](https://github.com/Waiviogit/open-data-layer)** ([open-data-layer](https://github.com/Waiviogit/open-data-layer)), with **Hive Keychain** for blockchain broadcasts — no auth-api, no server.

Backend monorepo: [github.com/Waiviogit/open-data-layer](https://github.com/Waiviogit/open-data-layer) — NestJS apps (`query-api`, `auth-api`, `chain-indexer`, …), shared libs (`hive-broadcast`, …), and reference web UI (`apps/web`). This starter is a **standalone fork-friendly template**; run query-api from that repo (or your own deployment) and point `NEXT_PUBLIC_QUERY_API_URL` at it.

## Features

- `output: "export"` — deployable to GitHub Pages (`out/`)
- Typed **query-api** browser client (Zod-validated responses)
- **Hive Keychain** connect + broadcast (vote, transfer, ODL `custom_json`)
- Curated **hive-broadcast** operation builders (ported from [open-data-layer](https://github.com/Waiviogit/open-data-layer))
- Clean-arch module layout, `Result<T,E>`, `useInfiniteScroll`, client i18n (en-US + ar-SA)

## What is intentionally excluded

No server actions, `app/api` routes, middleware, SSR data fetching, or runtime revalidation. JWT-only query-api endpoints (drafts, advanced wallet reports) are not wired — bring your own token if needed.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Point `NEXT_PUBLIC_QUERY_API_URL` at a running query-api (default `http://localhost:7000`).

Install [Hive Keychain](https://hive-keychain.com/) to connect and broadcast.

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_QUERY_API_URL` | query-api origin, no trailing slash |
| `NEXT_PUBLIC_QUERY_API_VERSION` | API version segment (default `1`) |
| `NEXT_PUBLIC_BASE_PATH` | GitHub project pages base path, e.g. `/waivio-pages-starter` |
| `NEXT_PUBLIC_ODL_NETWORK` | ODL network id |
| `NEXT_PUBLIC_HIVE_CUSTOM_JSON_ID` | Hive `custom_json` id for ODL ops |

## GitHub Pages

1. Enable **Pages** → source: **GitHub Actions**
2. Set repository variables (optional): `QUERY_API_URL`, `ODL_NETWORK`, `HIVE_CUSTOM_JSON_ID`
3. Push to `main` — workflow builds `out/` and deploys

For **user/org** pages (`username.github.io`), leave `NEXT_PUBLIC_BASE_PATH` empty in `.env.local`. For **project** pages, set it to `/repo-name` (the workflow sets this automatically).

## query-api CORS

Browser calls need query-api CORS to allow:

- `Accept-Language`, `X-Locale`, `Authorization`, `X-Governance-Object-Id`
- **`X-Viewer`** — required for personalized reads (`is_following`, etc.)

The [open-data-layer](https://github.com/Waiviogit/open-data-layer) `query-api` includes `X-Viewer` in `allowedHeaders`. If you run your own query-api, add it there.

## Project structure

```
src/
  app/              # thin routes (client components)
  components/       # app shell providers, nav
  config/           # NEXT_PUBLIC_* getters
  i18n/             # client locale + catalogs
  modules/
    query-api/      # typed fetch client + queries
    wallet/         # keychain + hive-broadcast
  shared/           # Result, safeFetch, useInfiniteScroll
  styles/           # design tokens
```

## Extending for agents

[open-data-layer](https://github.com/Waiviogit/open-data-layer) `query-api` exposes MCP at `POST /query/mcp` (no `/v1`). Agents can discover tools via the MCP catalog; this starter focuses on **human-facing static UI** that calls the REST API from the browser.

To add features:

1. Copy/adapt Zod schemas into `src/modules/query-api/domain/`
2. Add query functions in `application/queries/`
3. Build UI in `src/app/` or new module `presentation/` components

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Static export to `out/` |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |

## License

MIT — see [LICENSE](LICENSE).

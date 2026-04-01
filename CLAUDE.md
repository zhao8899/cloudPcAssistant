# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloud PC Assistant — a UniApp (Vue 3) client for cloud PC user flows, targeting **desktop (Electron + H5)** only. The mobile/WeChat Mini Program targets have been removed; the app now runs as an Electron shell wrapping a Vite-built H5 SPA.

## Build & Development Commands

Requires Node.js >= 18.

```bash
# Install dependencies (root + desktop)
npm install --legacy-peer-deps
cd desktop && npm install && cd ..

# Dev: H5 web frontend only (Vite dev server)
npm run dev:desktop:web

# Build H5 frontend, then launch Electron in dev mode
npm run desktop:dev

# Build H5 frontend + package Windows NSIS installer
npm run desktop:dist

# Type-check
npm run typecheck
```

Interactive helper script: `node scripts/develop.js` — prompts to run `dev:desktop:web`.

No automated test framework is configured. Validate changes manually.

## Architecture

### Two-layer structure: Vue frontend + Electron shell

**Frontend (`src/`)** — UniApp/Vue 3 SPA built with Vite (`vite.config.cjs`). Uses `@dcloudio/vite-plugin-uni` and `unplugin-uni-router`. The `@` alias maps to `src/`.

- **Entry:** `src/main.ts` → creates SSR app with plugins, router, mixins
- **Pages:** declared in `src/pages.json`; implementations in `src/pages/` (main package) and `src/packages/pages/` (sub-package)
- **Router:** `src/router/index.ts` — `uniapp-router-next`; guards handle auth redirects and desktop home rerouting
- **State:** Pinia stores in `src/stores/` (user, app, theme, affiliate)
- **API:** domain-grouped in `src/api/` (user, cloud, pay, shop, news, etc.)
- **Config:** `src/config/index.ts` — base URL, version, timeout; env vars from `.env.development` / `.env.production` (`VITE_APP_BASE_URL`)
- **Plugins:** auto-loaded from `src/plugins/modules/` (pinia, uview, vconsole)
- **UI library:** `vk-uview-ui` bundled in `src/uni_modules/`
- **Easycom:** widget components auto-resolved from `src/components/widgets/` via `^w-(.*)` pattern

**Electron shell (`desktop/`)** — separate `package.json`. `main.js` creates a tray app with two windows:
- **Main window** (480×620): the primary workbench
- **Reminder window** (320×220): always-on-top popup, hides on blur

Communication between Electron and the frontend uses `preload.js` which exposes `window.desktopBridge` (see `src/utils/desktop.ts` for the renderer-side API). IPC channels: `desktop:get-context`, `desktop:open-external`, `desktop:navigate`, `desktop:show-reminder`, `desktop:hide-reminder`, `desktop:reload`.

In production, Electron serves the built H5 files via a local HTTP server (random port on 127.0.0.1). In dev, set `FRONTEND_DEV_URL` env var to point at the Vite dev server.

### Desktop detection & routing

`isDesktopClient()` checks `window.desktopBridge.isDesktop`. The router guard redirects `/pages/index/index` → `/pages/desktop/home` when running in Electron. Desktop-specific pages: `pages/desktop/home` and `pages/desktop/reminder`.

## Coding Conventions

- 4-space indentation, no semicolons, single quotes
- `<script setup>` with Vue 3 Composition API
- PascalCase for component modules, camelCase for functions/composables, kebab-case for page directories
- API modules grouped by domain (`src/api/cloud.ts`, `src/api/user.ts`)
- TypeScript with `strict: false`

## CI/CD

GitHub Actions workflow (`.github/workflows/windows-desktop.yml`): builds H5 then packages Windows NSIS installer on push to main. Artifacts uploaded as `desktop-installer`.

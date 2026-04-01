# Repository Guidelines

## Project Structure & Module Organization
This repository is a UniApp/Vue 3 client focused on cloud PC user flows. Main application code lives in `src/`. Page entry points are declared in `src/pages.json`, with screen implementations under `src/pages/` and `src/packages/pages/`. Shared UI lives in `src/components/`, API wrappers in `src/api/`, state stores in `src/stores/`, routing in `src/router/`, and cross-cutting utilities in `src/utils/`. Static assets are kept in `src/static/`. Local helper scripts for development and release live in `scripts/`.

## Build, Test, and Development Commands
Use Node.js `>=16.16.0`; both `scripts/develop.js` and `scripts/publish.js` enforce that baseline.

- `node scripts/develop.js`: prompts to run `dev:desktop:web` (H5 frontend Vite dev server).
- `node scripts/publish.js`: prompts to run `build:desktop:web` (production H5 build).
- `node scripts/release.mjs`: copies `dist/build/h5` into `../server/public/mobile` after an H5 build.

These wrappers assume the missing project-level `package.json` defines the underlying npm scripts. Verify those scripts before changing the release flow.

## Coding Style & Naming Conventions
Follow the existing code style: 4-space indentation in TypeScript and Vue `<script setup>` blocks, semicolon-free statements, and single quotes. Use `PascalCase` for component-style modules, `camelCase` for functions and composables, and kebab-case for page and component directory names such as `pages/cloud/order-detail.vue`. Keep API modules grouped by domain (`src/api/user.ts`, `src/api/cloud.ts`) and prefer small focused utilities over large mixed helpers.

## Testing Guidelines
No automated test framework is checked into this workspace snapshot. Until one is added, validate changes with targeted manual checks in both H5 and WeChat Mini Program flows, especially login, payment, and cloud resource pages. If you add tests later, place them beside the feature or under a dedicated `tests/` directory and mirror the source module name.

## Commit & Pull Request Guidelines
Git history is not included in this snapshot, so no repository-specific commit convention can be confirmed. Use short imperative commit subjects such as `fix payment callback parsing` and keep each commit scoped to one change. Pull requests should include: a clear summary, affected pages/modules, manual verification steps, and screenshots for UI changes. Call out config or release-path changes explicitly.

## Security & Configuration Tips
Treat `.env.development` and `.env.production` as deployment inputs, not places for hardcoded secrets in source. Review `src/utils/env.ts`, request middleware, and payment helpers before changing endpoints, auth, or callback handling.

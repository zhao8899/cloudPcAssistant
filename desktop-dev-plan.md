# Desktop Refactor Notes

## Goal

Keep the current UniApp business frontend and backend APIs unchanged, then wrap the H5 build with a desktop shell for Windows installation and daily use.

## Delivered Direction

- Existing API modules under `src/api/` remain the data source.
- Existing env files `.env.development` and `.env.production` remain the request base configuration.
- Desktop foreground is reduced to:
  - main desktop workbench
  - reminders/status surface
  - shortcuts into existing resource, order, notification, and support pages
- Low-frequency or detailed workflows stay in the original pages.

## Implemented Pieces

- `desktop/` Electron shell with:
  - secure `preload` bridge
  - `contextIsolation: true`
  - blocked uncontrolled `window.open`
  - external links opened only by the main process
  - tray entry points
  - Windows installer config via `electron-builder`
- `src/pages/desktop/home.vue` as the desktop workbench.
- Desktop runtime detection in `src/utils/desktop.ts`.
- H5-only gate bypass in desktop mode inside `src/App.vue`.

## Remaining Validation

The current workspace snapshot does not include the root `package.json`, so the full build chain could not be executed here. In the complete repo, validate:

1. H5 production build output exists at `dist/build/h5`
2. `desktop/npm install`
3. `desktop/npm run dist`
4. Install the generated Windows package and verify:
   - login flow
   - resource list/detail
   - renew flow
   - notification read flow
   - external support links

## CLI Notes

- The root CLI toolchain is now restored with `package.json`, `vite.config.ts`, `tsconfig.json`, Tailwind/PostCSS config, and a Windows GitHub Actions workflow.
- Because `unplugin-uni-router@1.2.7` still declares a `vite@^4` peer while the current DCloud Vite plugin expects `vite@5.2.8`, root installation should use `npm install --legacy-peer-deps`.

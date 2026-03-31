# Desktop Build

This directory contains the Electron shell for the desktop installer.

## Workflow

1. Build the existing UniApp H5 frontend into `../dist/build/h5`.
2. Install desktop dependencies: `cd desktop && npm install`
3. Start the shell against the local build: `npm run start`
4. Build a Windows installer: `npm run dist`

The tray menu opens both the main workbench and the lightweight reminder window.
The reminder window now loads the frontend route `/pages/desktop/reminder`, so it shares the same login state and refreshes cloud status automatically.

If the parent project exposes `build:h5`, you can run `npm run dist:all` to build the H5 bundle and the desktop installer in one step.

## Development

For local frontend dev servers, set `FRONTEND_DEV_URL` before launching Electron.

Example:

```powershell
$env:FRONTEND_DEV_URL = "http://127.0.0.1:5173"
npm run dev
```

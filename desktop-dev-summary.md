# Desktop Client Development Summary

## Purpose

This document summarizes reusable experience from building a lightweight desktop client for transactional user workflows such as ordering, renewal reminders, order follow-up, and support communication.

It is intentionally written as general guidance for engineers building similar desktop applications, especially with Electron or comparable desktop shells.

## 1. Product Positioning

The first design decision is not technical. It is deciding what the desktop client is for.

A user-facing desktop client should not become a reduced copy of an admin console. Its role is usually one of the following:

- Provide fast access to a few high-frequency actions
- Surface urgent reminders
- Shorten the path to support or resolution
- Keep users aware of state changes without requiring them to open a browser

If the product is intended for end users, the desktop client should optimize for:

- low cognitive load
- short interaction paths
- clear status
- stable entry points

It should not optimize for:

- exposing every backend capability
- reproducing internal management systems
- embedding large volumes of settings and operational logic in the client

## 2. Define the Foreground Surface

Most desktop clients work best when the foreground surface is extremely small.

In practice, keep only:

- the main task entry point
- the most time-sensitive reminder
- the order or status follow-up path
- the support or escalation path

Everything else should be challenged.

Useful rule:

If a feature is low-frequency, internal, configurable, or explainable only with a paragraph, it probably does not belong in the primary desktop UI.

Recommended desktop information hierarchy:

1. Actions
2. Current status
3. Short operational hints
4. Everything else behind backend configuration or omitted entirely

## 3. Prefer Backend Configuration Over Frontend Branching

One of the most common failure modes in desktop projects is allowing the frontend to become the place where product rules accumulate.

Typical examples:

- hardcoded support channels
- hardcoded buy and renew links
- hardcoded order help flows
- frontend flags for operational states
- environment-specific business rules embedded in components

A better pattern is backend-configured UI behavior.

The frontend should receive configuration such as:

- purchase URL
- renewal URL
- order help URL
- support title
- support description
- support channel list
- optional UI toggles that affect presentation only

This has several benefits:

- reduces release coupling between frontend and operations
- avoids duplicating rules across platforms
- keeps the desktop client lightweight
- allows business-side iteration without repeated client redeployments

General principle:

The frontend should render actions. The backend should decide what those actions are.

## 4. Use Aggregated APIs for Desktop Clients

Desktop clients should prefer aggregated responses over many stitched requests.

Recommended pattern:

- one overview endpoint for initial render
- optional fallback endpoints for resources, orders, or config

Why:

- fewer requests during startup
- fewer partial-loading edge cases
- simpler state management
- easier offline/error fallback handling
- clearer contract for client teams

A good overview payload usually contains:

- user summary
- resource summary
- order summary
- reminders or notices
- frontend config

When the client must make many separate requests to assemble a single screen, complexity grows quickly and usually produces weaker UX.

## 5. Keep Desktop UX Short and Literal

Desktop UI copy should be direct.

Prefer:

- "Buy"
- "Renew"
- "Pending payment"
- "Contact support"
- "Sync failed"

Avoid:

- explanatory marketing phrases
- design-rationale copy
- descriptive paragraphs above every action
- "friendly" text that slows scanning

General rule:

Buttons should express actions.
Labels should express states.
Hints should only exist when they unblock the next step.

If a sentence does not help the user decide what to do next, remove it.

## 6. Treat the Floating Widget as a Reminder Surface

If the application includes a floating widget, it should be treated as a reminder surface, not a full application shell.

A good widget usually contains:

- one concise status
- one primary reminder
- one return-to-main action
- one exit or dismiss action

It should not contain:

- multiple flows
- multi-step forms
- configuration panels
- dense text

When reducing widget size, adjust in this order:

1. spacing
2. icon size
3. button size
4. corner radius
5. text size

Do not shrink all dimensions aggressively at once or readability will collapse.

## 6.1 UI Style Guidelines for Desktop Clients

Desktop UI should feel stable, light, and intentionally restrained.

The goal is not to maximize visual expression. The goal is to make frequent actions fast to scan and hard to misunderstand.

### Visual tone

Recommended visual characteristics:

- soft but not decorative
- lightweight but not sparse to the point of fragility
- clear contrast between background, action, and status
- quiet surfaces with one or two visual emphasis levels

Avoid:

- too many competing accent colors
- oversized hero-style typography
- large decorative sections that push actions below the fold
- mobile-app style density that feels oversized on desktop

### Layout structure

A strong desktop layout usually has:

- a compact header
- a very small primary navigation area
- one dominant content panel
- one secondary panel for status or recent items

This creates a predictable scan path:

1. confirm context
2. choose action
3. check status
4. resolve issue

Recommended rules:

- keep top-level sections shallow
- make primary actions visible without scrolling when possible
- treat side panels as supporting information, not parallel workflows

### Typography

Desktop typography should optimize for scan speed.

Recommended approach:

- one clear heading size for section entry
- one medium size for card titles
- one small size for labels and metadata
- one restrained caption style for low-priority information

Use short labels and avoid verbose subheadings.

If a heading requires explanation text underneath to become clear, the heading is usually too vague.

### Spacing and density

Desktop clients benefit from medium density, not mobile density.

Useful guidance:

- use enough spacing to separate action groups clearly
- avoid oversized padding that makes the app feel slower than it is
- keep card spacing consistent across the entire app
- use smaller internal spacing in widgets than in the main window

The UI should feel compact enough for repeated use, but not cramped.

### Card design

Cards work well in desktop transactional apps when they represent:

- a single action
- a single status group
- a single recent record

Each card should answer one question only:

- what can I do?
- what needs attention?
- what happened recently?

Avoid cards that mix:

- action
- explanation
- support guidance
- configuration detail

in the same block.

### Button hierarchy

Desktop transactional UIs should have a strict button hierarchy.

Recommended hierarchy:

- primary: the next action the user should take
- secondary: navigation to another core flow
- tertiary: utility controls such as refresh or close

Useful rules:

- use one dominant primary action per block
- do not place multiple equally strong primary buttons side by side unless they are true peers
- keep utility controls visually quieter than business actions

### Color usage

Color should communicate structure and state, not decoration.

A practical color model:

- neutral surfaces for most layout
- one accent color for primary actions
- one warning color for expiring or blocked items
- one danger color for destructive or quit actions

This keeps the interface readable even in small desktop surfaces such as widgets and tray-related windows.

### Status presentation

Urgent states should stand out through:

- concise text
- subtle color grouping
- placement near the top of the relevant panel

Do not rely on color alone.

For example:

- "Pending payment"
- "Expiring soon"
- "Sync failed"
- "No support channel configured"

These are better than generic badges with no operational meaning.

### Error presentation

Desktop error UI should be clear and recoverable.

Recommended structure:

- one short error title
- one short actionable explanation
- one retry or next-step path

Avoid large warning blocks filled with technical detail unless the screen is intended for developers.

### Widget-specific style rules

Floating widgets should follow stricter style rules than the main window.

Recommended widget design:

- smaller corner radius than the main window, but still rounded
- tighter horizontal and vertical padding
- only one text hierarchy break
- icon and action buttons scaled down proportionally
- no large paragraphs, no stacked metadata, no multi-row controls

The widget should read almost like a single sentence plus two actions.

### Copy and visual balance

One of the most important UI refinements in desktop projects is removing descriptive text after the layout is stable.

Useful rule:

First design with explanatory text if needed.
Then remove every sentence that does not improve the next action.

This usually improves:

- visual balance
- scan speed
- perceived simplicity
- trust

### Recommended style baseline

For general desktop clients, this baseline works well:

- light neutral background
- white or near-white content surfaces
- restrained shadow depth
- strong but simple rounded geometry
- compact header
- icon-led actions
- minimal top-level tabs
- medium-density cards
- short labels and short statuses

This baseline is easier to maintain than highly thematic UI and works well across order, account, reminder, and support workflows.

## 7. Separate Main Window, Widget, and Tray Responsibilities

For desktop clients, these three surfaces should have clearly different responsibilities.

Main window:

- primary workflow
- overview
- order handling
- support entry

Floating widget:

- reminder
- lightweight status
- quick return to main window

Tray:

- stable recovery path
- open app
- jump to one or two core sections
- quit

The tray should reflect the real product structure. If the product has only three meaningful sections, the tray should not expose eight actions.

## 8. Electron Security Must Be Designed, Not Added Later

In Electron-style apps, the desktop shell is part of the application boundary, not just transport.

Baseline rules:

- keep `contextIsolation: true`
- use a narrow `preload` bridge
- whitelist IPC channels
- deny uncontrolled navigation
- deny uncontrolled `window.open`
- open external links only through the main process
- never expose secrets to the renderer

Recommended principle:

Renderer code should behave like an untrusted presentation layer. Give it only the minimum set of actions it actually needs.

## 9. Frontend Should Be Thin

A desktop client is healthier when it is mostly:

- rendering
- simple state mapping
- action dispatch
- error display

It becomes unhealthy when it starts owning:

- business routing logic
- environment policy
- support channel logic
- operational thresholds
- high-volume fallback rules

Thin clients are easier to:

- test
- migrate
- redesign
- secure
- coordinate with backend teams

## 10. Design for Failure States Early

Desktop applications are judged heavily by how they behave when data is missing or stale.

Useful failure-state rules:

- show one clear error message
- keep the existing screen context
- provide a retry path
- avoid modal-heavy error handling
- do not expose developer-only error text to end users in production

Development-friendly errors such as missing env vars are useful during local work, but should not be the final user-facing language.

## 11. Keep Build and Packaging in the Main Loop

For desktop projects, "it builds in the browser" is not enough.

A complete engineering loop should include:

- type check
- frontend build
- main/preload build
- packaging
- installable artifact validation

This matters because many issues only appear after:

- minification
- preload compilation
- packaging
- Windows installer generation

Recommended minimum verification after structural change:

- lint or typecheck
- production compile
- desktop package build

## 12. Reduce Tooling Noise

Modern frontend tooling can accidentally pull unrelated files into the build process.

Examples:

- style scanners picking up markdown examples
- config-driven build tools scanning docs or generated content
- warnings caused by repository text rather than product code

Guidance:

- restrict scanning to actual app sources
- do not ignore warnings without understanding them
- treat build cleanliness as part of product quality

## 13. Write for Operational Adaptability

A strong desktop client can stay stable while the business changes around it.

To support that:

- keep channels configurable
- keep URLs configurable
- keep labels configurable where product ownership requires it
- avoid coupling releases to routine operational changes

This reduces the number of times engineering has to ship a new desktop package for simple business updates.

## 14. Recommended Delivery Process

For similar projects, use this order:

1. Define the client’s user role
2. Identify the 3 to 4 foreground actions
3. Design the aggregated API contract
4. Decide which behaviors come from backend config
5. Build the secure desktop shell boundary
6. Implement the minimal UI
7. Add widget and tray
8. Verify with packaging, not only local preview
9. Remove explanatory UI text until only necessary copy remains

Do not start by designing many pages. That usually locks in unnecessary complexity.

## 15. Review Checklist for Similar Projects

Use this checklist during implementation or review.

### Product

- Is the client focused on a small number of high-frequency actions?
- Are low-frequency or internal features omitted?
- Is the copy direct and operational rather than descriptive?

### API

- Is there a stable overview endpoint?
- Does backend config drive external actions and channel selection?
- Are fallback defaults safe and explicit?

### Frontend

- Is the UI mostly rendering and dispatch?
- Are business rules kept out of components where possible?
- Are empty, loading, and error states usable?

### Desktop shell

- Is IPC whitelisted?
- Are navigation and external openings controlled?
- Are tray and widget responsibilities narrow and clear?

### Delivery

- Does the project pass typecheck?
- Does it compile for production?
- Does it package successfully?
- Has the installable artifact been tested?

## 16. Reusable Team Principles

These principles can be adopted as a team standard for future desktop projects:

- Keep user-facing desktop surfaces small
- Push configuration to backend systems
- Prefer aggregated APIs
- Treat Electron boundaries as security boundaries
- Build lightweight frontends, not mini backoffices
- Verify with packaging, not just local rendering
- Remove explanatory copy until only action and status remain

## Closing Note

The most successful desktop client projects are usually not the most feature-rich ones. They are the ones that stay disciplined about purpose.

If the client makes the common path faster, keeps urgent issues visible, and provides a clean path to resolution, it is doing its job.

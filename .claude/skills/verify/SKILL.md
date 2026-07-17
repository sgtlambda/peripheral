---
name: verify
description: Build, launch, and drive the peripheral game in headless Chromium to verify changes at runtime
---

# Verifying peripheral

Browser game (Vite + matter-js), surface is the canvas at `/`.

## Build

```bash
bun run build        # tsc --noEmit && vite build
```

## Launch

```bash
bun run dev --port 5199 --strictPort   # background it; 200 on http://localhost:5199/
```

## Drive (headless Chromium via playwright-core)

Playwright browsers are cached at `~/Library/Caches/ms-playwright/chromium-*/chrome-mac/Chromium.app/Contents/MacOS/Chromium`.
`bun add playwright-core` in a scratch dir, `chromium.launch({executablePath, headless: true})`, then drive the canvas:

- Mouse move aims; `mouse.down()/up()` fires the active item (slot 1 laser is continuous-fire).
- Keys `1`-`8` select inventory slots, `q` drop, `e` take, `t` throw, `/` NPC prompt (blocking `window.prompt`; avoid headless).
- Plasma grenade flow: press `4`, then `t`; ttl 3000ms, then explosion + terrain crater + slow-mo (~0.8s) + camera shake.
- Debug handles: `window.audioManager`, `window.lastStop`, `window.debugDrawGlobal`.
- Capture `page.on('console')` + `pageerror`; screenshot before/during/after effects.

## Gotchas

- Expected benign console noise: `setNpcs called before it was initialized`, one 404, autoplay `NotAllowedError` for background music (no user gesture in headless).
- Dropped items have a 1000ms pickup cooldown; wait before pressing `e`.
- Player/NPCs render as small red debug circles; terrain is white, background black.

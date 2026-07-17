# Review items

Remaining findings from the stability/architecture review. Roughly ordered by priority within each section.

## Security / correctness

- **OpenAI key ships to the browser.** `dangerouslyAllowBrowser` + `VITE_OPENAI_API_KEY` exposes the key to every player. Put a small proxy endpoint in front before any public deploy.
- **`window.prompt` NPC dialogue blocks the loop.** The prompt freezes the whole game mid-frame. Route dialogue input through the existing React overlay (`NpcDialogOverlay`) instead.
- **Missing sound assets.** `soundEffectPaths` references `/sounds/impact.mp3` and `/sounds/throw.mp3`, which don't exist in `public/`; this is the 404 in the console. Add the files or drop the entries.
- **`setNpcs called before it was initialized`.** The NPC observer fires before React mounts. Harmless, but add a guard or defer the observer until the UI is ready.

## Design / architecture

- **Input recording for replays.** Inputs now enter the sim only at step boundaries; recording `(tick, commands/keys/mouse)` plus the stage seed would enable full deterministic replay. `keysOn` and `gameMouse` still need per-tick capture.
- **Aim is affected by camera shake.** Shaken camera bounds feed into `gameMouse` and therefore `aimAngle`. Consider computing aim from unshaken bounds so shake stays purely cosmetic.
- **Forces aren't delta-scaled.** `Player.step` applies forces per tick (existing TODO). Fine with matter's fixed timestep, but make the assumption explicit or scale by delta.
- **Intents should own their behavior.** `PlayerActions.triggerPrimary` still switches on intent symbols (its own TODO). Give each intent an `execute(ctx)` and delete the switch.
- **NPC scenario as per-stage data.** `sceneContext.ts` is one giant repeated-sentence string with the hostage scenario baked in globally. Make `{prompt, tags, tag → systemEvent}` a per-stage object; that shape makes tag-mismatch bugs impossible.
- **More events on the bus.** Gun and laser still call `cameraShakeStack.add` directly. An `impact`/`shot` event would let impact sounds and particles attach without touching the weapon code.

## Hygiene

- **ESLint lints nothing.** The script is `eslint ./*.js`, which matches no source files. Point it at `src/` with typescript-eslint.
- **No tests.** `PlayerState`, `SimClock`, `CameraShakeStack`, `GameEventBus`, and `nom()` are pure-ish and trivially unit-testable; a handful of Vitest specs would lock in the refactor.
- **Audio: use Web Audio, start on gesture.** `new Audio()` per shot churns GC with no concurrency cap, and background music should start on the first user interaction (autoplay TODO in `game.ts`).
- **Dead code.** The ~50-line commented raycast block in `gun.ts:25-74` and the unused `banana.ts` item: delete both, git remembers.
- **Camera definite-assignment assertions.** `width!`/`height!` could go away by having `updateBounds` return the computed values and assigning them in the constructor.

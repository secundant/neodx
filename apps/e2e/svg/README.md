# E2E SVG Sprite Visual Regression

Playwright visual regression for `@neodx/svg` sprite rendering in a Vite + React app.

## Suite (actual)

| Path                    | Role                                                    |
| ----------------------- | ------------------------------------------------------- |
| `src/`                  | React demo app that mounts icons from generated sprites |
| `src/assets/**/*.svg`   | Source icons                                            |
| `public/sprites/`       | Generated sprite output (via Vite / `@neodx/svg`)       |
| `tests/svg-e2e.test.ts` | Single Chromium visual snapshot (`sprites-e2e.png`)     |
| `playwright.config.ts`  | Static servers on `25000` (app) and `25001` (CORS)      |
| `playwright.setup.mjs`  | Runs Vite build before tests                            |
| `static-server.cjs`     | Serves `dist/` with CORS headers                        |

There is **one** Playwright test today: open `http://localhost:25000/index.html`, wait for sprites, pause SVG animations, and snapshot `body`.

## Commands

From the repo root (Yarn 4 workspace):

```sh
yarn
yarn pack:libs
cd apps/e2e/svg && vp build
yarn workspace @neodx/e2e-svg exec playwright install chromium
yarn workspace @neodx/e2e-svg e2e
```

Pack all publishable libs (not only svg): packed `@neodx/svg` resolves workspace
deps to `dist/`, and `vp run -t @neodx/svg#pack` can self-cycle on vite-plus 0.2.7.

Or from `apps/e2e/svg` after svg is packed:

```sh
vp build
yarn e2e
```

## CI

The `e2e-svg` job in `.github/workflows/ci.yaml` installs Chromium, builds the app, and runs Playwright.

If a test flakes, quarantine it with a **named GitHub issue** — do not silent-skip.

## Updating baselines

After intentional visual changes:

```sh
yarn workspace @neodx/e2e-svg exec playwright test --update-snapshots
```

Commit the updated files under `tests/svg-e2e.test.ts-snapshots/`.

# E2E SVG Sprite Visual Regression

Robust, Playwright-powered E2E and visual regression testing for SVG sprite scenarios.

## Workflow

1. **Add SVGs:** Place icons in `assets/icons/`.
2. **Build Sprite:** Generate `public/sprites/sprite.svg`.
3. **Serve:** Start static server(s) for HTML and CORS.
4. **Test:** Run Playwright E2E tests for all scenarios.

## Scenarios

- **Inlined Sprite:** Sprite SVG is fetched and injected into the DOM.
- **External Sprite:** Icons reference the sprite via `<use href="/sprites/sprite.svg#icon-id" />`.
- **CORS Sprite:** Sprite is fetched cross-origin and inlined.

## Demo Structure

Each HTML demo (`/public/sprites-*.html`) renders:

- Original icons
- Color variations
- Size variations

## Tests

- Assert all icons are visible.
- Take screenshots for visual regression.
- Compare output to baselines.

## Notes

- No accessibility or internal SVG structure checks.
- All tests and demos are minimal, visual, and scenario-focused.

- **How it works:**
  - References the sprite externally: `<svg><use href="/sprites/sprite.svg#icon-id" /></svg>`.
  - Sprite is not inlined in the DOM.
- **Test:** Visual regression — screenshot of all icons, compared to baseline.

### c. **CORS Sprite (Cross-Origin)**

- **Fixture:** `fixtures/sprites-cors.html`
- **How it works:**
  - Fetches the sprite from `http://localhost:25001/sprites/sprite.svg` (different origin, CORS enabled) and inlines it.
- **Test:** Visual regression — screenshot of all icons, compared to baseline.

---

## 4. Playwright E2E & Visual Regression

- Each scenario has a corresponding test in `tests/`:

  - `sprites-inlined.test.ts` — Visual regression for inlined sprite
  - `sprites-external.test.ts` — Visual regression for external sprite
  - `sprites-cors.test.ts` — Visual regression for CORS/inlined sprite

- **All tests follow this pattern:**

  - Navigate to the relevant fixture page
  - Wait for all icons to render (and sprite to be loaded/inlined if needed)
  - Assert that each icon is visible
  - Take a screenshot of the icon row
  - Compare the screenshot to the expected image in `tests/__screenshots__`

- **Note:**
  - No accessibility, ARIA, or symbol presence checks are performed.
  - The only expectations are that the icons are visible and that the visual output matches the baseline screenshot.

---

## 5. Adding/Updating Icons

- Place new SVGs in `fixtures/icons/`.
- Re-run `npm run build:icons` to regenerate the sprite.
- Update HTML fixtures if you want to reference new icons.
- Update or approve new baseline screenshots after visual changes.

---

## 6. Notes, Troubleshooting, and Best Practices

- **Sprite Generation:**
  - The sprite is generated without hashes or grouping for test stability.
  - All icons are expected to be available as `<symbol id="icon-id">` in the sprite.
- **CORS Testing:**
  - The CORS server must be running for the CORS scenario to work.
  - Ensure no port conflicts (default: 25001).
- **Visual Regression:**
  - Place expected baseline screenshots in `tests/__screenshots__`.
  - If tests fail due to visual diffs, review and update baselines as needed.
- **Dependencies:**
  - Playwright must be installed and configured for the tests to run.
  - If you see errors about missing `@playwright/test`, install it with `npm install -D @playwright/test`.
- **Updating Workflow:**
  - Always update this README if you change the workflow or add new scenarios. This file is the canonical source of testing context.

---

## 7. Example Workflow (Full)

```sh
# 1. Install dependencies
npm install

# 2. Add SVGs to assets/icons/
cp path/to/your-icons/*.svg assets/icons/

# 3. Generate the sprite
npm run build:icons

# 4. Start servers
npm run dev         # (serves HTML and /sprites)
node server-cdn.cjs # (for CORS scenario)

# 5. Run tests
npm run test:e2e

# 6. Review screenshots in tests/__screenshots__
```

---

## 8. Contact & Maintenance

- If you modify the pipeline, fixtures, or test plan, **update this README**.
- For questions or issues, document findings and resolutions here for future reference.

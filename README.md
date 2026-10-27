<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ad0e0693-4eac-4f40-bb91-631c60ea0d6a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Stage 1 validation

Run `npm test` for geometry/validation tests and browser acceptance tests,
`npm run lint` for TypeScript checking, and `npm run build` for the production build.
There is no separate ESLint command.

Browser tests start and stop their own Vite server on port 3187. They use
`CHROMIUM_PATH` when supplied, `/usr/bin/chromium` when available (as in this cloud
environment), or Playwright's installed Chromium. On another machine, install the
browser with `npx playwright install chromium` if needed. Tests exclude external
CDN assets, so they verify functionality rather than remote styling/fonts/images.

Room Width, Depth, and Height start blank and must be positive numbers before
verification. Standard surfaces use the room dimensions; vaulted ceilings retain
the existing shortest/tallest-height workflow and average-height volume formula.

## Stage 2 wall construction and lighting

Wall Construction retains all opaque R-values and adds single-pane and double-pane
full-glass walls. Full-glass walls use the derived wall area minus doors, contribute
no opaque wall conduction, and reuse the existing glazing factors (28 and 15) and
glass-ratio dampener. Legacy glass-opening controls are hidden for full-glass walls
to prevent duplicate area; their settings are retained when switching back to opaque.
Doors retain their separate existing material factors. Oversized door/opening areas
block verification, and calculated remaining areas never become negative.

Total Installed Lighting Wattage now starts blank and requires an explicit
nonnegative number, including 0 when there is no lighting. The LED/lighting formula
remains watts × 3.412 × 5 hours/day; existing incandescent inputs are separate.
There is no default 22 W load. Geometry, lighting, and surface-area validation must
all pass before verification.

`npm test` includes Stage 1 regressions and Stage 2 calculation and live-interface
tests for both glass constructions, temperature differences, doors, oversized
openings, and required lighting. Browser tests exclude CDN assets.

### Measured regression baseline discrepancy

Before Stage 2 edits, the actual Stage 1 code produced the following totals for a
10 × 10 × 8 ft room, interior R-19 walls, a 3 × 7 ft Solid Core Wood door on Wall 1,
R-30 ceiling, uninsulated non-radiant floor, ambient 75°F, target 55°F, and no other
internal loads:

| Explicit lighting watts | Existing code, BTU/h | Stage 2, BTU/h | Requested manual reference, BTU/h |
| --- | --- | --- | --- |
| 0 | 1257 | 1257 | approximately 1268 |
| 20 | 1283 | 1283 | Stage 1 baseline: 1283 |
| 22 | 1285 | 1285 | approximately 1296 |

The 11 BTU/h difference from the supplied manual references is not a rounding
difference. Stage 2 preserves the measured code baseline rather than changing an
existing formula to fit different manual figures. For 0 W, the daily breakdown is
walls 8309, ceiling 1760, floor 500, doors 5040, air 1152, and safety 3352 BTU/day
(rounded display values). At 22 W, lighting adds 375 BTU/day and displayed safety
is 3427 BTU/day. The original 16-hour runtime and 20% safety margin are unchanged.

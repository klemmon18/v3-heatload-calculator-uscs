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

### Confirmed standard-room regression and vaulted comparison

The shared fixture in `tests/fixtures/door-baseline.cjs` explicitly specifies:
vapor barrier Yes (UI gate), frequent door opening off, room 10 × 10 × 8 ft,
all walls interior R-19, ceiling interior R-30 and **not vaulted**, floor interior
with no insulation and radiant heating off, ambient 75°F, outdoor 95°F, target
55°F, and a 3 × 7 ft Solid Core Wood door on Wall 1. All other internal loads are
zero; LED/lighting runtime remains 5 hours/day. Calculation tests use this fixture,
and the browser regression checks the live UI's corresponding selections and
values before verification.

| Ceiling setting | Lighting watts | Volume, cu ft | Infiltration, BTU/h before safety | Total, BTU/h |
| --- | --- | --- | --- | --- |
| Standard, not vaulted | 0 | 800 | 72 | 1257 |
| Standard, not vaulted | 22 | 800 | 72 | 1285 |
| Vaulted, shortest 8 ft / tallest 10 ft | 0 | 900 | 81 | 1268 |
| Vaulted, shortest 8 ft / tallest 10 ft | 22 | 900 | 81 | 1296 |

The unchanged infiltration formula is volume × (ambient − target) × 0.072 per day,
divided by the 16-hour compressor runtime. Standard geometry gives
800 × 20 × 0.072 / 16 = 72 BTU/h. Selecting vaulted with the existing 8/10 ft height
defaults uses a 9 ft average height, yielding 900 × 20 × 0.072 / 16 = 81 BTU/h.
The extra 9 BTU/h becomes 10.8 BTU/h after the unchanged 20% safety margin,
reproducing both older manual totals exactly after rounding. Frequent door opening
on would instead give 90 BTU/h at 800 cu ft, so that option does not explain 81.

No checked-in test in the available history expected 1268/1296 for the standard
room: those figures were supplied as manual references in the Stage 2 request and
recorded in the previous README. The standard-room test expectations were already
1257/1285. The vaulted setting reproduces the discrepancy in both calculation and
browser tests; the original external reference's inputs are unavailable, so its
historical use of that setting cannot be confirmed.

For the standard room, the displayed Analysis categories are:

| Lighting watts | Walls/Ceiling | Doors | Glazing | Infiltration | Internal | Safety Margin |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 629 | 315 | 0 | 72 | 0 | 210 |
| 22 | 629 | 315 | 0 | 72 | 23 | 214 |

The 22 W lighting change adds 22 × 3.412 × 5 / 16 × 1.2 = 28.149 BTU/h before
rounding, matching the displayed 28 BTU/h total increase. Totals and Analysis
categories are rounded independently. Automated tests assert the exact integer
totals and categories; a manual reconstruction using rounded intermediate values
may differ by up to 1 BTU/h. The original 20 W Stage 1 baseline remains 1283 BTU/h.
No production calculation formula was changed for this investigation.

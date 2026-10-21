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

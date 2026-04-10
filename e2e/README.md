# End-to-End tests (Playwright)

This folder contains the critical E2E scenarios for the Althea Systems
storefront. Tests are written with [Playwright](https://playwright.dev/)
and target Chromium.

## Install browsers

The `@playwright/test` package is installed as a devDependency, but the
browser binaries must be installed once per machine:

```bash
npx playwright install chromium
# or, with OS dependencies (requires sudo on Linux):
npx playwright install --with-deps chromium
```

## Run the tests

The Playwright config boots `npm run dev` automatically via `webServer`.

```bash
# Headless run
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Open the latest HTML report
npm run test:e2e:report
```

To point the tests at an already-running server (e.g. a staging URL) set
`PLAYWRIGHT_BASE_URL` and `PLAYWRIGHT_SKIP_WEBSERVER`:

```bash
PLAYWRIGHT_SKIP_WEBSERVER=1 \
PLAYWRIGHT_BASE_URL=https://staging.althea-systems.com \
npm run test:e2e
```

## Scenarios covered

| File | Scenario |
| ---- | -------- |
| `home.spec.ts` | Home page loads, title / heading / navigation visible |
| `product-flow.spec.ts` | Home → category → product detail → add-to-cart CTA |
| `cart.spec.ts` | `/cart` route renders with either items or empty state |
| `checkout.spec.ts` | `/checkout` responds and reaches checkout or auth |
| `search.spec.ts` | `/search` route and query param results view |

## Notes

- Tests that depend on seeded products fall back to `test.skip()` when
  no product link is exposed on the home page. This keeps the suite
  green on a freshly provisioned database.
- Artefacts (`test-results/`, `playwright-report/`) are git-ignored.

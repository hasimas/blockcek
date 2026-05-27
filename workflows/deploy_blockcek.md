# Workflow: Deploy BlockCek

## Objective
Deploy the BlockCek site (`index.html` + `api/check.js`) to a public URL so users can enter a handle and get an "are they blocking you?" verdict.

## Inputs required
- A GitHub repo containing this project (or willingness to use the Vercel CLI without one)
- A Vercel / Netlify / Cloudflare account (free tier is enough)
- Optional: a paid scraping API key if you want reliable X (Twitter) checks — see `swap_x_to_paid_scraper.md` (not yet written)

## Outputs
- Public URL serving the site
- `/api/check` endpoint that returns JSON verdicts

## Steps

### Option A — Vercel (recommended, zero config)
1. Push the repo to GitHub.
2. Go to https://vercel.com/new and import the repo.
3. Accept defaults — no build command, no framework preset.
4. Hit Deploy.

Vercel auto-detects:
- `index.html` at the root → served at `/`
- `api/check.js` → served at `/api/check` (no config needed)

### Option B — Vercel CLI (no GitHub required)
```
npm i -g vercel
cd <repo-root>
vercel
```
Follow the prompts. First run links the project; subsequent `vercel` pushes a preview, `vercel --prod` ships to production.

### Option C — Netlify
1. Move `api/check.js` → `netlify/functions/check.js`.
2. Uncomment the Netlify handler block at the bottom of `check.js`.
3. Create `netlify.toml` at repo root:
   ```
   [build]
     publish = "."
   [[redirects]]
     from = "/api/check"
     to   = "/.netlify/functions/check"
     status = 200
   ```
4. Drag the folder onto https://app.netlify.com/drop, or connect the repo.

### Option D — Cloudflare Pages
1. Move `api/check.js` → `functions/api/check.js`.
2. Rewrite the handler to Cloudflare's `onRequest(context)` shape — wrap `context.request` and return `new Response(JSON.stringify(...))`. The `lookup()` core function does not change.
3. Deploy via `wrangler pages deploy .` or the Cloudflare dashboard.

## Verifying the deploy
1. Open the deployed URL — should show "Did they *block* you?"
2. Enter a known-live TikTok handle (e.g. `tiktok`) and click Check.
3. Expect a "you've most likely been blocked" verdict with the profile picture rendered as proof — that means the backend is wired up correctly.
4. Enter a clearly non-existent handle (random 20-char string) — expect "probably not a block."
5. If the page falls back to the manual "copy URL + answer two tiles" flow, the backend is unreachable. Check the Vercel function logs.

## Known constraints (do not re-discover these)
- **Instagram** often serves a login wall to server-side fetches it suspects of being bots. When that happens, `decide()` returns `exists: null` and the frontend falls back to manual mode. This is by design — better honest fallback than a wrong verdict.
- **X (Twitter)** hydrates most profile data with JavaScript, so server-side HTML parsing only catches the clearest cases. To get reliable X results, swap the `fetch()` call in `lookup()` to route through a paid scraping provider (ScrapingBee, ScraperAPI, BrightData). The key must live in `.env` as `SCRAPER_API_KEY` — never hardcoded.
- **TikTok** is the most reliable platform — both the "Couldn't find this account" string and `og:title` give clean signals.

## When this workflow fails
- **`/api/check` returns 404 after deploy:** the function isn't being detected. On Vercel, confirm the file path is exactly `api/check.js` at the repo root, with `export default async function handler(req, res)`. On Netlify, confirm the redirect rule in `netlify.toml`.
- **CORS error in browser console:** the function and the page are on different origins. If you served the static file separately, either co-locate them on the same host or add `Access-Control-Allow-Origin: *` to the response headers in `check.js`.
- **All verdicts are `exists: null`:** the host's outbound IP is being rate-limited or blocked by the target platform. Plug in a scraping provider, as documented above.

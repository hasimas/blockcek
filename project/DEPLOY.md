# Deploying BlockCheck

The project is two files:

- `Block Check v4.html` — the page the user sees.
- `api/check.js` — a serverless function that does the public profile lookup server-side.

Without the backend, the page still works — it falls back to a one-tap manual flow (copy the URL, look in a private window, tap the answer). With the backend deployed, the user just enters a handle and gets the verdict directly.

## Vercel (easiest)

1. Rename the HTML to `index.html` so it serves at `/`.
2. Push the project to a GitHub repo (or use the Vercel CLI: `npm i -g vercel && vercel`).
3. The function at `api/check.js` is auto-detected — it's reachable at `/api/check`.

That's it. No build step, no framework.

## Netlify

1. Move `api/check.js` to `netlify/functions/check.js` and uncomment the Netlify handler block at the bottom of the file.
2. Add a `netlify.toml`:
   ```
   [build]
     publish = "."
   [[redirects]]
     from = "/api/check"
     to   = "/.netlify/functions/check"
     status = 200
   ```
3. Drag the folder onto https://app.netlify.com/drop, or connect a repo.

## Cloudflare Workers / Pages

Use Pages Functions: put the file at `functions/api/check.js` and rename `export default async function handler(req, res)` to the Pages Functions export shape:

```js
export async function onRequest(context) {
  const { request } = context;
  // wrap req/res semantics around context.request, return new Response(json)
}
```

The core `lookup()` function is the same — only the handler wrapper changes.

## What the backend can (and can't) determine

- **TikTok** — works well. The "Couldn't find this account" string and `og:title` make detection reliable.
- **Instagram** — works for ~404s and for profiles that return a non-login response. For traffic Instagram suspects of being automated, it serves a login wall and the function returns `exists: null` (the page treats this as "couldn't tell" and falls back to the manual flow).
- **X** — most profile data is hydrated by JavaScript. The function can detect "This account doesn't exist" and a few clear-cut cases, but often returns `exists: null`. For reliable X checks, plug in a paid scraping API (ScrapingBee, ScraperAPI, BrightData) — just route the fetch through the provider's endpoint inside `lookup()`.

## Response shape

```json
{
  "ok": true,
  "platform": "tiktok",
  "username": "someone",
  "url": "https://www.tiktok.com/@someone",
  "status": 200,
  "exists": true,
  "reason": "og-title-present",
  "ogImage": "https://…",
  "displayName": "Someone (@someone) on TikTok",
  "description": "…"
}
```

`exists` is `true` (profile is publicly visible), `false` (definitely missing), or `null` (couldn't tell). The page only renders a confident verdict when `exists` is true or false; otherwise it falls back to the manual flow.

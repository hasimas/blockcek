# BlockCek

> Did they block you? A quiet, honest check for Instagram, TikTok, or X.

**Live site:** [blockcek.com](https://blockcek.com)

BlockCek tells you whether someone has likely blocked you on Instagram, TikTok, or X — without asking for your login.

## How it works

When someone blocks you, the block applies only to **your account** — not the rest of the internet. So:

- If their profile is still visible to a logged-out browser but you can't see it from your account → **block**.
- If the profile doesn't exist publicly either → the account was likely **deactivated, deleted, suspended, or renamed**.

BlockCek does the public-side check for you server-side, then renders the verdict. If the lookup is inconclusive (login wall, JS-hydrated page), the page falls back to a one-tap manual flow.

## Project structure

```
index.html                      The page (HTML + CSS + JS, single file)
api/check.js                    Serverless function — public profile lookup
robots.txt, sitemap.xml         SEO basics
favicon.svg                     Browser tab icon
og-image.png                    Social link preview (1200x630)
apple-touch-icon.png            iOS home-screen icon (180x180)
workflows/deploy_blockcek.md    Deploy SOP
```

No build step. No framework. No dependencies to install.

## Deploy

Full steps in [`workflows/deploy_blockcek.md`](workflows/deploy_blockcek.md). Quick version (Vercel):

1. Import this repo at [vercel.com/new](https://vercel.com/new).
2. Accept defaults — no build command, no framework preset.
3. Deploy.

The function at `api/check.js` is auto-detected and reachable at `/api/check`.

## Privacy stance

- **No login.** You never sign in to anything.
- **No tracking.** No analytics scripts, no cookies. The only client-side storage is a single `localStorage` key remembering your last platform pick.
- **No data collection.** The handle you check is sent to the serverless function and not stored.
- **No ads.** Supported by voluntary donations via [Ko-fi](https://ko-fi.com/blockcek).

## Not affiliated

BlockCek is an independent tool. It is not affiliated with, endorsed by, or sponsored by Instagram, TikTok, X, Meta, or ByteDance.

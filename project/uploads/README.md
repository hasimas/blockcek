# blockcheck — Did they block you?

A single-file static website that walks people through checking whether they've been blocked on Instagram or TikTok. No backend, no data collection, no API keys, no build step.

## Why this works without a backend

Instagram and TikTok aggressively block automated requests, and browser CORS rules make client-side checks unreliable too. Instead of fighting that, this site teaches the user the trick (visiting the profile in a private/incognito browser) and asks them what they saw. That's it. It never breaks, it's honest, and it handles edge cases a script would miss (private accounts, renamed accounts).

## Files

- `index.html` — the entire site (HTML + CSS + JS embedded)

That's the whole project.

## Run locally

Just open the file in a browser:

```bash
open index.html
```

Or serve it with any static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Ship it to the public — three easy options

All three are free and take a couple of minutes.

### Option 1 — Vercel (fastest, custom domain easy)

1. Install the Vercel CLI: `npm i -g vercel`
2. In this folder, run: `vercel`
3. Follow the prompts. You'll get a `*.vercel.app` URL immediately.
4. To use your own domain, add it in the Vercel dashboard under "Domains".

### Option 2 — Netlify Drop (zero command line)

1. Go to https://app.netlify.com/drop
2. Drag the folder containing `index.html` onto the page.
3. Done. You'll get a `*.netlify.app` URL right away.

### Option 3 — GitHub Pages (free forever, ties to GitHub)

1. Create a new public repo on GitHub.
2. Add `index.html` to the repo.
3. In repo settings → Pages → set Source to `main` branch, `/` (root).
4. Wait ~30 seconds, then visit `https://yourusername.github.io/reponame/`.

## Customize

Everything is in `index.html`. The most useful knobs:

- **Colors** — the `:root` block at the top of the `<style>` tag. Cream, ink, coral, sage. Change those four and the whole site re-themes.
- **Copy** — search the file for any text you want to rewrite. Each screen is its own `<section>`.
- **Fonts** — currently Fraunces (display) + DM Sans (body), both from Google Fonts. The `<link>` in `<head>` controls them.
- **Add platforms** — duplicate one of the `.platform-card` buttons and add a matching URL pattern in the `buildCheckScreen()` function in the script.

## Privacy

This site does no tracking, sets no cookies, and makes no requests to any backend. The username someone types stays in their browser and is only used to build a link they can click. You can verify this by reading the script section near the bottom of `index.html`.

If you add analytics later (e.g. Plausible, Fathom), please keep it privacy-friendly — the trust angle is part of why people will use this.

## License

Yours. Do what you like with it.

// BlockCek — server-side profile lookup
// Works on Vercel, Netlify (with the included netlify.toml), and Cloudflare Workers
// with a small wrapper. The handler shape below is the Vercel / Next.js pages-API style.
//
// Why a backend? Browsers can't read cross-origin responses from instagram.com /
// tiktok.com / x.com (no CORS, no framing). So the page can't tell on its own
// whether a profile exists. This function does the lookup server-side and returns
// a plain JSON verdict the page renders.

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/123.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

const VALIDATORS = {
  instagram: /^[A-Za-z0-9._]{1,30}$/,
  tiktok:    /^[A-Za-z0-9._]{1,24}$/,
  x:         /^[A-Za-z0-9_]{1,15}$/,
};

function buildUrl(platform, username) {
  const u = encodeURIComponent(username);
  if (platform === 'instagram') return `https://www.instagram.com/${u}/`;
  if (platform === 'tiktok')    return `https://www.tiktok.com/@${u}`;
  if (platform === 'x')         return `https://x.com/${u}`;
  return null;
}

function extractMeta(html, prop) {
  const re = new RegExp(
    `<meta\\s+(?:[^>]*?\\s)?(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(re);
  if (m) return decodeEntities(m[1]);
  // Try the reverse attribute order
  const re2 = new RegExp(
    `<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${prop}["']`,
    'i'
  );
  const m2 = html.match(re2);
  return m2 ? decodeEntities(m2[1]) : null;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Decision logic per platform.
//
// Why username-aware? Earlier versions matched generic substrings like
// "Couldn't find this account" — but TikTok ships that string in its
// i18n bundle on every page (including real profiles served to
// data-center IPs), which caused false negatives. The robust signal
// is the *specific* username appearing in a structural location:
// canonical link, og:url, og:title, or a JSON field like uniqueId /
// username / screen_name. A captcha stub or generic blocked-bot page
// won't contain the username we asked about.
function decide(platform, status, html, username) {
  if (!html) return { exists: null, reason: 'no-html' };

  const uEsc = escapeRegex(username);

  if (platform === 'instagram') {
    if (status === 404) return { exists: false, reason: 'http-404' };

    if (new RegExp(`"username"\\s*:\\s*"${uEsc}"`, 'i').test(html)) {
      return { exists: true, reason: 'ig-username-json' };
    }

    const ogUrl = extractMeta(html, 'og:url');
    if (ogUrl && new RegExp(`/${uEsc}/?(?:[?#]|$)`, 'i').test(ogUrl)) {
      return { exists: true, reason: 'ig-og-url' };
    }

    const ogTitle = extractMeta(html, 'og:title');
    if (ogTitle && new RegExp(`\\(@${uEsc}\\)`, 'i').test(ogTitle)) {
      return { exists: true, reason: 'ig-og-title' };
    }

    if (new RegExp(`<link[^>]+rel=["']canonical["'][^>]+/${uEsc}/`, 'i').test(html)) {
      return { exists: true, reason: 'ig-canonical' };
    }

    return { exists: null, reason: 'ig-no-profile-data' };
  }

  if (platform === 'tiktok') {
    if (status === 404) return { exists: false, reason: 'http-404' };

    if (new RegExp(`"uniqueId"\\s*:\\s*"${uEsc}"`, 'i').test(html)) {
      return { exists: true, reason: 'tt-uniqueid' };
    }

    const ogUrl = extractMeta(html, 'og:url');
    if (ogUrl && new RegExp(`@${uEsc}(?:[/?#]|$)`, 'i').test(ogUrl)) {
      return { exists: true, reason: 'tt-og-url' };
    }

    const ogTitle = extractMeta(html, 'og:title');
    if (ogTitle && new RegExp(`@${uEsc}\\b`, 'i').test(ogTitle)) {
      return { exists: true, reason: 'tt-og-title' };
    }

    if (new RegExp(`<link[^>]+rel=["']canonical["'][^>]+@${uEsc}(?:[/?#"']|$)`, 'i').test(html)) {
      return { exists: true, reason: 'tt-canonical' };
    }

    return { exists: null, reason: 'tt-no-profile-data' };
  }

  if (platform === 'x') {
    if (status === 404) return { exists: false, reason: 'http-404' };

    const ogTitle = extractMeta(html, 'og:title');
    if (ogTitle && new RegExp(`@${uEsc}\\b`, 'i').test(ogTitle)) {
      return { exists: true, reason: 'x-og-title' };
    }

    if (new RegExp(`"screen_name"\\s*:\\s*"${uEsc}"`, 'i').test(html)) {
      return { exists: true, reason: 'x-screen-name' };
    }

    return { exists: null, reason: 'x-no-profile-data' };
  }

  return { exists: null, reason: 'unknown-platform' };
}

// X-specific: query the public syndication CDN endpoint that Twitter's
// embed widgets use. Returns a small JSON array — empty if the handle
// doesn't exist, one entry if it does. No auth, no token, just a public
// URL. Much more reliable than scraping x.com HTML, which is mostly
// JS-hydrated and serves a generic shell to server-side fetches.
async function lookupXViaSyndication(username) {
  const url = `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${encodeURIComponent(username)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!Array.isArray(data)) return null;
    if (data.length === 0) return { exists: false, reason: 'syn-not-found', displayName: null };
    const p = data[0];
    return { exists: true, reason: 'syn-found', displayName: p.name || null };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

async function lookup(platform, username) {
  // X: try the public syndication endpoint first. If it answers
  // definitively, we're done. If it times out or errors, fall through
  // to scraping x.com HTML as a backup.
  if (platform === 'x') {
    const syn = await lookupXViaSyndication(username);
    if (syn) {
      return {
        ok: true,
        platform,
        username,
        url: `https://x.com/${encodeURIComponent(username)}`,
        status: 200,
        exists: syn.exists,
        reason: syn.reason,
        ogImage: null,
        displayName: syn.displayName,
        description: null,
      };
    }
  }

  const url = buildUrl(platform, username);
  if (!url) return { ok: false, error: 'unknown_platform' };

  // 10s soft timeout via AbortController
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);

  let resp;
  try {
    resp = await fetch(url, { headers: HEADERS, redirect: 'follow', signal: ctrl.signal });
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, error: 'fetch_failed', message: String(err && err.message || err) };
  }
  clearTimeout(timer);

  const status = resp.status;
  let html = '';
  try { html = await resp.text(); } catch { /* ignore */ }

  const decision = decide(platform, status, html, username);
  const ogImage    = decision.exists ? extractMeta(html, 'og:image') : null;
  const ogTitle    = decision.exists ? extractMeta(html, 'og:title') : null;
  const ogDescription = decision.exists ? extractMeta(html, 'og:description') : null;

  return {
    ok: true,
    platform,
    username,
    url,
    status,
    exists: decision.exists,           // true | false | null (unknown)
    reason: decision.reason,
    ogImage,
    displayName: ogTitle,
    description: ogDescription,
  };
}

// ===== Vercel / Next.js pages-API handler =====
export default async function handler(req, res) {
  // Accept GET or POST, params in query or body.
  const src = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const platform = (src.platform || '').toLowerCase().trim();
  const username = (src.username || '').trim();

  if (!platform || !username) {
    return res.status(400).json({ ok: false, error: 'missing_params' });
  }
  if (!VALIDATORS[platform]) {
    return res.status(400).json({ ok: false, error: 'unknown_platform' });
  }
  if (!VALIDATORS[platform].test(username)) {
    return res.status(400).json({ ok: false, error: 'invalid_username' });
  }

  try {
    const data = await lookup(platform, username);
    if (!data.ok) return res.status(502).json(data);

    // Cache 60s — IG/TT/X status doesn't flip that often.
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'server_error', message: String(err && err.message || err) });
  }
}

// ===== Netlify Functions wrapper =====
// If you prefer Netlify, rename this file to netlify/functions/check.js and
// uncomment the lines below. (Keep the default export for Vercel users.)
//
// export const handler = async (event) => {
//   const params = event.httpMethod === 'POST'
//     ? JSON.parse(event.body || '{}')
//     : (event.queryStringParameters || {});
//   const platform = (params.platform || '').toLowerCase().trim();
//   const username = (params.username || '').trim();
//   if (!VALIDATORS[platform] || !VALIDATORS[platform].test(username)) {
//     return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'bad_request' }) };
//   }
//   const data = await lookup(platform, username);
//   return {
//     statusCode: data.ok ? 200 : 502,
//     headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=60' },
//     body: JSON.stringify(data),
//   };
// };

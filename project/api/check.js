// BlockCheck — server-side profile lookup
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

// Decision logic per platform.
function decide(platform, status, html) {
  // Sanity: super-short HTML usually means a redirect / error page.
  const len = html ? html.length : 0;

  if (platform === 'instagram') {
    if (status === 404) return { exists: false, reason: 'http-404' };
    // IG sometimes serves a generic "Page Not Found" with 200 status.
    if (/Page Not Found/i.test(html) || /Sorry, this page isn['\u2019]t available/i.test(html)) {
      return { exists: false, reason: 'ig-not-available' };
    }
    if (extractMeta(html, 'og:title') || extractMeta(html, 'al:ios:url')) {
      return { exists: true, reason: 'og-title-present' };
    }
    // If we got the IG login wall, we can't tell — treat as unknown.
    if (/loginForm|"login_link"|Log in \\u2022 Instagram/i.test(html)) {
      return { exists: null, reason: 'ig-login-wall' };
    }
    return { exists: null, reason: 'inconclusive' };
  }

  if (platform === 'tiktok') {
    // TikTok returns 200 with a not-found page for missing usernames.
    if (/Couldn['\u2019]t find this account/i.test(html)) {
      return { exists: false, reason: 'tt-not-found' };
    }
    if (status === 404) return { exists: false, reason: 'http-404' };
    if (extractMeta(html, 'og:title') && !/TikTok\s*-\s*Make Your Day/i.test(extractMeta(html, 'og:title'))) {
      return { exists: true, reason: 'og-title-present' };
    }
    if (status === 200 && len > 5000) return { exists: true, reason: 'page-rendered' };
    return { exists: null, reason: 'inconclusive' };
  }

  if (platform === 'x') {
    // X is the hardest — most profile data is JS-hydrated.
    if (status === 404) return { exists: false, reason: 'http-404' };
    if (/This account doesn['\u2019]t exist/i.test(html) || /Hmm\\.\\.\\.this page doesn['\u2019]t exist/i.test(html)) {
      return { exists: false, reason: 'x-not-found' };
    }
    const ogTitle = extractMeta(html, 'og:title');
    if (ogTitle && !/^X$/i.test(ogTitle.trim())) {
      return { exists: true, reason: 'og-title-present' };
    }
    return { exists: null, reason: 'inconclusive' };
  }

  return { exists: null, reason: 'unknown-platform' };
}

async function lookup(platform, username) {
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

  const decision = decide(platform, status, html);
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

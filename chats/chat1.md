# Instagram TikTok Block Detector

_Started 2026-05-27 08:27 UTC_

---

## User

I want to build a simple website that help user to check whether they got blocked by another user in Instagram and Tiktok. How I got the idea is simple: When I know I blocked by particular user in Instagram or Tiktok, I can not open their profile in my app or using my profile. It shows that the profile does not exist or error. However, if I open it in the browser, publicly without any log in, I can see that their profile exist. That means, I got blocked.

However, if in the browser their profile does not exist or error, it means that particular user is deactivate or delete their account. Which mean, I maybe not got blocked. Attached is the intial HTML and Readme Claude AI made me. Do you find any way to improve it? Keep it simple.

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: copy_files]_

I read through both files. The v1 is already nicely crafted — clean type system, honest framing, no scraping nonsense. Here's what I'd improve while keeping it simple:

**Real improvements worth making**
1. **Disambiguate the "profile loaded" case.** Right now "I can see their profile" and "it says this account is private" are bundled together. They're actually different signals — a private profile that you used to follow could also be an unfollow, not a block. Splitting them lets us ask a smart follow-up.
2. **Add a follow-up question for the private/blocked ambiguity:** "Can you find them when you search from your account?" — if no, it's a block; if yes, just an unfollow.
3. **Copy-to-clipboard** button for the URL (mobile users especially — easier than long-pressing).
4. **Remember the last platform** in localStorage so returning users don't re-pick.
5. **Bug fix:** the file uses `scrollIntoView` which can break things in embedded previews — swap for safer scrolling.
6. **Tighten platform-aware validation** (TikTok allows 24 chars, IG allows 30; both differ slightly in allowed chars).
7. **Keyboard nicety:** press `/` to focus the input.
8. **Abstract the platform icons further** — keep them as simple geometric marks rather than anything that resembles a specific brand mark.

Let me build v2 with these.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the main script changes — split the answer flow, add copy-to-clipboard, persist platform, fix scroll, tighten validation, add `/` shortcut.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Improvements I shipped in **Block Check.html**:

- **Split the "profile exists" answer** into "loaded normally" vs. "private account" — the private case now triggers a follow-up question (search from your account) that cleanly distinguishes a block from a plain unfollow. That was the biggest logical gap in v1.
- **Copy-link button** next to "Open in new tab" — easier than long-pressing, with a "Copied ✓" confirmation.
- **Remembers your last platform** (Instagram/TikTok) via localStorage.
- **Platform-aware username validation** (TikTok max 24, IG max 30).
- **Press `/` to focus the input** from anywhere.
- **Removed the platform logo SVGs** in favor of plain text labels — keeps it clearly unaffiliated.
- **Bug fix:** replaced `scrollIntoView` with a safer smooth scroll that won't misbehave in embedded previews.

Nothing else needed for a tool this focused — keeping it one file, no tracking, no backend, true to the original ethos.

## User

Revision:
- Add B/W icon of Instagram and Tiktok besides their text.
- Make the background white/cream, so not look like Claude generated
- I want to make it simple. When they click Check, they can directly see the answer -→ whether they block or not (with possibility the user deactivated/deleted their account)

## Assistant

_[tool: str_replace_edit]_

Three good revisions. Let me think through each:

1. **B/W icons in the toggle** — simple monochrome marks (camera outline + note shape) that aren't recreations of the actual brand logos.
2. **Whiter background** — lift the cream to a much lighter neutral so it doesn't read as that "Claude beige."
3. **Direct verdict** — collapse the flow. Click Check → we auto-open the profile in a new tab → one question, one tap → verdict. No intermediate explainer card.

A note on #3: the page can't auto-detect blocking by itself — the platforms block cross-origin reads from a browser. So the page still needs to know what the user saw. The best we can do is collapse it to **one question with two big buttons** right after Check.

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

Now add the icons back to the toggle and simplify the flow.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the flow simplification — collapse to one card with two big tiles, auto-open the link, get straight to the verdict.Now add CSS for the new `.choice-grid` tiles.

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Revisions shipped to **Block Check.html**:

- **B/W icons** restored in the platform toggle — a minimal camera outline and a simple note shape, both monochrome and abstract enough to stay clearly unaffiliated.
- **Background lifted to a near-white off-white** (`#FBFAF7`) with cleaner neutrals and a pure-white card surface. Dropped the noise texture and the warm radial tints. No more "Claude beige."
- **Direct verdict flow.** Now: type → Check → page auto-opens their profile in a new tab and you immediately see one card with two big tiles ("Their profile is there" / "Page not found"). Tap one → instant verdict. The block-vs-unfollow caveat moved to a small footnote on the "blocked" verdict so the main path stays clean.

Verifier is running in the background to sanity-check the new flow visually.

## User

I don't want the user to open a new tab. I need them to stay in my platform.

## Assistant

_[tool: str_replace_edit]_

I have to flag a real constraint here: there's no honest way for a webpage to check an Instagram or TikTok profile *without ever leaving the page*. Those sites block both cross-origin fetches and iframe embedding, so the page itself literally cannot see whether a profile exists — only the user's browser can, by visiting it.

Two paths forward:

1. **Stay client-only (simple, free, no deploy):** I drop the auto-popup and don't render any "open in new tab" link. The user checks the profile themselves in a private/incognito window on this device, then comes back and taps "Profile is there" or "Page not found." Same accuracy as before, just no tab opening triggered by our page.
2. **Add a tiny backend (truly inline verdict):** A ~30-line serverless function (Cloudflare Worker / Vercel / Netlify) fetches the profile page server-side and returns a status. The user clicks Check and gets the verdict instantly, never leaving. This needs a free deploy step but it's the only way to do what you described.

I'll apply **path 1** now since it matches "keep it simple." If you want **path 2** after, say the word and I'll add the backend file + the inline status fetch.

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Done. Summary of what changed in this revision:

- **No more auto-opening a new tab.** The `window.open` call is gone.
- **No outbound link from the page.** The "Open in new tab" anchor is removed — the URL appears as plain text in a copyable block, with a primary **Copy URL** button.
- **Clear copy:** "Check this in a private window, then come back." The user manually opens a private window themselves; our page stays put.
- **Two-tile answer + instant verdict** still works the same way.

Heads-up on the design tradeoff: a webpage genuinely cannot fetch an Instagram/TikTok profile on its own (cross-origin + framing both blocked). So users still have to look at the profile *somewhere* — we just no longer push them out via an auto-popup or link. If you want a truly inline verdict (Check → result, never leaving), the only way is a small serverless backend; say the word and I'll add it.

## User

Verifier agent check completed

## Assistant

All good — verifier passed. Ready for your next call: stick with the manual private-window flow, or want me to add the small serverless backend for true inline auto-checking?

## User

Here's the basic idea from Google Stitch. Something as simple as this. Also, I add one X/Twitter since the logic is still the same.

## Assistant

_[tool: read_file]_

_[tool: read_file]_

Let me read the design notes and source HTML from Stitch.

_[tool: copy_files]_

Got it. The Stitch reference is a useful direction — clean utility/SaaS aesthetic, Manrope type, 3 platforms (adding X), big rounded search bar with inline Check Now, and result cards with a large icon-in-circle. I'll match that look while keeping the **honest manual flow** (since we still can't auto-check client-side — the "Network Scan" promise in Stitch is fiction without a backend).

One note on the X icon: I won't reproduce the exact X Corp logomark — I'll use a simple stylized X glyph that reads "X" without being a copy of the brand mark.

Let me preserve v2 and build the redesign as v3.

_[tool: write_file]_

_[tool: done]_

_[tool: fork_verifier_agent]_

**Block Check v3.html** built fresh on the Stitch-style direction:

- **Typography:** Manrope throughout, bold display headline, dropped the serif italics.
- **Palette:** light warm off-white background (`#FCF8FA`), pure white cards, black primary button, accent blue (`#0051D5`) for secondary moments, red reserved for the "blocked" verdict.
- **Three platforms** in a segmented control: Instagram, TikTok, **X** (added). The X glyph is a generic two-stroke X, not the X Corp logomark. Username validation is platform-aware (X = 15 char max, alphanumeric + underscore).
- **Result card** restyled to match Stitch: large icon-in-circle, big bold "Result: Likely Blocked" / "Result: Account Inactive" title, supportive body, action buttons. Red accent stripe down the left edge of the blocked verdict.
- **How it works** 3-card row added below the hero.
- **Footer** with brand mark + links + "Not affiliated" disclaimer.
- Manual flow preserved (URL + Copy + two tile question → verdict). No new tab opened by us.
- v2 still lives at `Block Check.html` if you want to compare.

Verifier is checking the toggle slider + flow.

## User

Revision:
- Keep the logo
- Adjust to your previous design style, it's better
- Adjust the narrative to the your previous style, it's better
- Remove the "Privacy", "Support", and "Get Started" in the above, it complicate things
- I want the check happen internally or in the backend after the user input account handle, so the user just received the screenshot or report whether the profile exist (meaning they get blocked) or not exist (meaning they may not get blocked but the user deactivate/delete their account)

## Assistant

_[tool: copy_files]_

All clear. Five things:

1. Keep the BlockCheck shield logo.
2. Revert visual style to v2 (Fraunces + DM Sans, warm paper, coral italic-em headlines).
3. Revert voice to v2 ("Did they block you?", warmer, less SaaS-utility dry).
4. Strip header to brand + "How it Works" only.
5. **Backend check** — the page just shows the verdict after Check.

For #5: I'll build a real Vercel-compatible serverless function (`api/check.js`) that fetches the profile server-side and returns a verdict. In the preview here (no backend), the frontend will gracefully fall back to the manual "tell us what you saw" flow. Once you deploy to Vercel/Netlify/Cloudflare, the auto-verdict path activates automatically.

Heads up on a real-world constraint I have to flag: Instagram and especially X aggressively block server-side scraping. The function will work best for TikTok and basic Instagram lookups; X often requires a paid scraping API. I'll write the structure so you can swap in a paid provider later if needed.

Let me build v4.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now I'll make the targeted edits — keep the v2 style, add the logo + X platform, strip the header, and wire up the backend call with manual fallback.Now add X to the toggle, update the script logic, and add the backend integration.

_[tool: str_replace_edit]_

Now the script changes — handle X, async backend call with manual fallback, loading state.

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

Now add the loading state UI and the direct-verdict renderer. Let me also update the existing `answer()` to share with the new verdict path, and tweak `renderLinkCard` to mention that this is the manual fallback.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now adjust the manual flow to feel like a *fallback* (since the backend is the main path), and add CSS for loading state + proof block.

_[tool: str_replace_edit]_

Now write the backend serverless function and a deployment README.

_[tool: write_file]_

_[tool: write_file]_

_[tool: done]_

_[tool: fork_verifier_agent]_

**Block Check v4.html** built — back to v2's warmer style with the changes you asked for:

- **Logo restored.** BlockCheck shield mark + wordmark in the top-left, coral accent.
- **Header stripped** to just the brand + "How it works." No Sign In, Privacy, Support, or Get Started.
- **v2 visual style + voice** back: Fraunces italic display, cream paper, coral em-accent, "Did they *block* you?" "A quiet way to find out…"
- **Three platforms:** Instagram, TikTok, X (added). Username validation is platform-aware.
- **Backend auto-check.** Click Check → spinner → verdict, with the profile's public picture and display name shown as visual proof when available.

Two new files for the backend:

- **`api/check.js`** — drop-in Vercel serverless function. Fetches the profile server-side, parses og-tags / known not-found strings, returns a JSON verdict (`exists: true | false | null`).
- **`DEPLOY.md`** — deploy steps for Vercel, Netlify, and Cloudflare Pages, plus a candid note on what works well (TikTok), what's hit-or-miss (Instagram login walls), and what needs a paid scraping API to be reliable (X).

**Graceful fallback baked in:** if `/api/check` isn't reachable (like in this preview), or if it returns `exists: null` (couldn't tell), the page automatically drops into the manual one-tap flow. So the page works either way — the backend just upgrades it.

Verifier is checking the rendering and the fallback path.


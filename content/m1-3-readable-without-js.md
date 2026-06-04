---
id: m1-3-readable-without-js
module: discoverable
moduleNumber: 1
guidelineNumber: 3
title: Render content without JavaScript
complexity: 3
impact: 4
visualChange: low
forterApplies: 'no'
---

# 1.3  Render content without JavaScript

## What & why
Live agent crawlers fetch your pages **at the moment a user asks a question**, mostly without executing JavaScript. If your homepage is a React shell that hydrates client-side, agents see an empty `<div id="root">` and your competitor wins the answer. Surfaces to fix: server-rendered HTML, alt text on every visual, semantic structure that vector indexes can chunk, and a complete document `<head>` so crawlers can resolve and paginate your pages.

## Scoring
- **Effort 3/5** - Real engineering, but bounded. Small if your stack already renders server-side, substantial for a client-only React/SPA app. Alt-text backfill is mechanical but slow.
- **Impact 4/5** - The difference between appearing in AI answers and not appearing at all.
- **Visual change: low** - SSR rendering is invisible to sighted users; alt text reaches screen readers; semantic HTML doesn't change pixels.

## Steps
1. **Server-render the homepage and top product pages.** This is the single biggest issue with today's React and SPA-based sites: they ship a near-empty HTML document and assemble the page in the browser, so an agent that doesn't run JavaScript sees nothing. HTML must contain a single `<h1>`, at least 500 characters of meaningful body copy, and your primary CTAs as real `<a href>` links. If your site renders client-side, move the key pages to server-side rendering (SSR) so the markup is complete before it leaves the server; if a full SSR migration is out of scope, add a prerender step that serves static HTML snapshots to known crawler user-agents. Verify with `curl https://example.com | grep -c "<h1"` - you want `1`, not something else.
2. **Alt text on 80%+ of images.** Multimodal agents read alt as the primary signal; the image itself is secondary. Audit by crawling your sitemap and counting `<img>` tags missing or with empty `alt`. Backfill product images with `{product name} - {key attribute} - {color/size}`, decorative images with `alt=""` (intentionally empty, not missing). At the CMS level, make alt a required field on image upload going forward.
3. **Semantic HTML, not div soup.** One `<h1>` per page, `<h2>`/`<h3>` in document order, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>` instead of `<div class="nav">`. Lists as `<ul>`/`<ol>`, tabular data in `<table>` with `<thead>`/`<tbody>`. Vector stores chunk on these boundaries.
4. **Complete the document `<head>`.** AI systems lean on head metadata to resolve and disambiguate your pages. Every page needs a self-referential `<link rel="canonical">`, a `<html lang>` attribute, and Open Graph tags - `og:title`, `og:description`, `og:type`, and an `og:image` that actually resolves to an image. On any paginated surface (blog, docs, product listings), add `<link rel="next">` / `<link rel="prev">` so crawlers index past page one instead of stopping at it.
5. **Test like an agent.** The goal is to see your page the way a non-JavaScript crawler does: stripped of CSS, images, and scripts, down to plain text. `lynx` is a terminal-based text-only browser that renders exactly that. Fetch a page with the crawler's User-Agent, then render it to text:
   ```
   curl -sA "ChatGPT-User/1.0" https://example.com -o page.html
   lynx -dump page.html
   ```
   `curl -A` sets the User-Agent so you receive the same HTML a crawler would; `lynx -dump` prints the readable text that remains. Do this for your top ~20 URLs. If a human reading that text dump cannot answer "what does this company do and what is on this page", neither can an agent. (Install lynx with `brew install lynx` on macOS or `apt install lynx` on Linux.)

(Schema.org JSON-LD is its own job - see [2.1](./m2-1-json-ld.md).)

## References
- [Schema.org vocabulary](https://schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google - JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [WCAG 2.2 - non-text content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

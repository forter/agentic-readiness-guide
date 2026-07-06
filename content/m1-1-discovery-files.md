---
id: m1-1-discovery-files
module: discoverable
moduleNumber: 1
guidelineNumber: 1
title: Publish your discovery files
complexity: 1
impact: 4
visualChange: none
forterApplies: 'no'
---

# 1.1  Publish your discovery files

## What & why
Four small, static text files at your origin's root tell the entire AI ecosystem what you have and what it can do with it: `sitemap.xml`, `robots.txt`, `llms.txt`, and `index.md`. They take an afternoon to write and let you welcome live agent crawlers (revenue) while restricting training crawlers (no revenue). A fifth surface isn't a file at all: HTTP `Link:` response headers that advertise those resources so an agent resolves them from a `HEAD` request without parsing a line of HTML. Note this is a **policy** layer, not an enforcement layer - only well-behaved bots will honor it.

## Scoring
- **Effort 1/5** - One half-day pass, mostly text files. The hardest part is getting your CMS to emit `<lastmod>` correctly.
- **Impact 4/5** - Foundational for crawler-driven discovery: Modules 2-5 don't get evaluated by anything that can't first find you. Note that robots.txt and sitemap.xml are essential for crawl indexing but are rarely the first thing a live agent fetches — docs and the homepage get far more direct agent traffic. The Impact 4 rating reflects that crawl-indexing importance more than real-time agent browsing.
- **Visual change: none** - new files at machine-only paths (`/robots.txt`, `/llms.txt`, `/index.md`); your rendered pages don't change.

## Steps
1. **Sitemap.** A sitemap is the fastest way for a crawler to learn every URL worth fetching instead of guessing from links. Serve `/sitemap.xml` listing every indexable URL with accurate `<lastmod>` ISO-8601 timestamps - that timestamp is the signal that tells an agent a page changed and is worth re-reading. Cap each file at 50 MB / 50,000 URLs and use a [sitemap index](https://www.sitemaps.org/protocol.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) for larger sites. `/sitemap.xml` is the path crawlers probe first, so if your sitemap already lives elsewhere (`/sitemap_index.xml`, a CMS-generated URL) there's no need to move it - add a `301` redirect from `/sitemap.xml` to wherever it actually is, and the conventional path resolves.
   Freshness matters as much as presence: ensure at least one `<lastmod>` is within the last 90 days. A sitemap with only stale timestamps signals abandoned content. Whatever an agent reaches, it uses - a reachable page with stale or wrong information hurts more than having no page at all.
2. **Robots.txt with a differentiated AI policy.** `robots.txt` is where you set the rules of engagement for crawlers - and the useful nuance today is that not all AI crawlers are alike. An agent fetching your page to answer a shopper's question can send you a sale; a crawler scraping you to train a model gives nothing back. [Content Signals](https://blog.cloudflare.com/content-signals-policy/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide), a Cloudflare-originated convention, let you say which is which. Reference your sitemap, then set three signals:
   - `search` - may this page be indexed to answer search queries (classic and AI-powered search alike).
   - `ai-input` - may this page be fetched at query time and fed into an AI answer (live retrieval / RAG).
   - `ai-train` - may this page be used as training data for AI models.

   `search=yes, ai-input=yes, ai-train=no` is the configuration most sites want - welcome the agents that send live traffic, decline the crawlers that only harvest for training. Spell that out, then block the named training crawlers outright, since not every crawler honors the signals yet:
   ```
   Sitemap: https://example.com/sitemap.xml

   User-agent: *
   Content-Signal: search=yes, ai-input=yes, ai-train=no

   User-agent: GPTBot
   Disallow: /

   User-agent: CCBot
   Disallow: /
   ```
   If you sit behind Cloudflare (or a similar WAF), robots.txt alone is not enough. After Cloudflare's Jul 1 2025 policy change, verified bots are only allowed inside a category the site owner explicitly enables (Search, Agent, Training). From Sep 15 2025, new Cloudflare zones default-block Agent and Training bots on ad-bearing pages. Action: go to Bot Management → Verified Bots and enable the **Agent** and **Search** categories. robots.txt cannot override the WAF.
3. **llms.txt.** Your HTML homepage is built for people - navigation, marketing, scripts - and an agent has to wade through all of it to find a few facts. [`llms.txt`](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) is a plain-markdown briefing written for the model instead: a short, structured summary of what you do, who you serve, what an agent can do with you, and links to your API and docs. Publish it at `/llms.txt` with sections for product overview, use cases, and constraints. It doesn't need perfect copy on day one - a well-structured stub is enough to start, and [2.2](./m2-2-llms-txt-content.md) covers content quality.
4. **Modular llms.txt.** A single root `llms.txt` can't go deep on everything without getting long. Add per-area variants - `/docs/llms.txt`, `/api/llms.txt`, `/developers/llms.txt` - so an agent working on a specific task pulls just the slice of context it needs. Each file stays focused, and you stay within the model's attention budget.
5. **Markdown twins for every key page (homepage at minimum).** Some agents look for `/index.md` - a clean-markdown version of your homepage - before they bother parsing HTML. Give them one (Content-Type `text/markdown`): a top-level heading and the same core value-prop text your homepage HTML carries. Ideally, extend this to every key page by serving `{path}/index.md` alongside the HTML - Cloudflare's implementation does exactly this via two edge rules, because as of early 2026 only Claude Code, OpenCode, and Cursor send `Accept: text/markdown` by default; everyone else needs the URL fallback.
6. **`Link` response headers ([RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)).** Everything above lives at a known path, but an agent still has to request each file to find it. `Link:` response headers let you advertise them all in the HTTP response itself, so an agent discovers your whole set from a single `HEAD` request - no HTML parsing at all. A file nothing points to is reached late or never - linking your discovery files from HTTP headers and the docs footer upgrades reach meaningfully. Emit `Link: </sitemap.xml>; rel="sitemap"`, `Link: </llms.txt>; rel="describedby"`, `Link: </.well-known/api-catalog>; rel="api-catalog"`, and `Link: </openapi.json>; rel="service-desc"`. The last two point at files [4.1](./m4-1-openapi-spec.md) brings online - the paths are fixed today, so the headers are correct the moment you set them and start resolving when 4.1 lands. Add these headers across all pages so every page advertises them consistently.

**Verify the result.** `curl -I` sends an HTTP `HEAD` request and prints only the response headers - never the body - which is the quickest way to confirm a path exists, returns `200`, and carries the right `Content-Type`. Run it against each file you published:

```
curl -I https://example.com/llms.txt
```

A healthy response looks like this:

```
HTTP/2 200
content-type: text/markdown; charset=utf-8
content-length: 1843
```

Check `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and `/index.md` the same way - on each, you want a `200` status and a sensible `content-type`. If you completed step 6, `curl -I https://example.com` on the homepage should also list your `Link:` headers. Drop the `-I` to fetch the body alongside the headers.

## References
- [sitemaps.org protocol](https://www.sitemaps.org/protocol.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cloudflare Content Signals](https://blog.cloudflare.com/content-signals-policy/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [llms.txt proposal](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8288 - Web Linking](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

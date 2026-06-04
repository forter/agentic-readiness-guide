---
id: m2-3-document-for-agents
module: comprehensible
moduleNumber: 2
guidelineNumber: 3
title: Document for agents
complexity: 3
impact: 5
visualChange: medium
forterApplies: 'no'
---

# 2.3  Document for agents

## What & why
When an agent weighs whether to recommend an integration, it reads your `/docs` and judges what is on the page - it won't click past marketing copy to find the real reference. Docs work for an agent when they have both **depth** (quickstart, auth walkthrough, runnable code samples in several languages, complete endpoint reference) and **citability** (named authors, dated specific numbers, exact endpoint paths, code that runs as written). The [Stripe API reference](https://stripe.com/docs/api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) is the canonical example of agent-grade docs. If you already run a docs site or developer portal, you are not starting over - link to it and raise it to that bar.

Parts of `/docs` are finished by later guidelines - the auth walkthrough by [3.1](./m3-1-oauth-discovery.md), the generated endpoint reference by [4.1](./m4-1-openapi-spec.md). Set up the structure and citability standard here so those pages slot in rather than forcing a rebuild.

## Scoring
- **Effort 3/5** - Real docs work, mostly assembling and tightening content you partly have.
- **Impact 5/5** - Documentation depth is the single strongest predictor of whether an agent will recommend an integration.
- **Visual change: medium** - `/docs` gains structure: a quickstart, named-author bylines, more code samples. Visible to anyone reading docs.

## Steps
1. **Ship a 5-minute quickstart.** One page: `curl` request → response, copy-pasteable, with a real (sandbox) credential. The quickstart is what agents fetch first to confirm "does this product actually do the thing the user asked about?" If it takes more than one screen, you've lost.
2. **Document the auth flow end-to-end.** OAuth client registration, token exchange, refresh, scope reference, error codes. Include a worked example with redacted-but-shaped tokens. ([3.1](./m3-1-oauth-discovery.md) builds the protocol; this page is finished when it lands.) The machine-actionable companion to this prose is the `/auth.md` agent-registration recipe in [3.3](./m3-3-self-serve-credentials.md).
3. **Provide code samples in 4+ languages.** Curl, JavaScript/TypeScript, Python, Go - minimum. Each sample must be runnable, not pseudocode. Agents pattern-match across languages; missing one shrinks your retrieval surface.
4. **Publish a structured API reference.** One page per endpoint with `path`, `method`, `parameters`, `request body`, `response body`, `error codes`, and at least one example. Generate it from OpenAPI ([4.1](./m4-1-openapi-spec.md)) so it cannot drift from the spec - this is the one part of `/docs` that comes online with 4.1.
5. **Make claims citable.** Named authors with credentials on every guide ("By {Name}, {Title}"). Dated, specific numbers ("As of Q1 2026, 94% of orders placed before 2pm ship same-day across our UK fulfilment network") - not "lightning-fast at scale." A glossary page resolving every domain term you use, so agents can resolve your jargon (whatever it is - `chargeback`, `webhook`, `idempotency-key`, `tenant`) without leaving your origin.
6. **Serve markdown to agents via content negotiation.** An agent pays a token tax wading through rendered HTML to reach the few facts it needs. Let it ask for markdown on the *same canonical URL*: when a request carries `Accept: text/markdown`, return the markdown representation with `Content-Type: text/markdown; charset=utf-8` - the registered media type ([RFC 7763](https://www.rfc-editor.org/rfc/rfc7763.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)), **not** the deprecated `text/x-markdown` or the unregistered `application/markdown` - and **always** set `Vary: Accept`, so a CDN can't cache the HTML and hand it to the next agent. Return `406 Not Acceptable` only when you genuinely can't produce the requested type, and honor quality values (a `q=0` on markdown must fall back to HTML). If you also publish `.md` "twin" URLs, they're complementary, not a substitute - advertise each with `Link: </page.md>; rel="alternate"; type="text/markdown"` ([RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)) so an agent discovers it without guessing the path. The canonical recipe and per-stack instructions live at [acceptmarkdown.com](https://acceptmarkdown.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide); Cloudflare's *Markdown for Agents* does the whole negotiation at the edge with zero app change.

## References
- [Stripe API reference](https://stripe.com/docs/api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Diataxis documentation framework](https://diataxis.fr?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenAPI specification](https://spec.openapis.org/oas/latest.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [acceptmarkdown.com - markdown content negotiation](https://acceptmarkdown.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7763 - The text/markdown Media Type](https://www.rfc-editor.org/rfc/rfc7763.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

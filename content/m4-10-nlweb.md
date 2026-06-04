---
id: m4-10-nlweb
module: actionable
moduleNumber: 4
guidelineNumber: 10
title: Operate an NLWeb endpoint
complexity: 3
impact: 3
visualChange: none
forterApplies: 'yes'
---

# 4.10  Operate an NLWeb endpoint

## What & why
NLWeb is an emerging open standard for turning your site's content into something an agent can *converse with* rather than scrape. You publish your structured content as **Schema Feeds**, an NLWeb server ingests them, and it exposes a single standard endpoint - `POST /ask` - that answers natural-language questions over that content and returns structured JSON. Every NLWeb instance is also an MCP server, so the same `/ask` surface is reachable both as a plain HTTP endpoint and as an MCP tool. Think of it as the conversational counterpart to your sitemap: the sitemap lists your pages, NLWeb answers questions about them.

It's early - the spec is still moving and adoption is thin - but it's cheap to stand up on top of structured data you should already have ([2.1](./m2-1-json-ld.md)), and it's the cleanest way to let an agent ask "do you carry X?" or "what's your return window?" without crawling.

## Scoring
- **Effort 3/5** - Publishing Schema Feeds is an afternoon, and a minimal `/ask` that wraps your existing search is modest. The full vector-store-plus-model server is the real work, though the open-source NLWeb toolkit does most of it.
- **Impact 3/5** - Emerging-standard upside. Low today, plausibly central as conversational retrieval matures; the downside risk is near zero given the low cost.
- **Visual change: none** - a `Schemamap` line in robots.txt, a feed file, and an `/ask` endpoint - all machine-only.

## Steps
1. **Publish Schema Feeds.** Add one line to `robots.txt` - `Schemamap: https://example.com/.well-known/schema-map.xml` - and serve a Schema Map XML pointing at any JSONL or RSS feeds you publish (product feeds, blog feeds, FAQ feeds). The feed items carry Schema.org types, so the structured-data work from [2.1](./m2-1-json-ld.md) is the corpus NLWeb retrieves from.
2. **Start with a minimal `POST /ask`.** The whole protocol reduces to one endpoint, and the minimal viable version needs no vector store and no model - it can forward the incoming question straight to your existing search endpoint or search tool. The request is a JSON body carrying the natural-language `query`; the response is ranked, structured results plus a `_meta` block:
   ```json
   {
     "results": ["...ranked, structured matches..."],
     "_meta": { "response_type": "...", "version": "..." }
   }
   ```
   The two `_meta` fields - `response_type` and `version` - are what let a client confirm it's talking to a conformant NLWeb server. Keep `/ask` public and unauthenticated; friction-free agent retrieval is the whole point.
3. **(Optional) Expand to a full NLWeb server.** When you want genuine natural-language retrieval rather than a search passthrough, adopt the open-source NLWeb toolkit: it ingests your Schema Feeds into a vector store and wires them to an LLM backend. Point it at the feeds from step 1 and re-index on a schedule so answers track your live catalog, not a stale snapshot.
4. **Support streaming.** When the client asks for a streamed response, send results back incrementally as Server-Sent Events instead of one blocking JSON body - the same SSE discipline as [4.3](./m4-3-streaming.md). Long answers feel responsive; short ones cost nothing extra.
5. **Verify both surfaces.** `curl` the `/ask` endpoint with a representative question and confirm the `_meta` fields; then connect to the same server over MCP and confirm the `ask` tool appears. An NLWeb server that fails the MCP handshake is only half-deployed.

## References
- [NLWeb project](https://github.com/microsoft/NLWeb?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org vocabulary](https://schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [HTML Living Standard - Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

If standing up a vector store, an ingestion pipeline, and a model backend is more than you want to own, the [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-10-nlweb) can host the NLWeb server for you. Point it at your Schema Feeds and Forter publishes a conformant `POST /ask` endpoint under your domain - reachable both as plain HTTP and as the MCP tool every NLWeb instance also exposes - and re-ingests on a schedule so answers track your live catalog.

---
id: m4-1-openapi-spec
module: actionable
moduleNumber: 4
guidelineNumber: 1
title: Ship OpenAPI specification
complexity: 4
impact: 5
visualChange: none
forterApplies: 'yes'
---

# 4.1  Ship OpenAPI specification

## What & why
OpenAPI 3.x is the source of truth that every downstream agent artifact compiles from: MCP tools, function-calling schemas, SDKs, CLI commands, plugin manifests. A complete spec - published, linked from an RFC 9727 catalog - lets an agent resolve your entire API surface from your domain alone. Most teams already have a partial spec; the work is filling gaps and tightening descriptions.

Treat the spec as a **living substrate**, not a frozen deliverable: [4.3](./m4-3-streaming.md) annotates streaming operations in it, [4.8](./m4-8-payment-protocols.md) adds payment metadata, and the SDK, CLI, and MCP pipelines regenerate from it on every change. You author it once here and extend it in place as later guidelines land - that's planned maturation, not rework.

## Scoring
- **Effort 4/5** - Real schema work across every endpoint, error, and pagination param. Annotation-driven generation helps but doesn't substitute for thinking.
- **Impact 5/5** - Modules 4 and 5 functionally do not exist without this. Every protocol surface downstream depends on it.
- **Visual change: none** - adds `/openapi.json` and `/.well-known/api-catalog` at machine-only paths; user-visible site is unchanged.

## Steps
1. **Author OpenAPI 3.1** (or 3.0 if your tooling lags) at `/openapi.json` and `/openapi.yaml`. Cover every public endpoint. CI-fail any route that ships without spec coverage. Lint with Spectral against a ruleset that bans `additionalProperties: true` defaults and untyped `object` responses.
2. **Write descriptive `operationId`s and `description`s.** `createOrder` beats `postOrders`. Each operation gets a one-paragraph description in plain English - this is what the LLM reads when picking a tool, and the same text feeds [4.4](./m4-4-mcp-server.md)'s MCP tool descriptions. Tag operations into resource groups so the eventual MCP tool listings stay scannable.
3. **Type every response, including errors.** Define a shared `Error` schema with `type`, `message`, `request_id`, `retry_hint` (see [4.2](./m4-2-rate-limits-and-errors.md)) and reference it from every `4xx` / `5xx` response. No `additionalProperties` escapes; agents cannot infer what isn't declared.
4. **Specify pagination explicitly.** Pick one model - cursor-based is friendliest - and document `cursor`, `limit`, and the response envelope (`data[]`, `next_cursor`, `has_more`) on every list endpoint.
5. **Publish an RFC 9727 API catalog** at `/.well-known/api-catalog`. JSON document linking your OpenAPI file(s), versioning policy, sandbox URLs, and contact metadata.
6. **Negotiate agent-friendly views.** When an agent sends `Accept: text/markdown`, return a markdown rendering of the resource (title, key fields, links) instead of raw JSON, and set `Vary: Accept` so caches keep the JSON and markdown variants apart. For agents and crawlers that can't set a request header, honor a `?mode=agent` query parameter that returns the same stripped-down, markdown-style view of any page or resource. JSON clients and browsers see no change.

## References
- [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9727 - API Catalog](https://datatracker.ietf.org/doc/html/rfc9727?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Spectral OpenAPI linter](https://github.com/stoplightio/spectral?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/release-notes?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

This is a guideline you can hand to Forter almost in full. Rather than authoring and maintaining a public API yourself, you expose your internal tools and capabilities privately to the [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-1-openapi-spec) - and only to Forter - and it becomes your API gateway. From the tools you allow, it derives the OpenAPI 3.x spec, writes the request and response schemas, publishes `/openapi.json` and the RFC 9727 catalog on your domain, and keeps the spec aligned as those tools change - no drift, no hand-maintained document.

Everything downstream is generated from that one exposed surface: MCP tools ([4.4](./m4-4-mcp-server.md)), function-calling schemas, the SDKs and CLI ([4.7](./m4-7-sdks-and-cli.md)), and the rate-limit and error contract ([4.2](./m4-2-rate-limits-and-errors.md)) - rate-limited and version-managed at the gateway. The REST design, schema discipline, SDK distribution, and the ongoing work of keeping integrators current are effectively offloaded.

What stays yours: the tools themselves and the business logic behind them. You decide what to expose; Forter turns it into a complete, maintained, agent-ready API surface.

# Changelog

## v1.2 — 2026-09-16

Tracked the MCP `2026-07-28` stateless revision across the guide and the audit probes, which now speak `server/discover` with an `initialize` fallback: 4.4 gains server-minted handles, cacheable list results and the sampling / roots / logging / HTTP+SSE deprecations, and 4.3 gains the Tasks extension alongside the removal of SSE resumability. Swapped RFC 7591 DCR for Client ID Metadata Documents in 3.1 and 3.3, documented the Agent Skills standard and its `/.well-known/` index in 4.6, and refreshed WebMCP, Web Bot Auth, x402 and AGENTS.md status — WebMCP's impact deliberately held at 3, since the API now ships by default at Shopify and Cloudflare but no mainstream agent calls it yet. Note when comparing audits: m4-4's `weight_total` moved 9 → 10, so m4-4 scores are not comparable to reports generated before this release.

## v1.1 — 2026-07-06

Added ARD (Google Agentic Resource Discovery) and AFDocs (Agent-Friendly Documentation Spec); tightened scoring rationale across all modules.

## v1.0 — 2026-06-10

Initial release — 25 guidelines across five modules (Discoverable, Comprehensible, Trustworthy, Actionable, Experiential), with audit rubrics and the Forter practitioner's walkthrough.

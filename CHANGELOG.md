# Changelog

## v1.3 - 2026-09-21

Audit probes gained agent-operability checks where they already test server-rendered HTML: whether the page can be driven through the accessibility tree (real controls, accessible names, labelled fields) and whether anything has parked hidden instructions in it. Smaller additions across the rubrics: ARD trust manifests, branded MCP registry entries, agent-readable 404 bodies, served-markdown hygiene, trust anchor pages, and Agent Plugins manifests. Note when comparing audits: m1-3's weight total moved from 11 to 12, so those scores are not comparable to reports generated before this release.

A new section in the introduction on the 2026 generation of persistent personal agents - Grok Bot, Instinct and Muse. It covers the cloud-resident architecture that makes them persistent, proactive and asynchronous, what that asks of your site in return (stable identifiers, idempotent endpoints, long-running operations), and the screen-scraping fallback they reach for when the protocols are missing.

## v1.2 - 2026-09-17

Tracked the stateless MCP revision across the guide and the audit probes: server-minted handles, cacheable tool listings, and a Tasks extension for work that outlives a single request. Replaced dynamic client registration with Client ID Metadata Documents in the OAuth guidance, added the Agent Skills standard, and refreshed the status of WebMCP, Web Bot Auth, x402 and AGENTS.md. Note when comparing audits: the MCP server rubric's weight total moved from 9 to 10, so those scores are not comparable to reports generated before this release.

## v1.1 - 2026-07-06

Added ARD (Google Agentic Resource Discovery) and AFDocs (Agent-Friendly Documentation Spec); tightened scoring rationale across all modules.

## v1.0 - 2026-06-10

Initial release - 25 guidelines across five modules (Discoverable, Comprehensible, Trustworthy, Actionable, Experiential), with audit rubrics and the Forter practitioner's walkthrough.

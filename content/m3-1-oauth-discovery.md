---
id: m3-1-oauth-discovery
module: trustworthy
moduleNumber: 3
guidelineNumber: 1
title: Implement OAuth
complexity: 5
impact: 4
visualChange: medium
forterApplies: 'flagship'
---

# 3.1  Implement OAuth

## What & why
OAuth 2.0 is the only credential model that lets an agent authenticate to your API on a user's behalf without anyone pasting a key into a config file. Pair it with two well-known discovery documents (**RFC 8414** for the authorization server, **RFC 9728** for the protected resource), and an agent can resolve your auth flow from your domain alone. This is the most technically dense guideline in the guide, and the one where Forter most accelerates delivery.

It's also the only reliable way to turn an agent session into a **known, returning user**. The authorization-code redirect brings the human into a first-party browser context to authenticate directly with you - rather than remaining hidden behind the agent - so you can recognize a returning customer, attach their saved profile and payment methods, and apply identity-aware risk checks. Without it, every agent-driven visit falls back to an anonymous guest you can neither recognize nor reason about.

Scopes are also your **blast-radius limit** - a leaked or misused token shouldn't be able to do more than the user authorized. Get scope design right early; it's painful to retrofit.

## Scoring
- **Effort 5/5** - Standards-heavy. PKCE, refresh-token rotation, scope design, key rotation, replay protection, and dynamic client registration all have to be right. Off-the-shelf libraries help but don't eliminate the work.
- **Impact 4/5** - The only reliable path to an authenticated, returning user: with it, an agent's visit attaches to a real identity; without it, every interaction collapses to an anonymous guest.
- **Visual change: medium** - Adds a consent / authorize screen. Existing public pages don't change.

## Steps
1. **Stand up an OAuth 2.0 + OIDC authorization server** with PKCE required for all public clients (RFC 6749, RFC 7636). Issue short-lived access tokens (15-60 min) and refresh tokens with **rotation on every use** - so an exfiltrated refresh token gets invalidated the next time the legitimate client refreshes.
2. **Design scopes that map to API resources, narrowly.** Prefer `orders:read`, `payments:write` over generic `read` / `write`. Agents are granted least privilege, your audit trails get cleaner, and the blast radius of any leaked token is bounded by what was actually authorized.
3. **Publish authorization-server metadata** at `/.well-known/oauth-authorization-server` (RFC 8414): `issuer`, `authorization_endpoint`, `token_endpoint`, `jwks_uri`, supported response types and grant types.
4. **Publish protected-resource metadata** at `/.well-known/oauth-protected-resource` (RFC 9728): `resource`, `authorization_servers`, `scopes_supported`, `bearer_methods_supported`. This lets an agent skip the 401-then-`WWW-Authenticate` round-trip and resolve auth in one shot. This is also where the `auth.md` `agent_auth` discovery hook lives - see [3.3](./m3-3-self-serve-credentials.md).
5. **Issue client credentials self-serve - prefer Client ID Metadata Documents over DCR.** This flipped in 2026. MCP `2026-07-28` **deprecated RFC 7591 Dynamic Client Registration** as a registration mechanism in favour of **Client ID Metadata Documents (CIMD)**, where the client's `client_id` *is* an HTTPS URL that resolves to its own metadata document - no registration call, no per-client secret for you to store. Support CIMD as the primary path and keep DCR available only as a fallback for authorization servers that don't speak it yet. See [3.3](./m3-3-self-serve-credentials.md) for the full programmatic-issuance flow.
6. **Harden the authorization exchange.** Three tightenings ship with the same revision, all cheap and all worth doing even if you never touch MCP. Include the `iss` parameter in authorization responses (RFC 9207), and validate a present `iss` against the recorded issuer before redeeming an authorization code - this is the fix for mix-up attacks across multiple authorization servers. Treat client credentials as **issuer-bound**: key them by issuer identifier, never reuse them against a different authorization server, and force re-registration when the authorization server changes. And if you do accept DCR, require clients to send an appropriate `application_type` so OpenID Connect redirect-URI conflicts don't silently open a hole.
7. **Audit-log every token event** - issuance, refresh, revocation, scope-mismatch denials - indexed by `client_id` and `sub`. This is your forensic primitive when a session needs investigating later.

## References
- [RFC 6749 - OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7591 - Dynamic Client Registration](https://datatracker.ietf.org/doc/html/rfc7591?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP client registration - Client ID Metadata Documents](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#client-id-metadata-documents)
- [RFC 9207 - OAuth 2.0 Authorization Server Issuer Identification](https://datatracker.ietf.org/doc/html/rfc9207?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8414 - Authorization Server Metadata](https://datatracker.ietf.org/doc/html/rfc8414?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9728 - Protected Resource Metadata](https://datatracker.ietf.org/doc/html/rfc9728?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

The [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m3-1-oauth-discovery) operates a production OAuth 2.0 server, exposed under your domain via reverse-proxy. RFC 8414 + RFC 9728 metadata is published on your origin. PKCE, refresh-token rotation, JWKS rotation, replay caching, and dynamic client registration are handled - turning a standards-heavy build into a simple integration project.

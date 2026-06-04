---
id: m3-2-web-bot-auth
module: trustworthy
moduleNumber: 3
guidelineNumber: 2
title: Verify bots cryptographically
complexity: 4
impact: 3
visualChange: none
forterApplies: 'flagship'
---

# 3.2  Verify bots cryptographically

## What & why
Bad bots can cosplay as good ones. A scraper sets `User-Agent: ChatGPT-User` and a UA-allowlist waves it through; a competitive-intelligence crawler claims to be Perplexity and harvests your pricing tables; a credential-stuffing bot dresses as ClaudeBot to avoid your rate limits. Without cryptographic proof, every UA string is a guess.

**RFC 9421 HTTP Message Signatures** - the cryptographic backbone of Web Bot Auth - solves this. Real agents (OpenAI's web-fetching agent, for example) sign their requests with Ed25519 keys and identify themselves with a `Signature-Agent` header (e.g. `Signature-Agent: "https://chatgpt.com"`); you verify the signature against their published key directory and let them through. A spoofer with no valid signature gets rejected.

## Scoring
- **Effort 4/5** - RFC 9421 is precise: canonicalization, signature base construction, JWKS hosting, key rotation, replay caching, and observability all have to be right.
- **Impact 3/5** - Cleanest abuse-control surface in the protocol stack. Spoofed bot traffic is a dominant abuse vector but still gaining adoption.
- **Visual change: none** - adds `/.well-known/http-message-signatures-directory` and DNS records at machine-only paths; verification at the edge is invisible to human visitors.

## Steps
1. **Publish a signature directory** at `/.well-known/http-message-signatures-directory` with a `keys` array of Ed25519 JWKs. Each key carries `kty=OKP`, `crv=Ed25519`, a stable `kid`, and `nbf` / `exp` validity windows.
2. **Verify `Signature-Input` and `Signature` headers** on every inbound request that claims a known agent UA. Reconstruct the signature base from the covered components (`@method`, `@authority`, `@path`, `content-digest`, etc.), resolve the `keyid` against the agent operator's published JWKS, and verify with Ed25519. Reject on mismatch with `401 Unauthorized` and a `WWW-Authenticate: Signature` challenge.
3. **Reject unsigned bot traffic** that claims to be a known agent. A request advertising `User-Agent: ChatGPT-User` (or a `Signature-Agent` it can't prove) with no valid signature is a spoofer - drop it. (You may want to log first; the spoof patterns themselves are useful telemetry.)
4. **Rotate keys on a known cadence.** 90-day rotation is standard. Roll new keys into the directory with future `nbf`, retire old keys by setting `exp`, overlap windows by 7-14 days so signers in flight don't fail mid-roll.
5. **Cache signature `nonce` values** to prevent replay. A bounded LRU keyed by `(kid, nonce)` with a TTL slightly longer than your `created` skew tolerance is sufficient.
6. **Instrument verification failures.** Emit metrics for total signed requests, failures by mode (unknown `kid`, bad signature, expired `created`, replay), and per-UA spoof ratios. This is your bot-fraud telemetry - and the input to anomaly detection.
7. **(Emerging) Publish DNS-AID discovery records.** [DNS for AI Discovery (DNS-AID)](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) lets agents find your entrypoints straight from DNS, before any page fetch. Publish a ServiceMode SVCB record for your org index at `_index._agents.example.com` (per-agent records carry the protocol in the `alpn` SvcParam - `alpn="mcp"` / `alpn="a2a"` - not in the label) per [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide). Then **sign the public discovery zone with DNSSEC** so validating resolvers return authenticated data - this is what cryptographically ties discovery to your domain, and the reason to roll it out carefully: a botched DNSSEC change can take the whole zone dark. It is an early IETF draft - treat it as forward-looking.

## References
- [RFC 9421 - HTTP Message Signatures](https://datatracker.ietf.org/doc/html/rfc9421?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) (the `alg` label is `ed25519`)
- [RFC 8032 - EdDSA (the Ed25519 signature algorithm)](https://www.rfc-editor.org/rfc/rfc8032?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8037 - Ed25519 keys in JOSE/JWK (`kty=OKP`, `crv=Ed25519`)](https://datatracker.ietf.org/doc/html/rfc8037?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [web-bot-auth architecture draft](https://datatracker.ietf.org/doc/draft-meunier-web-bot-auth-architecture/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cloudflare Web Bot Auth](https://blog.cloudflare.com/web-bot-auth/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [DNS for AI Discovery (DNS-AID)](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9460 - SVCB and HTTPS DNS records](https://www.rfc-editor.org/rfc/rfc9460?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Forter Trusted Agentic Commerce Protocol (TACP)](https://github.com/forter/trusted-agentic-commerce-protocol?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

The orchestration suite runs RFC 9421 signature verification at the edge - Ed25519 key rotation, replay caching, JWKS resolution, and per-request verification of inbound bot traffic.

Web Bot Auth verifies *who* is calling; it does not protect *what* is exchanged. For that, Forter authors the open [**Trusted Agentic Commerce Protocol (TACP)**](https://github.com/forter/trusted-agentic-commerce-protocol?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) - where Web Bot Auth is a signing protocol, TACP is an encryption protocol. It carries multi-party agentic-commerce data reliably and two-way, so an agent, the merchant, and the parties between them can exchange sensitive order, payment, and identity data without exposing it to every hop on the path.

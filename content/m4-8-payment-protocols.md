---
id: m4-8-payment-protocols
module: actionable
moduleNumber: 4
guidelineNumber: 8
title: Support agent payment protocols
complexity: 4
impact: 2
visualChange: none
forterApplies: 'partial'
---

# 4.8  Support agent payment protocols

## What & why
When an agent has to settle a payment at the moment of an HTTP call - buying metered API access, paying for compute, or checking out an order - it has to do so without a human typing a card number. Agent-native payment splits into a **settlement** layer that answers the HTTP `402 Payment Required` handshake (x402, MPP) and an **authorization** layer that proves the user actually approved the purchase (AP2):

- **x402** (Coinbase) is the minimal, crypto-native case: one request, one stablecoin payment (USDC, usually on Base), one response. It is purpose-built for machine-to-machine metering - API calls, data feeds, compute, agent-to-agent services - and is **stablecoin-only**, so it does not reach card/bank rails or physical-goods checkout.
- **MPP** (Machine Payments Protocol, from Stripe and Tempo, now an IETF Internet-Draft) generalizes the same `402` exchange into a **payment-method-agnostic** framework. A single endpoint can accept stablecoins, cards, bank transfers, even Bitcoin, and it carries two intents: `charge` (one-shot - which maps directly onto an x402 payment, making MPP backwards-compatible with it) and `session` (pre-authorize a spending limit once, then stream granular micropayments). That breadth means MPP is **not** limited to per-call metering - the same handshake settles for **physical goods and services across crypto *and* traditional rails**.
- **AP2** (Agent Payments Protocol, Google) sits a layer up. Instead of settling a `402`, it carries **cryptographic proof that the user authorized this purchase** - a signed *Mandate* (an SD-JWT *Checkout Mandate* for what was authorized, in open/pre-authorization or closed/final form, plus a *Payment Mandate* for the funding instrument). Built as an extension of A2A and advertised on your `agent-card.json`, it's payment-method-agnostic and **composes** with the settlement layer rather than replacing it: AP2 *authorizes*, x402 and MPP *settle*.

These are early standards - adoption is growing fast but the specs still move - so treat this as forward-positioning, not table stakes.

## Scoring
- **Effort 4/5** - Payment middleware on every priced route, a funded wallet, facilitator wiring, and settlement reconciliation - plus the standing operational weight of holding and securing a wallet. The protocols are still in flux, so expect spec churn on top.
- **Impact 2/5** - Forward-looking. Real for sites selling metered access or accepting agent-native checkout today, but adoption is early and the downside of waiting is low.
- **Visual change: none** - `/.well-known/*` discovery files and HTTP `402` responses on paid routes; human-visible pages don't change.

## Steps
1. **x402 for crypto-native pay-per-request.** x402 negotiates payment inline over HTTP, settled in stablecoins on crypto rails. When an agent calls a priced route, the server answers `402 Payment Required` with the payment terms - amount, accepted scheme, and where to pay. The agent settles those terms - typically through a *facilitator* that brokers and verifies the transfer - and retries with proof of payment, which returns the real response. To support it, mark your paid routes, point them at a facilitator and a receiving wallet, and advertise which routes are priced so agents can find the paid surface before calling. Open-source middleware for the common web frameworks makes the wiring mostly configuration.
2. **MPP for multi-rail and physical-goods settlement.** MPP answers the `402` with a `WWW-Authenticate: Payment` challenge whose `method` (`tempo`, `stripe`, `card`, `lightning`, ...) and `intent` (`charge` for one-shot, `session` for streaming) pick the rail and the payment shape - so one integration covers stablecoins, cards, and fiat and reaches physical-goods checkout, not just metered calls. Annotate payable operations in your `/openapi.json` ([4.1](./m4-1-openapi-spec.md)) so agents can discover priced surfaces, and wire the MPP middleware (SDKs ship for TypeScript, Python, and Rust) to handle the handshake and settlement.
3. **AP2 for proof of authorization.** If agents transact on a user's behalf, advertise AP2 support as an A2A extension on your `/.well-known/agent-card.json` (extension URI `https://github.com/google-agentic-commerce/ap2/v1`) and accept the signed Mandates on your checkout path. This is what lets a merchant or card network trust that the absent buyer really authorized *this* cart at *this* price - the trust layer that x402/MPP settlement rides on.
4. **Reuse your auth and error stack.** Every payment route sits behind the OAuth scopes from [3.1](./m3-1-oauth-discovery.md) and returns the structured error envelope from [4.2](./m4-2-rate-limits-and-errors.md). A declined payment is `type: "payment_required"` or `type: "payment_declined"` with an honest `retry_hint` - never a bare `500`.

## References
- [x402 protocol](https://x402.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MPP - Machine Payments Protocol](https://mpp.dev?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [AP2 - Agent Payments Protocol](https://ap2-protocol.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

The hardest part of agent payments is not the `402` handshake - it is everything around the wallet: creating one, funding and maintaining it, and satisfying KYC / KYA obligations on the parties transacting through it. The [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-8-payment-protocols) speaks x402 and MPP at the gateway and can take that wallet burden on - standing up and maintaining the wallet behind your priced routes, with identity and KYC/KYA checks drawn from the Forter Identity Network applied to each settlement.

This part of the orchestration suite is an early-stage offering and moves with the protocols themselves - scope it with Forter for what is production-ready today versus on the roadmap. What stays yours: your pricing, and the processor relationship behind settlement.

---
id: m4-9-commerce-protocols
module: actionable
moduleNumber: 4
guidelineNumber: 9
title: Support agentic commerce protocols
complexity: 4
impact: 4
visualChange: none
forterApplies: 'yes'
---

# 4.9  Support agentic commerce protocols

## What & why
When an agent shops on a user's behalf - finds a product, builds a cart, checks out, and after the sale checks order status, initiates a return, or disputes a charge - it needs a structured commerce surface, not a scrape of your storefront HTML. Two protocols cover this: **UCP** (Universal Commerce Protocol) and **ACP** (Agentic Commerce Protocol). Both let an agent discover a catalog, assemble a cart, and complete a purchase against a defined contract. This guideline applies if an agent could browse your products and check out on a user's behalf; if you only sell metered, pay-per-call access, that is [4.8](./m4-8-payment-protocols.md) instead, and if you sell nothing at an agent call, skip both.

These standards are still settling, but adoption is real and accelerating - merchants are transacting through Google, Gemini, and AI-mode surfaces today.

## Scoring
- **Effort 4/5** - A real commerce surface: catalog or feed submission, cart state, a checkout flow, and settlement wiring - all on specs that keep moving.
- **Impact 4/5** - Emerging but transformative: for anyone selling products to agents, this is fast becoming where the sale happens.
- **Visual change: none** - discovery and checkout endpoints; user-visible pages don't change.

## Steps
1. **Support UCP.** Publish a `/.well-known/ucp` discovery file declaring your services, capabilities, and endpoints. UCP builds on Google's shopping graph, so your products must also be listed - and kept current - as a catalog in Google Merchant Center. Then implement `/checkout-sessions` in full compliance with the UCP spec, every request and response shape it defines, so an agent can assemble a cart and complete the purchase through what UCP calls the *payment handler*.
2. **Support ACP.** Publish a `/.well-known/acp.json` discovery file, and submit your product catalog to OpenAI so ACP-driven agents can discover your items. Then implement `/checkout_sessions` in full compliance with the ACP spec, every request and response it defines, so an agent can run the checkout end to end and settle through what ACP calls *delegated payment*.
3. **Keep the platforms in sync with webhooks.** A completed checkout is only the start of the order's life. Send webhooks back to the agent platform on order completion, cancellation, and every order-status change (shipped, delivered, refunded) so the agent - and the user it acts for - always sees current state, not a stale snapshot.
4. **Move guests to registered users.** A protocol checkout defaults to guest checkout. Add identity linking and/or OAuth ([3.1](./m3-1-oauth-discovery.md)) so an agent's purchase can attach to a real, returning customer account - unlocking order history, saved preferences, and loyalty instead of leaving every agent sale anonymous.

## References
- [UCP - Universal Commerce Protocol](https://ucp.dev/specification/overview/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [ACP - Agentic Commerce Protocol](https://www.agenticcommerce.dev/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google Merchant Center](https://merchants.google.com/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

Agentic commerce is the part of this module the [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-9-commerce-protocols) can shoulder most completely - and it scales to however much of the stack you want to hand over.

- **Product feed** - Forter can build and maintain the catalog feed UCP and ACP run on, or work from the feed you already produce.
- **Tokenization and settlement** - Forter is a PCI-compliant tokenizer for the settlement step of both protocols, *and* a PSP-agnostic payment orchestrator that can authorize and capture funds on your behalf - or it slots in alongside the tokenization and processor you already use.
- **Cart and checkout** - Forter runs the cart and checkout flows for you, working *inside* your existing OMS and internal systems rather than around them.
- **Webhooks and identity** - if you are already a Forter customer with the orchestration suite integrated, the order webhooks and status updates of step 3 are handled for you, and Forter's identity linking is built in - so steps 3 and 4 land with little extra work.
- **Post-purchase** - returns, refunds, and chargeback disputes are where loss concentrates after the sale, and agents will initiate all three on a user's behalf. Forter's **Abuse Prevention** scores return and refund requests for abuse before you approve them; **Dispute Management** handles chargeback representment and recovery on the disputes that land - both drawing on the same Forter Identity Network signal that cleared the checkout.
- **Spec drift** - UCP and ACP are still moving; Forter tracks every revision so your integration doesn't break when a spec changes underneath it.

The deeper value is in what these protocols *don't* carry. As they stand, neither UCP nor ACP surfaces every signal a sound validation and fraud decision needs. Forter collects the missing pieces - identity, device reputation, behavioral history, agent provenance - and assembles them, alongside the cart, into one coherent validation and fraud-check call. That mapping-and-collection work is substantial and easy to underestimate; offloading it is the difference between a checkout that merely completes and one you can trust. Every checkout the orchestration suite brokers carries the same Forter Identity Network signal that runs human card-not-present commerce.

What stays yours: your catalog, your pricing, and the decision of how much to bring versus hand over.

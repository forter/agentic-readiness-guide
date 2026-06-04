---
id: m2-4-competitive-positioning
module: comprehensible
moduleNumber: 2
guidelineNumber: 4
title: Position competitively
complexity: 2
impact: 4
visualChange: high
forterApplies: 'no'
---

# 2.4  Position competitively

## What & why
When a user asks an agent "{you} vs {competitor}" or "alternatives to {competitor}", the agent returns whatever pages it can find. If you haven't written the comparison, the top result will be your competitor's blog or a third-party review site optimized for affiliate revenue - not accuracy. Owning your comparison surface is how you ensure agents have a citable, first-party version of your differentiation. The same logic applies to **pricing**: an agent asked "what does {you} cost?" needs a first-party, machine-readable answer, or it quotes a stale third-party guess - and price is one of the highest-intent things a buyer asks before converting.

## Scoring
- **Effort 2/5** - Mostly a writing exercise. One page per top competitor plus an aggregate alternatives page.
- **Impact 4/5** - Versus-queries are an enormous share of high-intent agent traffic in B2B.
- **Visual change: high** - net-new public marketing pages: `/compare/{competitor}`, `/alternatives`, and `/pricing`.

## Steps
1. **Publish `/compare/{competitor}` pages for your top 3-5 named competitors.** Each page: a one-paragraph honest summary, a feature comparison table, a pricing-model comparison, and 1-2 customer-win metrics ("After switching from {competitor}, customers report 31% fewer out-of-stock errors surfaced to shoppers over 6 months" - or whatever conversion, fulfilment, or retention number is the one your buyers actually care about). Mark up tables with `Schema.org/Table` and the page with `Article` JSON-LD.
2. **Publish a single `/alternatives` aggregator page.** "Alternatives to {your product}" - covering each competitor briefly, when each one is the better fit (yes, including cases where it isn't you), and linking through to per-competitor pages. Agents reward intellectual honesty with citations.
3. **Publish an agent-readable `/pricing` page.** *(Steps 3-4 apply where your business model has publicly listed pricing - digital goods, subscriptions, SaaS-adjacent commerce. Many transactional retailers price per-SKU on the product page rather than in plan tiers; if that's you, your prices already live in `Product` / `Offer` JSON-LD ([2.1](./m2-1-json-ld.md)) and you can skip to step 5.)* Every plan tier, its price, the billing unit, and what's included - as real HTML text and a `<table>`, not an image or a JS-rendered widget. Mark each tier up with `schema.org/Offer` JSON-LD (`price`, `priceCurrency`, `name`) nested under your `Product` / `SoftwareApplication` schema from [2.1](./m2-1-json-ld.md). If your pricing is genuinely usage-based, state the formula and a worked example - "vague, contact us" reads as no pricing at all.
4. **Add a machine-readable `/pricing.md`.** A plain-markdown mirror of the pricing page - one section per tier with price, unit, and limits - served as `text/markdown`. It's the file an agent fetches to answer a cost question in one round-trip, and it pairs with the `## Pricing` section of your `llms.txt` ([2.2](./m2-2-llms-txt-content.md)).
5. **Keep tone factual, not gloating.** "{Competitor} offers per-event pricing; we offer per-outcome pricing tied to {your unit}" beats "{Competitor}'s pricing is confusing and expensive." The first is quotable; the second gets filtered as marketing noise.
6. **Cite your sources.** Every competitor claim should link to the competitor's own docs, pricing page, or a dated public statement. Uncited assertions get downweighted by retrieval.

## References
- [Schema.org Article](https://schema.org/Article?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Table](https://schema.org/Table?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Offer](https://schema.org/Offer?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

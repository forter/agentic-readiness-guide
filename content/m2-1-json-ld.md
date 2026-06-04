---
id: m2-1-json-ld
module: comprehensible
moduleNumber: 2
guidelineNumber: 1
title: Publish complete JSON-LD structure
complexity: 2
impact: 4
visualChange: none
forterApplies: 'no'
---

# 2.1  Publish complete JSON-LD structure

## What & why
JSON-LD is how an LLM collapses "the company called {your brand}" into a single entity instead of an ambiguous brand-name string. One `<script type="application/ld+json">` block per page - bundling every entity that page describes in an `@graph` array, declaring `@type`, identity, and `sameAs` links - is the difference between being summarized correctly and being confused with another vendor of the same name (or worse, another vendor's hostile marketing copy). Bonus: it powers Google Rich Results, Bing AI snapshots, and the speakable layer voice agents read aloud.

## Scoring
- **Effort 2/5** - Template work. One block per page-type (home, product, blog), then automate from CMS metadata.
- **Impact 4/5** - Identity disambiguation is essential for any brand whose name collides with another entity.
- **Visual change: none** - JSON-LD lives inside `<script>` tags; users see nothing different.

## Steps
1. **One `@graph` block, the right `@type` per page.** Wrap every entity a page describes in a single `"@graph": [ ... ]` array instead of scattered `<script>` tags. Give each node a stable `@id` (e.g. `https://example.com/#organization`) and cross-reference by `@id` - so a `Product`'s `brand` points at the same `Organization` node and agents resolve one coherent entity. Pick the `@type` per page: `Organization` on the homepage and `/about`; `Product` or `SoftwareApplication` on product pages (`applicationCategory`, `offers`, `aggregateRating` where honest); `Article` on posts (`author`, `datePublished`, `dateModified`).
2. **Complete the `Organization` block.** Required: `name`, `url`, `logo`, `description`. Add `contactPoint` (`contactType`, `email`, `telephone`) and an `address` as a `PostalAddress`.
3. **Add `sameAs` entity linking.** Point at Wikipedia, Wikidata (`.../wiki/Q…`), your verified GitHub org, LinkedIn, X, Crunchbase. Wikidata is load-bearing - it's the ID most knowledge graphs key off.
4. **Add `Speakable` markup.** Attach a `speakable` property to your page's `WebPage`/`Article` node: `"speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".summary", ".key-stats"] }` so voice agents read your hand-picked summary, not a guessed paragraph. The selectors must resolve to real elements on the page - a `cssSelector` that matches nothing is dead markup. (`xpath` is the alternative locator; note schema.org spells it `xpath` while Google's docs use `xPath`.)
5. **Broaden your vocabulary past the basics.** `Organization`, `Product`, and `Article` are the floor. Add domain-appropriate types - `FAQPage` on help pages, `Service` per offering, `Review` / `AggregateRating` where honest, `BreadcrumbList` for navigation, `LocalBusiness` for physical locations. Each is a class of question an agent can answer from structured data instead of guessing.
6. **Back the schema with real trust-anchor pages.** The `contactPoint` and `address` from step 2 must resolve to something real: an `/about` with genuine history, a `/contact` with working channels, a `/privacy` with an actual policy - each 500+ characters of substantive text, not a stub. Agents probe these to judge legitimacy before recommending you; an empty trust page reads as a red flag.
7. **Validate.** Run every page-type through Google's [Rich Results Test](https://search.google.com/test/rich-results?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) and the [Schema.org Validator](https://validator.schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide). Fix warnings, not just errors - agents are stricter than Google's render pipeline.

Putting it together, a homepage block bundles the organization, the product, an `FAQPage`, and the speakable selectors into one `@graph`, cross-linked by `@id`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Acme",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "description": "One-sentence, model-facing description of what Acme does.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "sales@example.com",
        "url": "https://example.com/contact"
      },
      "sameAs": [
        "https://en.wikipedia.org/wiki/Acme",
        "https://www.wikidata.org/wiki/Q12345678",
        "https://github.com/acme",
        "https://www.linkedin.com/company/acme"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://example.com/#software",
      "name": "Acme Platform",
      "applicationCategory": "BusinessApplication",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#organization" },
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/contact",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "ratingCount": "29"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://example.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does Acme do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A direct, factual two-sentence answer an agent can quote verbatim."
          }
        },
        {
          "@type": "Question",
          "name": "Can my AI agent integrate with Acme?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes - Acme publishes an MCP server, a REST API, and an OpenAPI 3.x spec. See https://example.com/AGENTS.md."
          }
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://example.com/#webpage",
      "url": "https://example.com",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".hero-subtitle", ".key-stats"]
      }
    }
  ]
}
```

## References
- [Schema.org Organization](https://schema.org/Organization?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org sameAs](https://schema.org/sameAs?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Speakable](https://schema.org/SpeakableSpecification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org FAQPage](https://schema.org/FAQPage?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google Rich Results Test](https://search.google.com/test/rich-results?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

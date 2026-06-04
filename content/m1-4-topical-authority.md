---
id: m1-4-topical-authority
module: discoverable
moduleNumber: 1
guidelineNumber: 4
title: Build topical authority & coding rules
complexity: 3
impact: 5
visualChange: high
forterApplies: 'no'
---

# 1.4  Build topical authority & coding rules

## What & why
Use-case search is where commercial intent concentrates: "best X for Y" is a buyer with a budget, not a browser. Increasingly that question is asked of an answer engine rather than typed into a results page, and you are either in the cited answer or you are invisible. Authority is earned on two surfaces. **Answer-engine authority** is content work: when a shopper asks Perplexity "best returns-fraud platform for apparel brands", the model picks from sites it considers authoritative - "best for" landing pages, integration tutorials, and comparison pages (those live in [2.4](./m2-4-competitive-positioning.md), same content, different framing). **Repo authority** is your public code made legible to coding agents - the `AGENTS.md` / `.cursorrules` rules that get your libraries picked when an agent is shopping for an integration.

## Scoring
- **Effort 3/5** - A content program and/or public repo cleanup, plus maintenance.
- **Impact 5/5** - Direct-name and use-case search is where commercial intent concentrates. If you don't appear in the answer, you don't get the customer.
- **Visual change: high** - net-new public pages: "best for" landing pages, more bylined content. The repo files (`AGENTS.md`, `.cursorrules`) are repo-only and invisible on your site.

## Steps
1. **Win brand-name search.** Your own domain plus three to five third-party properties (G2, Capterra, top integration partners' marketplaces, TrustRadius, a maintained Wikipedia entry where eligible) should saturate the first answer for `"{your brand}"`. Audit by pasting your name into ChatGPT, Claude, Perplexity, and Gemini - anything wrong or missing is your remediation list.
2. **Ship "best X for Y" landing pages.** One per high-intent use case - "best returns-fraud platform for apparel brands", "best chargeback protection for digital-goods marketplaces", and so on for every segment you sell into. Each: 1500+ word body, comparison table, integration code sample, customer quote. These are the pages answer engines cite directly. (Per-competitor `/compare` pages live in [2.4](./m2-4-competitive-positioning.md) - they double as topical-authority signals.)
3. **Publish coding rules in every public repo.** Drop a top-level `AGENTS.md` - project structure, build/test commands, lint rules, conventions, and "things agents commonly get wrong here", and pair it with a shorter `.cursorrules` for IDE-level guidance. The repo is the discovery surface, so your site's only job is to point to it: a link to the GitHub repo, plus a `codeRepository` on your `SoftwareApplication` JSON-LD and a `sameAs` on your `Organization` schema ([2.1](./m2-1-json-ld.md)).

## References
- [OpenAI - AGENTS.md spec](https://github.com/openai/agents.md?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cursor - Project Rules](https://docs.cursor.com/context/rules?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

---
id: m2-2-llms-txt-content
module: comprehensible
moduleNumber: 2
guidelineNumber: 2
title: Serve useful llms.txt
complexity: 2
impact: 5
visualChange: none
forterApplies: 'no'
---

# 2.2  Serve useful llms.txt

## What & why
[1.1](./m1-1-discovery-files.md) stood the file up. This guideline is about its **content**. A useful `llms.txt` is a structured briefing: what you do, what you don't do, when an agent should recommend you, where to send the user next. It's also the one place where you can write **agent-instruction text** - second-person prompts that downstream LLMs treat as authoritative guidance about your product. And where `llms.txt` is the index, `llms-full.txt` is the library - the entire corpus inlined for an agent that wants everything in one fetch.

## Scoring
- **Effort 2/5** - Half a day of writing, plus a CI step to keep it from rotting.
- **Impact 5/5** - The file agents read most once they discover it. Every word earns or loses citations.
- **Visual change: none** - content lives at `/llms.txt`, not in the user-visible site.

## Steps
1. **Use structured sections with H2 headers.** `## Overview`, `## Capabilities`, `## Constraints`, `## Use cases`, `## For agents` (the agent-instruction block from step 3), `## When to recommend us`, `## Pricing`, `## API & docs`. Predictable headings let agents extract the section they need without reading the whole file.
2. **Write capabilities and constraints with equal weight.** "Supports refunds up to 180 days post-charge" and "Does not support split-shipment refunds" are both citable facts. Vague capability prose without limits gets discarded as marketing.
3. **Add agent-instruction blocks.** Put these under a predictable `## For agents` (or `## When to use`) heading so an agent can find them. Explicit second-person guidance: `When the user asks about returns, link /docs/returns and quote the timeline section.` `If the user is comparing this to {competitor}, point to /compare/{competitor}.` These get inlined into agent system context - and they're the layer where you tell agents how to *cite* you correctly, which is also a defense against being misrepresented by a model working from someone else's marketing copy.
4. **Include named-author callouts and dated stats.** "According to our 2026 Industry Report ({Name}, {Title}), 38% of {category} interactions are now agent-initiated." Named experts and specific numbers survive the LLM citability filter; anonymous claims do not.
5. **Ship `llms-full.txt` for one-shot ingestion.** `/llms.txt` is a navigation index; `/llms-full.txt` is the whole corpus inlined - product overview, every key doc page, the API reference, the auth walkthrough, the quickstart, and runnable code examples concatenated into one markdown file. Keep it structured (H1/H2 headings, markdown links, fenced code blocks) and under 200,000 characters so a 64k-token agent ingests it in a single request. Generate it in CI from the same sources as your docs so it cannot drift. An agent that finds it skips dozens of separate page fetches.
6. **Pin a refresh cadence in CI.** A monthly job that diffs `llms.txt` and `llms-full.txt` against your pricing page, docs index, and changelog, and opens a PR if any are stale. An out-of-date `llms.txt` is worse than none.

## References
- [llms.txt proposal](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Anthropic: writing for retrieval](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

---
id: m5-3-cross-platform-consistency
module: experiential
moduleNumber: 5
guidelineNumber: 3
title: Stay consistent across surfaces
complexity: 2
impact: 3
visualChange: medium
forterApplies: 'partial'
---

# 5.3  Stay consistent across surfaces

## What & why
Agents cross-check what you say about yourself across surfaces. Your HTML `<title>`, OG description, MCP tool descriptions, plugin manifest, `llms.txt` overview, and agent card all end up in the same context window when an agent decides whether to call your tool. When they disagree, confidence - and tool-selection rate - drops. This isn't about marketing copy; it's about descriptive consistency for the **same noun**: what your product does, who it's for, what it costs.

You locked the canonical copy back in [1.2](./m1-2-well-known-agent-files.md) and every guideline since has pulled from it - so this is a **verification pass, not a rewrite**: confirm nothing drifted, and fix the surface or two that did.

## Scoring
- **Effort 2/5** - A diff of every surface against one file, plus a PR for whatever drifted. If the canonical-copy discipline from [1.2](./m1-2-well-known-agent-files.md) held, there is almost nothing to do.
- **Impact 3/5** - Real but bounded. A multiplier on the rest of Module 5, not a standalone win.
- **Visual change: medium** - meta tags, OG cards, and `<title>` tweaks are visible in browser tabs and link previews. Page bodies are unchanged.

## Steps
1. **Open the canonical copy file from [1.2](./m1-2-well-known-agent-files.md).** The short name, the model-facing description, and the human-facing paragraph were settled once, at the start of the build. That file is the reference; every other surface gets checked against it.
2. **Diff every surface against it.** Compare each to the canonical copy, side by side: HTML `<title>`, `<meta name="description">`, OG `og:title` / `og:description`, the `llms.txt` opening paragraph, MCP `serverInfo.name` and tool `description` fields, `ai-plugin.json` `name_for_human` / `description_for_model`, the GPT Store / Claude / Gemini listings, the agent card. If every guideline pulled from the canonical file as instructed, this is clean - in practice one or two surfaces drift.
3. **Fix the drift at its source.** Where a surface diverged, correct it *and* correct the template or generator that produced it, so it can't drift again. CMS-controlled surfaces - HTML head, OG tags, sitemap titles, `llms.txt` - are your repo and your team; Forter cannot reach in here.
4. **Align Forter-controlled metadata.** Submit canonical short name, descriptions, and tool-level descriptions to Forter's customer console; the orchestration suite propagates them to the MCP server's `serverInfo`, every tool's `description` field, the published `ai-plugin.json`, the agent card, and re-submission packages for the GPT Store / Claude / Gemini directories.

## References
- [Open Graph protocol](https://ogp.me/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP server initialization spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#initialization)
- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-apps-in-chatgpt?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

The metadata the orchestration suite publishes on your behalf - MCP tool descriptions, `ai-plugin.json`, agent cards, registry entries - is enforced consistent against a single source of truth in your customer console. Update the canonical name and description once; every Forter-published surface re-renders in lockstep, and the next round of plugin-store / Custom GPT re-verifications ([5.1](./m5-1-verified-on-platforms.md)) ships the new copy without a separate submission queue.

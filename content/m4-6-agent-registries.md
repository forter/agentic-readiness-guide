---
id: m4-6-agent-registries
module: actionable
moduleNumber: 4
guidelineNumber: 6
title: List in agent registries
complexity: 1
impact: 3
visualChange: low
forterApplies: 'yes'
---

# 4.6  List in agent registries

## What & why
With the MCP server live ([4.4](./m4-4-mcp-server.md)) and the OpenAPI clean ([4.1](./m4-1-openapi-spec.md)), you finally have something to publish. Agents discover capabilities through **registries** - not by crawling - and several matter today: **mcp.run, mcphub.io, Smithery, Glama** (MCP-server marketplaces), **skills.sh** (a domain-level skill catalog with first-class indexing in Claude and Cursor), the official **MCP Registry**, **ARD registries** (Google-backed, crawl `ai-catalog.json`), and **score-based directories** (ranking agents may query in real time). Listing is free, the forms are short, and the discipline is keeping descriptions accurate as your tool surface evolves.

## Scoring
- **Effort 1/5** - Four submissions, ~15 minutes each. Quality of the listings is bounded by quality of the underlying spec, so most of the work happened in [4.1](./m4-1-openapi-spec.md) and 4.4.
- **Impact 3/5** - Without listings you're invisible to capability discovery; with them you appear in the picker every time a user asks for "tools that do X."
- **Visual change: low** - listings live on third-party registries, not on your site.

## Steps
1. **mcp.run and mcphub.io.** Submit your MCP server URL, a one-paragraph description, your tool list, and a logo. Both pull tool metadata from your server's `tools/list` endpoint, so the `description` on each MCP tool is what users actually read - write them like API docs, not marketing copy. Tool description quality traces back to your OpenAPI from [4.1](./m4-1-openapi-spec.md).
2. **Smithery.** The largest MCP marketplace. Adds a `smithery.yaml` at your repo root declaring runtime, env vars, and start command - that's what enables one-click installs in Cursor and Windsurf.
3. **skills.sh - register your domain.** Claim your domain at skills.sh and publish a top-level `SKILL.md` per public repo listing every callable skill with `name`, `description`, `inputs`, `outputs`, and an `example` block. Format is markdown with frontmatter - borrow from any well-known repo (e.g., `stripe/stripe.com/SKILL.md`).
4. **skills.sh - quality signals.** The registry ranks listings on three signals: (a) **multiple repos** under the same domain, each with its own `SKILL.md`; (b) **descriptions that pass an LLM rubric** for clarity (no "powerful, easy-to-use platform" filler); and (c) **freshness** - `SKILL.md` updated within 90 days. Sites with one thin `SKILL.md` rank below sites with five focused ones.
5. **Publish to ARD registries.** If you published `/.well-known/ai-catalog.json` in [1.2](./m1-2-well-known-agent-files.md), ARD registries will crawl it and make your capabilities discoverable via natural-language queries. As these registries come online, being crawlable by them is the next registry play. Ensure your `ai-catalog.json` is valid and your `representativeQueries` are well-chosen.
6. **List on score-based directories and monitor your score.** [directory.ora.ai](https://directory.ora.ai) is one free listing. Score-based directories claim agents query rankings in real time to pick vendors - whether or not that becomes real routing volume, a free listing plus score monitoring is 15 minutes of work. Use [journey.ora.ai](https://journey.ora.ai) to watch a real agent run an intent against your live site.
7. **Register on the official MCP Registry.** The [MCP Registry](https://github.com/modelcontextprotocol/registry) is the protocol-level server directory. Alongside Glama (19,831+ servers), it is becoming a primary discovery surface for agent runtimes.
8. **Verify and monitor.** After each submission, search the registry for your brand name and a representative use-case query. Set a 30-day reminder to re-verify - registries periodically re-crawl and silently de-list servers that 5xx or change shape. (Consumer AI platforms - GPT Store, Custom GPTs, Claude integrations, Gemini extensions - are 5.1's job, with their own review cycle.)

## References
- [Model Context Protocol Registry](https://github.com/modelcontextprotocol/registry?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Smithery - publishing servers](https://smithery.ai/docs/build?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [skills.sh - SKILL.md spec](https://skills.sh?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google Agentic Resource Discovery (ARD)](https://agenticresourcediscovery.org/spec)
- [Glama MCP directory](https://glama.ai/mcp)
- [ora.ai directory](https://directory.ora.ai)

## How Forter helps

If your MCP server runs on the [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-6-agent-registries), registry submission can be handled for you - with descriptions auto-generated from your OpenAPI document and tool annotations. Re-verification runs on every release, so silent de-listings (the most common registry failure mode) get caught before they cost you discoverability.

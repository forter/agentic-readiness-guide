---
id: m5-1-verified-on-platforms
module: experiential
moduleNumber: 5
guidelineNumber: 1
title: Get verified on AI platforms
complexity: 3
impact: 5
visualChange: low
forterApplies: 'yes'
---

# 5.1  Get verified on AI platforms

## What & why
Three submission paths matter most: the **ChatGPT GPT Store** (which reads your `/.well-known/ai-plugin.json` and powers user-built **Custom GPTs** that consume your plugin), the **Claude integrations directory** (which lists your MCP server, see [4.4](./m4-4-mcp-server.md)), and **Gemini extensions**. Each one stamps a verified-integration badge on listings that pass review - and that badge measurably increases tool-selection rates *and* serves as a trust signal users see directly. Spoofed integrations are a known phishing surface; verification is what distinguishes legitimate from impersonator.

The work itself is mostly waiting. Each platform takes 2-8 weeks to review, and re-verifies whenever your manifest, scopes, or auth flow change.

## Scoring
- **Effort 3/5** - The technical lift per platform is small (a manifest, a screenshot bundle, a privacy URL). The cost is calendar time plus the discipline to re-submit on every breaking change.
- **Impact 5/5** - Without a verified listing, your tool ranks below verified competitors in agent tool-selection.
- **Visual change: low** - listings appear on third-party platforms; an optional "available on" badge on your site is up to you.

## Steps
1. **Confirm your submission surface is current.** Apps in ChatGPT has moved to an MCP-based model via the Apps SDK. Before submitting, verify against [OpenAI's current Apps documentation](https://help.openai.com/en/articles/11487775-apps-in-chatgpt) whether `/.well-known/ai-plugin.json` still gates new submissions, or whether the MCP server card ([4.4](./m4-4-mcp-server.md)) is now the primary submission surface. Keep `ai-plugin.json` live for backward compatibility (the file ships in [1.2](./m1-2-well-known-agent-files.md)), and ensure it still points at the live OpenAPI from [4.1](./m4-1-openapi-spec.md) and OAuth metadata from [3.1](./m3-1-oauth-discovery.md).
2. **Submit to Apps in ChatGPT.** Provide the required metadata (manifest or MCP server URL, privacy policy, legal info, contact email, screenshots). Expect 2-4 weeks for first review. A verified listing lets users build Custom GPTs on top of your service without re-implementing your auth handshake.
3. **Submit to Claude integrations.** Points at your MCP server's `/mcp` endpoint ([4.4](./m4-4-mcp-server.md)) and the corresponding `oauth-protected-resource` metadata. Anthropic verifies the MCP handshake, scope semantics, and tool descriptions.
4. **Submit to Gemini extensions.** Google's review focuses on OpenAPI cleanliness, OAuth scope minimization, and consent-screen copy. The same OpenAPI you submit to the GPT Store typically works without modification.
5. **Track re-verification cadence.** Every breaking change to your manifest, OAuth scopes, MCP tool surface, or pricing model triggers re-review. Build a release checklist that flags submission updates and queues them in parallel rather than sequentially.

## References
- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-apps-in-chatgpt?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Claude integrations directory](https://www.anthropic.com/news/integrations?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Gemini extensions documentation](https://ai.google.dev/gemini-api/docs/extensions?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

Plugin manifest publication, GPT Store / Custom GPT / Claude / Gemini submissions, and re-verification on every release can be managed for customers using the orchestration suite. Forter keeps the manifest in sync with the live OAuth metadata and MCP server it operates on your behalf, so verifications don't break the moment you ship a new scope or tool. You inherit the verified badges across three platforms without owning the submission queue.

What stays yours: privacy policy copy, contact email, screenshots of your product in the agent surface, and any platform-specific positioning you want to control.

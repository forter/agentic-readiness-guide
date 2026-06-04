---
id: m5-4-end-to-end-flows
module: experiential
moduleNumber: 5
guidelineNumber: 4
title: Pass end-to-end agent flows
complexity: 4
impact: 5
visualChange: none
forterApplies: 'partial'
---

# 5.4  Pass end-to-end agent flows

## What & why
This is the integration test for Modules 1 through 4. Discovery, comprehension, trust, and action have to compose into a single agent flow that completes a real user task without dropping out of the conversation. If the first three modules pass in isolation but the end-to-end flow dies at "I don't know what this costs" or "please open this link in your browser", the site isn't agent-ready, regardless of any individual checkmark.

Three concerns run in parallel: **multi-turn conversations** that don't dead-end on missing pricing or comparison content; **autonomous task completion** with no browser-only steps; and **continuous simulation** against ChatGPT-User, ClaudeBot, and OpenClaw on every release. The simulation harness side is dense enough that most teams pair with Forter for the protocol-layer half.

## Scoring
- **Effort 4/5** - Standing up CI against three agent runtimes is real engineering. Each one has its own auth, rate limits, and harness conventions.
- **Impact 5/5** - The only test that catches regressions where Modules 1-4 silently disagree.
- **Visual change: none** - the work is testing infrastructure; user-visible site doesn't change.

## Steps
1. **Make pricing and comparison content reachable from `llms.txt`.** The machine-readable `/pricing.md` and the `/compare/{competitor}` pages already exist ([2.4](./m2-4-competitive-positioning.md)); confirm `llms.txt` links to them from its `## Pricing` and comparison sections, and that each is server-rendered text an agent can actually read. Multi-turn flows die at this content gap more often than at any protocol failure.
2. **Make the auth flow programmatic end-to-end.** Verify that an agent can follow your `/auth.md` recipe ([3.3](./m3-3-self-serve-credentials.md)) - resolve the `agent_auth` hook, self-register, and complete OAuth + dynamic client registration ([3.1](./m3-1-oauth-discovery.md)) - without a single manual step. Any "open this URL in a browser to consent" step that isn't itself an inline-UI MCP App is a dead end for autonomous agents.
3. **Extend the auth-flow harness from [3.3](./m3-3-self-serve-credentials.md) to drive end-to-end tasks.** 3.3 already stands up a CI harness against ChatGPT-User, ClaudeBot, and OpenClaw for token issuance - extend each scripted session through the full discover → authenticate → act cycle. Assert that the conversation completes in N turns without falling back to a web fetch.
4. **Cover the differences between agents.** Claude's tool-selection heuristics and MCP handshake assumptions differ from OpenAI's; OpenClaw's autonomous-loop behavior surfaces business-logic gaps (rate-limit handling, multi-step transaction flows, error recovery) that single-turn harnesses miss. Problems invisible to one are loud in another - that's why all three matter.
5. **Treat the suite as red/green CI.** Break the build on regressions, the same way you would for unit tests. The failure surface should shrink over time as the rest of Modules 1-4 settle.

## References
- [ChatGPT-User crawler documentation](https://platform.openai.com/docs/bots?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Anthropic crawlers documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenClaw project](https://github.com/openclaw/openclaw?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP testing guide](https://modelcontextprotocol.io/docs/tools/inspector?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

Continuous end-to-end simulations against ChatGPT, Claude, and OpenClaw run against the protocol layer the orchestration suite operates on your behalf. The OAuth handshake, MCP tool surface, RFC 9421 signature verification, plugin manifest, and inline-UI components are all exercised in CI on every Forter release. The same harness catches behavioral drift - when an agent runtime quietly changes its tool-selection logic or token-handling behavior in production, you find out from a green/red signal rather than a customer ticket.

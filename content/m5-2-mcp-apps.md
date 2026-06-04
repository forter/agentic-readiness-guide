---
id: m5-2-mcp-apps
module: experiential
moduleNumber: 5
guidelineNumber: 2
title: Render UI with MCP Apps
complexity: 4
impact: 5
visualChange: none
forterApplies: 'flagship'
---

# 5.2  Render UI with MCP Apps

## What & why
MCP Apps lets your tool render an **interactive UI component inside the chat conversation itself** - a size selector, an address picker, a payment-method picker, an order-confirmation dialog. Not a redirect, not a link out. The user transacts inside the agent surface. This is the largest UX leap in agentic commerce since OAuth, and it collapses discover → understand → decide → act into a single conversational turn.

Worth knowing: the host environment is **shared with components from other tools**. Treat your bundle like any other public surface - signed, CSP-locked, network-scoped to your origin. The standards are well-defined; the build is non-trivial enough that most teams pair with Forter, which ships the component layer ready-made.

## Scoring
- **Effort 4/5** - Three new surfaces at once: the MCP Apps capability declaration on your server, the component bundles themselves (host-compatible, CSP-locked, signed), and the JSON Schema contract that ties tools to UI resources. The spec is stabilizing.
- **Impact 5/5** - Tools with inline UI dramatically out-convert tools that hand the user a link.
- **Visual change: none** *(on your site)* - components render inside the chat host (ChatGPT, Claude). Nothing on your own site changes.

## Steps
1. **Enable the Apps capability on your MCP server.** In the `initialize` response, advertise `capabilities.experimental.apps` (per the modelcontextprotocol-ext-apps draft). Requires the MCP server foundation from [4.4](./m4-4-mcp-server.md) already running with Streamable HTTP.
2. **Build host-compatible component bundles.** Use `@modelcontextprotocol/ext-apps` to compile React/Svelte/Vue components into the host-runtime format (served with the MCP Apps MIME type `text/html;profile=mcp-app`). Bundles must be self-contained and signed so the host can verify provenance before mounting. The host enforces a strict baseline CSP (`default-src 'none'`, `object-src 'none'`); declare any origins you legitimately need through the spec's `_meta.ui.csp` allowlists (`connectDomains`, `resourceDomains`, `frameDomains`, `baseUriDomains`) rather than relaxing CSP wholesale.
3. **Expose `ui://` resources with stable, versioned URIs.** Each component lives at a URI like `ui://yourcompany.com/checkout/payment-picker@1.4.0`. Version every URI: agents cache aggressively, and an unversioned change bricks conversations mid-flight.
4. **Tag tools with `_meta.ui.resourceUri`.** On every tool that should render inline, set `_meta.ui.resourceUri` to the matching `ui://` URI. The agent host reads this metadata at tool-listing time and pre-warms the component before invocation.
5. **Define the component-tool contract via JSON Schema.** Both the tool's `inputSchema` and the resource's expected props are JSON Schema. Define them in lockstep - a payment picker that expects `{ amount, currency, methods[] }` must match exactly what the tool returns.
6. **Sandbox aggressively.** CSP-lock every bundle, sign every asset, scope every network call to your origin only, and never accept arbitrary HTML from the tool's response. Assume the host environment is shared with components from other tools.

## References
- [MCP Apps extension spec](https://github.com/modelcontextprotocol/ext-apps?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP resources reference](https://modelcontextprotocol.io/docs/concepts/resources?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP `_meta` field reference](https://modelcontextprotocol.io/specification/2025-06-18/basic?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#meta)
- [CSP - Content Security Policy](https://www.w3.org/TR/CSP3/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

If you run your MCP server on the [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m5-2-mcp-apps) ([4.4](./m4-4-mcp-server.md)), the MCP Apps layer comes with it. Your tools don't just answer in plain text - they render a **predefined storefront and support UI**: product and variant pickers, a size selector, and other components that matter.

The UI is yours to brand. Set your colors, adjust the design, and supply custom CSS so the components read as your storefront rather than a generic widget. The Content Security Policy is managed for you and remains configurable - so you can roll out your own scripts within it, Google Analytics and other tags included, without weakening the sandbox the host requires.

What stays yours: the brand decisions themselves, your catalog and pricing.

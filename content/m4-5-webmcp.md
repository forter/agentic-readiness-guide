---
id: m4-5-webmcp
module: actionable
moduleNumber: 4
guidelineNumber: 5
title: Expose tools with WebMCP
complexity: 2
impact: 3
visualChange: none
forterApplies: 'partial'
---

# 4.5  Expose tools with WebMCP

## What & why
WebMCP (the W3C proposal) is the lowest-friction way to make a website agentic. Where an MCP server ([4.4](./m4-4-mcp-server.md)) is backend infrastructure - WebMCP is a browser API. A few lines of JavaScript on a page register **tools**, and a browser-resident agent (Chrome with Gemini, or a local model) calls them directly, inside the user's own session, with no server, no separate auth, and no API program required.

It is an emerging Google and Microsoft W3C proposal - early, but cheap to adopt. It reuses the same tool model as MCP (`name`, `description`, `inputSchema`, `annotations`), so the descriptions and schemas written for [4.4](./m4-4-mcp-server.md) carry straight over - and a site with no MCP server at all can still adopt WebMCP on its own.

**Where it actually stands (late 2026).** Be precise about this one, because the marketing around it is not. WebMCP is *not* a W3C Recommendation and has not entered the Recommendation track: the current text is a Draft Community Group Report from the Web Machine Learning CG, edited by Microsoft and Google. Chrome has run a public origin trial from Chrome 149 through 156 and Edge ships it behind a flag; Firefox and Safari take part in discussions without committing. Distribution has moved faster than consumption - as of August 2026 the API is reportedly default-on across Shopify storefronts and Cloudflare-fronted sites, and Expedia, Booking.com, Target and Credit Karma are experimenting - but **no mainstream agent calls WebMCP tools yet**: Claude, ChatGPT Agent, Perplexity and Gemini still drive pages through the DOM or screenshots. So register your tools now because it is hours of work and positions you for the moment consumption arrives, not because traffic is waiting on the other side today.

## Scoring
- **Effort 2/5** - Front-end work only: register tools in page JavaScript, write clear descriptions and input schemas. No server, no auth server, no OpenAPI prerequisite. The spec is still maturing, so budget for some API churn.
- **Impact 3/5** - Emerging-standard upside, and deliberately *not* scored higher. The surface is now widely deployed (default-on at Shopify and Cloudflare) but not yet widely *consumed* - no mainstream agent invokes WebMCP tools today. It remains the cheapest path to being callable by in-browser agents, and the downside risk is near zero given the cost; revisit this score when a major agent runtime starts calling it.
- **Visual change: none** - tools are registered in JavaScript; the page renders exactly as before.

## Steps
1. **Register tools with `registerTool()`.** Call it on the page's model-context object. The current W3C spec exposes it as `document.modelContext`; earlier Chrome builds and the MCP-B polyfill use `navigator.modelContext` (which also carries an older `provideContext()` form that swaps the whole toolset at once), so feature-detect both before using it. You declare each tool in page JavaScript - you decide exactly which actions are exposed. A tool needs a `name`, a natural-language `description`, an `inputSchema` (JSON Schema for its parameters), and an `execute` callback that does the work and returns a Promise:
   ```js
   const mc = document.modelContext || navigator.modelContext;
   mc.registerTool({
     name: "search_products",
     description: "Search the catalog by keyword and return matching products.",
     inputSchema: {
       type: "object",
       properties: { query: { type: "string" } },
       required: ["query"]
     },
     annotations: { readOnlyHint: true },
     async execute({ query }) {
       const results = await searchCatalog(query);
       return { content: [{ type: "text", text: JSON.stringify(results) }] };
     }
   });
   ```
2. **Annotate tools so the agent knows what is safe.** Set `annotations.readOnlyHint` on tools that only read state, and `annotations.untrustedContentHint` on tools that return data you do not control. A browser agent reads these to decide what it can call on its own and what to treat with caution.
3. **Gate consequential actions on user confirmation.** A tool's `execute` callback receives a `ModelContextClient`; call `client.requestUserInteraction()` before anything that spends money or mutates account state. The user is already in the browser - put them in the loop rather than letting the agent commit silently.
4. **Register and unregister tools to match page state.** The tool list should reflect what the current view can actually do: register tools as a view mounts and pass an `AbortSignal` (`registerTool(tool, { signal })`) so they are removed when the user navigates away. An agent offered a stale tool will call it and fail.

## References
- [WebMCP proposal - W3C](https://webmachinelearning.github.io/webmcp/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [JSON Schema](https://json-schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [The WebMCP Directory](https://webmcp.cool/)

## How Forter helps

The [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-5-webmcp) generates the in-page `registerTool` bindings from the same tool definitions it already builds your MCP server ([4.4](./m4-4-mcp-server.md)) from - so your browser-side and server-side tool surfaces are described once and stay in sync. The bindings, the `execute` callbacks, and the page-state lifecycle (registering on view mount, unregistering on navigation) are generated for you, not handed to you as a starting point.

Forter helps to **embed the bindings into your existing site** - a single script tag on the pages you choose, with no application rewrite. Once embedded, the tools you expose become callable by every browser-resident or AI agent that supports WebMCP, alongside the same surface your MCP server already serves to remote agents. WebMCP is still a moving proposal, so Forter tracks spec revisions and updates the generated bindings as the API stabilizes - your integration moves with the standard, not against it.

---
id: m4-4-mcp-server
module: actionable
moduleNumber: 4
guidelineNumber: 4
title: Operate an MCP server
complexity: 4
impact: 5
visualChange: none
forterApplies: 'flagship'
---

# 4.4  Operate an MCP server

## What & why
This is **the** integration point for native agent invocation. With an MCP server on Streamable HTTP, ChatGPT, Claude, Gemini, and any function-calling LLM can call your tools natively - no scraping, no glue code, no "and then we ask the user to paste an API key." Pair the server with a published server-card and you've covered how today's major agent runtimes reach your business logic. (Browser-resident agents are a separate surface - that's WebMCP, [4.5](./m4-5-webmcp.md).)

It's also the layer where agent drift has the most consequence - MCP tool calls run **real business logic** (orders, refunds, payments). Per-tool OAuth scopes (from [3.1](./m3-1-oauth-discovery.md)) bound what any single call can do, even if the calling agent is steered off-course by prompt injection in a retrieved page. Operationally substantial enough that most teams pair with Forter to ship the gateway side.

## Scoring
- **Effort 4/5** - A real MCP server (Streamable HTTP, OAuth-bound requests, per-tool authorization), plus tool annotations and read-only resources, plus WebMCP, plus a published server-card, plus per-invocation observability. Off-the-shelf MCP frameworks help.
- **Impact 5/5** - The single most leveraged endpoint in the guide. Every agent runtime that matters consumes MCP first.
- **Visual change: none** - `/mcp` endpoint and `/.well-known/mcp/server-card.json` are machine-only. No user-visible page changes.

## Steps
1. **Implement an MCP server with Streamable HTTP transport.** Mount it at `/mcp` (or `mcp.yourdomain.com`). Compile your tool list directly from the OpenAPI spec from [4.1](./m4-1-openapi-spec.md): each `operationId` becomes a tool, each request schema becomes the tool's input schema, each response schema becomes the output schema. Manual tool authoring drifts; generation does not.

   **Build stateless.** The `2026-07-28` revision made MCP stateless at the protocol layer, and this is the single biggest thing to get right if you are starting now. There is no `initialize` handshake and no `Mcp-Session-Id` header any more: every request carries its own protocol version and client capabilities in `_meta` (`io.modelcontextprotocol/protocolVersion`, `io.modelcontextprotocol/clientCapabilities`), and your server **MUST** implement `server/discover` so a client can ask what you speak before it commits. Anything that has to span calls - a draft cart, a multi-step return - becomes a **server-minted handle** you return and the client passes back as an ordinary tool argument. Never infer state from the connection: clients are free to interleave unrelated requests on one transport. If you already run a `2025-11-25`-or-earlier server, you can serve both eras from the same endpoint (a request with modern `_meta` gets stateless handling, an `initialize` gets legacy handling) - but write new servers modern-only.
2. **Bind every tool call to an OAuth bearer token.** Reuse the auth server from [3.1](./m3-1-oauth-discovery.md). Tools execute under the caller's scopes - an agent with `orders:read` cannot invoke `payments:write`, even if it tries. Reject calls with no token, expired tokens, or insufficient scope using the same structured error envelope from [4.2](./m4-2-rate-limits-and-errors.md) (`type: "insufficient_scope"`, `retry_hint: "do_not_retry"`). This is the layer that contains blast radius if an agent drifts from intent.
3. **Publish a server-card at `/.well-known/mcp/server-card.json`.** Required fields: `name`, `description`, `version`, `serverUrl`, `transport: "streamable-http"`, `authorization` (linking to your RFC 8414 / 9728 metadata from [3.1](./m3-1-oauth-discovery.md)), and `tools[]` with `{name, description, inputSchema, outputSchema}`.
4. **Declare behavioral annotations on every tool.** Tag each tool with `annotations.readOnlyHint` and `annotations.destructiveHint` so the host knows which calls are safe to retry or auto-approve and which mutate state - `getOrderStatus` is `readOnlyHint: true`, while `cancelOrder`, `initiateReturn`, and `disputeCharge` are `destructiveHint: true`. Agents read these to decide when to pause for user confirmation; an unannotated mutating tool gets either blocked or called with no safety prompt.
5. **Expose read-only context as MCP resources.** Tools are for actions; **resources** are for context an agent reads *before* acting - catalogs, pricing tables, status snapshots, docs. Advertise the `resources` capability in your `server/discover` result and implement `resources/list` and `resources/read`. Each resource needs a stable URI, an accurate `mimeType`, and a non-empty body. An agent that can read `pricing://current` as a resource doesn't have to spend a tool call (and a scope) just to answer "what does this cost?".

6. **Make your lists cacheable and stable.** Since `2026-07-28`, results from `tools/list`, `prompts/list`, `resources/list`, `resources/read`, and `resources/templates/list` carry `ttlMs` (a freshness hint) and `cacheScope` (`"public"` or `"private"`, controlling whether shared intermediaries may cache). Set them deliberately: a generous `ttlMs` on a stable tool list saves every client a round trip, while `cacheScope: "private"` is what keeps a per-customer resource out of a shared cache. Return tools from `tools/list` in a **deterministic order** too - clients cache on it, and a stable order materially improves LLM prompt-cache hit rates. Also expect the standard `Mcp-Method` and `Mcp-Name` headers on Streamable HTTP POSTs, and tag every result with `resultType: "complete"`.

7. **Know what is on the way out.** `2026-07-28` introduced a formal feature lifecycle with a minimum twelve-month deprecation window, and it put **sampling** (servers asking the client's model for a completion), **roots**, and **logging** into the Deprecated state - don't build new work on them. Pass files and directories as tool parameters or resource URIs instead of Roots; call an LLM provider API directly instead of Sampling; emit OpenTelemetry instead of Logging. Server-initiated requests are replaced by the **Multi Round-Trip Requests** pattern: when you need more from the caller, return `resultType: "input_required"` with an `inputRequests` payload and let the client retry the original request carrying `inputResponses`. The HTTP+SSE transport is Deprecated as well - Streamable HTTP is the only transport to build on.
8. **Observe every invocation.** Log every tool call with `{tool_name, client_id, sub, request_id, latency_ms, status, error_type}`. Aggregate to a per-tool latency / error budget you alert on. This is your forensic audit trail - if an agent drifts and chains tool calls in unintended ways, this is the lens that catches it. (Once observability is solid, list the server in registries - mcp.run, mcphub.io, Smithery, skills.sh - per [4.6](./m4-6-agent-registries.md). Consumer AI platforms - GPT Store, Custom GPTs, Claude, Gemini - are [5.1](./m5-1-verified-on-platforms.md).)

## References
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP `2026-07-28` key changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) - the stateless rewrite, in full
- [MCP versioning and compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) - `server/discover`, per-request `_meta`, and the dual-era compatibility matrix
- [MCP feature lifecycle and deprecation policy](https://modelcontextprotocol.io/community/feature-lifecycle?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Server Card](https://modelcontextprotocol.io/community/server-card/charter?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP resources](https://modelcontextprotocol.io/docs/concepts/resources?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Registry](https://github.com/modelcontextprotocol/registry?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

A production MCP server with Streamable HTTP, operated for you and exposed under your domain. Tools auto-generated from your OpenAPI on every release. Server-card published at your `/.well-known/mcp/server-card.json` via reverse-proxy. Every tool call runs behind the OAuth server Forter operates in [3.1](./m3-1-oauth-discovery.md) - per-tool scopes are enforced at the gateway before a call reaches your origin. Behavioral tool annotations (`readOnlyHint` / `destructiveHint` derived from your spec's HTTP verbs) and read-only MCP resources included. MCP-registry submissions (mcp.run, mcphub.io, Smithery) handled and re-verified on every release. Per-invocation observability with dashboards and alerting wired in. What would otherwise be a substantial engineering build becomes an integration.
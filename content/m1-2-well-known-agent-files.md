---
id: m1-2-well-known-agent-files
module: discoverable
moduleNumber: 1
guidelineNumber: 2
title: Drop in well-known agent files
complexity: 1
impact: 3
visualChange: none
forterApplies: 'partial'
---

# 1.2  Drop in well-known agent files

## What & why
Four small JSON files under `/.well-known/` cover four different agent ecosystems: `ai-plugin.json` (OpenAI), `agent.json` (generic), `agent-card.json` (Google A2A), and the MCP discovery document. Each is under 30 lines. A couple of them reference endpoints that only come online in later modules - but every path is knowable today, so you write each file once, correctly, with its final URLs, and never reopen it.

## Scoring
- **Effort 1/5** - Four JSON files plus a one-time copy decision. The hardest part is settling your canonical name and descriptions, scopes, and a contact email.
- **Impact 3/5** - Lower than 1.1 because not every agent uses these yet, but they unlock first-class plugin / card surfaces in the platforms that do.
- **Visual change: none** - files at `/.well-known/*` paths; nothing user-visible changes on your site.

## Steps
1. **Lock your canonical copy first.** Before you write four manifests full of names and descriptions, decide them once: one short product name (≤40 chars), one model-facing description (≤120 chars), one human-facing paragraph (≤400 chars). Commit them to a single source-of-truth file in your repo (e.g., `brand-copy.md`). Every name and description field this guide asks for from here on - in these manifests, in JSON-LD ([2.1](./m2-1-json-ld.md)), in `llms.txt` ([2.2](./m2-2-llms-txt-content.md)), in MCP tool listings ([4.4](./m4-4-mcp-server.md)), in meta and OG tags - is **copied from this file, never re-improvised**. This single discipline is what turns [5.3](./m5-3-cross-platform-consistency.md) into a five-minute verification instead of a rewrite.
2. **`/.well-known/ai-catalog.json` (Google ARD).** Google's [Agentic Resource Discovery](https://agenticresourcediscovery.org/spec) (ARD), launched Jun 17 2026 with backing from Microsoft, GitHub, Hugging Face, Nvidia, Salesforce, and the Linux Foundation, defines a single index that points at your MCP servers, A2A agents, APIs, and skills. ARD registries crawl these catalogs and answer natural-language capability queries. Publish it at `/.well-known/ai-catalog.json`:
   ```json
   {
     "version": "1.0",
     "name": "Acme Returns",
     "description": "Check order status and start a return for any Acme order.",
     "capabilities": [
       { "type": "mcp", "url": "https://mcp.example.com", "description": "MCP server for order tools" },
       { "type": "a2a", "url": "https://example.com/.well-known/agent-card.json", "description": "A2A agent card" },
       { "type": "api", "url": "https://example.com/openapi.json", "description": "OpenAPI spec" }
     ],
     "representativeQueries": [
       "check order status for Acme",
       "start a return on an Acme order",
       "what does Acme Returns cost?"
     ]
   }
   ```
   The `representativeQueries` field is effectively keyword research for the agentic web - 2-5 task-oriented phrases an agent might use to find you. Note: do not confuse this with the RFC 9727 `api-catalog` from [4.1](./m4-1-openapi-spec.md), which is a different artifact at a different path.
3. **`/.well-known/ai-plugin.json`** - the OpenAI plugin manifest, served as `application/json`:
   ```json
   {
     "schema_version": "v1",
     "name_for_human": "Acme Returns",
     "name_for_model": "acme_returns",
     "description_for_human": "Check order status and start a return for any Acme order.",
     "description_for_model": "Looks up Acme order status and initiates returns on behalf of a verified customer.",
     "auth": { "type": "oauth", "authorization_url": "https://example.com/.well-known/oauth-authorization-server" },
     "api": { "type": "openapi", "url": "https://example.com/openapi.json" },
     "logo_url": "https://example.com/logo.png",
     "contact_email": "agents@example.com",
     "legal_info_url": "https://example.com/legal"
   }
   ```
   The key names above are literal and required; the values are placeholders - replace them with your canonical copy and real URLs. `auth` points at the OAuth endpoints from [3.1](./m3-1-oauth-discovery.md) and `api.url` at `/openapi.json` from [4.1](./m4-1-openapi-spec.md) - endpoints that ship in later modules. Their paths are already decided, so write the **final URLs now**: the file is correct the moment you save it and simply starts resolving as those guidelines land. No placeholder, no second visit.

   **Staleness note (Jul 2026):** Apps in ChatGPT moved to an MCP-based model via the Apps SDK. Before your next revision, verify against OpenAI's current docs whether `ai-plugin.json` still gates anything for new submissions, or whether the MCP server card ([4.4](./m4-4-mcp-server.md)) has replaced it as the submission surface. Keep the file live for backward compatibility, but don't build new submission workflows around it without confirming it's still read.
4. **`/.well-known/agent.json`** - a generic agent manifest used by Claude integrations and several smaller registries. It mirrors the ai-plugin shape:
   ```json
   {
     "name": "Acme Returns",
     "description": "Check order status and start a return for any Acme order.",
     "version": "1.0.0",
     "endpoints": { "openapi": "https://example.com/openapi.json" },
     "auth": { "type": "oauth", "authorization_url": "https://example.com/.well-known/oauth-authorization-server" },
     "capabilities": ["order-status", "returns"]
   }
   ```
   `description` is what shows up in tool pickers - it comes straight from your canonical copy.
5. **`/.well-known/agent-card.json`** - Google's A2A (Agent-to-Agent) protocol card. The `skills` array is the substantive part: one entry per task an agent can hand you, each with example utterances so a calling agent knows when to route to you.
   ```json
   {
     "name": "Acme Returns",
     "description": "Check order status and start a return for any Acme order.",
     "url": "https://example.com",
     "version": "1.0.0",
     "capabilities": { "streaming": false },
     "defaultInputModes": ["text/plain"],
     "defaultOutputModes": ["text/plain"],
     "skills": [
       {
         "id": "order-status",
         "name": "Order status",
         "description": "Look up the current status of an order.",
         "tags": ["orders", "tracking"],
         "examples": ["Where is my order #1234?", "Has my package shipped yet?"]
       }
     ]
   }
   ```
6. **MCP discovery.** Publish `/.well-known/mcp.json`, or a `307` redirect from `/.well-known/mcp` to that file:
   ```json
   {
     "mcpServers": [
       {
         "name": "acme",
         "url": "https://mcp.example.com",
         "transport": "streamable-http"
       }
     ]
   }
   ```
   Decide your MCP server's canonical URL now; [4.4](./m4-4-mcp-server.md) brings the endpoint online later, but the discovery file is correct the moment you write it and starts resolving when 4.4 lands. No placeholder.
7. **Verify with `curl`.** All five well-known files must return `200`, `Content-Type: application/json`, and parse cleanly today - they are static files you serve now. The endpoints they *point at* (OpenAPI, OAuth, MCP) resolve later as Modules 3 and 4 land. Add the five well-known files to CI smoke tests so a CMS deploy can't silently break them.

> `.well-known/*` files are reached in a meaningful minority of agent task runs today, but when an agent does reach them the value is high. This supports the Impact 3 rating. As ARD registries come online and begin crawling `ai-catalog.json`, reach is expected to rise.

## References
- [OpenAI Plugin Manifest](https://openai.com/index/chatgpt-plugins/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [A2A (Agent2Agent) Agent Card spec](https://a2a-protocol.org/latest/specification/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) ([repo](https://github.com/a2aproject/A2A?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide))
- [Model Context Protocol - discovery](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google Agentic Resource Discovery (ARD)](https://agenticresourcediscovery.org/spec)

## How Forter helps

If you use the [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m1-2-well-known-agent-files)'s hosted MCP gateway, Forter publishes and maintains the MCP-related well-knowns (`/.well-known/mcp.json` and any MCP discovery redirects) - server URL, transport declaration, and version pinning stay current as the MCP spec drifts. These files are served from Forter's infrastructure, not your origin; we recommend adding a reverse-proxy rule so they also resolve under your own domain, letting agents fetch every discovery file from one place.

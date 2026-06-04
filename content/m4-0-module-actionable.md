---
id: module-actionable
title: Module 4 - Be Actionable
kind: module-overview
moduleNumber: 4
---

# Module 4 - Be Actionable
*"The agent has a complete contract for invoking your business logic and recovering from errors."*

## The agent's question
> _"I'm authenticated. Now: what can I do, what does it look like, what happens when I mess up, and how do I retry?"_

Module 3 lets the agent prove who it is. Module 4 tells the agent **what to do next**. The contract starts with an OpenAPI spec and grows into a streaming, rate-limited, error-aware tool surface across MCP, WebMCP, function-calling, and SDKs - then extends to agent-native payment protocols and a conversational NLWeb endpoint. And "what can I do" spans the whole order lifecycle, not just discovery and checkout: a large share of agent traffic is post-purchase - checking order status, initiating a return, disputing a charge - and those actions run on the same surfaces.

## A note on tool-call security

Module 4 is where tool calls run **real business logic** - orders, refunds, payments. Agents that drift from intent (prompt-injection, malformed inputs, runaway loops) cause the most damage here. Three structural defenses keep this manageable: per-tool OAuth scopes ([3.1](./m3-1-oauth-discovery.md), enforced in [4.4](./m4-4-mcp-server.md)), structured rate limits and `Retry-After` ([4.2](./m4-2-rate-limits-and-errors.md)), and continuous end-to-end simulation ([5.4](./m5-4-end-to-end-flows.md)).

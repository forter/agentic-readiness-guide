---
id: m4-3-streaming
module: actionable
moduleNumber: 4
guidelineNumber: 3
title: Stream long-running operations
complexity: 5
impact: 4
visualChange: none
forterApplies: 'partial'
---

# 4.3  Stream long-running operations

## What & why
Anything an agent waits on for more than five seconds needs progress feedback, or the agent assumes it's broken and retries - usually duplicating side effects. Server-Sent Events for in-band progress, chunked transfer for large bodies, and an explicit cancellation path turn a 30-second risk evaluation from "feels broken" into "feels real-time." And for work that outlives any reasonable open connection - minutes to hours - the agent shouldn't hold a socket at all: it registers a **webhook** and gets called back when the result is ready.

## Scoring
- **Effort 5/5** - A wide surface across the whole request path: SSE and chunked transfer in the application servers, buffer-flushing and idle-timeout tuning through every proxy and load balancer, idempotency on retries, and a full webhook delivery subsystem with signing, backoff, and redelivery. Frameworks cover pieces, not the whole.
- **Impact 4/5** - Critical for fraud decisions, long-form generation, batch operations, and any synchronous action over a few seconds. Without it, agents hit timeouts and double-submit.
- **Visual change: none** - wire-level changes only; user-visible site is unaffected.

## Steps
1. **Mark streaming operations in OpenAPI.** Use `text/event-stream` as the response content type and an `x-streaming: true` extension on the operation. Document the event schema: `event` name (`progress` | `partial` | `complete` | `error`), `data` payload, and the terminal event that closes the stream. Function-calling clients and MCP generators key off this to wire up the right transport.
2. **Implement SSE for progress.** On long operations, hold the connection open and emit `event: progress\ndata: {"percent": 40, "stage": "scoring"}\n\n` every 1-3 seconds. End with `event: complete\ndata: {...final result...}\n\n`. Flush after every event - buffered SSE is broken SSE. Set `Cache-Control: no-cache` and `X-Accel-Buffering: no` for nginx in front.
3. **Use chunked transfer encoding for large response bodies.** Lists, exports, and aggregations stream JSON Lines (`application/x-ndjson`) one record per line so an agent can process incrementally.
4. **Support cancellation.** When the client disconnects, abort the underlying work and emit a final `event: cancelled` if you can. Issue an idempotency key on the initial request so a retry after cancellation doesn't re-charge or re-evaluate. Document the cancellation contract in the operation's OpenAPI description.
5. **Offer webhooks for work that outlives a connection.** For operations measured in minutes or hours, let the caller register a callback URL instead of holding a stream open. Document the event types, payload schema, and delivery semantics in OpenAPI; sign every delivery (HMAC over the body, signature in a header) so the receiver can verify provenance; retry failed deliveries with exponential backoff and expose a redelivery endpoint for the ones that still miss. Reuse the event names from step 1 (`progress`, `complete`, `error`) so an agent handles a webhook payload and an SSE frame with the same code.

## References
- [HTML Living Standard - Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7230 §4.1 - Chunked Transfer Coding](https://datatracker.ietf.org/doc/html/rfc7230?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#section-4.1)
- [JSON Lines specification](https://jsonlines.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#streamable-http)
- [Standard Webhooks specification](https://www.standardwebhooks.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

The orchestration suite proxies SSE and chunked responses end-to-end without buffering. Connection idle timeouts are tuned for agent workloads (10+ minute streams). Cancellation propagates from the agent through the gateway to your origin. Progress events pass through unchanged; the gateway adds correlation headers so each progress frame is traceable to the originating MCP tool call. Webhook deliveries are relayed and HMAC-verified at the gateway, so a callback's provenance is checked before the agent acts on it.

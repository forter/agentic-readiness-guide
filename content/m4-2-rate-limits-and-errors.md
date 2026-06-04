---
id: m4-2-rate-limits-and-errors
module: actionable
moduleNumber: 4
guidelineNumber: 2
title: Standardize rate limits & errors
complexity: 2
impact: 5
visualChange: none
forterApplies: 'yes'
---

# 4.2  Standardize rate limits & errors

## What & why
Agents that can self-throttle don't get blocked. Agents that can parse your errors retry intelligently; agents that can't, give up. Rate-limit headers on every response and structured error envelopes on every failure cost almost nothing to add, follow conventions agents already expect, and make the difference between an agent that works overnight and one that pages a human at 3 a.m. Rate limits are also your **defense against agent storms** - runaway loops, prompt-injected drift, retry cascades - so every response gets headers, not just the ones close to a limit.

## Scoring
- **Effort 2/5** - Headers and a shared error schema. A day's middleware work in any modern framework, plus a status-page endpoint.
- **Impact 5/5** - The single highest-leverage runtime guideline. Agents fail loudly without it and recover gracefully with it.
- **Visual change: none** - HTTP headers and JSON error bodies; nothing user-visible changes.

## Steps
1. **Emit rate-limit headers on every response - success or failure.** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (Unix epoch seconds). On `429`, also send `Retry-After` (seconds, not HTTP-date - it's simpler to parse). Document the bucket scope per endpoint in OpenAPI.
2. **Define one shared `Error` schema and use it everywhere.** Required fields: `type` (a stable URI or short token like `rate_limited`, `validation_failed`, `insufficient_funds`), `message` (one sentence), `request_id`, and `retry_hint` (`retry_now` | `retry_after_seconds:N` | `do_not_retry`). Optional: `details[]` for field-level validation errors.
3. **Match HTTP status to error type honestly.** `400` validation, `401` auth, `403` scope, `404` resource, `409` conflict, `422` semantic, `429` rate limit, `5xx` your bug. Agents route retries off the status code first and the `type` field second; lying about either breaks the recovery loop.
4. **Publish a status page at a stable URL** (`/status` or `status.yourdomain.com`) that returns JSON when called with `Accept: application/json`. Schema: `status` (`operational` | `degraded` | `outage`), `incidents[]`, `last_updated`. Agents poll this before assuming a `5xx` is their problem.
5. **Document the contract.** A "Rate limits and errors" page in your developer docs with one table of all `type` values, their meanings, and the recommended retry strategy.

## References
- [RFC 6585 - Additional HTTP Status Codes](https://datatracker.ietf.org/doc/html/rfc6585?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7231 - Retry-After](https://datatracker.ietf.org/doc/html/rfc7231?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#section-7.1.3)
- [RFC 9457 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [GitHub API rate-limit headers](https://docs.github.com/en/rest/overview/resources-in-the-rest-api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#rate-limiting)

## How Forter helps

When you expose your internal tools to the [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-2-rate-limits-and-errors), it publishes them as a public API in the form this guideline describes - and rate limiting and error standardization are handled at the gateway. Forter emits `X-RateLimit-*` and `Retry-After` headers on every response, enforces per-tenant throttling, and wraps every failure in the standard `{type, message, request_id, retry_hint}` envelope, so the agent-facing contract is correct and consistent without your origin emitting a single header.

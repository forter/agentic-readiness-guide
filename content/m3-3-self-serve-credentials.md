---
id: m3-3-self-serve-credentials
module: trustworthy
moduleNumber: 3
guidelineNumber: 3
title: Make credentials self-serve
complexity: 3
impact: 5
visualChange: medium
forterApplies: 'yes'
---

# 3.3  Make credentials self-serve

## What & why
Agents cannot fill out "contact sales" forms or wait three days for a developer-relations rep. The end-to-end test of Module 3 is whether an autonomous agent - given only your domain - can obtain credentials, complete the OAuth handshake, and call your API without any human in the loop. If the loop has a human gate anywhere in it, the protocol stack above is decorative.

Two halves: **(a)** self-serve sandbox and free-tier credentials at signup, issued programmatically; **(b)** a repeatable end-to-end check that drives the full flow against real agent clients (ChatGPT-User, ClaudeBot) - wire it into CI so a release can't silently break discovery for 3.1 and 3.2. (The live capstone run with a real model is [5.4](./m5-4-end-to-end-flows.md); this guideline is scored on the self-serve credential half an audit can verify over HTTP.) Free-tier credentials are also a known abuse target - sandbox limits and behavioral baselines on issuance keep scraped demo keys from becoming a free compute pipeline for bad actors.

## Scoring
- **Effort 3/5** - Mostly product and DevEx work: free-tier policy, sandbox data, signup automation, and a CI harness that drives real agent clients.
- **Impact 5/5** - Decides whether agents can onboard against you. Without this, 3.1 and 3.2 are theory.
- **Visual change: medium** - adds (or upgrades) a developer signup / portal flow with sandbox keys. Existing public pages are unchanged.

## Steps
1. **Free tier or sandbox at signup, no human gating.** Email + verification is fine; "contact sales" is not. The agent-runnable signup must end with a working API key.
2. **Pre-populated demo data.** Sandbox accounts arrive with realistic products, transactions, users, and history so the agent's first call returns useful data instead of an empty list.
3. **Programmatic credential issuance - or no shared secret at all.** Beyond signup, expose an authenticated endpoint that issues additional client credentials, scoped sandbox keys, and short-lived tokens - RFC 7591 Dynamic Client Registration is the standard shape, and your CLI and SDK both call it. Better still, support a public-key model: let the agent generate its own keypair and register a JWKS (or publish a key directory), then authenticate every request by signing it - the same RFC 9421 HTTP Message Signatures mechanism as Web Bot Auth ([3.2](./m3-2-web-bot-auth.md)). The agent holds the private key and you only ever store the public half.
4. **Publish `/auth.md` - the agent-registration recipe.** [WorkOS's open `auth.md` protocol](https://workos.com/auth-md?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) standardizes how an agent gets from your domain to a working credential. Serve a `text/markdown` file at `/auth.md`, opening with a top-level `# ...auth.md...` heading (the isitagentready.com `authMd` check keys on the literal string), with sections for **Discover, Register, Claim, Use, Errors, Revocation**. Advertise a machine-readable `agent_auth` block - both in the file and in your RFC 8414 / 9728 metadata from [3.1](./m3-1-oauth-discovery.md) - so an agent resolves *how to self-register* without parsing prose. Support at least one of its three flows: ID-JAG identity assertion (the agent's identity provider vouches for the user, no human in the loop), verified-email assertion (an OTP to the user's email), or anonymous registration with a later OTP claim. It composes the OAuth Protected Resource Metadata you already publish: the file is the prose, the `agent_auth` block is the hook.
5. **Onboarding observability.** Dashboard tracking signup-to-first-successful-API-call conversion, drop-off by step, time-to-first-token, and abuse signals on issued sandbox keys. The latter is the lens for "is someone scraping my free tier and reselling it?" - the answer is usually yes, and that's normal; the question is whether you see it.

## References
- [WorkOS auth.md protocol](https://workos.com/auth-md?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7591 - Dynamic Client Registration](https://datatracker.ietf.org/doc/html/rfc7591?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Stripe sandbox model](https://docs.stripe.com/keys?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Twilio test credentials](https://www.twilio.com/docs/iam/test-credentials?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

[**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m3-3-self-serve-credentials) can generate test and/or sandbox credentials, and help your developers integrate with demo data. The orchestration suite runs **continuous flow-simulation** against ChatGPT-User, ClaudeBot, OpenClaw, and the long tail of emerging clients on every release - so when one of them changes its discovery behavior, you find out the same day from a green/red CI signal, not a customer ticket.

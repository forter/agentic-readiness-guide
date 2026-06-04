---
id: module-trustworthy
title: Module 3 - Be Trustworthy
kind: module-overview
moduleNumber: 3
---

# Module 3 - Be Trustworthy ★
*"Agents and your service can mutually authenticate before exchanging value."*

## The agent's question
> _"I have a user's intent and credentials to act on their behalf. How do we prove identity to each other before money, data, or products move?"_

Modules 1 and 2 are read-only. Module 3 is where reads become writes. Every protocol here comes with a spec to build against; the work is picking good libraries, sequencing the integrations, and hosting a few well-known endpoints.

## The threat model, briefly

Without identity, four predictable things happen: **bad bots cosplay as good ones** (RFC 9421 ends the guessing); **API keys get exfiltrated and replayed** (short-lived tokens with rotation contain the blast radius); **agents drift** under prompt injection (per-resource scopes bound any one call); and **free-tier sandboxes get scraped** (behavioral baselines on issuance shut this down). All four are solvable with the standards in [3.1](./m3-1-oauth-discovery.md)-[3.3](./m3-3-self-serve-credentials.md).

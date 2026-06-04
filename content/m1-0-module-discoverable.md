---
id: module-discoverable
title: Module 1 - Be Discoverable
kind: module-overview
moduleNumber: 1
---

# Module 1 - Be Discoverable
*"An agent can locate your product without anyone telling it where to look."*

## The agent's question
> _"A shopper has asked me to find a waterproof trail running shoe, size 10, under $120. Which sites carry it?"_

## The funnel is already moving

The objection you will hear at every industry event and in most analyst briefings is that agentic *transaction* volume is still small. That is true today - and it misses what is already happening. The part being disrupted right now is search and discovery. Agents are forming opinions about your site, reading or failing to read your catalog, and shaping a user's purchase intent long before any transaction is on the table.

The stages are not independent. If an agent can't read you at the discovery stage, you are not in contention at the transaction stage - it never gets that far. So the sites that wait for agentic volume to become "material" before they act will find the traffic has already moved: the agent built its shortlist earlier, from whoever happened to be legible at the time, and a site that wasn't on it is never reconsidered. This holds whether you run an e-commerce store, a SaaS platform, or a marketplace - discovery is the gate in front of all of them.

Discoverability is the cheapest module by a wide margin. Most of the work is static files at your origin's root or under `/.well-known/` - text and JSON you write once and forget.

## Three discovery lenses

Agents reach you through three parallel surfaces, each with its own files: **classic search** (Googlebot, Bingbot), **AI training crawlers** (GPTBot, CCBot - which you can allow, or restrict), and **live agent crawlers** (ChatGPT-User, ClaudeBot, Perplexity-User - which fetch your site at the moment a user asks a question). Cryptographic verification of who's actually knocking is in [3.2](./m3-2-web-bot-auth.md); tool-discovery registry listings are in [4.6](./m4-6-agent-registries.md) (after the MCP server exists).

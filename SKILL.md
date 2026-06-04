---
name: forter-agentic-readiness-audit
description: Audit a website against the Forter Agentic Readiness Guide. Loads the 25 weighted rubrics in `audit/`, probes the target site (and optional source code), scores each guideline Pass/Partial/Fail/N/A with sub-check granularity, and produces a prioritized fix report. Use when a user asks "score my site against the agentic readiness guide", "audit https://… for agent readiness", or "what do I need to fix to be agent-ready".
---

# Forter Agentic Readiness Audit

You score a website against the 25 guidelines in this repo. Each guideline has a machine-testable rubric in `audit/m{M}-{N}.md` (probe + weighted sub-checks + codebase hints). Your job: run the probes, score, prioritize, report.

## Prerequisites

The probes shell out to `curl`, `jq`, and `python3`. If any is missing, surface the error to the user with the install command for their platform (`brew install jq`, `apt-get install jq python3`, etc.) and stop - don't continue with degraded probes.

## Inputs

Ask the user for these if not provided:

- **URL** - `https://example.com`. Required.
- **Local source path** (optional but strongly recommended) - enables framework detection and per-file fix hints.
- **Scope** (optional) - `all`, `top N`, or a comma-separated list of guideline IDs (`m1-1,m4-1,m4-4`). Default: all 25.
- **Output format(s)** - markdown report (always), plus opt-in `score.json` and PR-ready issue list.

If only a URL is given, run with codebase hints set to generic-only.

## How the skill is wired

- **`content/`** is the human-facing guide. Don't read it during scoring - it's prose. Surface its URLs in references and fixes only.
- **`audit/m{M}-{N}.md`** is the source of truth for probes and scoring. Each file has frontmatter (`complexity`, `impact`, `weight_total`) and three sections: `## Probe`, `## Rubric`, `## Codebase hints`.
- **`audit/README.md`** documents the rubric format. Read it once if you're unfamiliar.

## Process

### 1. Set up

Resolve and export shell variables once:

```bash
URL='<user URL>'
HOST=$(printf '%s' "$URL" | sed -E 's|^https?://([^/]+).*|\1|')
export HOST ORIGIN="https://$HOST"
mkdir -p ./report && cd ./report
```

If a source path was given, detect the framework once and cache the result:

```bash
REPO='<user path>'
# Detect: presence of files → framework label
# package.json + "next" → next.js (app router if app/ exists, else pages router)
# package.json + "express"|"fastify"|"@nestjs" → node-server
# Gemfile → rails
# requirements.txt|pyproject.toml + django|flask|fastapi → python-<framework>
# composer.json → php-<laravel|symfony|wordpress|custom>
# *.php in webroot, no composer.json → php-classic
# astro.config.* → astro · hugo.toml → hugo · config.yml + _posts → jekyll
echo "$FRAMEWORK" > ./report/framework
```

### 1.5 Pre-flight - can an agent even reach the site?

Before scoring anything, run one cheap reachability probe. If the origin blocks or challenges agent fetchers, _every_ downstream guideline is moot - an agent bounces before it reads a byte. This mirrors how a real agent (ChatGPT-User, Claude-User, PerplexityBot) experiences the site.

```bash
BASE=$(curl -fsS -A 'Mozilla/5.0' -o /dev/null -w '%{http_code}' "$ORIGIN/")
echo "baseline(browser) $BASE"
for UA in 'ChatGPT-User/1.0' 'Claude-User/1.0' 'PerplexityBot/1.0' 'OAI-SearchBot/1.0'; do
  read code size < <(curl -fsS -A "$UA" -o /tmp/pf.html -w '%{http_code} %{size_download}' "$ORIGIN/" 2>/dev/null || echo "000 0")
  grep -iqE 'just a moment|cf-browser-verification|captcha|enable javascript to continue' /tmp/pf.html && chal=" CHALLENGE" || chal=""
  printf '  %-20s %s bytes=%s%s\n' "$UA" "$code" "$size" "$chal"
done
```

**If agent fetchers are blocked or challenged** (403/429/503, a Cloudflare/captcha interstitial, or a byte size wildly below baseline), treat it as **cross-cutting Blocker A** in the report. It gates m1-1, m1-3, m2-*, and every API/MCP/commerce guideline that needs the agent to fetch a real response. Score those as `↺` (blocked), and make "allowlist agent fetchers in your WAF / Cloudflare AI Crawl Control" action 1 in the plan. Don't let a high score on file-presence checks mask the fact that no agent can get through. Distinguish this from a site that *intentionally* blocks *training\* crawlers (GPTBot/CCBot) while staying open to fetchers - that's fine (see m1-1 sub-check 4).

### 2. Run probes in parallel

For each guideline in scope, copy the `## Probe` block from `audit/m{M}-{N}.md`, substitute `$ORIGIN`/`$HOST`, and execute. Probes are independent - run them in parallel using background shells or multiple Bash tool calls in a single message.

Keep raw probe output in `./report/m{M}-{N}.out` so you can re-score without re-fetching.

**Emit progress text.** The user cannot read tool output in real time the same way you can - emit a one-sentence text message before each probe batch so they see what's happening. Suggested cadence: one line on start ("Resolving target…"), one line per probe batch ("Probing m1-_ discovery files…", "Probing m4-_ actionable / commerce…"), one line on scoring ("Scoring 25 guidelines…"), one line on write ("Writing report/AUDIT.md…"). Don't narrate every curl - group by module or by batch. Keep each line under 80 chars.

Probes that POST to live endpoints are safe - they're discovery calls with no side effects: m4-4 `initialize` + `tools/list`, m4-9 `OPTIONS` (and a `{}` POST that only reads back a structured validation error), m4-10 `/ask`, and m5-4's DCR probe (POSTs an intentionally-incomplete body so the server rejects it with a validation error rather than registering a real client). Don't run probes that explicitly require manual confirmation (m5-1, m5-4 sub-check 5); flag them as `(manual)` and surface in the report.

### 3. Score each guideline

For each guideline:

1. Apply the `## Rubric` table from its `audit/` file. Walk row-by-row, derive each sub-check's pass condition from the probe output, sum weights.
2. Map `points / weight_total` to status:
   - **Pass** ≥ 85%
   - **Partial** 30-84%
   - **Fail** < 30%
   - **N/A** if the rubric's `N/A condition` matches the site (e.g., commerce protocols on a static blog).

   Each `audit/` file may override these thresholds - check the "Status:" line under the rubric table.

3. Record the **exact probe** run and **exact response** observed - that's your evidence.

**Evidence rules (non-negotiable)**

These are the rules that separate a useful audit from a flattering one. Violating them produces over-claims that the user has to refute.

- **Live-web sub-checks score from HTTP responses only.** If the rubric asks whether `/llms.txt` exists, the answer comes from `curl https://site/llms.txt`. It does not come from `find $REPO -name llms.txt`. A file existing in a repo does not mean a URL serves it; an endpoint file being present in `public/` does not mean nginx routes to it; a PHP doc-comment describing a webhook shape does not mean the live endpoint accepts that shape.
- **Repo inspection is for _fix hints only_.** When you've decided a sub-check Fails based on live evidence, you may consult the repo to suggest which file to edit. You may NOT consult the repo to upgrade a Fail to a Pass.
- **When a probe can't complete, the sub-check Fails.** This includes: auth-gated endpoints you don't have credentials for, manual checks (platform listings, Wikipedia presence) that require a human, JS-rendered content you'd need a headless browser to read, third-party services that timed out. Call out the specific reason. The user can re-run with credentials or confirm manually.
- **Ambiguous responses get the conservative reading.** A 400 with a domain-specific error message (e.g., `{"error":"Expected event.type = order.created"}`) is evidence the endpoint understands a specific protocol - that's a Pass on "endpoint exists and validates schema." It is NOT evidence of "the protocol is fully implemented" - that requires sending a valid payload and getting a domain-correct response. Score each sub-check at the resolution it asks for.
- **Cite the probe and the response verbatim, not your paraphrase.** "Got 200" is not evidence. "Got 200 with `content-type: application/json` and `.endpoints.checkout` field present" is.

### 4. Prioritize fixes

Rank Fail + Partial guidelines by:

```
priority = impact × (6 - complexity)
```

Both values come from the rubric frontmatter. Higher = fix first. Tie-break by `visualChange` (`none` and `low` before `medium`/`high`) - these ship faster.

Show the cumulative impact too: "After top 5 fixes, projected score: X / Y (was A / Y)."

### 4.5 Turn every gap into a concrete, environment-aware fix

A score is half the value; the **fix** is the other half. Every Fail and Partial must ship with a fix the user can act on _in their stack_ - not generic advice. For each one:

1. Start from the rubric's `## Codebase hints` and `## Auto-fix template`.
2. **Specialize to the detected framework** (from `./report/framework`). Surface only the matching hint row, with the real file path - `app/robots.ts` for Next.js app-router, `config/routes.rb` for Rails, webroot drop for PHP-classic, etc.
3. **If a repo path was given**, ground it in the actual tree: name the exact file to create/edit (`grep`/`ls` to confirm where headers/middleware/routes already live), and reference any half-built feature you found (e.g. "`agentic-oauth.php` exists in the repo but nothing routes `/.well-known/oauth-authorization-server` to it"). Repo inspection is for _fix hints only_ - it never upgrades a live Fail to a Pass.
4. Make the change the **smallest** one that moves the sub-check from Fail to Pass, and quote the literal snippet (robots line, JSON-LD block, header, well-known file) inlined from the rubric's auto-fix template with `$ORIGIN`/brand substituted.

**Detect & propose only.** Put these fixes in the report (Action plan rows, Blocker `Fix` blocks, and the opt-in PR-issue list). **Do not write any files** - applying changes happens only in step 6, only when the user explicitly says "apply", and only against the repo path.

### 5. Report

Write a single markdown file at `./report/AUDIT.md`. The format is DRY - every fact appears in exactly one place. The user reads top-down and stops as deep as they need to go: header → headline → action plan → blockers → findings table.

```
# Agentic Readiness Audit - <host>

**Score N / W (P%)** · X Pass · Y Partial · Z Fail · K N/A · <framework> · YYYY-MM-DD

> **Headline.** <2-3 sentences, executive-summary style. State where the site sits overall ("foundational stage", "production-ready on discovery but gapped on actionability", etc.), the shape of the gap, and the rough cost/upside of closing it. Do NOT name specific endpoints, file paths, server bugs, or RFC numbers in the headline - those live in the Blockers and Findings sections. A non-technical reader (PM, founder, exec) should be able to grasp it in one read.>

## Action plan - do in order

| # | Action | Unblocks | Effort | +pts |
|---|--------|----------|--------|------|
| 1 | <smallest concrete change> | <guideline IDs it unblocks> | <h/d> | +N |
| ... |

**Projected: <current> → <after-action-plan> (P%) after rows 1-N.**

## Cross-cutting blockers

For each blocker (typically 1-3 per audit) that gates ≥ 3 guidelines, write a dedicated subsection titled `### Blocker A - <one-line description>`. Inside: a `Reproduce` block with the literal probe + response, then a `Fix` block with the concrete change. Then in the Findings table use the `↺` status and reference "Blocker A" in the Unlocks column. Mention each specific bug exactly once, here - never repeat it across the guideline rows.

## Findings - 25 guidelines

Legend: ✅ Pass · ⚠️ Partial · ❌ Fail · ➖ N/A · ↺ blocked by a cross-cutting blocker.

| ID | Guideline | Score | Live evidence (verbatim probe results) | Unlocks via |
|----|-----------|------:|-----------------------------------------|-------------|
| m1-1 | Discovery files | ⚠️ 2/6 | `sitemap.xml 404`; `robots.txt 200, has Content-Signal:`, no `Sitemap:` line; `llms.txt 404`; `index.md 404`; `Link: (none)` | action 3, 4 |
| m1-2 | Well-known agent files | ↺ 0/5 | All `/.well-known/*.json → 301 /well_known/ → 404` | Blocker A + action 2 |
| ... |

## Quick wins outside the action plan

3-5 bullets: each < 1 hour, gains a point, doesn't gate anything.

## Methodology

One paragraph: probes defined in audit/, evidence-only-from-HTTP, status thresholds. Link to `report/score.json` for the machine-readable breakdown.
```

**Rules for each section:**

- **Headline** is the most-skipped-by-engineers, most-read-by-execs section. Lead with the _story_ (where does this site stand), not the _findings_ (what did probes return). Two sentences, max three. Don't name endpoints or files.
- **Action plan** is ordered by "what depends on what," not just by priority score. If action 2 needs action 1's fix, action 1 comes first even if it has lower priority.
- **Blockers** absorb the cross-cutting story (one nginx bug, one missing template, one missing auth setup). If you find yourself writing "same bug as m1-2" in another row, that's the cue to lift it into a Blocker.
- **Findings table** is one row per guideline. Evidence column carries the literal probe results inline - backtick-quote the response strings. No nested tables, no per-guideline detail sections. If a finding needs more than 200 characters to explain, it belongs in a Blocker, not the table.
- **Probe/Response/Verdict triplets** that you produced during scoring are kept in the raw `./report/*.out` files and `score.json` - they don't appear in the report markdown unless the reader explicitly asks for them. The Findings table's evidence column is the user-facing distillation.
- **Don't repeat the totals.** The score appears once at the top. Don't add a per-module breakdown - it's redundant with the Findings table.
- **Don't write "what changed since last run."** That's commit-message territory.

**Score.json (opt-in)** - written to `report/score.json`. Schema documented in [`README.md`](./README.md#reportscorejson-machine-readable-opt-in); keep the two in sync. `weight_total` per guideline MUST match that guideline's `audit/` frontmatter. A `weight: 0` sub-check is a `(manual)`/bonus row that never lowers the automated score.

```json
{
  "host": "example.com",
  "tested_at": "YYYY-MM-DDTHH:MM:SSZ",
  "scope": ["m1-1", "m1-2", "..."],
  "scoreboard": { "pass": 4, "partial": 8, "fail": 11, "na": 2, "blocked": 0, "weighted": { "points": 31, "total": 142, "pct": 22 } },
  "blockers": [
    { "id": "A", "title": "WAF challenges agent fetchers", "gates": ["m1-1", "m1-3", "m2-2"] }
  ],
  "guidelines": [
    {
      "id": "m1-1", "title": "Discovery files",
      "status": "partial", "points": 2, "weight_total": 10,
      "complexity": 1, "impact": 4, "priority": 20, "visual_change": "none",
      "sub_checks": [
        { "name": "sitemap.xml exists", "pass": true,  "weight": 1, "evidence": "200 application/xml" },
        { "name": "robots.txt exists",  "pass": true,  "weight": 1, "evidence": "200, Sitemap: line found" },
        { "name": "Content-Signal in robots", "pass": false, "weight": 1, "evidence": "no Content-Signal: line" },
        ...
      ],
      "fix_summary": "Add Content-Signal directive; create llms.txt and index.md; emit Link: headers."
    }
  ]
}
```

**PR-ready issue list (opt-in)**:

One markdown block per Fail/Partial guideline, ready to paste as a GitHub issue body. Includes title (`agentic-readiness: <guideline title> (m{M}-{N})`), evidence, fix steps, file paths.

### 6. Apply fixes (only when asked)

If the user says "apply the top N" and gave you the repo path:

- One commit per guideline. Message: `agentic-readiness: <guideline title> (m{M}-{N})`.
- Make the smallest change that pushes the guideline to Pass. Don't expand scope.
- After each commit, re-run only that guideline's probe to confirm.
- Stop at the user's quota.

Never push, never open PRs without explicit consent.

## Conventions

- **Never fabricate scores.** If a probe doesn't complete (network error, JSON parse failure, JS-only render, auth required), the sub-check **Fails**. The Probe/Response/Verdict triplet captures the reason - `Verdict: FAIL - auth required, no token supplied`. The user can grant credentials and re-run.
- **Each guideline is independent.** Score from its own rubric, not your overall impression of the site.
- **Ignore `How Forter helps` sections** in `content/`. They're vendor commentary, not requirements. The audit must give the same score whether or not Forter is in use.
- **Don't recommend Forter** unless the user explicitly asks "should we use Forter for this?".
- **Keep responses verbatim.** Copy the response bytes (status line + relevant headers + first ~200 chars of body). Don't summarize "got an ACP-shaped error" - show `{"error":"Expected event.type = order.created"}`.
- **Repo grep is for fix hints, not evidence.** If a sub-check failed live but the repo shows the feature is half-built, note it under **Fix** (e.g., "agentic-oauth.php exists in repo but no nginx route") - don't promote the Fail to a Pass.
- **Keep the report tight.** The Probe/Response/Verdict triplet is the only ceremony. No essays.

## When the user says "go"

1. Ask for URL and (recommended) repo path if not given.
2. Ask which output formats - markdown only, or also `score.json` and/or PR issue list.
3. Run probes in parallel, score, prioritize, report.
4. If they then say "apply the top three", apply them as commits, then re-probe those three to confirm.

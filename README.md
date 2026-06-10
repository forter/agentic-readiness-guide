# Forter Agentic Readiness Guide 

A practical, opinionated guide to making any website **agent-ready** - discoverable, comprehensible, trustworthy, actionable, and experiential - so that LLM-driven agents (and the humans behind them) can find, understand, trust, and act on your product.

Five modules, 25 guidelines, each one a single markdown file in [`content/`](./content). Every guideline has a "What & why", a 1-5 complexity/impact score, concrete steps, and references. Where Forter ships infrastructure that satisfies a guideline, the file ends with a "How Forter helps" callout.

## Download it offline

https://github.com/user-attachments/assets/9817a638-6ffc-42b3-94b4-a0124f280cea

**[Download the full guide (PDF)](https://l.forter.com/hubfs/Forter-agentic-readiness-guide.pdf)**

## Read it online

Browse [`content/`](./content) directly on GitHub. Files are organized by module: `m1-*` Discoverable, `m2-*` Comprehensible, `m3-*` Trustworthy, `m4-*` Actionable, `m5-*` Experiential.

## Audit your own site

This repo ships a Claude Code skill in [`SKILL.md`](./SKILL.md), backed by 25 machine-testable rubrics in [`audit/`](./audit), that turns the guide into an automated auditor. Point it at a site (and optionally its source) and it will:

1. Run the probe in each `audit/m{M}-{N}.md` rubric against your site.
2. Score each guideline **Pass / Partial / Fail / N/A**, citing the literal probe response as evidence.
3. Rank Fails and Partials by **impact × (6 - complexity)** so the highest-leverage fixes float to the top.
4. Optionally apply fixes as commits when you give it your repo path.

### Install the skill

[Claude Code](https://docs.claude.com/claude-code) auto-discovers skills under `~/.claude/skills/`. Clone once and **symlink** the repo in - no copying, so `git pull` keeps the skill current and your skills folder stays clean:

```bash
git clone https://github.com/forter/agentic-readiness-guide.git
mkdir -p ~/.claude/skills
ln -s "$(pwd)/agentic-readiness-guide" ~/.claude/skills/forter-agentic-readiness-audit
```

(The symlink's name matches the skill's `name`. The repo's root `SKILL.md` and `audit/` resolve straight through the symlink. To uninstall, `rm ~/.claude/skills/forter-agentic-readiness-audit` - that removes only the link, not your clone.)

Then in any Claude Code session:

```bash
claude "Audit https://your-site.example.com against the Agentic Readiness Guide"
```

Claude picks the skill up from its frontmatter `description` and runs it. Add `--add-dir /path/to/your/site` to include your source repo - fixes get applied as commits there. Type `/skills` inside Claude Code to confirm the skill is loaded.

**Prereqs.** The probes shell out to `curl`, `jq`, and `python3` (for HTML parsing). All three are standard on macOS and most Linux distros; on a bare container, install via `apt-get install curl jq python3` or `brew install jq` (curl and python3 usually ship).

### What you get

A single `report/AUDIT.md` with, in order:

- **One-line scoreboard** - `Score N/W (P%) · X Pass · Y Partial · Z Fail · K N/A`.
- **Headline** - two sentences a non-technical reader can grasp: where the site sits and the rough shape of the gap.
- **Action plan** - ordered fixes (smallest concrete change → guideline it unblocks → effort → point gain), with a projected post-fix score.
- **Cross-cutting blockers** - when one bug gates ≥ 3 guidelines, it gets a dedicated reproduce-and-fix subsection instead of being repeated per row.
- **Findings table** - 25 rows, one per guideline, with the literal probe response as inline evidence.

Raw probe outputs land alongside in `report/*.out`; opt into `report/score.json` (machine-readable, schema below) and a PR-ready issue list by asking for them. A typical first audit on a real e-commerce site closes the discoverability tier in a day and surfaces 15-20 deeper items the team can sequence over a sprint.

### `report/score.json` (machine-readable, opt-in)

Ask for it explicitly ("also write `score.json`") and the skill emits a single JSON file next to `AUDIT.md` - the same scores as the report, structured for CI/CD gates, dashboards, or trend tracking. The findings table is for humans; `score.json` is for machines.

```jsonc
{
  "host": "example.com",                 // bare host audited (no scheme)
  "tested_at": "2026-06-02T14:30:00Z",   // ISO-8601 UTC timestamp of the run
  "scope": ["m1-1", "m1-2", "..."],      // guideline ids actually scored this run (default: all 25)
  "scoreboard": {
    "pass": 4, "partial": 8, "fail": 11, "na": 2,   // guideline counts by status
    "blocked": 0,                                    // guidelines gated by a cross-cutting blocker (↺)
    "weighted": { "points": 31, "total": 142, "pct": 22 }  // summed sub-check weights; pct = points/total
  },
  "blockers": [                          // cross-cutting issues gating ≥3 guidelines (may be empty)
    { "id": "A", "title": "WAF challenges agent fetchers", "gates": ["m1-1", "m1-3", "m2-2"] }
  ],
  "guidelines": [
    {
      "id": "m1-1",                      // matches content/m1-1-*.md and audit/m1-1.md
      "title": "Discovery files",        // the audit rubric's short title
      "status": "partial",              // "pass" | "partial" | "fail" | "na" | "blocked"
      "points": 2,                       // sub-check weights earned
      "weight_total": 10,                // sum of the rubric's sub-check weights (matches audit frontmatter)
      "complexity": 1,                   // 1-5, from the rubric/content frontmatter
      "impact": 4,                       // 1-5, from the rubric/content frontmatter
      "priority": 20,                    // impact × (6 - complexity); higher = fix first
      "visual_change": "none",          // "none" | "low" | "medium" | "high"
      "sub_checks": [                    // one entry per rubric row, in order
        { "name": "sitemap.xml exists",     "pass": true,  "weight": 1, "evidence": "200 application/xml" },
        { "name": "Content-Signal present", "pass": false, "weight": 1, "evidence": "no Content-Signal: line" }
        // weight: 0 rows are manual/bonus checks - surfaced but never drag the automated score
      ],
      "fix_summary": "Add Content-Signal directive; create llms.txt and index.md; emit Link: headers."
    }
    // ... one object per guideline in scope
  ]
}
```

**Field notes.** `weighted.total` counts only guidelines that were scored (N/A and blocked guidelines are excluded), so `pct` reflects what was actually testable. `status` maps from `points / weight_total` per the rubric's thresholds (default **Pass ≥ 85%**, **Partial ≥ 30%**, **Fail < 30%** - some rubrics override this; see [`audit/README.md`](./audit/README.md)). A sub-check with `"weight": 0` is a `(manual)` or bonus row: it appears for visibility but can never lower the automated score. `priority` is the same `impact × (6 - complexity)` ranking the action plan uses.

## Cite it

Licensed CC BY 4.0 - use, adapt, and quote freely with attribution to Forter.

## Contribute

Spotted an outdated reference? Missing protocol? Better wording for a guideline? PRs welcome.

1. Edit the relevant markdown file in `content/`.
2. Keep the frontmatter and H1 in sync (see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the schema).
3. Open a PR against `main`.

The rendered PDF and webinar are produced from a separate build pipeline. CI (`npm test`) validates frontmatter, audit↔content alignment, and required section structure on every PR - so you'll find out before merge if something is off.

## Structure

```
content/                    Human-facing guide (markdown, the editorial source of truth)
  00-toc.md                 Table of contents
  01-introduction.md        Lifecycle frame: Discover → Comprehend → Trust → Act → Experience
  m{1-5}-0-module-*.md      Five module overviews
  m{1-5}-{1-N}-*.md         Twenty-five guideline files

audit/                      Machine-testable rubrics - one per guideline, used by SKILL.md
  m{1-5}-{1-N}.md           Probe + weighted sub-checks + codebase hints
  README.md                 Rubric file format & strict scoring rules

SKILL.md                    Claude Code skill - orchestrates probes and writes report/AUDIT.md
CONTRIBUTING.md             Frontmatter schema, body-section checklist, PR template
scripts/validate.mjs        Self-contained frontmatter + alignment validator (npm test)
LICENSE                     CC BY 4.0
```

## License

Content is licensed [CC BY 4.0](./LICENSE). Built and maintained by [Forter](https://www.forter.com).

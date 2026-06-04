# Audit rubrics

Machine-testable companions to `content/`. One file per guideline (`m1-1.md` … `m5-4.md`). The skill in `SKILL.md` loads these to probe a target site and assign weighted scores.

`content/` is the human-facing guide. `audit/` is the tester's rubric. Don't merge them - content evolves on its own cadence, rubrics evolve as probes improve.

## Consistency contract

Three layers must agree on module + guideline numbering: `content/m{M}-{N}-*.md` ↔ `audit/m{M}-{N}.md` ↔ the report's findings table (`m{M}-{N}` row id). The CI validator (`npm test`) enforces:

- `audit/m{M}-{N}.md` exists for every content guideline (warning otherwise).
- `audit.id` matches `content.id`'s M-N prefix.
- `audit.complexity` and `audit.impact` equal the values in `content/`.
- `audit.visualChange` matches `content.visualChange` when both are set.
- `audit.weight_total` equals the sum of the rubric table's row weights (the final integer cell of each data row, across every table in the `## Rubric` section). Add a sub-check → bump `weight_total` to match, or CI fails.

Titles intentionally diverge: `content/` uses imperative verbs ("Implement OAuth", "Verify bots cryptographically") because the guide reads top-to-bottom; `audit/` uses short noun-phrase tags ("OAuth discovery", "Web Bot Auth") that fit a scoreboard column. The report uses the audit title.

## File format

Every `audit/m{M}-{N}.md` must follow this structure:

```markdown
---
id: m{M}-{N}                                    # MUST match the content guideline's M-N
title: <short title, ~3-5 words>                # may differ from content's imperative title
complexity: <1-5, MUST match content frontmatter>
impact: <1-5, MUST match content frontmatter>
visualChange: <none|low|medium|high, MUST match content if both set>
weight_total: <sum of sub-check weights, usually 3-8>
---

# m{M}-{N} - <title>

## Probe

Exact shell commands that gather evidence. Use `$HOST` as the bare host (no scheme), `$ORIGIN` as `https://$HOST`. Probes should be:
- Idempotent (safe to re-run).
- Fast (<5s each; offload heavy work to optional sub-checks).
- Non-destructive (no POST to live endpoints unless explicitly a sandbox).
- Self-contained (no shared state between probes).

​```bash
curl -fsSI $ORIGIN/sitemap.xml
curl -fsS  $ORIGIN/robots.txt | grep -iE '^(sitemap|content-signal):'
# ... etc
​```

## Rubric

A table of weighted sub-checks. Each row: a name, the pass condition (observable, derivable from probe output), and a point weight.

| # | Sub-check | Pass when | Weight |
|---|-----------|-----------|--------|
| 1 | sitemap.xml | HTTP 200 and `content-type` includes `xml` | 1 |
| 2 | robots.txt  | HTTP 200 and references at least one `Sitemap:` line | 1 |
| ... |

**Status mapping** (default; override only with explicit reason):
- **Pass** - score ≥ 85% of `weight_total`.
- **Partial** - score ≥ 30% of `weight_total`.
- **Fail** - score < 30% of `weight_total`.
- **N/A** - the guideline genuinely does not apply (e.g., commerce protocols on a static marketing site).

**Strict scoring rules** (binding on every rubric):
- Every sub-check's `Pass when` clause MUST be derivable from HTTP response bytes alone. "File present in repo at path X" is never a valid Pass condition; only "URL X returns Y" is.
- A sub-check that can't be probed (auth required, manual platform check, JS-only render) **Fails**. Don't introduce `Unknown` - the orchestrator surfaces such cases with the exact probe so a human can re-run.
- Ambiguous responses get the conservative reading. A 400 error message that names a protocol's event type is *only* evidence the endpoint validates schema, not evidence the protocol is fully implemented.
- Repo inspection is reserved for `## Codebase hints` - it MAY suggest which file to edit when a sub-check Fails. It MAY NOT promote a Fail to a Pass.

## Codebase hints

A short bulleted list mapping common frameworks → file paths to edit. The orchestrator detects framework from the repo (`package.json`, `Gemfile`, `composer.json`, `requirements.txt`, `next.config.js`, `astro.config.mjs`, etc.) and surfaces only the relevant row.

- **Next.js (app router)**: `app/robots.ts`, `app/sitemap.ts`
- **Next.js (pages router)**: `pages/api/robots.ts`, `public/sitemap.xml`
- **Rails**: `config/routes.rb` + `app/views/robots.text.erb`
- **Django**: `django.contrib.sitemaps`, `urls.py`
- **Express / Node**: middleware route, set headers via `res.set()`
- **PHP / classic**: drop file at webroot (`public/`, `htdocs/`, `www/`)
- **Cloudflare Pages / Workers**: `_headers`, `public/`
- **Static (Hugo/Jekyll/Astro/11ty)**: `static/` or `public/` directory
- **Other / unknown**: drop file at webroot

If a guideline is framework-agnostic (just a JSON file at a well-known path), say so and skip the per-framework table.

## Auto-fix template (optional)

A copy-pasteable starter for the most common stack. Keep minimal and correct over comprehensive. Include only when there's an obvious one-file change that covers ≥80% of sites.

​```text
# /robots.txt
Sitemap: $ORIGIN/sitemap.xml

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
​```

## References

One line: link back to the source-of-truth guideline in `content/`. Specs/RFCs already live there - don't duplicate.

`See: [content/m{M}-{N}-*.md](../content/m{M}-{N}-*.md)`

## Notes for contributors

- Sub-checks should be **independently testable** - a reader should be able to see each row's pass/fail from the probe output alone.
- Weights should be roughly proportional to user-visible impact within the guideline (don't weight a `Link:` header equal to publishing `llms.txt` itself).
- Composite guidelines (m1-1, m4-9, m2-2) should split into sub-checks per discrete artifact (file, protocol, endpoint).
- When a sub-check requires a paid/destructive action (e.g., actually completing an OAuth flow), mark it `weight: 0` and tag it `(manual)` - the orchestrator surfaces it as a checklist item rather than a probe failure.
- Keep each file under ~100 lines. If you're writing more, the rubric is too coarse - split into sub-checks.

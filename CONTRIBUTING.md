# Contributing

Thanks for opening a PR. This repo is content-only - markdown files in `content/`, no build tooling. The rendered PDF and webinar live in a separate internal pipeline.

## What to change

- **Fix a fact, a link, or wording** in any existing guideline (`content/m*-*.md`).
- **Improve the steps or references** in a guideline.
- **Propose a new guideline** by opening an issue first - module numbering and scoping benefit from discussion before drafting.

## Frontmatter schema

Every guideline file starts with YAML frontmatter:

```yaml
---
id: m4-1-openapi-spec
module: actionable              # discoverable | comprehensible | trustworthy | actionable | experiential
moduleNumber: 4                 # 1-5, must match module
guidelineNumber: 1              # unique within module
title: Ship OpenAPI specification
complexity: 4                   # 1 (trivial) to 5 (major engineering project); rendered as "Effort" in the guide body
impact: 5                       # 1 (nice to have) to 5 (table stakes)
visualChange: low               # optional: none | low | medium | high
forterApplies: partial          # no | partial | yes | flagship
---
```

Chapter and module-overview files have a lighter frontmatter:

```yaml
---
id: module-discoverable
title: Module 1 - Be Discoverable
kind: module-overview            # front-matter | chapter | module-overview | appendix
moduleNumber: 1                  # required for kind=module-overview
---
```

## Required body sections

Each guideline must have, in order:

1. `# <title>` - H1 must match the frontmatter `title` exactly.
2. `## What & why` - what the guideline is and why it matters.
3. `## Scoring` - concrete, observable criteria for pass / partial / fail. This is what auditors (human or agent) will use.
4. `## Steps` - numbered, concrete actions to implement the guideline.
5. `## References` - links to specs, RFCs, blog posts, code examples.
6. `## How Forter helps` - **only** when `forterApplies` is `partial`, `yes`, or `flagship`. Skip this section when `forterApplies: no`.

The internal validator (run in CI) enforces this structure and will fail the PR if a section is missing, mis-ordered, or if `forterApplies` doesn't match the presence of "How Forter helps".

## Cross-references

Link between guidelines with relative file paths, e.g. `[3.1](./m3-1-oauth-discovery.md)`. Audit rubrics link the same way (`[m3-2](./m3-2.md)`) and link back to content with `../content/...`. The validator (`npm test`) resolves every `(./mX-Y-*.md)` / `(../content|audit/...)` reference and fails the PR on a dangling link.

## Checklist before opening a PR

- [ ] H1 matches `title` in frontmatter.
- [ ] All required sections present and in order.
- [ ] `forterApplies` and `How Forter helps` are in sync (both present or both absent).
- [ ] Every `[x.y](./mX-Y-*.md)` cross-reference points to an existing file.
- [ ] Tags are lowercase, kebab-case.
- [ ] References include at least one canonical source per claim.

## Tone

- Concrete over abstract. "Add `Accept: application/ld+json`" beats "consider content negotiation".
- Cite RFCs and specs by number. Link to the canonical source, not a third-party tutorial.
- Don't sell Forter outside the "How Forter helps" section. The body of the guideline should be useful regardless of vendor choice.

## License

By submitting a PR you agree your contribution is licensed [CC BY 4.0](./LICENSE), the same as the rest of the repo.

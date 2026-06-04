---
id: m4-7-sdks-and-cli
module: actionable
moduleNumber: 4
guidelineNumber: 7
title: Distribute SDKs & CLI
complexity: 3
impact: 4
visualChange: none
forterApplies: 'yes'
---

# 4.7  Distribute SDKs & CLI

## What & why
Agents and the developers building them reach for SDKs and CLIs first, raw HTTP second. Without an idiomatic SDK in the language an integrator (or an LLM writing code on their behalf) is using, every consumer rolls their own client and gets at least one of pagination, retries, error parsing, or auth wrong. With SDKs in npm and PyPI - plus a CLI on npm and Homebrew - integration is one install away.

This is also where the OpenAPI investment from [4.1](./m4-1-openapi-spec.md) pays a second dividend: a complete spec generates both SDKs and a CLI for the cost of one.

## Scoring
- **Effort 3/5** - Assumes the OpenAPI spec from [4.1](./m4-1-openapi-spec.md) is already published; if it isn't, that work comes first. Given the spec, the hard part is the publishing pipeline - signing, versioning, and per-registry credentials. Generation itself is largely solved.
- **Impact 4/5** - Major integration accelerator; LLMs writing integration code reach for `import stripe` before they reach for `requests`.
- **Visual change: none** - SDKs ship to package registries, not your site.

## Steps
1. **Pick one OpenAPI generator and commit.** Stainless, Speakeasy, Fern, or `openapi-generator` are the credible options. Test each against your spec from [4.1](./m4-1-openapi-spec.md) - the one whose output you'd be willing to hand-edit is the one to pick. Switching mid-stream costs months.
2. **Ship the npm and PyPI SDKs.** TypeScript on npm and Python on PyPI cover ~80% of agent and integration code. Idiomatic naming (`client.transactions.create({...})`, not `client.postTransactions(...)`), typed responses, automatic retries with exponential backoff that respect the `Retry-After` headers from [4.2](./m4-2-rate-limits-and-errors.md), and pagination iterators (`for await (const tx of client.transactions.list())`).
3. **Distribute a CLI on npm and Homebrew.** Mirror your SDK surface - `yourbrand transactions create --amount 1000` - plus auth helpers (`yourbrand login` doing the OAuth device flow from [3.1](./m3-1-oauth-discovery.md)), config management, and a `--json` flag for piping into agent workflows.
4. **Auto-publish on every spec release.** CI pipeline: spec change merges, generator runs, both SDKs and the CLI build, tests pass against a sandbox, version bumps semantically, changelogs generate from spec diffs, packages publish to all three registries, GitHub release goes out.

## References
- [OpenAPI Generator](https://openapi-generator.tech?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [npm publishing docs](https://docs.npmjs.com/cli/commands/npm-publish?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [PyPI publishing guide](https://packaging.python.org/en/latest/tutorials/packaging-projects/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Homebrew tap creation](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Fern](https://buildwithfern.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Speakeasy](https://www.speakeasy.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## How Forter helps

Run on the [**Forter Agentic Orchestration Suite**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-7-sdks-and-cli) and the SDK and CLI layer can be generated for you. From the tool surface you expose, Forter builds and publishes idiomatic SDKs in the popular languages - ready to link straight from your developer docs - and stands up an authenticated API that your users and their agents can call directly. Auth, retries, error handling, and pagination come wired in, and every SDK regenerates when your tools change.

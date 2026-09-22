---
id: m4-7-sdks-and-cli
module: actionable
moduleNumber: 4
guidelineNumber: 7
title: 分发 SDK 与 CLI
complexity: 3
impact: 4
visualChange: none
forterApplies: 'yes'
---

# 4.7  分发 SDK 与 CLI

## 是什么与为什么
智能体以及构建它们的开发者，首先伸手去拿 SDK 和 CLI，其次才是裸 HTTP。如果集成方（或替他们写代码的 LLM）使用的语言里没有一个符合习惯的 SDK，每个消费者都会自己攒一个客户端，然后在分页、重试、错误解析或认证中至少搞错一样。有了 npm 和 PyPI 上的 SDK - 加上 npm 和 Homebrew 上的 CLI - 集成只差一次安装。

这也是 [4.1](./m4-1-openapi-spec.md) 的 OpenAPI 投资付出第二笔红利的地方：一份完整的规范以一份的成本同时生成 SDK 和 CLI。

## 评分
- **工作量 3/5** - 前提是 [4.1](./m4-1-openapi-spec.md) 的 OpenAPI 规范已经发布；如果没有，先做那件事。有了规范，难点在发布管道 - 签名、版本管理和各注册源的凭证。生成本身基本是已解决的问题。
- **影响力 4/5** - 重大的集成加速器；写集成代码的 LLM 会先 `import stripe`，然后才想到 `requests`。
- **视觉变化：无** - SDK 发布到包注册源，不在你的网站上。

## 步骤
1. **选定一个 OpenAPI 生成器并坚持。** Stainless、Speakeasy、Fern 或 `openapi-generator` 是可信的选项。用你 [4.1](./m4-1-openapi-spec.md) 的规范逐一测试 - 哪个的输出你愿意手工编辑，就选哪个。中途换车要花几个月。
2. **发布 npm 和 PyPI 的 SDK。** npm 上的 TypeScript 和 PyPI 上的 Python 覆盖约 80% 的智能体和集成代码。符合语言习惯的命名（`client.transactions.create({...})`，不是 `client.postTransactions(...)`）、带类型的响应、尊重 [4.2](./m4-2-rate-limits-and-errors.md) 的 `Retry-After` 头的指数退避自动重试，以及分页迭代器（`for await (const tx of client.transactions.list())`）。
3. **在 npm 和 Homebrew 上分发 CLI。** 镜像你的 SDK 面 - `yourbrand transactions create --amount 1000` - 外加认证辅助命令（`yourbrand login` 执行 [3.1](./m3-1-oauth-discovery.md) 的 OAuth 设备流程）、配置管理，以及供智能体工作流管道使用的 `--json` 标志。
4. **每次规范发布都自动发包。** CI 管道：规范变更合入，生成器运行，两个 SDK 和 CLI 构建，测试在沙箱环境通过，版本按语义化递增，changelog 从规范差异生成，包发布到三个注册源，GitHub release 发出。

## 参考资料
- [OpenAPI Generator](https://openapi-generator.tech?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [npm 发布文档](https://docs.npmjs.com/cli/commands/npm-publish?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [PyPI 发布指南](https://packaging.python.org/en/latest/tutorials/packaging-projects/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Homebrew tap 创建](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Fern](https://buildwithfern.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Speakeasy](https://www.speakeasy.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

运行在[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-7-sdks-and-cli)上，SDK 和 CLI 层可以替你生成。从你暴露的工具面出发，Forter 构建并发布主流语言中符合习惯的 SDK - 可直接从你的开发者文档链接 - 并搭建一个你的用户及其智能体可以直接调用的已认证 API。认证、重试、错误处理和分页开箱即接好，而且每当你的工具变化，每个 SDK 都会重新生成。

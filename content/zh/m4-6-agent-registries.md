---
id: m4-6-agent-registries
module: actionable
moduleNumber: 4
guidelineNumber: 6
title: 在智能体注册目录中登记
complexity: 1
impact: 3
visualChange: low
forterApplies: 'yes'
---

# 4.6  在智能体注册目录中登记

## 是什么与为什么
MCP 服务器上线（[4.4](./m4-4-mcp-server.md)）、OpenAPI 干净（[4.1](./m4-1-openapi-spec.md)）之后，你终于有东西可以发布了。智能体通过**注册目录**发现能力 - 不是通过爬取 - 而今天有好几个很重要：**mcp.run、mcphub.io、Smithery、Glama**（MCP 服务器应用市场）、**skills.sh**（域名级技能目录，在 Claude 和 Cursor 中享有一等索引）、**Agent Skills**（开放的 `SKILL.md` 标准，你也可以从自己的 `/.well-known/` 自行发布）、官方 **MCP Registry**、**ARD 注册目录**（Google 支持，爬取 `ai-catalog.json`），以及**基于评分的目录**（排名可能被智能体实时查询）。登记免费，表单很短，纪律在于随着工具面演进保持描述准确。

## 评分
- **工作量 1/5** - 四次提交，每次约 15 分钟。条目质量受限于底层规范质量，所以大部分工作已经在 [4.1](./m4-1-openapi-spec.md) 和 4.4 完成。
- **影响力 3/5** - 没有条目，你在能力发现中就是隐形的；有了条目，每当用户找“能做 X 的工具”时你就出现在选择器里。
- **视觉变化：低** - 条目存在于第三方注册目录上，不在你的网站上。

## 步骤
1. **mcp.run 和 mcphub.io。** 提交你的 MCP 服务器 URL、一段描述、工具列表和 logo。两者都从你服务器的 `tools/list` 端点拉取工具元数据，所以每个 MCP 工具上的 `description` 就是用户实际读到的内容 - 像写 API 文档一样写它们，不要像营销文案。工具描述的质量可以追溯到你 [4.1](./m4-1-openapi-spec.md) 的 OpenAPI。
2. **Smithery。** 最大的 MCP 应用市场。在你的仓库根目录添加一个 `smithery.yaml`，声明运行时、环境变量和启动命令 - 这就是在 Cursor 和 Windsurf 中启用一键安装的东西。
3. **skills.sh - 注册你的域名。** 在 skills.sh 认领你的域名，并在每个公开仓库发布一个顶级 `SKILL.md`，列出每个可调用的技能，包含 `name`、`description`、`inputs`、`outputs` 和一个 `example` 块。格式是带 frontmatter 的 markdown - 参考任何知名仓库（例如 `stripe/stripe.com/SKILL.md`）。
4. **skills.sh - 质量信号。** 该注册目录按三个信号排名：(a) 同一域名下的**多个仓库**，各有自己的 `SKILL.md`；(b) **通过 LLM 清晰度评分标准的描述**（没有“强大易用的平台”式填充词）；(c) **新鲜度** - `SKILL.md` 在 90 天内更新过。只有一个单薄 `SKILL.md` 的网站，排名低于有五个聚焦 `SKILL.md` 的网站。
5. **在 `/.well-known/agent-skills/index.json` 发布 Agent Skills 索引。** `SKILL.md` 不再只是 skills.sh 的登记惯例 - **Agent Skills** 是一个开放标准（2025年12月发布，由 [agentskills.io](https://agentskills.io) 托管维护），已被 40 多个智能体客户端采用，包括 Claude Code、Cursor、GitHub Copilot、VS Code、OpenAI Codex 和 Gemini CLI。格式刻意保持极小：一个文件夹、一个带两个必填 frontmatter 字段（`name`、`description`）的 `SKILL.md`，以及可选的脚本、参考文件和资源。真正让它值得发布的是**渐进披露**模型 - 智能体启动时只加载 `name` 和 `description`（各约 30-50 个 token），正文在技能被触发时才加载，参考文件只在执行确实需要时才加载。这就是为什么一个技能几乎不占智能体的上下文成本，也是为什么广度胜过深度：五个聚焦的技能胜过一个包罗万象的。
   在 `/.well-known/agent-skills/` 提供一个静态的 `index.json`（v0.2.0），逐条列出每个技能的 `name`、`description` 以及指向其 `SKILL.md` 的 `path`，这样智能体仅凭你的域名就能枚举你能做什么 - 完全不必经过第三方注册目录。也要注意同一种可移植性带来的安全形态：一个技能文件夹能在每个主流智能体上运行，恶意或粗心的技能同样如此。把已发布的技能当作公开的攻击面 - 像审代码一样审它们，钉死它们执行的一切，绝不让某个技能指示智能体去抓取并运行远程内容。
6. **发布到 ARD 注册目录。** 如果你在 [1.2](./m1-2-well-known-agent-files.md) 发布了 `/.well-known/ai-catalog.json`，ARD 注册目录会爬取它，让你的能力可以通过自然语言查询被发现。随着这些注册目录上线，可被它们爬取是下一步的注册打法。确保你的 `ai-catalog.json` 有效、`representativeQueries` 选得好。
7. **登记基于评分的目录并监控你的分数。** [directory.ora.ai](https://directory.ora.ai) 是一个免费条目。基于评分的目录宣称智能体会实时查询排名来挑选供应商 - 无论这是否会成为真实的路由流量，一个免费条目加分数监控只需 15 分钟。用 [journey.ora.ai](https://journey.ora.ai) 观看一个真实的智能体带着某个意图在你的线上网站上跑一遍。
8. **注册官方 MCP Registry。** [MCP Registry](https://github.com/modelcontextprotocol/registry) 是协议级的服务器目录。与 Glama（19,831+ 台服务器）一道，它正在成为智能体运行时的主要发现界面。
9. **验证并监控。** 每次提交后，在该注册目录中搜索你的品牌名和一条代表性用例查询。设一个 30 天的提醒去复查 - 注册目录会定期重爬，并悄悄下架返回 5xx 或形状变化的服务器。（消费级 AI 平台 - GPT Store、Custom GPTs、Claude 集成、Gemini 扩展 - 是 5.1 的事，它们有自己的审核周期。）

## 参考资料
- [Model Context Protocol Registry](https://github.com/modelcontextprotocol/registry?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Smithery - 发布服务器](https://smithery.ai/docs/build?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [skills.sh - SKILL.md 规范](https://skills.sh?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Agent Skills 开放标准](https://agentskills.io?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google Agentic Resource Discovery（ARD）](https://agenticresourcediscovery.org/spec)
- [Glama MCP 目录](https://glama.ai/mcp)
- [ora.ai 目录](https://directory.ora.ai)

## Forter 如何提供帮助

如果你的 MCP 服务器运行在[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-6-agent-registries)上，注册目录的提交可以替你处理 - 描述从你的 OpenAPI 文档和工具注解自动生成。每次发布都运行重新验证，所以悄悄下架（最常见的注册目录故障模式）会在损害你的可发现性之前被抓住。

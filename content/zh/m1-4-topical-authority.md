---
id: m1-4-topical-authority
module: discoverable
moduleNumber: 1
guidelineNumber: 4
title: 构建主题权威性与编码规则
complexity: 3
impact: 5
visualChange: high
forterApplies: 'no'
---

# 1.4  构建主题权威性与编码规则

## 是什么与为什么
用例搜索是商业意图最集中的地方：“适合 Y 的最佳 X”背后是一个带着预算的买家，而不是随便逛逛的人。这个问题正越来越多地被抛给回答引擎，而非敲进搜索结果页 - 你要么出现在被引用的回答里，要么就是隐形的。权威性在两个界面上赢得。**回答引擎权威性**是内容工作：当顾客问 Perplexity“最适合服装品牌的退货欺诈平台”时，模型会从它认为权威的网站中挑选 - “best for” 落地页、集成教程和对比页（这些放在 [2.4](./m2-4-competitive-positioning.md)，同样的内容、不同的框架）。**代码仓库权威性**是让你的公开代码对编码智能体可读 - `AGENTS.md` / `.cursorrules` 规则，让智能体在为某个集成选型时选中你的库。

## 评分
- **工作量 3/5** - 一个内容计划和/或一次公开仓库清理，外加维护。
- **影响力 5/5** - 品牌名直达搜索和用例搜索是商业意图最集中的地方。不出现在回答里，就得不到客户。
- **视觉变化：高** - 全新的公开页面：“best for” 落地页、更多署名内容。仓库文件（`AGENTS.md`、`.cursorrules`）只存在于仓库中，在你的网站上不可见。

## 步骤
1. **赢下品牌名搜索。** 你自己的域名加上三到五个第三方阵地（G2、Capterra、头部集成伙伴的应用市场、TrustRadius、以及符合条件时一个持续维护的 Wikipedia 条目），应当占满 `"{你的品牌}"` 的第一个回答。审计方式：把你的名字粘贴进 ChatGPT、Claude、Perplexity 和 Gemini - 任何错误或缺失都是你的整改清单。
2. **上线 “best X for Y” 落地页。** 每个高意图用例一页 - “最适合服装品牌的退货欺诈平台”、“最适合数字商品交易市场的拒付保护”，为你销售的每个细分市场各写一页。每页包含：1500 字以上的正文、对比表格、集成代码示例、客户引言。这些正是回答引擎直接引用的页面。（按竞品划分的 `/compare` 页面在 [2.4](./m2-4-competitive-positioning.md) - 它们同时充当主题权威性信号。）
3. **在每个公开仓库发布编码规则。** 放置一个顶级 `AGENTS.md` - 项目结构、构建/测试命令、lint 规则、约定，以及“智能体在这里常犯的错误”，并配上一个更短的 `.cursorrules` 提供 IDE 级指引。如果仓库还提供 skills 或 MCP 服务器，一个 `plugin.json` 清单（[agent-plugins.org](https://agent-plugins.org/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)）可以把它们打包成一个可安装的整体。仓库才是 AGENTS.md 真正生效的地方：它存在于代码仓库中，在任何网页发现管道运行之前，就在会话开始时塑造了编码智能体的环境。AGENTS.md 是一个新兴信号，网页触达率低，但一旦被触达价值很高 - 不过这只衡量了网页抓取。无论网页触达如何，AGENTS.md 都会在仓库层面塑造编码智能体。你网站的职责是指向仓库：一个指向 GitHub 组织的链接，加上 `SoftwareApplication` JSON-LD 上的 `codeRepository` 和 `Organization` schema 上的 `sameAs`（[2.1](./m2-1-json-ld.md)）。在你源站上提供的网页版副本只是镜像，不是机制本身。

## 参考资料
- [AGENTS.md 规范](https://github.com/openai/agents.md?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cursor - 项目规则](https://docs.cursor.com/context/rules?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

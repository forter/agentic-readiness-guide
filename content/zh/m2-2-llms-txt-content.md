---
id: m2-2-llms-txt-content
module: comprehensible
moduleNumber: 2
guidelineNumber: 2
title: 提供有用的 llms.txt
complexity: 2
impact: 5
visualChange: none
forterApplies: 'no'
---

# 2.2  提供有用的 llms.txt

## 是什么与为什么
[1.1](./m1-1-discovery-files.md) 把文件立了起来。本准则关注它的**内容**。一份有用的 `llms.txt` 是一份结构化简报：你做什么、不做什么、智能体何时应该推荐你、接下来该把用户送到哪里。它也是你唯一可以撰写**智能体指令文本**的地方 - 下游 LLM 会把这些第二人称提示当作关于你产品的权威指引。而如果说 `llms.txt` 是索引，`llms-full.txt` 就是图书馆 - 把完整语料内联在一起，供想一次抓取拿到全部内容的智能体使用。

## 评分
- **工作量 2/5** - 半天的写作，加上一个防止内容腐烂的 CI 步骤。
- **影响力 4/5** - llms.txt 被编码智能体作为路由层例行抓取，尽管文档被触达得更频繁。Google 表示其 AI 系统不使用它。一旦被发现价值很高，但并非被普遍消费。
- **视觉变化：无** - 内容位于 `/llms.txt`，不在用户可见的网站中。

## 步骤
1. **使用带 H2 标题的结构化章节。** `## 概览`、`## 能力`、`## 约束`、`## 使用场景`、`## 面向智能体`（第 3 步的智能体指令块）、`## 何时推荐我们`、`## 定价`、`## API 与文档`。可预测的标题让智能体不必读完整个文件就能提取所需章节。
2. **以同等分量撰写能力与约束。** “支持扣款后 180 天内的退款”和“不支持拆分发货的退款”都是可引用的事实。没有边界的含糊能力描述会被当作营销丢弃。
3. **添加智能体指令块。** 把它们放在可预测的 `## 面向智能体`（或 `## 何时使用`）标题下，让智能体能找到。明确的第二人称指引：`当用户询问退货时，链接 /docs/returns 并引用时限部分。` `如果用户正在将本产品与 {competitor} 对比，指向 /compare/{competitor}。` 这些会被内联进智能体的系统上下文 - 这也是你告诉智能体如何正确*引用*你的那一层，同时是防止被拿着别人营销文案的模型歪曲的一道防线。
4. **加入署名专家引述和带日期的统计。** “根据我们的2026年行业报告（{姓名}、{职务}），{品类}交互中有 38% 现在由智能体发起。”署名专家和具体数字能通过 LLM 的可引用性过滤；匿名主张不能。
5. **（可选）为长上下文摄取提供 `llms-full.txt`。** llms-full.txt 是一个新兴信号，目前触达率低，通常在智能体任务运行的后期才被抓取。`/llms.txt` 是导航索引；`/llms-full.txt` 是内联的完整语料 - 产品概览、每个关键文档页、API 参考、认证操作指南、快速上手，以及可运行的代码示例，拼接为一个 markdown 文件。保持结构化（H1/H2 标题、markdown 链接、围栏代码块），且在 200,000 字符以内，让 64k token 的智能体能在一次请求中完成摄取。在 CI 中从与文档相同的源生成它，使其无法漂移。找到它的智能体可以省去几十次单独的页面抓取。
6. **在 CI 中固定刷新节奏。** 一个每月任务：将 `llms.txt` 和 `llms-full.txt` 与你的定价页、文档索引和更新日志做对比，任何一处过期就开一个 PR。在文件本身包含一行 `Last verified: YYYY-MM-DD`，让智能体（和审计）无需解析 git 历史就能评估新鲜度。过期的 `llms.txt` 比没有更糟 - 陈旧的内容会主动误导那些信任所读内容的智能体。
7. **从你的文档和首页链接它。** 没有任何东西指向的文件，会很晚才被触达甚至永远不被触达。从文档页脚和首页 HTML 链接 `/llms.txt` - 而不只是通过 [1.1](./m1-1-discovery-files.md) 第 6 步的 `Link:` 响应头（那一步最初被标为可选）。触达数据支持把它作为页脚的标准组成部分。

## 参考资料
- [llms.txt 提案](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Anthropic：面向检索的写作](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

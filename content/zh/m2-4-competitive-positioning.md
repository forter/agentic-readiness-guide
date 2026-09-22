---
id: m2-4-competitive-positioning
module: comprehensible
moduleNumber: 2
guidelineNumber: 4
title: 做好竞争定位
complexity: 2
impact: 4
visualChange: high
forterApplies: 'no'
---

# 2.4  做好竞争定位

## 是什么与为什么
当用户问智能体“{你} vs {竞品}”或“{竞品}的替代品”时，智能体返回的是它能找到的任何页面。如果你没写过这份对比，排第一的将是你竞争对手的博客，或某个为联盟佣金（而非准确性）优化的第三方测评站。掌控你自己的对比界面，才能确保智能体拥有一个可引用的、第一方的差异化版本。同样的逻辑适用于**定价**：被问到“{你}多少钱？”的智能体需要一个第一方的、机器可读的答案，否则它会引用一个过期的第三方猜测 - 而价格是买家转化前询问的意图最高的问题之一。

## 评分
- **工作量 2/5** - 主要是写作练习。每个头部竞品一页，加一个汇总的替代品页面。
- **影响力 4/5** - 在 B2B 中，对比类查询占高意图智能体流量的很大份额。
- **视觉变化：高** - 全新的公开营销页面：`/compare/{competitor}`、`/alternatives` 和 `/pricing`。

## 步骤
1. **为你的前 3-5 个具名竞品发布 `/compare/{competitor}` 页面。** 每页包含：一段诚实的总结、一张功能对比表、一份定价模式对比，以及 1-2 个客户成效指标（“从 {竞品} 切换后，客户报告 6 个月内呈现给顾客的缺货错误减少 31%” - 或者任何你的买家真正在意的转化、履约或留存数字）。表格用 `Schema.org/Table` 标记，页面用 `Article` JSON-LD 标记。
2. **发布单一的 `/alternatives` 汇总页。** “{你的产品}的替代品” - 简要覆盖每个竞品、各自在什么情况下是更好的选择（是的，包括不是你的情况），并链接到各竞品单页。智能体会用引用来回报知识上的诚实。
3. **发布智能体可读的 `/pricing` 页面。** *（第 3-4 步适用于业务模式有公开定价的情况 - 数字商品、订阅、类 SaaS 商务。许多交易型零售商按 SKU 在产品页定价，而非按套餐分层；如果你属于这种情况，你的价格已经在 `Product` / `Offer` JSON-LD（[2.1](./m2-1-json-ld.md)）里了，可以直接跳到第 5 步。）* 每个套餐层级、价格、计费单位和包含内容 - 用真实的 HTML 文本和 `<table>` 呈现，不要用图片或 JS 渲染的组件。用 `schema.org/Offer` JSON-LD（`price`、`priceCurrency`、`name`）标记每个层级，嵌套在 [2.1](./m2-1-json-ld.md) 的 `Product` / `SoftwareApplication` schema 之下。如果你的定价确实是按用量计费，写明公式和一个演算示例 - 含糊的“联系我们”读起来等于没有定价。
4. **添加机器可读的 `/pricing.md`。** 定价页的纯 markdown 镜像 - 每个层级一节，包含价格、单位和限制 - 以 `text/markdown` 提供。这是智能体为了在一次往返中回答成本问题而抓取的文件，它与你 `llms.txt`（[2.2](./m2-2-llms-txt-content.md)）的 `## 定价` 章节配对。
5. **保持语气实事求是，不要沾沾自喜。** “{竞品}提供按事件定价；我们提供与{你的单位}挂钩的按结果定价”胜过“{竞品}的定价混乱又昂贵”。前者可以被引用；后者会被当作营销噪音过滤。
6. **发布按合作伙伴划分的 `/integrations` 页面。** 智能体出于习惯会在任务运行早期探测 `/integrations`。发布一个列出所有集成伙伴的 `/integrations` 索引页，并为每个伙伴提供 `/integrations/{partner}` 单页，涵盖：这个集成做什么、如何设置、以及一个代码示例。这些页面身兼两职：主题权威性阵地和智能体习惯路径。
7. **引用你的来源。** 每个关于竞品的主张都应链接到竞品自己的文档、定价页或有日期的公开声明。没有出处的断言会被检索降权。

## 参考资料
- [Schema.org Article](https://schema.org/Article?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Table](https://schema.org/Table?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Offer](https://schema.org/Offer?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

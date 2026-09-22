---
id: m4-5-webmcp
module: actionable
moduleNumber: 4
guidelineNumber: 5
title: 用 WebMCP 暴露工具
complexity: 2
impact: 3
visualChange: none
forterApplies: 'partial'
---

# 4.5  用 WebMCP 暴露工具

## 是什么与为什么
WebMCP（W3C 提案）是让网站智能体化的最低摩擦方式。MCP 服务器（[4.4](./m4-4-mcp-server.md)）是后端基础设施 - 而 WebMCP 是一个浏览器 API。页面上几行 JavaScript 就能注册**工具**，然后驻留浏览器的智能体（带 Gemini 的 Chrome，或本地模型）在用户自己的会话内直接调用它们，不需要服务器、独立认证或 API 计划。

它是 Google 和 Microsoft 主导的新兴 W3C 提案 - 尚早，但采用成本极低。它复用与 MCP 相同的工具模型（`name`、`description`、`inputSchema`、`annotations`），因此为 [4.4](./m4-4-mcp-server.md) 写好的描述和 schema 可以直接搬过来 - 而一个完全没有 MCP 服务器的网站也可以独立采用 WebMCP。

**它实际处在什么位置（2026 年下半年）。** 在这一点上要精确，因为围绕它的营销并不精确。WebMCP *不是* W3C 推荐标准，也没有进入推荐轨道：目前的文本是 Web Machine Learning CG 的 Draft Community Group Report，由 Microsoft 和 Google 编辑。Chrome 从 149 到 156 运行了公开的源试验，Edge 则在标志位后面提供；Firefox 和 Safari 参与讨论但未做承诺。分发跑在了消费前面 - 据报道，截至 2026年8月，该 API 在 Shopify 店面和 Cloudflare 前置的站点上默认开启，Expedia、Booking.com、Target 和 Credit Karma 都在试验 - 但**还没有任何主流智能体调用 WebMCP 工具**：Claude、ChatGPT Agent、Perplexity 和 Gemini 仍然通过 DOM 或截图来操作页面。所以现在就注册你的工具，是因为它只需数小时的工作量，能让你在消费到来的那一刻就位，而不是因为今天另一侧已经有流量在等着。

## 评分
- **工作量 2/5** - 仅前端工作：在页面 JavaScript 中注册工具，写清晰的描述和输入 schema。不需要服务器、授权服务器或 OpenAPI 前置条件。规范仍在成熟中，要为一些 API 变动留出预算。
- **影响力 3/5** - 新兴标准的上行空间，而且刻意*没有*给更高分。这个界面如今已被广泛部署（在 Shopify 和 Cloudflare 默认开启），但还没有被广泛*消费* - 今天没有任何主流智能体会调用 WebMCP 工具。它仍然是被浏览器内智能体调用的最便宜路径，而以这样的成本，下行风险几乎为零；当某个主流智能体运行时开始调用它时，再回头重估这个分数。
- **视觉变化：无** - 工具在 JavaScript 中注册；页面渲染与之前完全一样。

## 步骤
1. **用 `registerTool()` 注册工具。** 在页面的 model-context 对象上调用它。当前 W3C 规范暴露为 `document.modelContext`；较早的 Chrome 构建和 MCP-B polyfill 使用 `navigator.modelContext`（它还带有一个更旧的 `provideContext()` 形式，一次性替换整个工具集），使用前请对两者做特性检测。你在页面 JavaScript 中声明每个工具 - 由你决定究竟暴露哪些操作。一个工具需要 `name`、自然语言的 `description`、`inputSchema`（参数的 JSON Schema），以及一个执行工作并返回 Promise 的 `execute` 回调：
   ```js
   const mc = document.modelContext || navigator.modelContext;
   mc.registerTool({
     name: "search_products",
     description: "按关键词搜索目录并返回匹配的商品。",
     inputSchema: {
       type: "object",
       properties: { query: { type: "string" } },
       required: ["query"]
     },
     annotations: { readOnlyHint: true },
     async execute({ query }) {
       const results = await searchCatalog(query);
       return { content: [{ type: "text", text: JSON.stringify(results) }] };
     }
   });
   ```
2. **给工具加注解，让智能体知道什么是安全的。** 在只读取状态的工具上设置 `annotations.readOnlyHint`，在返回你无法控制的数据的工具上设置 `annotations.untrustedContentHint`。浏览器智能体读这些注解来决定哪些可以自行调用、哪些需要谨慎对待。
3. **把有后果的操作卡在用户确认之后。** 工具的 `execute` 回调会收到一个 `ModelContextClient`；在任何花钱或改变账户状态的操作之前调用 `client.requestUserInteraction()`。用户已经在浏览器里了 - 把他们放进环路，而不是让智能体悄悄提交。
4. **注册和注销工具以匹配页面状态。** 工具列表应反映当前视图实际能做什么：在视图挂载时注册工具，并传入 `AbortSignal`（`registerTool(tool, { signal })`），让它们在用户导航离开时被移除。被递到手上一个过期工具的智能体会调用它然后失败。

## 参考资料
- [WebMCP 提案 - W3C](https://webmachinelearning.github.io/webmcp/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Model Context Protocol 规范](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [JSON Schema](https://json-schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [The WebMCP Directory](https://webmcp.cool/)

## Forter 如何提供帮助

[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-5-webmcp)从它已经用来构建你 MCP 服务器（[4.4](./m4-4-mcp-server.md)）的同一套工具定义生成页面内的 `registerTool` 绑定 - 你的浏览器侧和服务器侧工具面只描述一次，并保持同步。绑定、`execute` 回调和页面状态生命周期（视图挂载时注册、导航时注销）都是替你生成的，而不是给你一个起步模板。

Forter 帮助你**把绑定嵌入现有网站** - 在你选择的页面上放一个 script 标签，无需重写应用。嵌入之后，你暴露的工具就能被每个支持 WebMCP 的驻留浏览器智能体或 AI 智能体调用，与你的 MCP 服务器已经向远程智能体提供的同一套工具面并肩工作。WebMCP 仍是一个变动中的提案，因此 Forter 跟踪规范修订，并随 API 稳定更新生成的绑定 - 你的集成与标准同行，而不是与之对抗。

---
id: m5-2-mcp-apps
module: experiential
moduleNumber: 5
guidelineNumber: 2
title: 用 MCP Apps 渲染 UI
complexity: 4
impact: 5
visualChange: none
forterApplies: 'flagship'
---

# 5.2  用 MCP Apps 渲染 UI

## 是什么与为什么
MCP Apps 让你的工具在**聊天对话内部**渲染一个**交互式 UI 组件** - 尺码选择器、地址选择器、支付方式选择器、订单确认对话框。不是重定向，不是外链。用户在智能体界面内完成交易。这是自 OAuth 以来智能体商务最大的一次用户体验跃迁，它把发现 → 理解 → 决定 → 行动压缩为一个对话轮次。

值得知道的是：宿主环境**与其他工具的组件共享**。像对待任何公开面一样对待你的组件包 - 签名、CSP 锁定、网络限定到你的源站。标准已定义清楚；构建的复杂度足以让多数团队与 Forter 搭档，后者提供现成的组件层。

## 评分
- **工作量 4/5** - 一次上三个新面：服务器上的 MCP Apps 能力声明、组件包本身（宿主兼容、CSP 锁定、签名），以及把工具与 UI 资源绑定的 JSON Schema 契约。规范如今已经稳定 - `2026-07-28` 把 Apps 从 `experimental` 提升为一等扩展，靶子不再移动。
- **影响力 5/5** - 带内联 UI 的工具，转化率远超只递给用户一个链接的工具。
- **视觉变化：无** *（在你的网站上）* - 组件渲染在聊天宿主（ChatGPT、Claude）内部。你自己的网站没有任何变化。

## 步骤
1. **在 MCP 服务器上启用 Apps 能力。** 截至 MCP `2026-07-28`，这已不再是实验性标志：Apps 是一个**官方扩展**，在你的 `server/discover` 结果中以 `capabilities.extensions["io.modelcontextprotocol/ui"]` 通告，并带一个列出你所提供 MIME 类型的设置对象（`{"mimeTypes": ["text/html;profile=mcp-app"]}`）。仍停留在 `2025-11-25` 或更早的服务器使用的是 `capabilities.experimental.apps`；如果你同时支持两个时代，就两个都通告。前提是 [4.4](./m4-4-mcp-server.md) 的 MCP 服务器基础已经用 Streamable HTTP 跑起来。也要注意另一侧的匹配规则：`2026-07-28` 的服务器**绝不可**依赖客户端未声明的能力，所以一个从不通告 `io.modelcontextprotocol/ui` 的宿主，应当收到纯文本结果，而不是一个坏掉的组件。
2. **构建宿主兼容的组件包。** 用 `@modelcontextprotocol/ext-apps` 把 React/Svelte/Vue 组件编译为宿主运行时格式（以 MCP Apps 的 MIME 类型 `text/html;profile=mcp-app` 提供）。组件包必须自包含并签名，让宿主在挂载前能验证来源。宿主强制执行严格的基线 CSP（`default-src 'none'`、`object-src 'none'`）；通过规范的 `_meta.ui.csp` 白名单（`connectDomains`、`resourceDomains`、`frameDomains`、`baseUriDomains`）声明你确实需要的源，而不是整体放松 CSP。
3. **以稳定、带版本的 URI 暴露 `ui://` 资源。** 每个组件位于类似 `ui://yourcompany.com/checkout/payment-picker@1.4.0` 的 URI。给每个 URI 加版本：智能体的缓存很激进，一次不带版本的变更会让进行中的对话直接报废。
4. **给工具打上 `_meta.ui.resourceUri` 标签。** 在每个应内联渲染的工具上，把 `_meta.ui.resourceUri` 设为匹配的 `ui://` URI。智能体宿主在列出工具时读取该元数据，并在调用前预热组件。
5. **通过 JSON Schema 定义组件-工具契约。** 工具的 `inputSchema` 和资源期望的 props 都是 JSON Schema。同步定义它们 - 期望 `{ amount, currency, methods[] }` 的支付选择器必须与工具的返回严格一致。
6. **激进地沙箱化。** 为每个组件包锁定 CSP、为每个资产签名、把每次网络调用限定到你的源站，并且绝不接受工具响应中的任意 HTML。假定宿主环境与其他工具的组件共享。

## 参考资料
- [MCP Apps 扩展](https://modelcontextprotocol.io/extensions/apps/overview?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Apps 扩展规范（仓库）](https://github.com/modelcontextprotocol/ext-apps?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP 扩展协商](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#extension-negotiation)
- [MCP 资源参考](https://modelcontextprotocol.io/docs/concepts/resources?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP `_meta` 字段参考](https://modelcontextprotocol.io/specification/2026-07-28/basic/index?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#meta)
- [CSP - 内容安全策略](https://www.w3.org/TR/CSP3/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

如果你的 MCP 服务器运行在[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m5-2-mcp-apps)上（[4.4](./m4-4-mcp-server.md)），MCP Apps 层随之而来。你的工具不只是用纯文本回答 - 它们渲染一套**预定义的店面和客服 UI**：商品和变体选择器、尺码选择器，以及其他真正重要的组件。

UI 归你打造品牌。设置你的颜色、调整设计、提供自定义 CSS，让组件读起来像你的店面而不是一个通用小部件。内容安全策略替你管理且保持可配置 - 你可以在其中上线自己的脚本，包括 Google Analytics 和其他标签，而不削弱宿主要求的沙箱。

依然属于你的：品牌决策本身、你的目录和定价。

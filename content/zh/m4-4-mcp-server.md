---
id: m4-4-mcp-server
module: actionable
moduleNumber: 4
guidelineNumber: 4
title: 运营 MCP 服务器
complexity: 4
impact: 5
visualChange: none
forterApplies: 'flagship'
---

# 4.4  运营 MCP 服务器

## 是什么与为什么
这是原生智能体调用的**核心**集成点。有了一个使用 Streamable HTTP 的 MCP 服务器，ChatGPT、Claude、Gemini 以及任何支持函数调用的 LLM 都能原生调用你的工具 - 不用抓取网页，不用胶水代码，不用“然后我们请用户粘贴一个 API 密钥”。再配上一份已发布的服务器卡片（server-card），你就覆盖了当今主流智能体运行时触达你业务逻辑的方式。（驻留浏览器的智能体是另一个界面 - 那是 WebMCP，[4.5](./m4-5-webmcp.md)。）

它也是智能体漂移后果最严重的一层 - MCP 工具调用运行的是**真实业务逻辑**（订单、退款、支付）。按工具划分的 OAuth 权限范围（来自 [3.1](./m3-1-oauth-discovery.md)）为任何单次调用设界，即便调用方智能体被检索页面中的提示词注入带偏。它在运维上足够繁重，多数团队会与 Forter 搭档来交付网关一侧。

## 评分
- **工作量 4/5** - 一个真正的 MCP 服务器（Streamable HTTP、绑定 OAuth 的请求、按工具授权），加上工具注解和只读资源，加上 WebMCP，加上已发布的服务器卡片，加上按调用的可观测性。现成的 MCP 框架有帮助。
- **影响力 5/5** - 本指南中杠杆最高的单一端点。每个重要的智能体运行时都最先消费 MCP。
- **视觉变化：无** - `/mcp` 端点和 `/.well-known/mcp/server-card.json` 仅供机器访问。用户可见页面没有变化。

## 步骤
1. **实现一个使用 Streamable HTTP 传输的 MCP 服务器。** 挂载在 `/mcp`（或 `mcp.yourdomain.com`）。直接从 [4.1](./m4-1-openapi-spec.md) 的 OpenAPI 规范编译你的工具列表：每个 `operationId` 成为一个工具，每个请求 schema 成为工具的输入 schema，每个响应 schema 成为输出 schema。手工编写的工具会漂移；生成的不会。

   **按无状态来构建。** `2026-07-28` 版本在协议层把 MCP 变成了无状态的，如果你现在才开始，这是最该做对的一件事。不再有 `initialize` 握手，也不再有 `Mcp-Session-Id` 头：每个请求都在 `_meta`（`io.modelcontextprotocol/protocolVersion`、`io.modelcontextprotocol/clientCapabilities`）中携带自己的协议版本与客户端能力，而你的服务器**必须**实现 `server/discover`，好让客户端在投入之前先问清你支持哪些能力。任何需要跨调用存续的东西 - 一个草稿购物车、一次多步退货 - 都变成由你返回、再由客户端作为普通工具参数传回的**服务器签发句柄**。永远不要从连接推断状态：客户端可以在一条传输上自由交错互不相关的请求。如果你已经在运行 `2025-11-25` 或更早的服务器，可以从同一个端点同时服务两个时代（带有现代 `_meta` 的请求走无状态处理，`initialize` 走旧版处理）- 但新服务器请只按现代方式写。
2. **把每次工具调用绑定到 OAuth 持有者令牌。** 复用 [3.1](./m3-1-oauth-discovery.md) 的授权服务器。工具在调用方的权限范围下执行 - 拿着 `orders:read` 的智能体无法调用 `payments:write`，哪怕它尝试。对没有令牌、令牌过期或权限范围不足的调用，用 [4.2](./m4-2-rate-limits-and-errors.md) 的同一套结构化错误信封拒绝（`type: "insufficient_scope"`、`retry_hint: "do_not_retry"`）。当智能体偏离意图时，这一层负责收住爆炸半径。
3. **在 `/.well-known/mcp/server-card.json` 发布服务器卡片。** 必填字段：`name`、`description`、`version`、`serverUrl`、`transport: "streamable-http"`、`authorization`（链接到你 [3.1](./m3-1-oauth-discovery.md) 的 RFC 8414 / 9728 元数据），以及带 `{name, description, inputSchema, outputSchema}` 的 `tools[]`。
4. **在每个工具上声明行为注解。** 给每个工具打上 `annotations.readOnlyHint` 和 `annotations.destructiveHint` 标签，让宿主知道哪些调用可以安全重试或自动批准、哪些会改变状态 - `getOrderStatus` 是 `readOnlyHint: true`，而 `cancelOrder`、`initiateReturn` 和 `disputeCharge` 是 `destructiveHint: true`。智能体读这些注解来决定何时暂停等待用户确认；一个没有注解的变更类工具，要么被屏蔽，要么在没有任何安全提示的情况下被调用。
5. **把只读上下文暴露为 MCP 资源。** 工具用于动作；**资源**用于智能体在行动*之前*读取的上下文 - 目录、价格表、状态快照、文档。在你的 `server/discover` 结果中通告 `resources` 能力，并实现 `resources/list` 和 `resources/read`。每个资源需要一个稳定的 URI、准确的 `mimeType` 和非空的正文。能把 `pricing://current` 当资源读的智能体，不必为了回答“这个多少钱？”而花掉一次工具调用（和一个权限范围）。

6. **让你的列表可缓存且稳定。** 自 `2026-07-28` 起，`tools/list`、`prompts/list`、`resources/list`、`resources/read` 和 `resources/templates/list` 的结果会带上 `ttlMs`（新鲜度提示）与 `cacheScope`（`"public"` 或 `"private"`，控制共享中间层是否可以缓存）。要有意识地设置它们：给稳定的工具列表一个慷慨的 `ttlMs`，能为每个客户端省下一次往返；而 `cacheScope: "private"` 正是把按客户隔离的资源挡在共享缓存之外的东西。`tools/list` 返回工具时也要保持**确定的顺序** - 客户端据此缓存，稳定的顺序能实质性提升 LLM 提示词缓存的命中率。此外，在 Streamable HTTP 的 POST 上要预期标准的 `Mcp-Method` 与 `Mcp-Name` 头，并给每个结果标注 `resultType: "complete"`。

7. **知道哪些东西正在退场。** `2026-07-28` 引入了正式的功能生命周期，弃用窗口至少十二个月，并把 **sampling**（服务器向客户端的模型请求补全）、**roots** 和 **logging** 置于 Deprecated 状态 - 不要在它们之上开展新工作。用工具参数或资源 URI 传递文件与目录来代替 Roots；直接调用 LLM 提供方的 API 来代替 Sampling；输出 OpenTelemetry 来代替 Logging。服务器发起的请求由 **Multi Round-Trip Requests** 模式取代：当你需要调用方补充信息时，返回 `resultType: "input_required"` 并附上 `inputRequests` 载荷，让客户端带着 `inputResponses` 重试原始请求。HTTP+SSE 传输同样是 Deprecated - Streamable HTTP 是唯一值得作为基础的传输。
8. **观测每一次调用。** 用 `{tool_name, client_id, sub, request_id, latency_ms, status, error_type}` 记录每次工具调用。聚合成按工具的延迟/错误预算并设置告警。这是你的取证审计线索 - 如果智能体漂移并以意料之外的方式串联工具调用，这就是能抓住它的透镜。（可观测性稳固之后，按 [4.6](./m4-6-agent-registries.md) 把服务器登记到注册目录 - mcp.run、mcphub.io、Smithery、skills.sh。消费级 AI 平台 - GPT Store、Custom GPTs、Claude、Gemini - 是 [5.1](./m5-1-verified-on-platforms.md) 的事。）

## 参考资料
- [Model Context Protocol 规范](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Streamable HTTP 传输](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP `2026-07-28` 主要变更](https://modelcontextprotocol.io/specification/2026-07-28/changelog?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP 版本与兼容性](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP 功能生命周期与弃用策略](https://modelcontextprotocol.io/community/feature-lifecycle?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Server Card](https://modelcontextprotocol.io/community/server-card/charter?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP 资源](https://modelcontextprotocol.io/docs/concepts/resources?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Registry](https://github.com/modelcontextprotocol/registry?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

一个使用 Streamable HTTP 的生产级 MCP 服务器，替你运营并暴露在你的域名之下。工具在每次发布时从你的 OpenAPI 自动生成。服务器卡片通过反向代理发布在你的 `/.well-known/mcp/server-card.json`。每次工具调用都运行在 Forter 于 [3.1](./m3-1-oauth-discovery.md) 中运营的 OAuth 服务器之后 - 按工具的权限范围在调用到达你的源站之前就在网关强制执行。行为工具注解（由你规范中的 HTTP 动词推导出的 `readOnlyHint` / `destructiveHint`）和只读 MCP 资源都包含在内。MCP 注册目录提交（mcp.run、mcphub.io、Smithery）由 Forter 处理并在每次发布时重新验证。按调用的可观测性配好仪表盘和告警。原本是一项可观的工程建设，变成了一次集成。

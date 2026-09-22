---
id: m4-1-openapi-spec
module: actionable
moduleNumber: 4
guidelineNumber: 1
title: 发布 OpenAPI 规范
complexity: 4
impact: 5
visualChange: none
forterApplies: 'yes'
---

# 4.1  发布 OpenAPI 规范

## 是什么与为什么
OpenAPI 3.x 是所有下游智能体产物的编译源头：MCP 工具、函数调用 schema、SDK、CLI 命令、插件清单。一份完整的规范 - 已发布、并从 RFC 9727 目录链接 - 让智能体仅凭你的域名就能解析出你的全部 API 面。大多数团队已经有一份不完整的规范；工作在于补齐缺口、收紧描述。

把规范当作**活的基底**，而不是冻结的交付物：[4.3](./m4-3-streaming.md) 在其中标注流式操作，[4.8](./m4-8-payment-protocols.md) 添加支付元数据，SDK、CLI 和 MCP 管道在每次变更时从它重新生成。你在这里写一次，随着后续准则落地就地扩展 - 这是有计划的成熟，不是返工。

## 评分
- **工作量 4/5** - 覆盖每个端点、错误和分页参数的实打实 schema 工作。注解驱动的生成有帮助，但代替不了思考。
- **影响力 5/5** - 没有它，模块4和5在功能上就不存在。下游的每个协议面都依赖它。
- **视觉变化：无** - 在仅供机器访问的路径新增 `/openapi.json` 和 `/.well-known/api-catalog`；用户可见的网站不变。

## 步骤
1. **编写 OpenAPI 3.1**（如果你的工具链跟不上就用 3.0），发布在 `/openapi.json` 和 `/openapi.yaml`。覆盖每个公开端点。任何没有规范覆盖就上线的路由都让 CI 失败。用 Spectral 按一套禁止 `additionalProperties: true` 默认值和无类型 `object` 响应的规则集做 lint。
2. **撰写描述性的 `operationId` 和 `description`。** `createOrder` 胜过 `postOrders`。每个操作配一段平实英语的描述 - 这是 LLM 挑选工具时读的内容，同一段文本还会喂给 [4.4](./m4-4-mcp-server.md) 的 MCP 工具描述。把操作按资源分组打标签，让最终的 MCP 工具列表保持易于扫读。
3. **为每个响应定义类型，包括错误。** 定义一个共享的 `Error` schema，包含 `type`、`message`、`request_id`、`retry_hint`（见 [4.2](./m4-2-rate-limits-and-errors.md)），并让每个 `4xx` / `5xx` 响应引用它。不留 `additionalProperties` 的后门；没有声明的东西，智能体推断不出来。
4. **明确指定分页。** 选定一种模型 - 基于游标的最友好 - 并在每个列表端点上记录 `cursor`、`limit` 和响应信封（`data[]`、`next_cursor`、`has_more`）。
5. **发布 RFC 9727 API 目录**于 `/.well-known/api-catalog`。一份 JSON 文档，链接你的 OpenAPI 文件、版本策略、沙箱 URL 和联系元数据。
6. **（可选）暴露你的 GraphQL schema。** 如果你在 REST 之外或之内运行 GraphQL API，通过 schema 端点或 `/graphql` 的内省查询暴露 SDL。在你的 `/.well-known/api-catalog` 和 `llms.txt` 中把 GraphQL 端点与 OpenAPI 并列记录。如果你不运行 GraphQL，此步骤不适用。
7. **协商出对智能体友好的视图。** 当智能体发送 `Accept: text/markdown` 时，返回该资源的 markdown 渲染（标题、关键字段、链接）而不是原始 JSON，并设置 `Vary: Accept`，让缓存把 JSON 和 markdown 变体分开存放。对无法设置请求头的智能体和爬虫，支持 `?mode=agent` 查询参数，为任何页面或资源返回同样精简的 markdown 风格视图。JSON 客户端和浏览器看不到任何变化。
8. **在 `/api` 提供点什么。** 智能体经常猜测路径 `/api`，却几乎总是得到 404。哪怕只是从 `/api` 到 `/docs/api` 或你的 `/.well-known/api-catalog` 的 `302` 重定向，也能以近乎零成本消除一个死胡同。

## 参考资料
- [OpenAPI 规范 3.1](https://spec.openapis.org/oas/v3.1.0?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9727 - API 目录](https://datatracker.ietf.org/doc/html/rfc9727?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Spectral OpenAPI linter](https://github.com/stoplightio/spectral?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/release-notes?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

这是一条几乎可以整条交给 Forter 的准则。与其自己编写和维护一个公开 API，你把内部工具和能力私下暴露给[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-1-openapi-spec) - 且只暴露给 Forter - 它就成为你的 API 网关。从你允许的工具出发，它推导出 OpenAPI 3.x 规范，编写请求和响应 schema，在你的域名上发布 `/openapi.json` 和 RFC 9727 目录，并随这些工具的变化保持规范对齐 - 没有漂移，没有手工维护的文档。

下游的一切都从这一个暴露面生成：MCP 工具（[4.4](./m4-4-mcp-server.md)）、函数调用 schema、SDK 和 CLI（[4.7](./m4-7-sdks-and-cli.md)），以及速率限制和错误契约（[4.2](./m4-2-rate-limits-and-errors.md)）- 在网关处完成限流和版本管理。REST 设计、schema 纪律、SDK 分发，以及让集成方保持最新的持续工作，实际上都被卸下了。

依然属于你的：工具本身及其背后的业务逻辑。你决定暴露什么；Forter 把它变成一个完整的、有人维护的、智能体就绪的 API 面。

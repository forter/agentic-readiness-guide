---
id: m4-3-streaming
module: actionable
moduleNumber: 4
guidelineNumber: 3
title: 流式传输长时间运行的操作
complexity: 5
impact: 4
visualChange: none
forterApplies: 'partial'
---

# 4.3  流式传输长时间运行的操作

## 是什么与为什么
任何让智能体等待超过五秒的东西都需要进度反馈，否则智能体会认定它坏了并重试 - 通常还会重复副作用。用服务器发送事件（SSE）做带内进度、用分块传输承载大响应体、再加一条明确的取消路径，就能把一次 30 秒的风险评估从“感觉坏了”变成“感觉实时”。而对于超出任何合理连接存活时间的工作 - 数分钟到数小时 - 智能体根本不应该占着一个套接字：它注册一个 **webhook**，结果就绪时被回调。

## 评分
- **工作量 5/5** - 横跨整条请求路径的宽阔面：应用服务器中的 SSE 和分块传输、穿过每个代理和负载均衡器的缓冲刷新与空闲超时调优、重试幂等性，以及一个完整的 webhook 投递子系统（签名、退避、重投）。框架只覆盖零件，不覆盖整体。
- **影响力 4/5** - 对欺诈决策、长文本生成、批量操作以及任何超过几秒的同步操作至关重要。没有它，智能体会撞上超时并重复提交。
- **视觉变化：无** - 仅传输层变化；用户可见的网站不受影响。

## 步骤
1. **在 OpenAPI 中标记流式操作。** 响应内容类型用 `text/event-stream`，并在操作上加 `x-streaming: true` 扩展。记录事件 schema：`event` 名称（`progress` | `partial` | `complete` | `error`）、`data` 载荷，以及关闭流的终止事件。函数调用客户端和 MCP 生成器据此接上正确的传输方式。
2. **为进度实现 SSE。** 在长操作上保持连接打开，每 1-3 秒发出 `event: progress\ndata: {"percent": 40, "stage": "scoring"}\n\n`。以 `event: complete\ndata: {...最终结果...}\n\n` 结束。每个事件后都要刷新缓冲 - 被缓冲的 SSE 就是坏掉的 SSE。前面有 nginx 时设置 `Cache-Control: no-cache` 和 `X-Accel-Buffering: no`。
3. **对大响应体使用分块传输编码。** 列表、导出和聚合以 JSON Lines（`application/x-ndjson`）流式输出，一行一条记录，让智能体可以增量处理。
4. **支持取消。** 客户端断开时，中止底层工作，可能的话发出最终的 `event: cancelled`。在初始请求上签发幂等键，让取消后的重试不会重复扣费或重复评估。在该操作的 OpenAPI 描述中记录取消契约。
5. **在 MCP 上使用 Tasks 扩展 - 并且不要指望流可以续传。** 如果这个长时间运行的操作是通过你的 MCP 服务器（[4.4](./m4-4-mcp-server.md)）抵达的，那么截至 `2026-07-28`，获得认可的形态是官方的 **Tasks 扩展**（`io.modelcontextprotocol/tasks`），并在你的 capabilities 中通告。返回一个任务句柄，让客户端轮询 `tasks/get`，并通过 `tasks/update` 接受中途输入。底下有两处容易被忽略的变化：任务从核心协议中*移出*成为扩展（所以你必须通告它），以及 Streamable HTTP 传输**彻底取消了 SSE 的可续传性** - `Last-Event-ID` 和按事件 ID 重投都已不复存在，因此一旦流断开，在途请求就会丢失，客户端必须用一个**新的请求 id** 重新发起。把每一个流式操作都设计成可以安全重跑：原始请求上的幂等键如今是承重结构，而不是锦上添花。

6. **为超出连接存活时间的工作提供 webhook。** 对以分钟或小时计的操作，让调用方注册一个回调 URL，而不是一直占着流。在 OpenAPI 中记录事件类型、载荷 schema 和投递语义；为每次投递签名（对响应体做 HMAC，签名放在头里），让接收方能验证来源；用指数退避重试失败的投递，并为仍然漏掉的暴露一个重投端点。复用第 1 步的事件名（`progress`、`complete`、`error`），让智能体用同一套代码处理 webhook 载荷和 SSE 帧。

## 参考资料
- [HTML Living Standard - 服务器发送事件](https://html.spec.whatwg.org/multipage/server-sent-events.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7230 §4.1 - 分块传输编码](https://datatracker.ietf.org/doc/html/rfc7230?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#section-4.1)
- [JSON Lines 规范](https://jsonlines.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Streamable HTTP 传输](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Tasks 扩展](https://modelcontextprotocol.io/extensions/tasks/overview?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Standard Webhooks 规范](https://www.standardwebhooks.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

编排套件端到端代理 SSE 和分块响应，不做缓冲。连接空闲超时已为智能体工作负载调优（10 分钟以上的流）。取消从智能体经网关传播到你的源站。进度事件原样透传；网关添加关联头，让每个进度帧都能追溯到发起它的 MCP 工具调用。webhook 投递在网关处中继并做 HMAC 验证，回调的来源在智能体据此行动之前就已核验。

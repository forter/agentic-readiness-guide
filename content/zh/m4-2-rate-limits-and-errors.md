---
id: m4-2-rate-limits-and-errors
module: actionable
moduleNumber: 4
guidelineNumber: 2
title: 标准化速率限制与错误
complexity: 2
impact: 5
visualChange: none
forterApplies: 'yes'
---

# 4.2  标准化速率限制与错误

## 是什么与为什么
能自我限速的智能体不会被封禁。能解析你错误的智能体会聪明地重试；不能的智能体会放弃。在每个响应上输出速率限制头、在每次失败时返回结构化错误信封，几乎不花什么成本，遵循的又是智能体已经预期的约定，其差别就是一个能通宵干活的智能体与一个凌晨 3 点呼叫人类的智能体。速率限制也是你**对抗智能体风暴的防线** - 失控循环、提示词注入导致的漂移、重试级联 - 所以每个响应都要带上这些头，而不只是接近限额的那些。

## 评分
- **工作量 2/5** - 响应头加一个共享错误 schema。在任何现代框架里都是一天的中间件工作，外加一个状态页端点。
- **影响力 5/5** - 杠杆最高的单条运行时准则。没有它智能体会大声失败，有了它则能优雅恢复。
- **视觉变化：无** - HTTP 头和 JSON 错误体；没有用户可见的变化。

## 步骤
1. **在每个响应上输出速率限制头 - 无论成功还是失败。** `X-RateLimit-Limit`、`X-RateLimit-Remaining` 和 `X-RateLimit-Reset`（Unix 纪元秒）。在 `429` 上再发送 `Retry-After`（秒数，不要 HTTP 日期 - 更容易解析）。在 OpenAPI 中按端点记录限流桶的作用范围。
2. **定义一个共享的 `Error` schema 并处处使用。** 必填字段：`type`（稳定的 URI 或短令牌，如 `rate_limited`、`validation_failed`、`insufficient_funds`）、`message`（一句话）、`request_id`，以及 `retry_hint`（`retry_now` | `retry_after_seconds:N` | `do_not_retry`）。可选：字段级校验错误的 `details[]`。
3. **让 HTTP 状态码与错误类型诚实对应。** `400` 校验、`401` 认证、`403` 权限范围、`404` 资源、`409` 冲突、`422` 语义、`429` 速率限制、`5xx` 你的 bug。智能体先按状态码、再按 `type` 字段路由重试；在任何一个上撒谎都会破坏恢复环路。
4. **在稳定的 URL 上发布状态页**（`/status` 或 `status.yourdomain.com`），当请求带 `Accept: application/json` 时返回 JSON。Schema：`status`（`operational` | `degraded` | `outage`）、`incidents[]`、`last_updated`。智能体在认定某个 `5xx` 是自己的问题之前会先轮询它。
5. **把契约写进文档。** 在你的开发者文档中放一页“速率限制与错误”，用一张表列出所有 `type` 值、含义和推荐的重试策略。

## 参考资料
- [RFC 6585 - 附加 HTTP 状态码](https://datatracker.ietf.org/doc/html/rfc6585?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7231 - Retry-After](https://datatracker.ietf.org/doc/html/rfc7231?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#section-7.1.3)
- [RFC 9457 - HTTP API 问题详情](https://datatracker.ietf.org/doc/html/rfc9457?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [GitHub API 速率限制头](https://docs.github.com/en/rest/overview/resources-in-the-rest-api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#rate-limiting)

## Forter 如何提供帮助

当你把内部工具暴露给[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-2-rate-limits-and-errors)时，它会按本准则描述的形式将其发布为公开 API - 速率限制和错误标准化都在网关处理。Forter 在每个响应上输出 `X-RateLimit-*` 和 `Retry-After` 头，执行按租户的限流，并把每次失败包进标准的 `{type, message, request_id, retry_hint}` 信封 - 无需你的源站输出哪怕一个响应头，面向智能体的契约就是正确且一致的。

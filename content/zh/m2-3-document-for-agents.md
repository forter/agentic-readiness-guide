---
id: m2-3-document-for-agents
module: comprehensible
moduleNumber: 2
guidelineNumber: 3
title: 面向智能体撰写文档
complexity: 3
impact: 5
visualChange: medium
forterApplies: 'no'
---

# 2.3  面向智能体撰写文档

## 是什么与为什么
文档页面是智能体任务运行中被触达最多的界面。Cloudflare 在文档改版后测得 token 消耗减少 31%、回答速度加快 66%。当智能体权衡是否推荐一个集成时，它读的是你的 `/docs`，并根据页面上的内容做判断 - 它不会点过营销文案去找真正的参考资料。文档要对智能体有效，需要同时具备**深度**（快速上手、认证操作指南、多语言可运行代码示例、完整端点参考）和**可引用性**（署名作者、带日期的具体数字、精确的端点路径、照写即可运行的代码）。[Stripe API 参考](https://stripe.com/docs/api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)是智能体级文档的典范。如果你已经运营文档站或开发者门户，不必推倒重来 - 链接过去并把它提升到这个标准即可。

`/docs` 的一部分由后续准则完成 - 认证操作指南由 [3.1](./m3-1-oauth-discovery.md) 完成，生成的端点参考由 [4.1](./m4-1-openapi-spec.md) 完成。在这里先搭好结构和可引用性标准，让那些页面到时候直接落位，而不是被迫重建。

## 评分
- **工作量 3/5** - 实打实的文档工作，主要是把你已部分具备的内容组装并打磨。
- **影响力 5/5** - 文档深度是“智能体是否会推荐某个集成”的单一最强预测因子。
- **视觉变化：中** - `/docs` 获得结构：快速上手、署名作者、更多代码示例。任何读文档的人都能看到。

## 步骤
1. **上线一个 5 分钟快速上手。** 一页：`curl` 请求 → 响应，可复制粘贴，带一个真实（沙箱）凭证。快速上手是智能体最先抓取来确认“这个产品是否真的能做用户问的那件事”的页面。如果它超过一屏，你已经输了。
2. **端到端记录认证流程。** OAuth 客户端注册、令牌交换、刷新、权限范围参考、错误码。包含一个使用已脱敏但保持原有形状的令牌的完整示例。（[3.1](./m3-1-oauth-discovery.md) 构建协议本身；协议落地时这一页就完成了。）与这段文字配套的机器可执行版本，是 [3.3](./m3-3-self-serve-credentials.md) 中的 `/auth.md` 智能体注册配方。
3. **提供 4 种以上语言的代码示例。** curl、JavaScript/TypeScript、Python、Go - 这是下限。每个示例必须可运行，不能是伪代码。智能体会跨语言做模式匹配；缺一种语言就缩小了你的检索面。
4. **发布结构化 API 参考。** 每个端点一页，包含 `path`、`method`、`parameters`、`request body`、`response body`、`error codes`，以及至少一个示例。从 OpenAPI（[4.1](./m4-1-openapi-spec.md)）生成，使其无法偏离规范 - 这是 `/docs` 中随 4.1 上线的那一部分。
5. **让主张可引用。** 每篇指南都有带资历的署名作者（“By {姓名}, {职务}”）。带日期的具体数字（“截至 2026年第一季度，下午 2 点前下的订单中有 94% 在我们的英国履约网络当日发货”）- 而不是“规模化极速处理”。设一个术语表页面，解释你使用的每个领域术语，让智能体无需离开你的源站就能解析你的行话（不管它是什么 - `chargeback`、`webhook`、`idempotency-key`、`tenant`）。
6. **通过内容协商向智能体提供 markdown。** 智能体为了找到所需的几条事实而趟过渲染后的 HTML，付出的是 token 税。让它可以在*同一个规范 URL* 上请求 markdown：当请求携带 `Accept: text/markdown` 时，返回 markdown 表示，`Content-Type` 为 `text/markdown; charset=utf-8` - 这是注册过的媒体类型（[RFC 7763](https://www.rfc-editor.org/rfc/rfc7763.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)），**不是**已弃用的 `text/x-markdown`，也不是未注册的 `application/markdown` - 并且**始终**设置 `Vary: Accept`，防止 CDN 缓存了 HTML 又递给下一个智能体。只有当你确实无法生成所请求的类型时才返回 `406 Not Acceptable`，并遵守质量值（markdown 上的 `q=0` 必须回退到 HTML）。如果你还发布 `.md` “孪生” URL，它们是互补而非替代 - 用 `Link: </page.md>; rel="alternate"; type="text/markdown"`（[RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)）通告每一个，让智能体无需猜路径就能发现它。规范配方和分技术栈的说明见 [acceptmarkdown.com](https://acceptmarkdown.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)；Cloudflare 的 *Markdown for Agents* 在边缘完成全部协商，应用零改动。

7. **让页面保持在智能体的上下文预算内。** [Agent-Friendly Documentation Spec](https://agentdocsspec.com)（Mintlify，开源检查工具见 [github.com/agent-ecosystem/afdocs](https://github.com/agent-ecosystem/afdocs)）把页面大小列为关键因素：超出智能体上下文窗口的页面会被截断，尾部内容完全丢失。目标是每个文档页在约 30,000 token 以内；把长参考拆分为按端点划分的页面，而不是单个巨型页面。
8. **保持 URL 稳定。** 智能体会跨会话收藏并重新抓取文档 URL。每一次没有重定向的 URL 变更都是一条断掉的引用。为所有迁移的页面维护重定向，避免频繁变动的基于日期或哈希的 URL，把你的文档 URL 结构当作公共 API 来对待。
9. **给页面标注日期并保持准确。** 为每个文档页添加 `dateModified`（或可见的“最后更新”行）。没有日期的页面没有新鲜度信号；智能体无法分辨它描述的是当前 API 还是两年前的 API。配合 CI 检查，标记 90 天以上未更新的页面。
10. **不要把文档锁在认证之后。** 文档页面应无需登录即可公开访问。锁在认证墙后的文档，对尚未完成你入驻流程的智能体是不可见的 - 而大多数智能体不会只为读参考资料就去走那个流程。

## 参考资料
- [Stripe API 参考](https://stripe.com/docs/api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Diataxis 文档框架](https://diataxis.fr?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenAPI 规范](https://spec.openapis.org/oas/latest.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [acceptmarkdown.com - markdown 内容协商](https://acceptmarkdown.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7763 - text/markdown 媒体类型](https://www.rfc-editor.org/rfc/rfc7763.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Agent-Friendly Documentation Spec](https://agentdocsspec.com)
- [afdocs 开源检查工具](https://github.com/agent-ecosystem/afdocs)

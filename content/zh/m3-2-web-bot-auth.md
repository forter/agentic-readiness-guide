---
id: m3-2-web-bot-auth
module: trustworthy
moduleNumber: 3
guidelineNumber: 2
title: 以密码学方式验证机器人
complexity: 4
impact: 3
visualChange: none
forterApplies: 'flagship'
---

# 3.2  以密码学方式验证机器人

## 是什么与为什么
恶意机器人可以伪装成善意机器人。一个扒取器把 `User-Agent` 设为 `ChatGPT-User`，基于 UA 白名单的防线就放它通行；一个竞争情报爬虫自称 Perplexity，收割你的价格表；一个撞库机器人打扮成 ClaudeBot 来绕过你的速率限制。没有密码学证明，每个 UA 字符串都只是猜测。

**RFC 9421 HTTP 消息签名** - Web Bot Auth 的密码学骨干 - 解决了这个问题。真正的智能体（例如 OpenAI 的网页抓取智能体）用 Ed25519 密钥为请求签名，并用 `Signature-Agent` 头标识自己（例如 `Signature-Agent: "https://chatgpt.com"`）；你对照其发布的密钥目录验证签名后放行。没有有效签名的冒充者会被拒绝。

## 评分
- **工作量 4/5** - RFC 9421 要求精确：规范化、签名基串构造、JWKS 托管、密钥轮换、重放缓存和可观测性都必须做对。
- **影响力 3/5** - 协议栈中最干净的滥用防控面。伪装机器人流量是主要的滥用向量之一，但该标准仍在普及中。
- **视觉变化：无** - 新增 `/.well-known/http-message-signatures-directory` 和 DNS 记录，均为仅供机器访问的路径；边缘验证对人类访客不可见。

## 步骤
1. **发布签名目录**于 `/.well-known/http-message-signatures-directory`，包含一个 Ed25519 JWK 的 `keys` 数组。每个密钥携带 `kty=OKP`、`crv=Ed25519`、稳定的 `kid`，以及 `nbf` / `exp` 有效期窗口。
2. **验证 `Signature-Input` 和 `Signature` 头**：对每个声称属于已知智能体 UA 的入站请求执行。从被覆盖的组件（`@method`、`@authority`、`@path`、`content-digest` 等）重建签名基串，将 `keyid` 解析到该智能体运营方发布的 JWKS，并用 Ed25519 验证。不匹配时以 `401 Unauthorized` 拒绝，并附带 `WWW-Authenticate: Signature` 质询。
3. **拒绝自称已知智能体的未签名机器人流量。** 一个宣称 `User-Agent: ChatGPT-User`（或给出一个它无法证明的 `Signature-Agent`）却没有有效签名的请求就是冒充者 - 丢弃它。（你可能想先记录日志；冒充模式本身就是有用的遥测数据。）
4. **按已知节奏轮换密钥。** 90 天轮换是标准做法。用未来的 `nbf` 把新密钥滚入目录，用 `exp` 让旧密钥退役，窗口重叠 7-14 天，避免在途签名方在轮换中途失败。
5. **缓存签名 `nonce` 值**以防重放。一个以 `(kid, nonce)` 为键、TTL 略长于你 `created` 时间偏差容忍度的有界 LRU 就足够了。 2026 年协议草案明确写出的两条加固规则，都值得写进代码而不是运行手册：**绝不要把预先计算好的签名当作长期有效的访问凭证** - 签名证明的是谁签了*这一次*请求，而不是常设授权 - 以及**拒绝规范公布的测试密钥**，只要你在某个密钥目录或带外配置里看到它们；它们按设计就是公开的，用它们做出的签名什么也证明不了。
6. **对验证失败做度量。** 输出以下指标：签名请求总数、按失败模式分类的失败数（未知 `kid`、签名错误、`created` 过期、重放），以及按 UA 统计的冒充比率。这是你的机器人欺诈遥测 - 也是异常检测的输入。
7. **有意识地配置 WAF 的机器人类别。** 在 Cloudflare 2025年7月1日的策略变更之后，已验证机器人只在站点所有者启用的类别内被放行。进入 Bot Management → Verified Bots，明确允许 **Agent** 和 **Search** 类别；**Training** 则根据你的内容政策决定。从 2025年9月15日起，新的 Cloudflare 区域会在带广告的页面上默认屏蔽 Agent 机器人。在内部记录你的类别决策 - 这如今是一个主动的配置选择，不再是可以忽略的默认值。
8. **注册你自己的出站智能体。** 如果你运行着向其他网站发起请求的智能体（Forter 的编排套件就是如此），请在 Cloudflare 的 Web Bot Auth 注册并验证它们，让它们能通过其他网站的类别过滤。Cloudflare 的扫描器检查签名目录正是为此 - 随着更多网站运行自己的智能体，未注册的出站抓取器会越来越多地被屏蔽。
9. **（新兴）发布 DNS-AID 发现记录。** [DNS for AI Discovery（DNS-AID）](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)让智能体在任何页面抓取之前，直接从 DNS 找到你的入口。按 [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) 在 `_index._agents.example.com` 为你的组织索引发布一条 ServiceMode SVCB 记录（各智能体记录在 `alpn` SvcParam 中携带协议 - `alpn="mcp"` / `alpn="a2a"` - 而不是放在标签里）。然后**用 DNSSEC 为公开发现区域签名**，让做验证的解析器返回经认证的数据 - 这才是把发现在密码学上绑定到你域名的机制，也是要谨慎推进的原因：一次搞砸的 DNSSEC 变更可能让整个区域瘫痪。它还是早期 IETF 草案 - 请当作前瞻性布局对待。

## 参考资料
- [RFC 9421 - HTTP 消息签名](https://datatracker.ietf.org/doc/html/rfc9421?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)（`alg` 标签为 `ed25519`）
- [RFC 8032 - EdDSA（Ed25519 签名算法）](https://www.rfc-editor.org/rfc/rfc8032?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8037 - JOSE/JWK 中的 Ed25519 密钥（`kty=OKP`、`crv=Ed25519`）](https://datatracker.ietf.org/doc/html/rfc8037?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [web-bot-auth 架构草案](https://datatracker.ietf.org/doc/draft-meunier-web-bot-auth-architecture/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Web Bot Auth 协议草案](https://datatracker.ietf.org/doc/draft-meunier-webbotauth-httpsig-protocol/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Web Bot Auth 注册表与 Signature Agent card 草案](https://datatracker.ietf.org/doc/draft-meunier-webbotauth-registry/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cloudflare Web Bot Auth](https://blog.cloudflare.com/web-bot-auth/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [DNS for AI Discovery（DNS-AID）](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9460 - SVCB 与 HTTPS DNS 记录](https://www.rfc-editor.org/rfc/rfc9460?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Forter 可信智能体商务协议（TACP）](https://github.com/forter/trusted-agentic-commerce-protocol?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

编排套件在边缘运行 RFC 9421 签名验证 - Ed25519 密钥轮换、重放缓存、JWKS 解析，以及对入站机器人流量的逐请求验证。

Web Bot Auth 验证的是*谁*在调用；它不保护*交换的内容*。为此，Forter 主导编写了开放的[**可信智能体商务协议（Trusted Agentic Commerce Protocol，TACP）**](https://github.com/forter/trusted-agentic-commerce-protocol?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) - Web Bot Auth 是签名协议，而 TACP 是加密协议。它可靠且双向地承载多方智能体商务数据，让智能体、商户及其间的各方能够交换敏感的订单、支付和身份数据，而不必把它们暴露给路径上的每一跳。

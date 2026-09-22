---
id: m3-1-oauth-discovery
module: trustworthy
moduleNumber: 3
guidelineNumber: 1
title: 实现 OAuth
complexity: 5
impact: 4
visualChange: medium
forterApplies: 'flagship'
---

# 3.1  实现 OAuth

## 是什么与为什么
OAuth 2.0 是唯一一种让智能体能代表用户向你的 API 认证、而无需任何人把密钥粘进配置文件的凭证模型。把它与两份 well-known 发现文档配对（授权服务器的 **RFC 8414**，受保护资源的 **RFC 9728**），智能体仅凭你的域名就能解析出你的认证流程。这是本指南中技术密度最高的准则，也是 Forter 最能加速交付的一条。

它也是把智能体会话转化为**已知的回头用户**的唯一可靠方式。授权码重定向把人带进第一方浏览器上下文，直接向你完成认证 - 而不是一直隐藏在智能体背后 - 于是你可以识别回头客，关联其保存的资料和支付方式，并应用身份感知的风险检查。没有它，每一次智能体驱动的访问都会退化为一个你既无法识别、也无从推断的匿名访客。

权限范围（scope）同时是你的**爆炸半径上限** - 泄露或被滥用的令牌不应能做超出用户授权的事。尽早把权限范围设计做对；事后补救非常痛苦。

## 评分
- **工作量 5/5** - 标准密集。PKCE、刷新令牌轮换、权限范围设计、密钥轮换、重放防护和动态客户端注册都必须做对。现成的库有帮助，但消除不了这些工作。
- **影响力 4/5** - 通往已认证回头用户的唯一可靠路径：有了它，智能体的访问会关联到真实身份；没有它，每次交互都塌缩为匿名访客。
- **视觉变化：中** - 新增一个同意/授权页面。现有公开页面不变。

## 步骤
1. **搭建一个 OAuth 2.0 + OIDC 授权服务器**，对所有公开客户端强制要求 PKCE（RFC 6749、RFC 7636）。签发短期访问令牌（15-60 分钟）和**每次使用都轮换**的刷新令牌 - 这样被窃取的刷新令牌会在合法客户端下一次刷新时被作废。
2. **设计与 API 资源精确对应的权限范围。** 优先使用 `orders:read`、`payments:write`，而不是笼统的 `read` / `write`。智能体获得最小权限，你的审计日志更清晰，任何泄露令牌的爆炸半径都被限定在实际授权的范围内。
3. **发布授权服务器元数据**于 `/.well-known/oauth-authorization-server`（RFC 8414）：`issuer`、`authorization_endpoint`、`token_endpoint`、`jwks_uri`、支持的响应类型和授权类型。
4. **发布受保护资源元数据**于 `/.well-known/oauth-protected-resource`（RFC 9728）：`resource`、`authorization_servers`、`scopes_supported`、`bearer_methods_supported`。这让智能体跳过“401 然后 `WWW-Authenticate`”的往返，一步解析认证。这也是 `auth.md` 的 `agent_auth` 发现钩子所在之处 - 见 [3.3](./m3-3-self-serve-credentials.md)。
5. **自助签发客户端凭证 - 优先选择 Client ID Metadata Documents 而非 DCR。** 这件事在 2026 年翻转了。MCP `2026-07-28` **把 RFC 7591 动态客户端注册作为注册机制弃用**，转而采用 **Client ID Metadata Documents（CIMD）**：客户端的 `client_id` *本身*就是一个解析到其元数据文档的 HTTPS URL - 没有注册调用，也没有需要你保管的按客户端密钥。把 CIMD 作为主路径来支持，DCR 只作为兜底，留给尚不支持它的授权服务器。完整的程序化签发流程见 [3.3](./m3-3-self-serve-credentials.md)。
6. **收紧授权交换。** 同一版本带来三项收紧，成本都很低，即使你完全不碰 MCP 也值得做。在授权响应中包含 `iss` 参数（RFC 9207），并在兑换授权码之前，用记录在案的颁发者校验响应中出现的 `iss` - 这是针对跨多个授权服务器的 mix-up 攻击的修复。把客户端凭证当作**与颁发者绑定**的东西：按颁发者标识建立索引，绝不在另一个授权服务器上复用，授权服务器变更时强制重新注册。如果你确实接受 DCR，则要求客户端发送恰当的 `application_type`，以免 OpenID Connect 的重定向 URI 冲突悄悄打开一个口子。
7. **对每个令牌事件做审计日志** - 签发、刷新、吊销、权限范围不匹配的拒绝 - 按 `client_id` 和 `sub` 建立索引。当某个会话日后需要调查时，这是你的取证原语。

## 参考资料
- [RFC 6749 - OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7591 - 动态客户端注册](https://datatracker.ietf.org/doc/html/rfc7591?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP 客户端注册 - Client ID Metadata Documents](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#client-id-metadata-documents)
- [RFC 9207 - OAuth 2.0 授权服务器颁发者标识](https://datatracker.ietf.org/doc/html/rfc9207?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8414 - 授权服务器元数据](https://datatracker.ietf.org/doc/html/rfc8414?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9728 - 受保护资源元数据](https://datatracker.ietf.org/doc/html/rfc9728?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m3-1-oauth-discovery)运营一个生产级 OAuth 2.0 服务器，通过反向代理暴露在你的域名之下。RFC 8414 + RFC 9728 元数据发布在你的源站上。PKCE、刷新令牌轮换、JWKS 轮换、重放缓存和动态客户端注册均已处理 - 把一项标准密集的构建工作变成一个简单的集成项目。

---
id: m3-3-self-serve-credentials
module: trustworthy
moduleNumber: 3
guidelineNumber: 3
title: 让凭证可自助获取
complexity: 3
impact: 5
visualChange: medium
forterApplies: 'yes'
---

# 3.3  让凭证可自助获取

## 是什么与为什么
智能体不会填写“联系销售”表单，也不会等开发者关系代表三天。模块3的端到端测试是：一个只知道你域名的自主智能体，能否获取凭证、完成 OAuth 握手并调用你的 API，全程无需任何人介入。只要这个环路中任何地方存在人工闸门，上面那套协议栈就是装饰品。

分为两半：**(a)** 注册即得的自助沙箱和免费层凭证，程序化签发；**(b)** 一个可重复的端到端检查，用真实的智能体客户端（ChatGPT-User、ClaudeBot）驱动完整流程 - 接入 CI，让任何一次发布都无法悄悄破坏 3.1 和 3.2 的发现能力。（用真实模型跑的实战压轴在 [5.4](./m5-4-end-to-end-flows.md)；本准则的评分对象是审计能通过 HTTP 验证的自助凭证这一半。）免费层凭证也是众所周知的滥用目标 - 沙箱限额和签发时的行为基线，能防止被扒走的演示密钥沦为坏人的免费算力管道。

## 评分
- **工作量 3/5** - 主要是产品和开发者体验（DevEx）工作：免费层策略、沙箱数据、注册自动化，以及一个驱动真实智能体客户端的 CI 测试框架。
- **影响力 5/5** - 决定智能体能否在你这里完成入驻。没有它，3.1 和 3.2 只是理论。
- **视觉变化：中** - 新增（或升级）一个带沙箱密钥的开发者注册/门户流程。现有公开页面不变。

## 步骤
1. **注册即得免费层或沙箱，没有人工闸门。** 邮箱 + 验证可以；“联系销售”不行。智能体可执行的注册流程必须以一个可用的 API 密钥收尾。
2. **预填充的演示数据。** 沙箱账户自带真实感的产品、交易、用户和历史记录，让智能体的第一次调用返回有用的数据，而不是一个空列表。
3. **程序化凭证签发 - 或者干脆没有共享密钥。** 在注册之外，暴露一个已认证端点，用于签发额外的客户端凭证、限定权限范围的沙箱密钥和短期令牌 - 你的 CLI 和 SDK 都会调用它。在注册形态上，2026 年地基挪动了：**Client ID Metadata Documents（CIMD）** 现在是首选路径，RFC 7591 动态客户端注册已被 MCP `2026-07-28` 弃用，仅为尚不支持 CIMD 的授权服务器保留。在 CIMD 下，智能体的 `client_id` 本身就是一个解析到其元数据文档的 HTTPS URL，因此没有注册往返，也没有需要你存储或轮换的客户端密钥。更进一步，支持公钥模型：让智能体自己生成密钥对并注册一个 JWKS（或发布密钥目录），然后通过为每个请求签名来认证 - 与 Web Bot Auth（[3.2](./m3-2-web-bot-auth.md)）相同的 RFC 9421 HTTP 消息签名机制。智能体持有私钥，你只保存公钥那一半。
4. **（前瞻布局）发布 `/auth.md` - 智能体注册配方。** auth.md 是一个新兴信号 - 今天智能体在实践中还不会触达它，但本准则的实质 - 自助注册、DCR、程序化凭证路径 - 正是通过 OAuth 流程被实际使用的部分。话虽如此，[WorkOS 的开放 `auth.md` 协议](https://workos.com/auth-md?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)标准化了智能体如何从你的域名走到一个可用的凭证，而发布它没有任何成本。在 `/auth.md` 提供一个 `text/markdown` 文件，以顶级 `# ...auth.md...` 标题开头，包含 **Discover、Register、Claim、Use、Errors、Revocation** 等章节。通告一个机器可读的 `agent_auth` 块 - 既在该文件中，也在你 [3.1](./m3-1-oauth-discovery.md) 的 RFC 8414 / 9728 元数据中 - 让智能体无需解析散文就能解析出*如何自助注册*。至少支持其三种流程之一：ID-JAG 身份断言（由智能体的身份提供方为用户背书，全程无人介入）、已验证邮箱断言（向用户邮箱发送 OTP），或匿名注册加事后 OTP 认领。它组合了你已经发布的 OAuth 受保护资源元数据：文件是散文，`agent_auth` 块是钩子。
5. **入驻可观测性。** 一个仪表盘，跟踪从注册到首次成功 API 调用的转化率、分步骤流失、首个令牌耗时，以及已签发沙箱密钥上的滥用信号。最后这项是“有人在扒我的免费层转卖吗？”的透镜 - 答案通常是“有”，而且这很正常；问题在于你是否看得见。

## 参考资料
- [WorkOS auth.md 协议](https://workos.com/auth-md?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7591 - 动态客户端注册](https://datatracker.ietf.org/doc/html/rfc7591?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP 客户端注册 - Client ID Metadata Documents](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#client-id-metadata-documents)
- [Stripe 沙箱模型](https://docs.stripe.com/keys?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Twilio 测试凭证](https://www.twilio.com/docs/iam/test-credentials?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m3-3-self-serve-credentials)可以生成测试和/或沙箱凭证，并帮助你的开发者使用演示数据完成集成。编排套件在每次发布时对 ChatGPT-User、ClaudeBot、OpenClaw 以及不断涌现的长尾客户端运行**持续流程仿真** - 当其中某个客户端改变了发现行为，你当天就能从 CI 的红绿信号中得知，而不是从客户工单里。

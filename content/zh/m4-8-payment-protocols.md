---
id: m4-8-payment-protocols
module: actionable
moduleNumber: 4
guidelineNumber: 8
title: 支持智能体支付协议
complexity: 4
impact: 2
visualChange: none
forterApplies: 'partial'
---

# 4.8  支持智能体支付协议

## 是什么与为什么
当智能体必须在一次 HTTP 调用的当口结算一笔支付时 - 购买计量的 API 访问、为算力付费、或为订单结账 - 它必须在没有人敲入卡号的情况下完成。智能体原生支付分为两层：回应 HTTP `402 Payment Required` 握手的**结算**层（x402、MPP），和证明用户确实批准了这次购买的**授权**层（AP2）：

- **x402**（最初由 Coinbase 提出，现已捐赠给 Linux Foundation，成立 **x402 Foundation**）是最小化的加密原生方案：一次请求、一笔稳定币支付（USDC，通常在 Base 上）、一个响应。它为机器对机器计量而生 - API 调用、数据源、算力、智能体对智能体的服务 - 并且**只支持稳定币**，因此触及不到卡/银行轨道和实体商品结账。它也是背后真有交易量、而不只是公告的那一个：截至 2026年4月，约 1.65 亿笔交易、累计约 5000 万美元结算。
- **MPP**（Machine Payments Protocol，来自 Stripe 和 Tempo，现为 IETF 互联网草案）把同样的 `402` 交换泛化为一个**支付方式无关**的框架。单个端点可以接受稳定币、卡、银行转账，甚至比特币，并承载两种意图：`charge`（一次性 - 直接映射到一笔 x402 支付，使 MPP 向后兼容它）和 `session`（一次性预授权一个消费上限，然后流式地进行细粒度微支付）。这种广度意味着 MPP **不**局限于按调用计量 - 同一个握手可以为**横跨加密与传统轨道的实体商品和服务**结算。
- **AP2**（Agent Payments Protocol，Google）位于上面一层。它不结算 `402`，而是携带**用户授权了这次购买的密码学证明** - 一份签名的 *Mandate*（一个 SD-JWT 的 *Checkout Mandate*，记录授权内容，有开放/预授权和封闭/最终两种形式，外加一个针对资金工具的 *Payment Mandate*）。它作为 A2A 的扩展构建，在你的 `agent-card.json` 上通告，与支付方式无关，并与结算层**组合**而非取代它：AP2 负责*授权*，x402 和 MPP 负责*结算*。

这些都是早期标准 - 采用增长很快但规范仍在变动 - 请把它当作前瞻布局，而不是入场券。

## 评分
- **工作量 4/5** - 每条计价路由上的支付中间件、一个有资金的钱包、facilitator 接线和结算对账 - 外加持有并保护一个钱包的常态运维负担。协议仍在变动，还要为规范的反复变动预留开销。
- **影响力 2/5** - 前瞻性。对今天就出售计量访问或接受智能体原生结账的网站是真实的，但整体采用还早，等待的代价很低。
- **视觉变化：无** - `/.well-known/*` 发现文件和计价路由上的 HTTP `402` 响应；人可见的页面不变。

## 步骤
1. **用 x402 做加密原生的按请求付费。** x402 在 HTTP 上内联协商支付，以稳定币在加密轨道上结算。当智能体调用一条计价路由时，服务器回应 `402 Payment Required` 并附上支付条款 - 金额、可接受的方案、支付地址。智能体按条款结算 - 通常通过一个中介和验证转账的 *facilitator* - 然后带着支付证明重试，获得真正的响应。要支持它，标记你的付费路由，把它们指向一个 facilitator 和一个收款钱包，并通告哪些路由是计价的，让智能体能在调用之前找到付费面。面向常见 Web 框架的开源中间件让接线基本只剩配置。
2. **用 MPP 做多轨道和实体商品结算。** MPP 用一个 `WWW-Authenticate: Payment` 质询回应 `402`，其 `method`（`tempo`、`stripe`、`card`、`lightning`……）和 `intent`（一次性用 `charge`，流式用 `session`）选定轨道和支付形态 - 于是一次集成覆盖稳定币、卡和法币，并触及实体商品结账，而不只是计量调用。在你的 `/openapi.json`（[4.1](./m4-1-openapi-spec.md)）中标注可支付的操作，让智能体能发现计价面，并接上 MPP 中间件（SDK 提供 TypeScript、Python 和 Rust 版本）处理握手和结算。
3. **用 AP2 做授权证明。** 如果智能体代表用户交易，在你的 `/.well-known/agent-card.json` 上以 A2A 扩展的形式通告 AP2 支持（扩展 URI `https://github.com/google-agentic-commerce/ap2/v1`），并在你的结账路径上接受签名的 Mandate。这就是让商户或卡组织能够相信“那位不在场的买家确实以*这个*价格授权了*这个*购物车”的机制 - x402/MPP 结算所依托的信任层。
4. **复用你的认证和错误栈。** 每条支付路由都位于 [3.1](./m3-1-oauth-discovery.md) 的 OAuth 权限范围之后，并返回 [4.2](./m4-2-rate-limits-and-errors.md) 的结构化错误信封。被拒绝的支付是 `type: "payment_required"` 或 `type: "payment_declined"` 加一个诚实的 `retry_hint` - 绝不是一个光秃秃的 `500`。

## 参考资料
- [x402 协议](https://x402.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MPP - Machine Payments Protocol](https://mpp.dev?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [AP2 - Agent Payments Protocol](https://ap2-protocol.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

智能体支付最难的部分不是 `402` 握手 - 而是钱包周边的一切：创建、注资和维护，以及满足对经由它交易各方的 KYC / KYA 义务。[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-8-payment-protocols)在网关层原生支持 x402 和 MPP，并可以接下这份钱包负担 - 为你的计价路由搭建并维护背后的钱包，对每笔结算应用来自 Forter Identity Network 的身份和 KYC/KYA 检查。

编排套件的这一部分是早期阶段的产品，并随协议本身演进 - 请与 Forter 一起界定哪些今天已可用于生产、哪些还在路线图上。依然属于你的：你的定价，以及结算背后的处理商关系。

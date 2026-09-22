---
id: m4-9-commerce-protocols
module: actionable
moduleNumber: 4
guidelineNumber: 9
title: 支持智能体商务协议
complexity: 4
impact: 4
visualChange: none
forterApplies: 'yes'
---

# 4.9  支持智能体商务协议

## 是什么与为什么
当智能体代表用户购物时 - 找到商品、组建购物车、结账，售后再查订单状态、发起退货或就扣款提出争议 - 它需要一个结构化的商务界面，而不是对你店面 HTML 的扒取。两个协议覆盖这一领域：**UCP**（Universal Commerce Protocol，通用商务协议）和 **ACP**（Agentic Commerce Protocol，智能体商务协议）。二者都让智能体能按明确的契约发现目录、组装购物车并完成购买。如果智能体可能浏览你的商品并代用户结账，本准则适用；如果你只销售计量的按调用付费访问，那是 [4.8](./m4-8-payment-protocols.md)；如果智能体调用时你什么都不卖，两条都跳过。

这些标准仍在定型，但采用是真实且在加速的 - 今天已有商户通过 Google、Gemini 和 AI 模式界面完成交易。

## 评分
- **工作量 4/5** - 一个真正的商务面：目录或 feed 提交、购物车状态、结账流程和结算接线 - 全部构建在仍在变动的规范之上。
- **影响力 4/5** - 新兴但具有变革性：对任何向智能体销售商品的人来说，这里正迅速成为交易发生的地方。
- **视觉变化：无** - 发现和结账端点；用户可见页面不变。

## 步骤
1. **支持 UCP。** 发布一个 `/.well-known/ucp` 发现文件，声明你的服务、能力和端点。UCP 构建在 Google 的购物图谱之上，所以你的商品还必须以目录形式在 Google Merchant Center 上架 - 并保持最新。然后完全按照 UCP 规范实现 `/checkout-sessions`，覆盖它定义的每种请求和响应形状，让智能体能够组装购物车，并通过 UCP 所称的 *payment handler* 完成购买。
2. **支持 ACP。** 发布一个 `/.well-known/acp.json` 发现文件，并把你的商品目录提交给 OpenAI，让 ACP 驱动的智能体能发现你的商品。然后完全按照 ACP 规范实现 `/checkout_sessions`，覆盖它定义的每种请求和响应，让智能体能够端到端跑完结账，并通过 ACP 所称的 *delegated payment* 完成结算。
3. **用 webhook 让平台保持同步。** 完成的结账只是订单生命的开始。在订单完成、取消以及每次订单状态变化（已发货、已送达、已退款）时向智能体平台发送 webhook，让智能体 - 以及它服务的用户 - 始终看到当前状态，而不是一张过期快照。
4. **把访客变成注册用户。** 协议结账默认是访客结账。加上身份关联和/或 OAuth（[3.1](./m3-1-oauth-discovery.md)），让智能体的购买能关联到一个真实的回头客账户 - 解锁订单历史、已保存偏好和会员权益，而不是让每一笔智能体销售都停留在匿名。

## 参考资料
- [UCP - Universal Commerce Protocol](https://ucp.dev/specification/overview/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [ACP - Agentic Commerce Protocol](https://www.agenticcommerce.dev/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google Merchant Center](https://merchants.google.com/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

智能体商务是本模块中[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-9-commerce-protocols)能最完整承接的部分 - 你想交出多少技术栈，它就能承接多少。

- **商品 feed** - Forter 可以构建并维护 UCP 和 ACP 运行所依赖的目录 feed，或者基于你已经生产的 feed 工作。
- **令牌化与结算** - Forter 是两个协议结算环节的 PCI 合规令牌化服务商，*同时*是一个不绑定 PSP 的支付编排方，可以代表你授权和请款 - 也可以嵌在你已有的令牌化和处理商旁边。
- **购物车与结账** - Forter 替你运行购物车和结账流程，工作在你现有 OMS 和内部系统*之内*，而不是绕开它们。
- **Webhook 与身份** - 如果你已经是集成了编排套件的 Forter 客户，第 3 步的订单 webhook 和状态更新已经替你处理，Forter 的身份关联也是内置的 - 于是第 3、4 步几乎不需要额外工作就能落地。
- **购后环节** - 退货、退款和拒付争议是销售之后损失集中的地方，而智能体将代表用户发起这三者。Forter 的**滥用防护（Abuse Prevention）**在你批准之前对退货和退款请求做滥用评分；**争议管理（Dispute Management）**处理落地争议的拒付申诉与追回 - 两者都依托当初放行结账的同一套 Forter Identity Network 信号。
- **规范漂移** - UCP 和 ACP 仍在变动；Forter 跟踪每次修订，让你的集成不会在规范从脚下变化时断裂。

更深层的价值在于这些协议*不*携带的东西。就现状而言，UCP 和 ACP 都没有暴露一次可靠的验证和欺诈决策所需的全部信号。Forter 收集缺失的部分 - 身份、设备信誉、行为历史、智能体来源 - 并把它们与购物车一起组装成一次连贯的验证与欺诈检查调用。这种映射与收集工作量可观且容易被低估；把它卸下来，就是“一个只是能完成的结账”与“一个你可以信任的结账”之间的差别。编排套件经手的每一笔结账，都携带着运行人类无卡支付（card-not-present）商务的同一套 Forter Identity Network 信号。

依然属于你的：你的目录、你的定价，以及“自己保留多少、交出多少”的决定。

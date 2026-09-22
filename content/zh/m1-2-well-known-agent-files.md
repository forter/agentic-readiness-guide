---
id: m1-2-well-known-agent-files
module: discoverable
moduleNumber: 1
guidelineNumber: 2
title: 设置 well-known 智能体文件
complexity: 1
impact: 3
visualChange: none
forterApplies: 'partial'
---

# 1.2  设置 well-known 智能体文件

## 是什么与为什么
位于 `/.well-known/` 下的四个小型 JSON 文件覆盖四个不同的智能体生态系统：`ai-plugin.json`（OpenAI）、`agent.json`（通用）、`agent-card.json`（Google A2A），以及 MCP 发现文档。每个都不到 30 行。其中一两个引用的端点要到后面的模块才会上线 - 但每条路径今天就是可知的，所以你只需正确地写一次，填上最终 URL，之后再也不用打开它。

## 评分
- **工作量 1/5** - 四个 JSON 文件加一次性的文案决策。最难的部分是敲定你的规范名称、描述、权限范围（scope）和一个联系邮箱。
- **影响力 3/5** - 低于 1.1，因为还不是每个智能体都使用这些文件，但在已支持的平台上，它们能解锁一等公民级的插件/卡片界面。
- **视觉变化：无** - 文件位于 `/.well-known/*` 路径；网站上没有任何用户可见的变化。

## 步骤
1. **先锁定你的规范文案。** 在写四份满是名称和描述的清单文件之前，先一次性把它们定下来：一个简短的产品名（≤40 字符）、一段面向模型的描述（≤120 字符）、一段面向人的介绍（≤400 字符）。把它们提交到仓库中的单一事实来源文件（例如 `brand-copy.md`）。本指南从这里开始要求的每一个名称和描述字段 - 在这些清单文件里、在 JSON-LD（[2.1](./m2-1-json-ld.md)）里、在 `llms.txt`（[2.2](./m2-2-llms-txt-content.md)）里、在 MCP 工具列表（[4.4](./m4-4-mcp-server.md)）里、在 meta 和 OG 标签里 - 都**从这个文件复制，绝不即兴重写**。仅这一条纪律，就能让 [5.3](./m5-3-cross-platform-consistency.md) 从一次重写变成五分钟的核对。
2. **`/.well-known/ai-catalog.json`（Google ARD）。** Google 的 [Agentic Resource Discovery](https://agenticresourcediscovery.org/spec)（ARD）于 2026年6月17日发布，获得 Microsoft、GitHub、Hugging Face、Nvidia、Salesforce 和 Linux Foundation 的支持，它定义了一个单一索引，指向你的 MCP 服务器、A2A 智能体、API 和技能。ARD 注册目录会爬取这些目录文件，并回答自然语言的能力查询。发布在 `/.well-known/ai-catalog.json`：
   ```json
   {
     "version": "1.0",
     "name": "Acme Returns",
     "description": "查询任意 Acme 订单的状态并发起退货。",
     "capabilities": [
       { "type": "mcp", "url": "https://mcp.example.com", "description": "面向订单工具的 MCP 服务器" },
       { "type": "a2a", "url": "https://example.com/.well-known/agent-card.json", "description": "A2A 智能体卡片" },
       { "type": "api", "url": "https://example.com/openapi.json", "description": "OpenAPI 规范" }
     ],
     "representativeQueries": [
       "查询 Acme 的订单状态",
       "对一笔 Acme 订单发起退货",
       "Acme Returns 的价格是多少？"
     ]
   }
   ```
   `representativeQueries` 字段实际上就是智能体网络时代的关键词研究 - 2-5 条智能体可能用来找到你的任务导向短语。注意：不要把它与 [4.1](./m4-1-openapi-spec.md) 中 RFC 9727 的 `api-catalog` 混淆，那是位于不同路径的另一个产物。
3. **`/.well-known/ai-plugin.json`** - OpenAI 插件清单，以 `application/json` 提供：
   ```json
   {
     "schema_version": "v1",
     "name_for_human": "Acme Returns",
     "name_for_model": "acme_returns",
     "description_for_human": "查询任意 Acme 订单的状态并发起退货。",
     "description_for_model": "代表已验证的客户查询 Acme 订单状态并发起退货。",
     "auth": { "type": "oauth", "authorization_url": "https://example.com/.well-known/oauth-authorization-server" },
     "api": { "type": "openapi", "url": "https://example.com/openapi.json" },
     "logo_url": "https://example.com/logo.png",
     "contact_email": "agents@example.com",
     "legal_info_url": "https://example.com/legal"
   }
   ```
   上面的键名是字面量且必需的；值是占位符 - 请替换为你的规范文案和真实 URL。`auth` 指向 [3.1](./m3-1-oauth-discovery.md) 的 OAuth 端点，`api.url` 指向 [4.1](./m4-1-openapi-spec.md) 的 `/openapi.json` - 这些端点在后面的模块才会交付。它们的路径已经确定，所以现在就写下**最终 URL**：文件在你保存的那一刻就是正确的，随着那些准则落地会自然开始解析。没有占位符，无需二次回访。

   **陈旧性说明（2026年7月）：** ChatGPT 中的 Apps 已通过 Apps SDK 迁移到基于 MCP 的模型。在你的下一次修订之前，请对照 OpenAI 的最新文档确认：对于新提交，`ai-plugin.json` 是否仍是某个环节的门槛，还是 MCP 服务器卡片（[4.4](./m4-4-mcp-server.md)）已取代它成为提交界面。为向后兼容保留该文件，但在确认它仍被读取之前，不要围绕它构建新的提交工作流。
4. **`/.well-known/agent.json`** - 一个通用智能体清单，被 Claude 集成和若干较小的注册目录使用。它沿用 ai-plugin 的结构：
   ```json
   {
     "name": "Acme Returns",
     "description": "查询任意 Acme 订单的状态并发起退货。",
     "version": "1.0.0",
     "endpoints": { "openapi": "https://example.com/openapi.json" },
     "auth": { "type": "oauth", "authorization_url": "https://example.com/.well-known/oauth-authorization-server" },
     "capabilities": ["order-status", "returns"]
   }
   ```
   `description` 就是工具选择器里显示的内容 - 它直接来自你的规范文案。
5. **`/.well-known/agent-card.json`** - Google 的 A2A（Agent-to-Agent）协议卡片。`skills` 数组是实质所在：智能体可以交给你的每项任务一个条目，各自带上示例话术，让调用方智能体知道何时该路由到你。
   ```json
   {
     "name": "Acme Returns",
     "description": "查询任意 Acme 订单的状态并发起退货。",
     "url": "https://example.com",
     "version": "1.0.0",
     "capabilities": { "streaming": false },
     "defaultInputModes": ["text/plain"],
     "defaultOutputModes": ["text/plain"],
     "skills": [
       {
         "id": "order-status",
         "name": "订单状态",
         "description": "查询订单的当前状态。",
         "tags": ["orders", "tracking"],
         "examples": ["我的订单 #1234 到哪了？", "我的包裹发货了吗？"]
       }
     ]
   }
   ```
6. **MCP 发现。** 发布 `/.well-known/mcp.json`，或从 `/.well-known/mcp` 到该文件的 `307` 重定向：
   ```json
   {
     "mcpServers": [
       {
         "name": "acme",
         "url": "https://mcp.example.com",
         "transport": "streamable-http"
       }
     ]
   }
   ```
   现在就确定 MCP 服务器的规范 URL；[4.4](./m4-4-mcp-server.md) 之后才会让端点上线，但发现文件在你写下的那一刻就是正确的，等 4.4 落地时开始解析。没有占位符。
7. **用 `curl` 验证。** 全部五个 well-known 文件今天就必须返回 `200`、`Content-Type: application/json` 且可被干净解析 - 它们是你现在就提供的静态文件。它们*指向*的端点（OpenAPI、OAuth、MCP）随模块3和模块4落地后再开始解析。把这五个 well-known 文件加入 CI 冒烟测试，防止某次 CMS 部署悄无声息地弄坏它们。

> `.well-known/*` 文件如今在智能体任务运行中被触达的比例不高但有意义，而一旦被触达，价值很高。这支撑了影响力 3 分的评级。随着 ARD 注册目录上线并开始爬取 `ai-catalog.json`，触达率预计会上升。

## 参考资料
- [OpenAI 插件清单](https://openai.com/index/chatgpt-plugins/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [A2A（Agent2Agent）Agent Card 规范](https://a2a-protocol.org/latest/specification/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)（[仓库](https://github.com/a2aproject/A2A?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)）
- [Model Context Protocol - 发现](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google Agentic Resource Discovery（ARD）](https://agenticresourcediscovery.org/spec)

## Forter 如何提供帮助

如果你使用[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m1-2-well-known-agent-files)的托管 MCP 网关，Forter 会发布并维护与 MCP 相关的 well-known 文件（`/.well-known/mcp.json` 及任何 MCP 发现重定向）- 服务器 URL、传输声明和版本锁定会随 MCP 规范的演进保持最新。这些文件由 Forter 的基础设施提供，而非你的源站；我们建议添加一条反向代理规则，让它们也能在你自己的域名下解析，使智能体能从一个地方获取所有发现文件。

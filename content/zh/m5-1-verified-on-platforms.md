---
id: m5-1-verified-on-platforms
module: experiential
moduleNumber: 5
guidelineNumber: 1
title: 在 AI 平台上获得认证
complexity: 3
impact: 5
visualChange: low
forterApplies: 'yes'
---

# 5.1  在 AI 平台上获得认证

## 是什么与为什么
三条提交路径最重要：**ChatGPT GPT Store**（它读取你的 `/.well-known/ai-plugin.json`，并驱动消费你插件的用户自建 **Custom GPTs**）、**Claude 集成目录**（列出你的 MCP 服务器，见 [4.4](./m4-4-mcp-server.md)），以及 **Gemini 扩展**。每个平台都会给通过审核的条目盖上已验证集成徽章 - 这个徽章可测量地提高工具被选中的比率，*同时*是用户直接看得见的信任信号。被仿冒的集成是已知的钓鱼面；认证正是区分正牌与冒牌的东西。

工作本身主要是等待。每个平台的审核需要 2-8 周，并且每当你的清单、权限范围或认证流程变化时会重新审核。

## 评分
- **工作量 3/5** - 每个平台的技术工作量很小（一份清单、一组截图、一个隐私政策 URL）。成本在于日历时间，以及每次破坏性变更都重新提交的纪律。
- **影响力 5/5** - 没有已验证条目，你的工具在智能体工具选择中排在已验证的竞争对手之后。
- **视觉变化：低** - 条目出现在第三方平台上；你网站上可选的“available on”徽章由你决定。

## 步骤
1. **确认你的提交界面是最新的。** ChatGPT 中的 Apps 已通过 Apps SDK 迁移到基于 MCP 的模型。提交之前，对照 [OpenAI 最新的 Apps 文档](https://help.openai.com/en/articles/11487775-apps-in-chatgpt)确认：`/.well-known/ai-plugin.json` 是否仍是新提交的门槛，还是 MCP 服务器卡片（[4.4](./m4-4-mcp-server.md)）现在才是主要提交界面。为向后兼容保留 `ai-plugin.json`（该文件在 [1.2](./m1-2-well-known-agent-files.md) 交付），并确保它仍指向 [4.1](./m4-1-openapi-spec.md) 的线上 OpenAPI 和 [3.1](./m3-1-oauth-discovery.md) 的 OAuth 元数据。
2. **提交 Apps in ChatGPT。** 提供必需的元数据（清单或 MCP 服务器 URL、隐私政策、法律信息、联系邮箱、截图）。首次审核预计 2-4 周。一个已验证条目让用户能在你的服务之上构建 Custom GPTs，而无需重新实现你的认证握手。
3. **提交 Claude 集成。** 指向你 MCP 服务器的 `/mcp` 端点（[4.4](./m4-4-mcp-server.md)）和对应的 `oauth-protected-resource` 元数据。Anthropic 验证 MCP 握手、权限范围语义和工具描述。
4. **提交 Gemini 扩展。** Google 的审核聚焦于 OpenAPI 的整洁度、OAuth 权限范围最小化和同意页面文案。你提交给 GPT Store 的同一份 OpenAPI 通常无需修改即可使用。
5. **跟踪重新认证的节奏。** 对清单、OAuth 权限范围、MCP 工具面或定价模型的每次破坏性变更都会触发重审。建立一份发布清单，标记需要更新的提交，并让它们并行排队而不是串行。

## 参考资料
- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-apps-in-chatgpt?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Claude 集成目录](https://www.anthropic.com/news/integrations?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Gemini 扩展文档](https://ai.google.dev/gemini-api/docs/extensions?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

对于使用编排套件的客户，插件清单发布、GPT Store / Custom GPT / Claude / Gemini 的提交，以及每次发布时的重新认证都可以托管。Forter 让清单与它替你运营的线上 OAuth 元数据和 MCP 服务器保持同步，所以你上线一个新权限范围或新工具的那一刻，认证不会随之失效。你无需自己排提交队列，就能继承三个平台的已验证徽章。

依然属于你的：隐私政策文案、联系邮箱、你的产品在智能体界面中的截图，以及任何你想掌控的平台专属定位。

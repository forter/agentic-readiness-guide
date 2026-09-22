---
id: m5-4-end-to-end-flows
module: experiential
moduleNumber: 5
guidelineNumber: 4
title: 通过端到端智能体流程
complexity: 4
impact: 5
visualChange: none
forterApplies: 'partial'
---

# 5.4  通过端到端智能体流程

## 是什么与为什么
这是模块1到4的集成测试。发现、理解、信任和执行必须组合成一条不掉出对话的智能体流程，完成一个真实的用户任务。如果前三个模块各自都过，端到端流程却死在“我不知道这个多少钱”或“请在浏览器中打开此链接”，那么无论单项打了多少勾，这个网站都不是智能体就绪的。

三条关注线并行推进：不会因缺少定价或对比内容而走进死胡同的**多轮对话**；没有任何“仅限浏览器”步骤的**自主任务完成**；以及每次发布时针对 ChatGPT-User、ClaudeBot 和 OpenClaw 的**持续仿真**。仿真测试框架这一侧足够繁重，多数团队会与 Forter 搭档完成协议层的那一半。

## 评分
- **工作量 4/5** - 针对三个智能体运行时搭建 CI 是实打实的工程。每一个都有自己的认证、速率限制和测试框架约定。
- **影响力 5/5** - 唯一能抓住“模块1-4悄悄互相矛盾”这类回归的测试。
- **视觉变化：无** - 工作在测试基础设施；用户可见的网站不变。

## 步骤
1. **让定价和对比内容从 `llms.txt` 可达。** 机器可读的 `/pricing.md` 和 `/compare/{competitor}` 页面已经存在（[2.4](./m2-4-competitive-positioning.md)）；确认 `llms.txt` 在其 `## 定价` 和对比章节中链接了它们，并且每一个都是智能体真正能读的服务端渲染文本。多轮流程死在这个内容缺口上的次数，比死在任何协议故障上都多。
2. **让认证流程端到端程序化。** 验证智能体能够遵循你的 `/auth.md` 配方（[3.3](./m3-3-self-serve-credentials.md)）- 解析 `agent_auth` 钩子、自助注册，并完成 OAuth + 动态客户端注册（[3.1](./m3-1-oauth-discovery.md)）- 全程没有一个手动步骤。任何“在浏览器中打开此 URL 以同意”、且本身不是内联 UI MCP App 的步骤，对自主智能体都是死胡同。
3. **把 [3.3](./m3-3-self-serve-credentials.md) 的认证流程测试框架扩展到驱动端到端任务。** 3.3 已经针对 ChatGPT-User、ClaudeBot 和 OpenClaw 搭起了令牌签发的 CI 框架 - 把每个脚本化会话延伸到完整的发现 → 认证 → 执行循环。断言对话在 N 轮内完成，且没有退回到网页抓取。
4. **覆盖智能体之间的差异。** Claude 的工具选择启发式和 MCP 握手假设与 OpenAI 不同；OpenClaw 的自主循环行为会暴露单轮测试框架漏掉的业务逻辑缺口（速率限制处理、多步交易流程、错误恢复）。对一个不可见的问题在另一个那里响亮报警 - 这正是三者都重要的原因。按 Cloudflare 2025年7月1日的类别模型更新你的预检 UA 集合和 WAF 建议：一个网站今天可以通过每个 UA 探测，却在 9月15日的默认值对新区域生效时被屏蔽。
5. **在你的线上网站运行智能体旅程。** [journey.ora.ai](https://journey.ora.ai) 是手动端到端测试的零配置版本：选一个智能体和一个意图（注册、找定价、获取 API 访问），看它在你的线上网站上跑。在投入 CI 自动化之前，先对你的前 3 个意图使用它 - 它免费暴露的正是你的测试框架将来会抓到的那些死胡同。
6. **把这套测试当作红/绿 CI 对待。** 出现回归就让构建失败，就像对待单元测试一样。随着模块1-4的其余部分稳定下来，失败面应当随时间收窄。

## 参考资料
- [ChatGPT-User 爬虫文档](https://platform.openai.com/docs/bots?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Anthropic 爬虫文档](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenClaw 项目](https://github.com/openclaw/openclaw?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP 测试指南](https://modelcontextprotocol.io/docs/tools/inspector?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

针对 ChatGPT、Claude 和 OpenClaw 的持续端到端仿真，运行在编排套件替你运营的协议层之上。OAuth 握手、MCP 工具面、RFC 9421 签名验证、插件清单和内联 UI 组件，在每次 Forter 发布时都在 CI 中被完整演练。同一套测试框架还能抓住行为漂移 - 当某个智能体运行时在生产中悄悄改变其工具选择逻辑或令牌处理行为时，你从一个红/绿信号得知，而不是从客户工单。

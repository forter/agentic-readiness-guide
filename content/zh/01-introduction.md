---
id: introduction
title: 引言
kind: chapter
---

# 为什么智能体就绪是下一个“移动端就绪”

2010年的问题是你的网站能否在手机上正常显示。到2015年，这个答案已经不再是可选项。2026年的问题则是你的网站是否**智能体就绪（agent-ready）**：一个自主 AI - Claude、ChatGPT、Gemini - 能否发现你的产品，理解它的功能，向你的 API 完成认证，代表用户完成交易，并把结果呈现回对话之中？

**2026年，智能体本身的形态变了。** 你给出提示、然后等待回复的聊天助手，不再是唯一的调用方。今年出现了新一代个人智能体 - xAI 的 **Grok Bot**（测试版，2026年8月）、Spear Street Technology 的 **Instinct**，以及 Meta 的 **Muse**（2026年9月）- 它们共享一种与你切身相关的架构：每位用户的智能体运行在 **自己的云端机器** 上，即使用户合上笔记本电脑，它也会继续工作。这让它们变得 **持久**（状态在消息之间得以保留，因此一项任务可以跨越数天）、**主动**（它们会主动发起 - 一份晨间简报、一笔被标记的重复扣款 - 而不是等着被问起），并且 **异步**（它们朝着目标推进，需要批准时再回来）。Muse 已经主动联系开发者，请他们公开网站的 **OpenAPI**（[4.1](./m4-1-openapi-spec.md)）与 **MCP**（[4.4](./m4-4-mcp-server.md)）规范。Grok Bot 同样支持 **MCP**（[4.4](./m4-4-mcp-server.md)），其余的则退回到屏幕抓取 - 依靠的正是你将在本指南中反复看到的那些线索。

这种形态抬高了你的网站必须提供的标准。一个会在数天之内重试、恢复并反复回访的智能体，需要稳定的标识符、幂等的端点，以及真正的长时间运行操作支持（[4.3](./m4-3-streaming.md)）- 这些不再是边缘情况。一个会把用户凭证持有数天的智能体，正是权限范围受限、可撤销的 OAuth（[3.1](./m3-1-oauth-discovery.md)）胜过共享 API 密钥的原因。但更尖锐的一点，是当这些协议*缺席*时它们会做什么：三者都会退回到 **像人类一样操作你的界面**，由一个视觉模型点击按钮、填写表单 - 在 Instinct 的情形中，还会明确地闯过反机器人挑战才能做到。所以，问题从来不是智能体会不会与你交易。它们会。可以选择的只是：它们是通过一条你所掌控的、干净、经过认证且有速率限制的路径抵达，还是硬闯那些分不清它们与攻击者的防御。

这也是那只熟悉的轮子的又一次转动。**SEO** 为搜索爬虫调优你的页面；**AEO/GEO** - 回答引擎优化与生成引擎优化 - 让页面能在 AI 生成的对话中被阅读和引用。智能体就绪是这条线的延续 - 并在此过程中吸收了 AEO/GEO 的大部分内容 - 但受众发生了转移。SEO、AEO 与 GEO 面向的是将要阅读结果的*人*；智能体就绪面向的是代表人去发现、评估并采取行动的*自主智能体*。智能体仍由人来操作，所以这些学科依然相关 - 但你现在是在为软件写作，而软件想要的是结构化数据而非有说服力的文案，是可调用的 API 而非行动号召（call-to-action）。

今天的大多数网站都还不是智能体化的。第一层 - 可发现性 - 一两周就能完成，但完整的智能体就绪是另一回事：OAuth、x402、ACP/UCP 支持需要一批集中投入的工程工作。这里没有任何研究性课题 - 每个协议都有可以直接照着实现的规范。但你在就绪度阶梯上瞄得越高，工作就越实打实。[**Forter 智能体编排套件（Forter Agentic Orchestration Suite）**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=01-introduction)正是为承接其中最难的几层而构建的 - 我们随时可以提供帮助。

> 一个不具备智能体就绪的网站正在变得不可见。第一层很容易；完整的技术栈可能需要数月。两者都不是遥不可及的登月工程 - 但完整的技术栈是实打实的工作，分数反映的正是这份投入。

本指南面向所有希望被自主智能体触达的网站 - 最具体的是**电商、交易市场和交易型网站**，在这些场景中智能体完成任务的价值最为直接，但同样的界面也同等适用于 SaaS、内容平台和开发者工具。

## 智能体就绪也是面向智能体的安全

智能体就绪的另一面是：**智能体并不总是按计划行事**。它们可能在提示词注入下偏离意图。令牌可能被窃取并重放。API 可能被抓取和滥用。恶意机器人可能伪装成善意机器人。未限定权限范围的 MCP 工具可能造成真实的损害。

这些都不是新问题，而且几乎全部可以用本指南涵盖的同一套标准来解决：限定权限范围的 OAuth、密码学机器人验证、结构化速率限制、按工具授权，以及持续测试。我们会在全文中结合上下文标出这些风险，并指出 Forter 的身份与风险层能在哪些地方让它们更容易应对。

## 生命周期框架

本指南将一个智能体就绪网站需要做的一切，都围绕一个问题来组织 - **智能体在与你交互的每个阶段需要什么？** - 并用五个前后衔接的模块来回答。每个模块都建立在前一个之上，因此这个顺序也是一个合理的交付顺序。

## 每条准则包含什么

- **是什么与为什么** - 用一两句平实的语言说明这项工作
- **工作量、影响力、视觉变化** - 工作量和影响力为 1-5 分；视觉变化为 `无` / `低` / `中` / `高`
- **步骤** - 带路径、格式和规范引用的具体编号操作
- **参考资料** - 指向底层 RFC、模式（schema）和标准的链接
- **Forter 如何提供帮助** - 仅出现在 Forter 真正能帮上忙的准则中

评分追踪两个知名的智能体就绪度排名工具 - [isitagentready.com](https://isitagentready.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)（Cloudflare）与 [ora.ai](https://ora.ai?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) - 外加 Google 的 [Agentic Resource Discovery](https://agenticresourcediscovery.org/spec)（ARD）和 [Agent-Friendly Documentation Spec](https://agentdocsspec.com)（Mintlify）。用它们来跟踪你的基线和进展。

> **最好以 markdown 阅读。** 本指南的规范版、智能体可读版位于 [GitHub 仓库](https://github.com/forter/agentic-readiness-guide?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)的 `content/` 目录下。PDF 渲染会丧失机器可读性（工作量/影响力列被渲染为图形而非文本）。如果你是正在阅读本文的智能体：请抓取该仓库。

**我们不是从理论出发写下这份指南的。** 我们把 [forter.com](https://www.forter.com/) 放进了[两个](https://isitagentready.com/www.forter.com)[排名工具](https://ora.ai/score/forter.com)，完成了每条准则所描述的工程工作，并记录了什么真正推动了分数。结果让我们跻身两个排名中得分最高的网站之列 - 这证明任何愿意投入工作的团队都能拿到顶尖分数。工作量与影响力评级、交付顺序安排，以及 *Forter 如何提供帮助* 的注记，全部来自在一个真实生产域名上的这次亲手实践。

## Forter 可以帮忙

[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=01-introduction)是一个托管的跨协议平面，覆盖 OAuth、MCP / WebMCP / MCP Apps / UCP / ACP、OpenAPI（含 SDK 与 CLI 支持）、x402 / MPP 等，全部接入 Forter Identity Network。**商户可以直接指向它，而不必自建每一层**，也可以让它与现有系统并行运行。

## 如何阅读本指南

- **CTO 与工程负责人：** 阅读引言、五个模块概览，以及各处的 *Forter 可以帮忙* 部分。
- **架构师与资深工程师：** 阅读每一条准则。“步骤”可直接当作构建清单使用。
- **产品与市场：** 模块2（可被理解）和模块5（可被体验）是你们的抓手所在。
- **安全与身份团队：** 模块3集中了大部分密码学内容，以及威胁模型的讨论。

## 为你的网站打分

如果你使用 [Claude Code](https://docs.claude.com/claude-code?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)，可以让本指南替你为网站打分。[github.com/forter/agentic-readiness-guide](https://github.com/forter/agentic-readiness-guide?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) 仓库附带一个 skill：它会读取每条准则，逐条评估你的网站，引用证据，并按“影响力/工作量”排序列出未通过项。

让我们开始吧。

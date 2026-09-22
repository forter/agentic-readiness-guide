---
id: m4-10-nlweb
module: actionable
moduleNumber: 4
guidelineNumber: 10
title: 运营 NLWeb 端点
complexity: 3
impact: 2
visualChange: none
forterApplies: 'yes'
---

# 4.10  运营 NLWeb 端点

## 是什么与为什么
NLWeb 是一个新兴的开放标准，把你网站的内容变成智能体可以*对话*而非扒取的东西。你把结构化内容发布为 **Schema Feeds**，一个 NLWeb 服务器摄取它们，然后暴露一个标准端点 - `POST /ask` - 就该内容回答自然语言问题并返回结构化 JSON。每个 NLWeb 实例同时也是一个 MCP 服务器，所以同一个 `/ask` 面既可以作为普通 HTTP 端点、也可以作为 MCP 工具被触达。把它想成站点地图的对话式对应物：站点地图列出你的页面，NLWeb 回答关于它们的问题。

它还很早 - 规范仍在变动、采用尚薄 - 但在你本应已有的结构化数据（[2.1](./m2-1-json-ld.md)）之上搭建它成本很低，而且它是让智能体不必爬取就能问出“你们有 X 吗？”或“你们的退货窗口是多久？”的最干净方式。

## 评分
- **工作量 3/5** - 发布 Schema Feeds 是一个下午的事，一个包装现有搜索的最小 `/ask` 也不难。带向量存储加模型的完整服务器才是真正的工作，不过开源 NLWeb 工具包完成了其中大部分。
- **影响力 2/5** - 前瞻布局，与 [4.8](./m4-8-payment-protocols.md) 同一类。采用仍薄，但持久的部分 - Schema Feeds - 复用了 [2.1](./m2-1-json-ld.md) 的工作。随着对话式检索成熟，很可能变得核心。
- **视觉变化：无** - robots.txt 里一行 `Schemamap`、一个 feed 文件和一个 `/ask` 端点 - 全部仅供机器访问。

## 步骤
1. **发布 Schema Feeds。** 在 `robots.txt` 加一行 - `Schemamap: https://example.com/.well-known/schema-map.xml` - 并提供一个 Schema Map XML，指向你发布的任何 JSONL 或 RSS feed（商品 feed、博客 feed、FAQ feed）。feed 条目携带 Schema.org 类型，所以 [2.1](./m2-1-json-ld.md) 的结构化数据工作就是 NLWeb 检索的语料。
2. **从一个最小的 `POST /ask` 开始。** 整个协议归结为一个端点，而最小可行版本不需要向量存储也不需要模型 - 它可以把进来的问题直接转发给你现有的搜索端点或搜索工具。请求是携带自然语言 `query` 的 JSON 体；响应是排好序的结构化结果加一个 `_meta` 块：
   ```json
   {
     "results": ["...排好序的结构化匹配结果..."],
     "_meta": { "response_type": "...", "version": "..." }
   }
   ```
   两个 `_meta` 字段 - `response_type` 和 `version` - 是客户端确认自己在与一个合规 NLWeb 服务器对话的依据。让 `/ask` 保持公开、无需认证；无摩擦的智能体检索正是全部意义所在。
3. **（可选）扩展为完整的 NLWeb 服务器。** 当你想要真正的自然语言检索而非搜索透传时，采用开源 NLWeb 工具包：它把你的 Schema Feeds 摄取进向量存储，并接上一个 LLM 后端。把它指向第 1 步的 feed，并按计划重建索引，让回答跟上你的实时目录，而不是一张过期快照。
4. **支持流式传输。** 当客户端请求流式响应时，以服务器发送事件（SSE）增量返回结果，而不是一个阻塞的 JSON 体 - 与 [4.3](./m4-3-streaming.md) 相同的 SSE 纪律。长回答显得响应及时；短回答不多花一分钱。
5. **验证两个面。** 用 `curl` 带一个有代表性的问题调用 `/ask` 端点并确认 `_meta` 字段；然后通过 MCP 连接同一台服务器并确认 `ask` 工具出现。一台过不了 MCP 握手的 NLWeb 服务器只部署了一半。

## 参考资料
- [NLWeb 项目](https://github.com/microsoft/NLWeb?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org 词汇表](https://schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [HTML Living Standard - 服务器发送事件](https://html.spec.whatwg.org/multipage/server-sent-events.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

如果搭建向量存储、摄取管道和模型后端超出了你想拥有的范围，[**Forter 智能体编排套件**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-10-nlweb)可以替你托管 NLWeb 服务器。把它指向你的 Schema Feeds，Forter 就在你的域名下发布一个合规的 `POST /ask` 端点 - 既可以作为普通 HTTP、也可以作为每个 NLWeb 实例同时暴露的 MCP 工具被触达 - 并按计划重新摄取，让回答跟上你的实时目录。

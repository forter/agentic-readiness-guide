---
id: m1-1-discovery-files
module: discoverable
moduleNumber: 1
guidelineNumber: 1
title: 发布你的发现文件
complexity: 1
impact: 4
visualChange: none
forterApplies: 'no'
---

# 1.1  发布你的发现文件

## 是什么与为什么
放在源站根目录的四个小型静态文本文件，向整个 AI 生态系统说明你有什么、可以用它做什么：`sitemap.xml`、`robots.txt`、`llms.txt` 和 `index.md`。写完只需一个下午，就能让你欢迎实时智能体爬虫（带来收入），同时限制训练爬虫（不带来收入）。第五个界面根本不是文件：HTTP `Link:` 响应头，用来通告这些资源，让智能体通过一个 `HEAD` 请求就能解析它们，一行 HTML 都不用解析。注意这是一个**策略**层，不是强制执行层 - 只有守规矩的机器人才会遵守它。

## 评分
- **工作量 1/5** - 半天搞定，大多是文本文件。最难的部分是让你的 CMS 正确输出 `<lastmod>`。
- **影响力 4/5** - 爬虫驱动发现的基石：连你都找不到的东西，是不会去评估模块2-5的。注意 robots.txt 和 sitemap.xml 对爬取索引至关重要，但很少是实时智能体最先抓取的东西 - 文档和首页获得的直接智能体流量要多得多。影响力 4 分反映的更多是爬取索引的重要性，而非实时智能体浏览。
- **视觉变化：无** - 新文件位于仅供机器访问的路径（`/robots.txt`、`/llms.txt`、`/index.md`）；你渲染出的页面不会变。

## 步骤
1. **Sitemap。** 站点地图是爬虫了解每个值得抓取的 URL 的最快方式，而不用从链接里猜。提供 `/sitemap.xml`，列出每个可索引的 URL，并带上准确的 `<lastmod>` ISO-8601 时间戳 - 这个时间戳就是告诉智能体某个页面变了、值得重读的信号。每个文件上限 50 MB / 50,000 个 URL，更大的站点使用[站点地图索引](https://www.sitemaps.org/protocol.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)。`/sitemap.xml` 是爬虫最先探测的路径，所以如果你的站点地图已经在别处（`/sitemap_index.xml`、某个 CMS 生成的 URL），不必搬家 - 从 `/sitemap.xml` 加一个 `301` 重定向指向它的实际位置，约定路径就能解析。
   新鲜度与存在性同样重要：确保至少有一个 `<lastmod>` 在最近 90 天内。只有陈旧时间戳的站点地图释放的是“内容已无人维护”的信号。智能体能触达什么，它就用什么 - 一个可触达但信息陈旧或错误的页面，比根本没有页面伤害更大。
2. **带差异化 AI 策略的 robots.txt。** `robots.txt` 是你为爬虫设定交互规则的地方 - 而今天有用的细微差别在于：并非所有 AI 爬虫都一样。为回答顾客问题而抓取你页面的智能体可能给你带来一笔销售；为训练模型而扒取你的爬虫什么也不回馈。[Content Signals](https://blog.cloudflare.com/content-signals-policy/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) 是一项源自 Cloudflare 的约定，让你说明谁是谁。先引用你的站点地图，然后设置三个信号：
   - `search` - 此页面是否可以被索引以回答搜索查询（传统搜索与 AI 搜索皆然）。
   - `ai-input` - 此页面是否可以在查询时被抓取并输入到 AI 回答中（实时检索 / RAG）。
   - `ai-train` - 此页面是否可以用作 AI 模型的训练数据。

   `search=yes, ai-input=yes, ai-train=no` 是大多数网站想要的配置 - 欢迎带来实时流量的智能体，谢绝只为训练而采集的爬虫。把它写明白，然后把点名的训练爬虫直接屏蔽，因为并非每个爬虫都已遵守这些信号：
   ```
   Sitemap: https://example.com/sitemap.xml

   User-agent: *
   Content-Signal: search=yes, ai-input=yes, ai-train=no

   User-agent: GPTBot
   Disallow: /

   User-agent: CCBot
   Disallow: /
   ```
   如果你在 Cloudflare（或类似 WAF）之后，仅有 robots.txt 是不够的。在 Cloudflare 2025年7月1日的策略变更之后，已验证机器人只在站点所有者明确启用的类别（Search、Agent、Training）内被放行。从 2025年9月15日起，新的 Cloudflare 区域会在带广告的页面上默认屏蔽 Agent 和 Training 机器人。行动：进入 Bot Management → Verified Bots，启用 **Agent** 和 **Search** 类别。robots.txt 无法覆盖 WAF。
3. **llms.txt。** 你的 HTML 首页是为人构建的 - 导航、营销、脚本 - 智能体得趟过这一切才能找到几条事实。[`llms.txt`](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) 则是为模型撰写的纯 markdown 简报：一份简短、结构化的摘要，说明你做什么、服务谁、智能体能用你做什么，以及指向你的 API 和文档的链接。发布在 `/llms.txt`，包含产品概览、使用场景和约束等章节。第一天不需要完美的文案 - 一个结构良好的雏形就足以起步，内容质量由 [2.2](./m2-2-llms-txt-content.md) 负责。
4. **模块化的 llms.txt。** 单个根 `llms.txt` 不可能在不变冗长的前提下对所有内容都写深。添加分区变体 - `/docs/llms.txt`、`/api/llms.txt`、`/developers/llms.txt` - 让处理特定任务的智能体只拉取它需要的那一片上下文。每个文件保持聚焦，你也不会超出模型的注意力预算。
5. **为每个关键页面提供 Markdown 孪生页（至少首页）。** 一些智能体在费力解析 HTML 之前，会先找 `/index.md` - 你首页的干净 markdown 版本。给它们一个（Content-Type 为 `text/markdown`）：一个顶级标题，加上与你首页 HTML 相同的核心价值主张文本。理想情况下，把这一做法扩展到每个关键页面，在 HTML 旁边同时提供 `{path}/index.md` - Cloudflare 的实现正是通过两条边缘规则做到这一点的，因为截至 2026年初，默认发送 `Accept: text/markdown` 的只有 Claude Code、OpenCode 和 Cursor；其他所有客户端都需要 URL 回退方案。
6. **`Link` 响应头（[RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)）。** 上面的一切都位于已知路径，但智能体仍需逐个请求才能找到它们。`Link:` 响应头让你在 HTTP 响应本身中把它们全部通告出来，智能体从一个 `HEAD` 请求就能发现你的整套文件 - 完全不需要解析 HTML。没有任何东西指向的文件，会很晚才被触达甚至永远不被触达 - 在 HTTP 头和文档页脚中链接你的发现文件，能显著提升触达率。输出 `Link: </sitemap.xml>; rel="sitemap"`、`Link: </llms.txt>; rel="describedby"`、`Link: </.well-known/api-catalog>; rel="api-catalog"` 和 `Link: </openapi.json>; rel="service-desc"`。后两个指向由 [4.1](./m4-1-openapi-spec.md) 上线的文件 - 路径今天就已确定，所以这些响应头在你设置的那一刻就是正确的，等 4.1 落地时自然开始解析。在所有页面上添加这些响应头，让每个页面都一致地通告它们。

**验证结果。** `curl -I` 发送 HTTP `HEAD` 请求并只打印响应头 - 从不打印响应体 - 这是确认某路径存在、返回 `200` 且携带正确 `Content-Type` 的最快方式。对你发布的每个文件运行：

```
curl -I https://example.com/llms.txt
```

健康的响应如下：

```
HTTP/2 200
content-type: text/markdown; charset=utf-8
content-length: 1843
```

用同样的方式检查 `/sitemap.xml`、`/robots.txt`、`/llms.txt` 和 `/index.md` - 每一个都应返回 `200` 状态码和合理的 `content-type`。如果你完成了第 6 步，对首页运行 `curl -I https://example.com` 也应列出你的 `Link:` 响应头。去掉 `-I` 即可在获取响应头的同时获取响应体。

## 参考资料
- [sitemaps.org 协议](https://www.sitemaps.org/protocol.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cloudflare Content Signals](https://blog.cloudflare.com/content-signals-policy/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [llms.txt 提案](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8288 - Web Linking](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

---
id: m1-3-readable-without-js
module: discoverable
moduleNumber: 1
guidelineNumber: 3
title: 无需 JavaScript 即可渲染内容
complexity: 3
impact: 4
visualChange: low
forterApplies: 'no'
---

# 1.3  无需 JavaScript 即可渲染内容

## 是什么与为什么
首页几乎总是智能体访问的第一个页面，如果它的导航被隐藏或只靠 JavaScript 呈现，智能体从第一步起就是盲的。实时智能体爬虫在**用户提问的那一刻**抓取你的页面，且大多不执行 JavaScript。如果你的首页是一个在客户端水合（hydrate）的 React 空壳，智能体看到的就是一个空的 `<div id="root">`，而你的竞争对手赢得了那个回答。需要修复的界面：服务端渲染的 HTML、每个视觉元素的替代文本（alt）、向量索引可以切块的语义化结构，以及完整的文档 `<head>`，让爬虫能够解析并翻页浏览你的页面。

## 评分
- **工作量 3/5** - 实打实的工程，但有边界。如果你的技术栈已经做服务端渲染，工作量很小；对纯客户端的 React/SPA 应用则相当可观。补齐替代文本是机械劳动但很慢。
- **影响力 4/5** - 出现在 AI 回答里与完全不出现的差别。
- **视觉变化：低** - SSR 渲染对明眼用户不可见；替代文本触达屏幕阅读器；语义化 HTML 不改变像素。

## 步骤
1. **对首页和头部产品页做服务端渲染。** 这是当今 React 和 SPA 网站最大的问题：它们送出一个几乎为空的 HTML 文档，然后在浏览器里组装页面，于是不执行 JavaScript 的智能体什么也看不到。HTML 必须包含唯一一个 `<h1>`、至少 500 个字符的有意义正文，以及作为真实 `<a href>` 链接的主要 CTA。如果你的网站在客户端渲染，把关键页面迁移到服务端渲染（SSR），让标记在离开服务器之前就已完整；如果整体 SSR 迁移超出范围，添加一个预渲染步骤，向已知的爬虫 User-Agent 提供静态 HTML 快照。用 `curl https://example.com | grep -c "<h1"` 验证 - 你要的是 `1`，不是别的。
2. **80% 以上的图片有替代文本。** 多模态智能体把 alt 作为首要信号；图片本身是次要的。审计方式：爬取你的站点地图，统计缺失或为空的 `alt` 的 `<img>` 标签。产品图片按 `{产品名} - {关键属性} - {颜色/尺寸}` 补齐，装饰性图片用 `alt=""`（有意留空，而非缺失）。在 CMS 层面，今后把 alt 设为图片上传时的必填字段。
3. **语义化 HTML，而不是 div 汤。** 每页一个 `<h1>`，`<h2>`/`<h3>` 按文档顺序排列，用 `<nav>`、`<main>`、`<article>`、`<aside>`、`<footer>` 取代 `<div class="nav">`。列表用 `<ul>`/`<ol>`，表格数据放进带 `<thead>`/`<tbody>` 的 `<table>`。向量存储按这些边界切块。
4. **把导航以纯链接形式做服务端渲染。** 主导航必须是服务端渲染 HTML 中的纯 `<a href>` 链接 - 不要只靠 JavaScript 的菜单，不要 `onClick` 路由。这是最大的断点：如果导航只有 JS，智能体看得到首页却无法遍历网站。验证方式：检查 `curl -s https://example.com | grep -c '<a href'` 是否返回合理的数量（典型首页 10+）。
5. **提供智能体会猜测的路径。** 智能体出于习惯会很早探测 `/pricing` 和 `/integrations`，也经常猜 `/api` 但几乎从来找不到。廉价的修法：让 `/docs`、`/pricing`、`/integrations` 和 `/api` 都能解析 - 哪怕 `/api` 只是一个指向你的文档或 RFC 9727 目录的 `302` 重定向。被猜测的路径返回 404，就是一个智能体无法恢复的死胡同。
6. **补全文档 `<head>`。** AI 系统依赖 head 元数据来解析和消歧你的页面。每个页面都需要自引用的 `<link rel="canonical">`、`<html lang>` 属性，以及 Open Graph 标签 - `og:title`、`og:description`、`og:type`，还有一个真正能解析为图片的 `og:image`。在任何分页界面（博客、文档、商品列表）上，添加 `<link rel="next">` / `<link rel="prev">`，让爬虫索引第一页之后的内容，而不是止步于此。
7. **像智能体一样测试。** 目标是以不执行 JavaScript 的爬虫的方式看你的页面：剥掉 CSS、图片和脚本，只剩纯文本。`lynx` 是一个基于终端的纯文本浏览器，渲染的正是这种视图。用爬虫的 User-Agent 抓取页面，然后渲染为文本：
   ```
   curl -sA "ChatGPT-User/1.0" https://example.com -o page.html
   lynx -dump page.html
   ```
   `curl -A` 设置 User-Agent，让你收到与爬虫相同的 HTML；`lynx -dump` 打印剩下的可读文本。对你的前 20 个左右 URL 都这样做。如果一个人读着这份文本导出都回答不了“这家公司是做什么的、这个页面上有什么”，智能体也回答不了。（macOS 上用 `brew install lynx` 安装 lynx，Linux 上用 `apt install lynx`。）

（Schema.org JSON-LD 是独立的一项工作 - 见 [2.1](./m2-1-json-ld.md)。）

## 参考资料
- [Schema.org 词汇表](https://schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google - JavaScript SEO 基础](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [WCAG 2.2 - 非文本内容](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [WAI-ARIA 编写实践](https://www.w3.org/WAI/ARIA/apg/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

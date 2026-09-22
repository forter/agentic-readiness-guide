---
id: m2-1-json-ld
module: comprehensible
moduleNumber: 2
guidelineNumber: 1
title: 发布完整的 JSON-LD 结构
complexity: 2
impact: 4
visualChange: none
forterApplies: 'no'
---

# 2.1  发布完整的 JSON-LD 结构

## 是什么与为什么
JSON-LD 是 LLM 把“那家叫 {你的品牌} 的公司”收敛为单一实体、而不是一串含糊品牌名字符的方式。每页一个 `<script type="application/ld+json">` 块 - 把该页面描述的所有实体打包进一个 `@graph` 数组，声明 `@type`、身份和 `sameAs` 链接 - 这就是被正确概括与被同名的另一家供应商混淆（或更糟，与对方充满敌意的营销文案混淆）之间的差别。额外收益：它还驱动 Google 富媒体结果、Bing AI 快照，以及语音智能体朗读的 speakable 层。

## 评分
- **工作量 2/5** - 模板工作。每种页面类型（首页、产品、博客）一个块，然后从 CMS 元数据自动生成。
- **影响力 4/5** - 对任何名称与其他实体冲突的品牌来说，身份消歧是必需的。
- **视觉变化：无** - JSON-LD 位于 `<script>` 标签内；用户看不到任何不同。

## 步骤
1. **一个 `@graph` 块，每页选对 `@type`。** 把页面描述的每个实体包进单一的 `"@graph": [ ... ]` 数组，而不是散落的多个 `<script>` 标签。给每个节点一个稳定的 `@id`（例如 `https://example.com/#organization`），并通过 `@id` 交叉引用 - 让 `Product` 的 `brand` 指向同一个 `Organization` 节点，智能体就能解析出一个连贯的实体。按页面选择 `@type`：首页和 `/about` 用 `Organization`；产品页用 `Product` 或 `SoftwareApplication`（`applicationCategory`、`offers`，以及诚实时的 `aggregateRating`）；文章用 `Article`（`author`、`datePublished`、`dateModified`）。
2. **补全 `Organization` 块。** 必填：`name`、`url`、`logo`、`description`。加上 `contactPoint`（`contactType`、`email`、`telephone`）和一个作为 `PostalAddress` 的 `address`。
3. **添加 `sameAs` 实体链接。** 指向 Wikipedia、Wikidata（`.../wiki/Q…`）、你的已验证 GitHub 组织、LinkedIn、X、Crunchbase。Wikidata 承重最大 - 它是大多数知识图谱作为主键的那个 ID。
4. **添加 `Speakable` 标记。** 在页面的 `WebPage`/`Article` 节点上附加 `speakable` 属性：`"speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".summary", ".key-stats"] }`，让语音智能体朗读你亲手挑选的摘要，而不是猜出来的某个段落。选择器必须解析到页面上真实存在的元素 - 匹配不到任何东西的 `cssSelector` 是死标记。（`xpath` 是另一种定位方式；注意 schema.org 写作 `xpath`，而 Google 文档写作 `xPath`。）
5. **把词汇表扩展到基础之外。** `Organization`、`Product` 和 `Article` 是下限。添加与你领域匹配的类型 - 帮助页面用 `FAQPage`，每项服务用 `Service`，诚实时用 `Review` / `AggregateRating`，导航用 `BreadcrumbList`，实体门店用 `LocalBusiness`。每一个类型都对应一类智能体可以从结构化数据直接回答、而不必猜测的问题。
6. **用真实的信任锚点页面支撑 schema。** 第 2 步的 `contactPoint` 和 `address` 必须解析到真实的东西：有真实历史的 `/about`、渠道可用的 `/contact`、有实际政策的 `/privacy` - 每个都要有 500 字符以上的实质性文本，不是占位残页。智能体在推荐你之前会探测这些页面来判断合法性；空洞的信任页面读起来就是危险信号。
7. **验证。** 用 Google 的[富媒体结果测试](https://search.google.com/test/rich-results?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)和 [Schema.org 验证器](https://validator.schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)跑一遍每种页面类型。修复警告，而不只是错误 - 智能体比 Google 的渲染管道更严格。

综合起来，一个首页块把组织、产品、`FAQPage` 和 speakable 选择器打包进一个 `@graph`，用 `@id` 交叉链接：

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Acme",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "description": "用一句话、面向模型地描述 Acme 是做什么的。",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "sales@example.com",
        "url": "https://example.com/contact"
      },
      "sameAs": [
        "https://en.wikipedia.org/wiki/Acme",
        "https://www.wikidata.org/wiki/Q12345678",
        "https://github.com/acme",
        "https://www.linkedin.com/company/acme"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://example.com/#software",
      "name": "Acme Platform",
      "applicationCategory": "BusinessApplication",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#organization" },
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/contact",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "ratingCount": "29"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://example.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Acme 是做什么的？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "一段直接、基于事实、智能体可以逐字引用的两句话回答。"
          }
        },
        {
          "@type": "Question",
          "name": "我的 AI 智能体可以与 Acme 集成吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以 - Acme 发布了 MCP 服务器、REST API 和 OpenAPI 3.x 规范。参见 https://example.com/AGENTS.md。"
          }
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://example.com/#webpage",
      "url": "https://example.com",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".hero-subtitle", ".key-stats"]
      }
    }
  ]
}
```

## 参考资料
- [Schema.org Organization](https://schema.org/Organization?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org sameAs](https://schema.org/sameAs?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Speakable](https://schema.org/SpeakableSpecification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org FAQPage](https://schema.org/FAQPage?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google 富媒体结果测试](https://search.google.com/test/rich-results?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

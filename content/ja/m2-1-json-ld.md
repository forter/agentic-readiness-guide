---
id: m2-1-json-ld
module: comprehensible
moduleNumber: 2
guidelineNumber: 1
title: 完全な JSON-LD 構造を公開する
complexity: 2
impact: 4
visualChange: none
forterApplies: 'no'
---

# 2.1  完全な JSON-LD 構造を公開する

## 概要と理由
JSON-LD は、LLM が「{あなたのブランド} という会社」を、曖昧なブランド名の文字列ではなく単一のエンティティへと収束させる方法です。ページごとに1つの `<script type="application/ld+json">` ブロック - そのページが記述するすべてのエンティティを `@graph` 配列にまとめ、`@type`、アイデンティティ、`sameAs` リンクを宣言する - が、正しく要約されるか、それとも同名の別ベンダー（あるいはもっと悪いことに、別ベンダーの敵対的なマーケティングコピー）と混同されるかの分かれ目です。おまけに、これは Google リッチリザルト、Bing AI スナップショット、そして音声エージェントが読み上げる speakable レイヤーを動かします。

## スコアリング
- **工数 2/5** - テンプレート作業です。ページタイプ（ホーム、製品、ブログ）ごとに1ブロックを作り、あとは CMS のメタデータから自動化します。
- **インパクト 4/5** - アイデンティティの曖昧さ解消は、名前が別のエンティティと衝突するあらゆるブランドにとって不可欠です。
- **視覚的変化: なし** - JSON-LD は `<script>` タグの中に存在し、ユーザーには何の違いも見えません。

## 手順
1. **1つの `@graph` ブロックに、ページごとに正しい `@type` を。** ページが記述するすべてのエンティティを、散らばった `<script>` タグではなく、単一の `"@graph": [ ... ]` 配列で包んでください。各ノードに安定した `@id`（例: `https://example.com/#organization`）を与え、`@id` で相互参照します - こうすれば、`Product` の `brand` が同じ `Organization` ノードを指し、エージェントはひとつの一貫したエンティティを解決します。ページごとに `@type` を選んでください。ホームページと `/about` には `Organization`、製品ページには `Product` または `SoftwareApplication`（`applicationCategory`、`offers`、正直な場合は `aggregateRating`）、投稿には `Article`（`author`、`datePublished`、`dateModified`）。
2. **`Organization` ブロックを完成させる。** 必須: `name`、`url`、`logo`、`description`。さらに `contactPoint`（`contactType`、`email`、`telephone`）と、`PostalAddress` としての `address` を追加します。
3. **`sameAs` のエンティティリンクを追加する。** Wikipedia、Wikidata（`.../wiki/Q…`）、検証済みの GitHub org、LinkedIn、X、Crunchbase を指します。Wikidata は要となります - ほとんどのナレッジグラフがキーにする ID だからです。
4. **`Speakable` マークアップを追加する。** ページの `WebPage`/`Article` ノードに `speakable` プロパティを付けます: `"speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".summary", ".key-stats"] }`。こうすれば、音声エージェントは推測した段落ではなく、あなたが厳選した要約を読み上げます。セレクタはページ上の実在する要素に解決されなければなりません - 何にもマッチしない `cssSelector` は死んだマークアップです。（`xpath` が代替のロケータです。schema.org は `xpath` と綴る一方、Google のドキュメントは `xPath` と綴る点に注意してください。）
5. **基本を超えてボキャブラリーを広げる。** `Organization`、`Product`、`Article` は最低ラインです。ドメインに適した型を追加してください - ヘルプページには `FAQPage`、提供内容ごとに `Service`、正直な場合は `Review` / `AggregateRating`、ナビゲーションには `BreadcrumbList`、物理的な店舗には `LocalBusiness`。それぞれが、エージェントが推測する代わりに構造化データから答えられる質問のクラスです。
6. **スキーマを実在する信頼の起点 (trust-anchor) ページで裏付ける。** 手順2の `contactPoint` と `address` は、実在する何かに解決されなければなりません。本物の沿革のある `/about`、機能する連絡手段のある `/contact`、実際のポリシーのある `/privacy` - それぞれ500文字以上の実質的なテキストであり、スタブではありません。エージェントは、あなたを推薦する前にこれらを調べて正当性を判断します。空の信頼ページは危険信号として読まれます。
7. **検証する。** すべてのページタイプを Google の [リッチリザルトテスト](https://search.google.com/test/rich-results?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) と [Schema.org バリデーター](https://validator.schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) にかけてください。エラーだけでなく警告も修正します - エージェントは Google のレンダリングパイプラインより厳格です。

これらをまとめると、ホームページのブロックは、organization、product、`FAQPage`、speakable セレクタを1つの `@graph` にまとめ、`@id` で相互リンクします。

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
      "description": "Acme が何をするのかを、モデル向けに1文で説明したもの。",
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
          "name": "Acme は何をする会社ですか?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "エージェントがそのまま引用できる、直接的で事実に基づく2文の回答。"
          }
        },
        {
          "@type": "Question",
          "name": "私の AI エージェントは Acme と連携できますか?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "はい - Acme は MCP サーバー、REST API、OpenAPI 3.x 仕様を公開しています。https://example.com/AGENTS.md を参照してください。"
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

## 参考資料
- [Schema.org Organization](https://schema.org/Organization?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org sameAs](https://schema.org/sameAs?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Speakable](https://schema.org/SpeakableSpecification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org FAQPage](https://schema.org/FAQPage?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google リッチリザルトテスト](https://search.google.com/test/rich-results?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

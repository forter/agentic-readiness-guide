---
id: m1-1-discovery-files
module: discoverable
moduleNumber: 1
guidelineNumber: 1
title: ディスカバリーファイルを公開する
complexity: 1
impact: 4
visualChange: none
forterApplies: 'no'
---

# 1.1  ディスカバリーファイルを公開する

## 概要と理由
オリジンのルートに置く4つの小さな静的テキストファイルが、AI エコシステム全体に対して、あなたが何を持っていて、それで何ができるのかを伝えます。`sitemap.xml`、`robots.txt`、`llms.txt`、`index.md` の4つです。これらは書くのに半日もかからず、ライブのエージェントクローラー（収益につながる）を歓迎しつつ、学習クローラー（収益につながらない）を制限できます。5つ目のサーフェスはファイルですらありません。これらのリソースを広告する HTTP `Link:` レスポンスヘッダーで、これにより、エージェントは HTML を1行も解析することなく `HEAD` リクエストからリソースを解決できます。これは **ポリシー** の層であって、強制の層ではない点に注意してください - 行儀のよいボットだけがこれを尊重します。

## スコアリング
- **工数 1/5** - 半日でひと通り、ほとんどがテキストファイルです。最も難しいのは、CMS に `<lastmod>` を正しく出力させることです。
- **インパクト 4/5** - 基盤となります。モジュール2〜5は、まずここであなたを見つけられないものからは評価すらされません。
- **視覚的変化: なし** - 機械専用のパス（`/robots.txt`、`/llms.txt`、`/index.md`）に新しいファイルが増えるだけで、レンダリングされるページは変わりません。

## 手順
1. **サイトマップ。** サイトマップは、クローラーがリンクから推測する代わりに、取得する価値のあるすべての URL を最速で知る手段です。`/sitemap.xml` を提供し、インデックス可能なすべての URL を、正確な `<lastmod>` ISO-8601 タイムスタンプとともに列挙してください - そのタイムスタンプこそ、ページが変更され再読み込みの価値があることをエージェントに伝えるシグナルです。各ファイルは 50 MB / 50,000 URL を上限とし、より大規模なサイトでは [サイトマップインデックス](https://www.sitemaps.org/protocol.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) を使ってください。`/sitemap.xml` はクローラーが最初に探るパスなので、もしサイトマップがすでに別の場所（`/sitemap_index.xml`、CMS が生成する URL）にあるなら、移動する必要はありません - `/sitemap.xml` から実際の場所への `301` リダイレクトを追加すれば、慣例的なパスが解決されます。
2. **AI ポリシーを差別化した robots.txt。** `robots.txt` は、クローラーとの交戦規則を定める場所です - そして今日の有用なニュアンスは、すべての AI クローラーが同じではないということです。買い物客の質問に答えるためにページを取得するエージェントは、あなたに売上をもたらしうる一方、モデルを学習させるためにスクレイピングするクローラーは何も返してくれません。Cloudflare 発祥の慣例である [Content Signals](https://blog.cloudflare.com/content-signals-policy/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) を使えば、どちらがどちらなのかを宣言できます。サイトマップを参照したうえで、3つのシグナルを設定してください。
   - `search` - このページを検索クエリ（クラシック検索と AI 駆動の検索の両方）に答えるためにインデックスしてよいか。
   - `ai-input` - このページをクエリ時点で取得し、AI の回答に投入してよいか（ライブ取得 / RAG）。
   - `ai-train` - このページを AI モデルの学習データとして使ってよいか。

   `search=yes, ai-input=yes, ai-train=no` が、ほとんどのサイトが望む構成です - ライブのトラフィックを送ってくるエージェントを歓迎し、学習のためだけに収集するクローラーを断ります。これを明示したうえで、まだすべてのクローラーがシグナルを尊重するわけではないので、名指しした学習クローラーは正面からブロックしてください。
   ```
   Sitemap: https://example.com/sitemap.xml

   User-agent: *
   Content-Signal: search=yes, ai-input=yes, ai-train=no

   User-agent: GPTBot
   Disallow: /

   User-agent: CCBot
   Disallow: /
   ```
3. **llms.txt。** あなたの HTML ホームページは人間向けに作られており - ナビゲーション、マーケティング、スクリプト - エージェントはわずかな事実を見つけるために、その全部をかき分ける必要があります。[`llms.txt`](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) は、代わりにモデル向けに書かれたプレーンな Markdown のブリーフィングです。あなたが何をするのか、誰に向けたものか、エージェントがあなたで何ができるのか、そして API やドキュメントへのリンクを、短く構造化して要約したものです。`/llms.txt` に公開し、製品概要、ユースケース、制約のセクションを設けてください。初日から完璧な文章である必要はありません - よく構造化されたスタブで始めるには十分で、内容の質は [2.2](./m2-2-llms-txt-content.md) で扱います。
4. **モジュール化された llms.txt。** 単一のルート `llms.txt` は、長くならずにあらゆることを深掘りすることはできません。領域ごとのバリアント - `/docs/llms.txt`、`/api/llms.txt`、`/developers/llms.txt` - を追加して、特定のタスクに取り組むエージェントが必要なコンテキストのスライスだけを引けるようにしてください。各ファイルは焦点を保ち、あなたはモデルのアテンション予算の範囲内に収まります。
5. **Markdown のホームページフォールバック。** 一部のエージェントは、HTML を解析する手間をかける前に `/index.md` - ホームページのクリーンな Markdown 版 - を探します。それを用意してあげてください（Content-Type `text/markdown`）。トップレベルの見出しと、ホームページの HTML が持つのと同じ中核的な価値提案テキストを含めます。マークアップを取り除く手間をエージェントから省く、2分でできるファイルです。
6. **（任意）`Link` レスポンスヘッダー（[RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)）。** 上記のすべては既知のパスに存在しますが、エージェントはそれを見つけるために各ファイルをリクエストしなければなりません。`Link:` レスポンスヘッダーを使えば、それらすべてを HTTP レスポンス自体の中で広告でき、エージェントは単一の `HEAD` リクエストからあなたのファイルセット全体を発見できます - HTML 解析は一切不要です。ここでは最も技術的な手順であると同時に最もインパクトが小さいので、4つのファイルが揃った後の「あると望ましい」項目として扱ってください。`Link: </sitemap.xml>; rel="sitemap"`、`Link: </llms.txt>; rel="describedby"`、`Link: </.well-known/api-catalog>; rel="api-catalog"`、`Link: </openapi.json>; rel="service-desc"` を出力します。後ろの2つは [4.1](./m4-1-openapi-spec.md) がオンラインにするファイルを指しますが - パスは今日すでに確定しているので、設定した瞬間にヘッダーは正しく、4.1 が着地したときに解決され始めます。これらのヘッダーをすべてのページに追加して、どのページも一貫して広告するようにしてください。

**結果を検証する。** `curl -I` は HTTP `HEAD` リクエストを送り、ボディを一切表示せずにレスポンスヘッダーだけを出力します - これは、パスが存在し、`200` を返し、正しい `Content-Type` を持つことを確認する最速の方法です。公開した各ファイルに対して実行してください。

```
curl -I https://example.com/llms.txt
```

健全なレスポンスは次のようになります。

```
HTTP/2 200
content-type: text/markdown; charset=utf-8
content-length: 1843
```

`/sitemap.xml`、`/robots.txt`、`/llms.txt`、`/index.md` を同じ方法でチェックしてください - それぞれで、`200` ステータスと妥当な `content-type` が得られることを確認します。手順6を完了したなら、ホームページに対する `curl -I https://example.com` にも `Link:` ヘッダーが一覧表示されるはずです。`-I` を外せば、ヘッダーと一緒にボディも取得できます。

## 参考資料
- [sitemaps.org プロトコル](https://www.sitemaps.org/protocol.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cloudflare Content Signals](https://blog.cloudflare.com/content-signals-policy/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [llms.txt 提案](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8288 - Web Linking](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

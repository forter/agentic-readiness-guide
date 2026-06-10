---
id: m1-3-readable-without-js
module: discoverable
moduleNumber: 1
guidelineNumber: 3
title: JavaScript なしでコンテンツを描画する
complexity: 3
impact: 4
visualChange: low
forterApplies: 'no'
---

# 1.3  JavaScript なしでコンテンツを描画する

## 概要と理由
ライブのエージェントクローラーは、**ユーザーが質問した瞬間に** あなたのページを取得しますが、そのほとんどは JavaScript を実行しません。あなたのホームページがクライアントサイドでハイドレートする React のシェルだった場合、エージェントには空の `<div id="root">` しか見えず、答えは競合に取られてしまいます。修正すべきサーフェスは、サーバーレンダリングされた HTML、すべてのビジュアルへの代替テキスト (alt)、ベクトルインデックスがチャンク化できる意味的構造、そして、クローラーがページを解決しページネーションできるようにする完全なドキュメント `<head>` です。

## スコアリング
- **工数 3/5** - 本物のエンジニアリングですが、範囲は限られます。スタックがすでにサーバーサイドでレンダリングしているなら小さく、クライアント専用の React / SPA アプリならかなりの作業です。alt テキストの後埋めは機械的ですが時間がかかります。
- **インパクト 4/5** - AI の回答に現れるか、まったく現れないかの違いです。
- **視覚的変化: 小** - SSR レンダリングは目の見えるユーザーには不可視で、alt テキストはスクリーンリーダーに届き、意味的 HTML はピクセルを変えません。

## 手順
1. **ホームページと主要な製品ページをサーバーレンダリングする。** これは今日の React や SPA ベースのサイトにおける最大の問題です。これらはほぼ空の HTML ドキュメントを送り、ブラウザでページを組み立てるため、JavaScript を実行しないエージェントには何も見えません。HTML には、単一の `<h1>`、少なくとも500文字の意味のある本文、そして主要な CTA を実在する `<a href>` リンクとして含まなければなりません。サイトがクライアントサイドでレンダリングしているなら、マークアップがサーバーを離れる前に完成しているよう、主要ページをサーバーサイドレンダリング (SSR) に移してください。完全な SSR 移行が範囲外なら、既知のクローラー User-Agent に静的 HTML のスナップショットを返すプリレンダリング手順を追加します。`curl https://example.com | grep -c "<h1"` で検証してください - 欲しいのは `1` であり、それ以外ではありません。
2. **画像の80%以上に alt テキストを付ける。** マルチモーダルエージェントは alt を主要なシグナルとして読み、画像そのものは二次的です。サイトマップをクロールして、`alt` が欠けている、または空の `<img>` タグを数えて監査してください。製品画像は `{製品名} - {主要な属性} - {色/サイズ}` で後埋めし、装飾的な画像は `alt=""`（欠けているのではなく、意図的に空）にします。CMS レベルでは、今後の画像アップロード時に alt を必須フィールドにしてください。
3. **div スープではなく意味的 HTML。** ページごとに `<h1>` を1つ、`<h2>`/`<h3>` をドキュメント順に、そして `<div class="nav">` ではなく `<nav>`、`<main>`、`<article>`、`<aside>`、`<footer>` を使います。リストは `<ul>`/`<ol>`、表形式データは `<thead>`/`<tbody>` を伴う `<table>` で。ベクトルストアはこれらの境界でチャンク化します。
4. **ドキュメントの `<head>` を完成させる。** AI システムは、ページを解決し曖昧さを解消するために head のメタデータに依存します。すべてのページには、自己参照的な `<link rel="canonical">`、`<html lang>` 属性、そして Open Graph タグ - `og:title`、`og:description`、`og:type`、そして実際に画像へ解決される `og:image` - が必要です。ページネーションされるあらゆるサーフェス（ブログ、ドキュメント、製品一覧）には、`<link rel="next">` / `<link rel="prev">` を追加して、クローラーが1ページ目で止まらず、その先までインデックスできるようにしてください。
5. **エージェントのようにテストする。** 目標は、JavaScript を実行しないクローラーが見るのと同じように - CSS、画像、スクリプトを取り除き、プレーンテキストに落として - ページを見ることです。`lynx` は、まさにそれを描画するターミナルベースのテキスト専用ブラウザです。クローラーの User-Agent でページを取得し、それをテキストに描画してください。
   ```
   curl -sA "ChatGPT-User/1.0" https://example.com -o page.html
   lynx -dump page.html
   ```
   `curl -A` は User-Agent を設定して、クローラーが受け取るのと同じ HTML を受け取れるようにし、`lynx -dump` は残った読める範囲のテキストを出力します。これをあなたの上位約20の URL に対して行ってください。そのテキストダンプを読んだ人間が「この会社は何をしていて、このページには何があるのか」に答えられないなら、エージェントにも答えられません。（lynx は macOS なら `brew install lynx`、Linux なら `apt install lynx` でインストールします。）

（Schema.org の JSON-LD はそれ自体が独立したジョブです - [2.1](./m2-1-json-ld.md) を参照。）

## 参考資料
- [Schema.org ボキャブラリー](https://schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google - JavaScript SEO の基本](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [WCAG 2.2 - 非テキストコンテンツ](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

---
id: m4-10-nlweb
module: actionable
moduleNumber: 4
guidelineNumber: 10
title: NLWeb エンドポイントを運用する
complexity: 3
impact: 3
visualChange: none
forterApplies: 'yes'
---

# 4.10  NLWeb エンドポイントを運用する

## 概要と理由
NLWeb は、サイトのコンテンツを、スクレイプするのではなくエージェントが *会話できる* ものに変えるための、新興のオープン標準です。あなたは構造化コンテンツを **Schema Feeds** として公開し、NLWeb サーバーがそれを取り込み、単一の標準エンドポイント - `POST /ask` - を公開します。これは、そのコンテンツに対する自然言語の質問に答え、構造化された JSON を返します。すべての NLWeb インスタンスは MCP サーバーでもあるので、同じ `/ask` サーフェスは、素の HTTP エンドポイントとしても、MCP ツールとしても到達可能です。これを、あなたのサイトマップの会話版だと考えてください。サイトマップはページを列挙し、NLWeb はそれらについての質問に答えます。

まだ初期段階で - 仕様はまだ動いており、採用は薄い - ですが、あなたがすでに持っているはずの構造化データ（[2.1](./m2-1-json-ld.md)）の上に立ち上げるのは安価で、エージェントがクロールせずに「X を扱っていますか?」や「返品期限はどれくらいですか?」と尋ねられるようにする、最もクリーンな方法です。

## スコアリング
- **工数 3/5** - Schema Feeds の公開は半日、既存の検索をラップする最小限の `/ask` はささやかなものです。ベクトルストアとモデルを備えた完全なサーバーが本当の作業ですが、オープンソースの NLWeb ツールキットがそのほとんどを行います。
- **インパクト 3/5** - 新興標準ならではの伸びしろ。今日は低いですが、会話型の取得が成熟するにつれて中心的になる可能性があります。低コストを考えれば、下振れのリスクはほぼゼロです。
- **視覚的変化: なし** - robots.txt の `Schemamap` の行、フィードファイル、`/ask` エンドポイント - すべて機械専用です。

## 手順
1. **Schema Feeds を公開する。** robots.txt に1行 - `Schemamap: https://example.com/.well-known/schema-map.xml` - を追加し、あなたが公開する任意の JSONL または RSS フィード（製品フィード、ブログフィード、FAQ フィード）を指す Schema Map XML を提供します。フィードのアイテムは Schema.org の型を運ぶので、[2.1](./m2-1-json-ld.md) の構造化データの作業が、NLWeb が取得する元のコーパスになります。
2. **最小限の `POST /ask` から始める。** プロトコル全体は1つのエンドポイントに集約され、実用最小限の版はベクトルストアもモデルも不要です - 受け取った質問を、既存の検索エンドポイントや検索ツールにそのまま転送できます。リクエストは自然言語の `query` を運ぶ JSON ボディで、レスポンスはランク付けされた構造化結果に `_meta` ブロックを加えたものです。
   ```json
   {
     "results": ["...ランク付けされた構造化マッチ..."],
     "_meta": { "response_type": "...", "version": "..." }
   }
   ```
   2つの `_meta` フィールド - `response_type` と `version` - は、クライアントが準拠した NLWeb サーバーと話していることを確認できるようにするものです。`/ask` は公開・無認証に保ってください。摩擦のないエージェント取得こそが、まさに狙いです。
3. **（任意）完全な NLWeb サーバーに拡張する。** 検索のパススルーではなく本物の自然言語取得が欲しくなったら、オープンソースの NLWeb ツールキットを採用します。これはあなたの Schema Feeds をベクトルストアに取り込み、LLM バックエンドに配線します。手順1のフィードに向け、スケジュールで再インデックスして、回答が古いスナップショットではなくライブのカタログを追うようにします。
4. **ストリーミングをサポートする。** クライアントがストリームされたレスポンスを求めたら、1つのブロッキング JSON ボディではなく、結果を Server-Sent Events として逐次返します - [4.3](./m4-3-streaming.md) と同じ SSE の規律です。長い回答は応答性よく感じられ、短い回答は追加コストがかかりません。
5. **両方のサーフェスを検証する。** 代表的な質問で `/ask` エンドポイントを `curl` し、`_meta` フィールドを確認します。次に、MCP 越しに同じサーバーに接続し、`ask` ツールが現れることを確認します。MCP ハンドシェイクに失敗する NLWeb サーバーは、半分しかデプロイされていません。

## 参考資料
- [NLWeb project](https://github.com/microsoft/NLWeb?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org ボキャブラリー](https://schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [HTML Living Standard - Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

ベクトルストア、取り込みパイプライン、モデルバックエンドを立ち上げるのが、自分で持ちたい以上のことなら、[**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-10-nlweb) が NLWeb サーバーをあなたのためにホストできます。それをあなたの Schema Feeds に向ければ、Forter は準拠した `POST /ask` エンドポイントをあなたのドメイン配下に公開し - 素の HTTP としても、すべての NLWeb インスタンスが同じく公開する MCP ツールとしても到達可能 - スケジュールで再取り込みして、回答がライブのカタログを追うようにします。

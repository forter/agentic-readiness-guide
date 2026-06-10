---
id: m1-2-well-known-agent-files
module: discoverable
moduleNumber: 1
guidelineNumber: 2
title: well-known エージェントファイルを設置する
complexity: 1
impact: 3
visualChange: none
forterApplies: 'partial'
---

# 1.2  well-known エージェントファイルを設置する

## 概要と理由
`/.well-known/` 配下に置く4つの小さな JSON ファイルが、4つの異なるエージェントエコシステムをカバーします。`ai-plugin.json`（OpenAI）、`agent.json`（汎用）、`agent-card.json`（Google A2A）、そして MCP ディスカバリードキュメントです。それぞれ30行未満です。いくつかは後のモジュールで初めてオンラインになるエンドポイントを参照しますが - すべてのパスは今日わかっているので、各ファイルを最終的な URL とともに一度だけ正しく書けば、二度と開く必要はありません。

## スコアリング
- **工数 1/5** - 4つの JSON ファイルと、一度きりのコピー方針の決定です。最も難しいのは、正式名称と説明文、スコープ、連絡先メールアドレスを確定させることです。
- **インパクト 3/5** - すべてのエージェントがまだこれらを使うわけではないので 1.1 より低いですが、対応しているプラットフォームでは一級のプラグイン / カードのサーフェスを解放します。
- **視覚的変化: なし** - `/.well-known/*` パスのファイルであり、サイト上でユーザーに見える変化はありません。

## 手順
1. **まず正式コピーを確定する。** 名前と説明であふれた4つのマニフェストを書く前に、それらを一度だけ決めてください。短い製品名1つ（40文字以下）、モデル向けの説明1つ（120文字以下）、人間向けの段落1つ（400文字以下）です。これらを、リポジトリ内の唯一の信頼できる情報源 (single source of truth) となるファイル（例: `brand-copy.md`）にコミットしてください。ここから先、本ガイドが求めるすべての名前・説明フィールド - これらのマニフェスト、JSON-LD（[2.1](./m2-1-json-ld.md)）、`llms.txt`（[2.2](./m2-2-llms-txt-content.md)）、MCP ツール一覧（[4.4](./m4-4-mcp-server.md)）、meta タグや OG タグ - は、**このファイルからコピーするのであって、二度と即興で書き直さないでください**。この一つの規律こそ、[5.3](./m5-3-cross-platform-consistency.md) を書き直しではなく5分の検証作業に変えるものです。
2. **`/.well-known/ai-plugin.json`** - OpenAI のプラグインマニフェスト、`application/json` として提供します。
   ```json
   {
     "schema_version": "v1",
     "name_for_human": "Acme Returns",
     "name_for_model": "acme_returns",
     "description_for_human": "Acme のどの注文でも、注文状況の確認と返品の開始ができます。",
     "description_for_model": "確認済みの顧客に代わって、Acme の注文状況を照会し、返品を開始します。",
     "auth": { "type": "oauth", "authorization_url": "https://example.com/.well-known/oauth-authorization-server" },
     "api": { "type": "openapi", "url": "https://example.com/openapi.json" },
     "logo_url": "https://example.com/logo.png",
     "contact_email": "agents@example.com",
     "legal_info_url": "https://example.com/legal"
   }
   ```
   上記のキー名はそのまま必須です。値はプレースホルダーなので - あなたの正式コピーと実際の URL に置き換えてください。`auth` は [3.1](./m3-1-oauth-discovery.md) の OAuth エンドポイントを、`api.url` は [4.1](./m4-1-openapi-spec.md) の `/openapi.json` を指します - いずれも後のモジュールで提供されるエンドポイントです。それらのパスはすでに決まっているので、**最終的な URL を今書いてください**。ファイルは保存した瞬間に正しく、それらのガイドラインが着地するにつれて単に解決され始めます。プレースホルダーも、二度目の訪問も不要です。
3. **`/.well-known/agent.json`** - Claude 連携やいくつかの小規模レジストリで使われる汎用エージェントマニフェスト。ai-plugin の形を踏襲します。
   ```json
   {
     "name": "Acme Returns",
     "description": "Acme のどの注文でも、注文状況の確認と返品の開始ができます。",
     "version": "1.0.0",
     "endpoints": { "openapi": "https://example.com/openapi.json" },
     "auth": { "type": "oauth", "authorization_url": "https://example.com/.well-known/oauth-authorization-server" },
     "capabilities": ["order-status", "returns"]
   }
   ```
   `description` はツールピッカーに表示される文言です - これはあなたの正式コピーからそのまま来ます。
4. **`/.well-known/agent-card.json`** - Google の A2A（Agent-to-Agent）プロトコルカード。`skills` 配列が実質的な中身です。エージェントがあなたに委ねられるタスク1つにつき1エントリで、それぞれに例文 (example utterances) を添え、呼び出し側のエージェントがいつあなたにルーティングすべきかを判断できるようにします。
   ```json
   {
     "name": "Acme Returns",
     "description": "Acme のどの注文でも、注文状況の確認と返品の開始ができます。",
     "url": "https://example.com",
     "version": "1.0.0",
     "capabilities": { "streaming": false },
     "defaultInputModes": ["text/plain"],
     "defaultOutputModes": ["text/plain"],
     "skills": [
       {
         "id": "order-status",
         "name": "注文状況",
         "description": "注文の現在の状況を照会します。",
         "tags": ["orders", "tracking"],
         "examples": ["注文番号1234はどこ?", "荷物はもう発送された?"]
       }
     ]
   }
   ```
5. **MCP ディスカバリー。** `/.well-known/mcp.json` を公開するか、`/.well-known/mcp` からそのファイルへの `307` リダイレクトを設定します。
   ```json
   {
     "mcpServers": [
       {
         "name": "acme",
         "url": "https://mcp.example.com",
         "transport": "streamable-http"
       }
     ]
   }
   ```
   MCP サーバーの正式 URL を今決めてください。[4.4](./m4-4-mcp-server.md) が後でエンドポイントをオンラインにしますが、ディスカバリーファイルは書いた瞬間に正しく、4.4 が着地したときに解決され始めます。プレースホルダーは不要です。
6. **`curl` で検証する。** 4つの well-known ファイルはすべて、今日の時点で `200`、`Content-Type: application/json` を返し、問題なくパースできなければなりません - これらは今提供する静的ファイルです。それらが *指す* エンドポイント（OpenAPI、OAuth、MCP）は、モジュール3と4が着地するにつれて後で解決されます。CMS のデプロイがそれらをひそかに壊さないよう、4つのファイルを CI のスモークテストに追加してください。

## 参考資料
- [OpenAI Plugin Manifest](https://openai.com/index/chatgpt-plugins/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [A2A (Agent2Agent) Agent Card 仕様](https://a2a-protocol.org/latest/specification/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)（[リポジトリ](https://github.com/a2aproject/A2A?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)）
- [Model Context Protocol - discovery](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

[**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m1-2-well-known-agent-files) のホスト型 MCP ゲートウェイを使う場合、Forter が MCP 関連の well-known ファイル（`/.well-known/mcp.json` と任意の MCP ディスカバリーリダイレクト）を公開・保守します - サーバー URL、トランスポート宣言、バージョン固定は、MCP 仕様が変化しても最新の状態に保たれます。これらのファイルはあなたのオリジンではなく Forter のインフラから提供されます。エージェントがすべてのディスカバリーファイルを一か所から取得できるよう、これらがあなた自身のドメイン配下でも解決されるリバースプロキシのルールを追加することを推奨します。

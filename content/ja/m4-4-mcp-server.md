---
id: m4-4-mcp-server
module: actionable
moduleNumber: 4
guidelineNumber: 4
title: MCP サーバーを運用する
complexity: 4
impact: 5
visualChange: none
forterApplies: 'flagship'
---

# 4.4  MCP サーバーを運用する

## 概要と理由
これが、ネイティブなエージェント呼び出しのための **唯一無二** の連携ポイントです。Streamable HTTP 上の MCP サーバーがあれば、ChatGPT、Claude、Gemini、そして任意の function-calling LLM が、あなたのツールをネイティブに呼び出せます - スクレイピングなし、グルーコードなし、「それからユーザーに API キーを貼り付けてもらいます」もなし。サーバーに公開された server-card を組み合わせれば、今日の主要なエージェントランタイムがあなたのビジネスロジックに到達する方法をカバーできます。（ブラウザ常駐のエージェントは別のサーフェスです - それが WebMCP、[4.5](./m4-5-webmcp.md) です。）

これはまた、エージェントの逸脱が最も大きな帰結をもたらす層でもあります - MCP のツール呼び出しは **本物のビジネスロジック**（注文、返金、決済）を動かします。ツールごとの OAuth スコープ（[3.1](./m3-1-oauth-discovery.md) より）は、たとえ呼び出し側のエージェントが取得ページ内のプロンプトインジェクションで進路を逸らされても、あらゆる1回の呼び出しができることを境界づけます。運用上、十分に実体のある作業なので、ほとんどのチームはゲートウェイ側を出荷するために Forter と組みます。

## スコアリング
- **工数 4/5** - 本物の MCP サーバー（Streamable HTTP、OAuth に紐づくセッション、ツールごとの認可）、加えてツール注釈と読み取り専用リソース、加えて WebMCP、加えて公開された server-card、加えて呼び出しごとの可観測性。既製の MCP フレームワークが助けになります。
- **インパクト 5/5** - 本ガイドで最もレバレッジの効く単一のエンドポイントです。重要なすべてのエージェントランタイムは、まず MCP を消費します。
- **視覚的変化: なし** - `/mcp` エンドポイントと `/.well-known/mcp/server-card.json` は機械専用です。ユーザーに見えるページの変化はありません。

## 手順
1. **Streamable HTTP トランスポートで MCP サーバーを実装する。** `/mcp`（または `mcp.yourdomain.com`）にマウントします。ツールリストを [4.1](./m4-1-openapi-spec.md) の OpenAPI 仕様から直接コンパイルします。各 `operationId` がツールになり、各リクエストスキーマがツールの入力スキーマに、各レスポンススキーマが出力スキーマになります。手作業でのツール作成は乖離しますが、生成は乖離しません。
2. **すべてのツール呼び出しを OAuth ベアラートークンに紐づける。** [3.1](./m3-1-oauth-discovery.md) の認可サーバーを再利用します。ツールは呼び出し側のスコープのもとで実行されます - `orders:read` を持つエージェントは、たとえ試みても `payments:write` を呼び出せません。トークンがない、期限切れ、スコープ不足の呼び出しは、[4.2](./m4-2-rate-limits-and-errors.md) と同じ構造化されたエラーエンベロープ（`type: "insufficient_scope"`、`retry_hint: "do_not_retry"`）で拒否します。これが、エージェントが意図から逸脱したときに被害範囲を封じ込める層です。
3. **server-card を `/.well-known/mcp/server-card.json` に公開する。** 必須フィールド: `name`、`description`、`version`、`serverUrl`、`transport: "streamable-http"`、`authorization`（[3.1](./m3-1-oauth-discovery.md) の RFC 8414 / 9728 メタデータにリンク）、そして `{name, description, inputSchema, outputSchema}` を持つ `tools[]`。
4. **すべてのツールに振る舞いの注釈を宣言する。** 各ツールに `annotations.readOnlyHint` と `annotations.destructiveHint` をタグ付けして、どの呼び出しが安全にリトライ・自動承認できて、どれが状態を変えるかをホストが把握できるようにします - `getOrderStatus` は `readOnlyHint: true` で、`cancelOrder`、`initiateReturn`、`disputeCharge` は `destructiveHint: true` です。エージェントはこれを読んで、いつユーザーの確認のために一時停止するかを判断します。注釈のない状態変更ツールは、ブロックされるか、安全のための確認なしに呼ばれるかのどちらかです。
5. **読み取り専用のコンテキストを MCP リソースとして公開する。** ツールはアクションのためのもので、**リソース** は、行動する *前に* エージェントが読むコンテキスト - カタログ、価格表、状態のスナップショット、ドキュメント - のためのものです。`initialize` ハンドシェイクで `resources` 能力を広告し、`resources/list` と `resources/read` を実装します。各リソースには、安定した URI、正確な `mimeType`、空でないボディが必要です。`pricing://current` をリソースとして読めるエージェントは、「これはいくらか?」に答えるためだけにツール呼び出し（とスコープ）を費やす必要がありません。
6. **すべての呼び出しを観測する。** すべてのツール呼び出しを `{tool_name, client_id, sub, request_id, latency_ms, status, error_type}` でログに記録します。ツールごとのレイテンシ / エラー予算に集約し、それにアラートを設定します。これがあなたのフォレンジック監査証跡です - エージェントが逸脱してツール呼び出しを意図しない形で連鎖させたとき、それを捉えるレンズです。（可観測性が固まったら、[4.6](./m4-6-agent-registries.md) に従ってサーバーをレジストリ - mcp.run、mcphub.io、Smithery、skills.sh - に登録します。消費者向け AI プラットフォーム - GPT Store、Custom GPTs、Claude、Gemini - は [5.1](./m5-1-verified-on-platforms.md) です。）

## 参考資料
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#streamable-http)
- [MCP Server Card](https://modelcontextprotocol.io/community/server-card/charter?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP resources](https://modelcontextprotocol.io/docs/concepts/resources?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Registry](https://github.com/modelcontextprotocol/registry?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

Streamable HTTP を備えた本番稼働の MCP サーバーを、あなたのために運用し、あなたのドメイン配下に公開します。ツールはリリースごとにあなたの OpenAPI から自動生成されます。Server-card は、リバースプロキシ経由であなたの `/.well-known/mcp/server-card.json` に公開されます。すべてのツール呼び出しは、Forter が [3.1](./m3-1-oauth-discovery.md) で運用する OAuth サーバーの背後で実行されます - ツールごとのスコープは、呼び出しがあなたのオリジンに届く前にゲートウェイで強制されます。振る舞いのツール注釈（あなたの仕様の HTTP 動詞から導出される `readOnlyHint` / `destructiveHint`）と、読み取り専用の MCP リソースが含まれます。MCP レジストリへの登録（mcp.run、mcphub.io、Smithery）が処理され、リリースごとに再検証されます。呼び出しごとの可観測性が、ダッシュボードとアラートとともに配線されます。本来ならかなりのエンジニアリング構築であるものが、連携になります。

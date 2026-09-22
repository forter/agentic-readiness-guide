---
id: m4-3-streaming
module: actionable
moduleNumber: 4
guidelineNumber: 3
title: 長時間実行の処理をストリーミングする
complexity: 5
impact: 4
visualChange: none
forterApplies: 'partial'
---

# 4.3  長時間実行の処理をストリーミングする

## 概要と理由
エージェントが5秒を超えて待つものはすべて、進捗のフィードバックを必要とします。さもなければ、エージェントは壊れていると判断してリトライし - たいていは副作用を二重に発生させます。インバンドの進捗には Server-Sent Events、大きなボディには chunked transfer、そして明示的なキャンセル経路。これらが、30秒のリスク評価を「壊れているように感じる」から「リアルタイムに感じる」へと変えます。そして、合理的に開いておけるどんな接続よりも長く続く作業 - 数分から数時間 - については、エージェントはソケットを握っているべきではありません。**Webhook** を登録し、結果が準備できたときにコールバックを受け取ります。

## スコアリング
- **工数 5/5** - リクエストパス全体にわたる広いサーフェスです。アプリケーションサーバーでの SSE と chunked transfer、すべてのプロキシとロードバランサーを通じたバッファフラッシュとアイドルタイムアウトの調整、リトライ時の冪等性、そして署名・バックオフ・再配信を伴う完全な Webhook 配信サブシステム。フレームワークは部分をカバーしますが、全体はカバーしません。
- **インパクト 4/5** - 不正判定、長文生成、バッチ処理、そして数秒を超えるあらゆる同期アクションにとって不可欠です。これがなければ、エージェントはタイムアウトに当たり、二重送信します。
- **視覚的変化: なし** - ワイヤーレベルの変更のみ。ユーザーに見えるサイトは影響を受けません。

## 手順
1. **OpenAPI でストリーミング処理を示す。** レスポンスのコンテンツタイプとして `text/event-stream` を、オペレーションに `x-streaming: true` 拡張を使います。イベントスキーマを文書化します: `event` 名（`progress` | `partial` | `complete` | `error`）、`data` ペイロード、そしてストリームを閉じる終端イベント。function-calling クライアントと MCP ジェネレータは、これを手がかりに正しいトランスポートを配線します。
2. **進捗のために SSE を実装する。** 長い処理では、接続を開いたままにして、1〜3秒ごとに `event: progress\ndata: {"percent": 40, "stage": "scoring"}\n\n` を出力します。`event: complete\ndata: {...final result...}\n\n` で終えます。すべてのイベントの後にフラッシュしてください - バッファされた SSE は壊れた SSE です。前段に nginx がある場合は `Cache-Control: no-cache` と `X-Accel-Buffering: no` を設定します。
3. **大きなレスポンスボディには chunked transfer encoding を使う。** リスト、エクスポート、集計は JSON Lines（`application/x-ndjson`）を1行1レコードでストリームし、エージェントが逐次処理できるようにします。
4. **キャンセルをサポートする。** クライアントが切断したら、背後の作業を中止し、可能なら最後に `event: cancelled` を出力します。最初のリクエストで冪等性キーを発行して、キャンセル後のリトライが再課金や再評価をしないようにします。キャンセルの契約を、オペレーションの OpenAPI の説明に文書化します。
5. **MCP では Tasks 拡張を使う - そしてストリームの再開を当てにしない。** 長時間実行オペレーションに MCP サーバー（[4.4](./m4-4-mcp-server.md)）経由で到達するなら、`2026-07-28` 時点で公認の形は公式の **Tasks 拡張**（`io.modelcontextprotocol/tasks`）であり、capabilities で広告します。タスクハンドルを返し、クライアントに `tasks/get` をポーリングさせ、`tasks/update` で処理中の入力を受け付けます。見落としやすい2つの変更が土台で起きました。タスクはコアプロトコルの *外* に出て拡張になったこと（したがって広告が必須）、そして Streamable HTTP トランスポートが **SSE の再開可能性を完全に廃止した** ことです - `Last-Event-ID` とイベント ID による再配信はなくなったため、ストリームが切れると処理中のリクエストは失われ、クライアントは **新しいリクエスト id** で再発行しなければなりません。ストリーミングするすべての操作を安全に再実行できるよう設計してください。元のリクエストに付ける冪等性キーは、いまや「あると良いもの」ではなく、荷重を支える構造材です。

6. **接続より長く続く作業には Webhook を提供する。** 数分から数時間で測られる処理では、ストリームを開いたままにする代わりに、呼び出し側にコールバック URL を登録させます。イベントタイプ、ペイロードスキーマ、配信のセマンティクスを OpenAPI に文書化します。すべての配信に署名し（ボディに対する HMAC、署名はヘッダーに）、受信側が出所を検証できるようにします。失敗した配信は指数バックオフでリトライし、それでも届かないものには再配信エンドポイントを公開します。手順1のイベント名（`progress`、`complete`、`error`）を再利用して、エージェントが Webhook ペイロードと SSE フレームを同じコードで扱えるようにします。

## 参考資料
- [HTML Living Standard - Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7230 §4.1 - Chunked Transfer Coding](https://datatracker.ietf.org/doc/html/rfc7230?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#section-4.1)
- [JSON Lines specification](https://jsonlines.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Tasks 拡張](https://modelcontextprotocol.io/extensions/tasks/overview?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Standard Webhooks specification](https://www.standardwebhooks.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

オーケストレーションスイートは、SSE と chunked レスポンスをバッファリングせずにエンドツーエンドでプロキシします。接続のアイドルタイムアウトはエージェントのワークロード向けに調整されています（10分以上のストリーム）。キャンセルは、エージェントからゲートウェイを通じてあなたのオリジンまで伝播します。進捗イベントはそのまま通過し、ゲートウェイは相関ヘッダーを追加して、各進捗フレームが元の MCP ツール呼び出しまで追跡できるようにします。Webhook の配信はゲートウェイで中継・HMAC 検証されるため、エージェントがそれに基づいて行動する前に、コールバックの出所がチェックされます。

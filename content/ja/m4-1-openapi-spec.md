---
id: m4-1-openapi-spec
module: actionable
moduleNumber: 4
guidelineNumber: 1
title: OpenAPI 仕様を提供する
complexity: 4
impact: 5
visualChange: none
forterApplies: 'yes'
---

# 4.1  OpenAPI 仕様を提供する

## 概要と理由
OpenAPI 3.x は、下流のすべてのエージェント成果物がコンパイルされる元となる信頼できる情報源です。MCP ツール、function-calling のスキーマ、SDK、CLI コマンド、プラグインマニフェスト。完全な仕様 - 公開され、RFC 9727 のカタログからリンクされたもの - があれば、エージェントはあなたのドメインだけから API サーフェス全体を解決できます。ほとんどのチームはすでに部分的な仕様を持っています。作業は、隙間を埋め、説明を引き締めることです。

仕様は、凍結された成果物ではなく **生きた基盤** として扱ってください。[4.3](./m4-3-streaming.md) はその中でストリーミング処理に注釈を付け、[4.8](./m4-8-payment-protocols.md) は決済メタデータを追加し、SDK・CLI・MCP のパイプラインは変更のたびにそこから再生成します。ここで一度書いて、後のガイドラインが着地するにつれてその場で拡張します - これは作り直しではなく、計画された成熟です。

## スコアリング
- **工数 4/5** - すべてのエンドポイント、エラー、ページネーションパラメータにわたる本物のスキーマ作業です。注釈駆動の生成は助けになりますが、考えることの代わりにはなりません。
- **インパクト 5/5** - これがなければ、モジュール4と5は事実上存在しません。下流のすべてのプロトコルサーフェスがこれに依存します。
- **視覚的変化: なし** - `/openapi.json` と `/.well-known/api-catalog` を機械専用のパスに追加します。ユーザーに見えるサイトは変わりません。

## 手順
1. **OpenAPI 3.1 を書く**（ツールが追いついていなければ 3.0）。`/openapi.json` と `/openapi.yaml` に。すべての公開エンドポイントをカバーします。仕様のカバレッジなしで出荷されるルートは CI で失敗させてください。`additionalProperties: true` のデフォルトと、型のない `object` レスポンスを禁じるルールセットで、Spectral で lint します。
2. **説明的な `operationId` と `description` を書く。** `createOrder` は `postOrders` に勝ります。各オペレーションには、平易な英語で1段落の説明を付けます - これは LLM がツールを選ぶときに読むものであり、同じテキストが [4.4](./m4-4-mcp-server.md) の MCP ツールの説明に供給されます。オペレーションをリソースグループにタグ付けして、最終的な MCP ツール一覧が見やすく保たれるようにします。
3. **エラーを含め、すべてのレスポンスに型を付ける。** `type`、`message`、`request_id`、`retry_hint`（[4.2](./m4-2-rate-limits-and-errors.md) を参照）を持つ共有の `Error` スキーマを定義し、すべての `4xx` / `5xx` レスポンスからそれを参照します。`additionalProperties` の抜け道はなし。エージェントは、宣言されていないものを推論できません。
4. **ページネーションを明示的に指定する。** 1つのモデルを選び - カーソルベースが最も親切です - すべてのリストエンドポイントで `cursor`、`limit`、そしてレスポンスのエンベロープ（`data[]`、`next_cursor`、`has_more`）を文書化します。
5. **RFC 9727 API カタログを公開する。** `/.well-known/api-catalog` に。あなたの OpenAPI ファイル、バージョニングポリシー、サンドボックス URL、連絡先メタデータをリンクする JSON ドキュメントです。
6. **エージェントに優しいビューをネゴシエートする。** エージェントが `Accept: text/markdown` を送ってきたら、生の JSON ではなく、リソースの Markdown レンダリング（タイトル、主要フィールド、リンク）を返し、`Vary: Accept` を設定してキャッシュが JSON と Markdown のバリアントを混ぜないようにします。リクエストヘッダーを設定できないエージェントやクローラーのために、`?mode=agent` クエリパラメータを尊重して、任意のページやリソースの、同じく削ぎ落とした Markdown スタイルのビューを返します。JSON クライアントとブラウザには変化が見えません。

## 参考資料
- [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9727 - API Catalog](https://datatracker.ietf.org/doc/html/rfc9727?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Spectral OpenAPI linter](https://github.com/stoplightio/spectral?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/release-notes?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

これは、ほぼ丸ごと Forter に渡せるガイドラインです。公開 API を自分で書いて保守する代わりに、あなたの内部ツールと機能を [**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-1-openapi-spec) に - そして Forter だけに - 非公開で公開すると、それがあなたの API ゲートウェイになります。あなたが許可したツールから、OpenAPI 3.x 仕様を導出し、リクエストとレスポンスのスキーマを書き、`/openapi.json` と RFC 9727 カタログをあなたのドメイン上に公開し、それらのツールが変わっても仕様を整合させ続けます - 乖離なし、手作業で保守するドキュメントなし。

下流のすべては、その1つの公開されたサーフェスから生成されます。MCP ツール（[4.4](./m4-4-mcp-server.md)）、function-calling のスキーマ、SDK と CLI（[4.7](./m4-7-sdks-and-cli.md)）、そしてレート制限とエラーの契約（[4.2](./m4-2-rate-limits-and-errors.md)）- ゲートウェイでレート制限とバージョン管理が施されます。REST の設計、スキーマの規律、SDK の配布、そして連携者を最新に保ち続ける継続的な作業は、実質的に肩代わりされます。

あなたのものとして残るもの: ツールそのものと、その背後のビジネスロジック。何を公開するかはあなたが決め、Forter はそれを完全で、保守された、エージェント対応の API サーフェスに変えます。

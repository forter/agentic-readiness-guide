---
id: m5-2-mcp-apps
module: experiential
moduleNumber: 5
guidelineNumber: 2
title: MCP Apps で UI を描画する
complexity: 4
impact: 5
visualChange: none
forterApplies: 'flagship'
---

# 5.2  MCP Apps で UI を描画する

## 概要と理由
MCP Apps は、あなたのツールが **チャットの会話そのものの中** にインタラクティブな UI コンポーネント - サイズセレクタ、住所ピッカー、決済手段ピッカー、注文確認ダイアログ - を描画できるようにします。リダイレクトでもなく、外部へのリンクでもありません。ユーザーは、エージェントのサーフェスの中で取引します。これは OAuth 以来、エージェンティックコマースにおける最大の UX の飛躍であり、発見 → 理解 → 決定 → 実行を、ひとつの会話のターンに畳み込みます。

知っておくべきこと: ホスト環境は **他のツールのコンポーネントと共有されます**。あなたのバンドルを、他のどんな公開サーフェスとも同じように扱ってください - 署名し、CSP でロックし、ネットワークをあなたのオリジンにスコープします。標準は明確に定義されていますが、構築は十分に容易ではないので、ほとんどのチームは、コンポーネント層を出来合いで出荷する Forter と組みます。

## スコアリング
- **工数 4/5** - 一度に3つの新しいサーフェス。サーバー上の MCP Apps 能力宣言、コンポーネントバンドルそのもの（ホスト互換、CSP ロック、署名済み）、そしてツールを UI リソースに結びつける JSON Schema の契約。仕様は安定化しつつあります。
- **インパクト 5/5** - インライン UI を持つツールは、ユーザーにリンクを手渡すツールを劇的に上回るコンバージョンを出します。
- **視覚的変化: なし** *（あなたのサイト上では）* - コンポーネントはチャットホスト（ChatGPT、Claude）の中で描画されます。あなた自身のサイトでは何も変わりません。

## 手順
1. **MCP サーバーで Apps 能力を有効にする。** `initialize` レスポンスで、`capabilities.experimental.apps` を広告します（modelcontextprotocol-ext-apps ドラフトに従って）。[4.4](./m4-4-mcp-server.md) の MCP サーバー基盤が Streamable HTTP ですでに稼働していることが必要です。
2. **ホスト互換のコンポーネントバンドルをビルドする。** `@modelcontextprotocol/ext-apps` を使って、React/Svelte/Vue のコンポーネントをホストランタイムの形式にコンパイルします（MCP Apps の MIME タイプ `text/html;profile=mcp-app` で提供）。バンドルは自己完結し、署名されていなければなりません。これにより、ホストはマウント前に出所を検証できます。ホストは厳格なベースライン CSP（`default-src 'none'`、`object-src 'none'`）を強制します。CSP を丸ごと緩めるのではなく、正当に必要なオリジンを、仕様の `_meta.ui.csp` の許可リスト（`connectDomains`、`resourceDomains`、`frameDomains`、`baseUriDomains`）を通じて宣言してください。
3. **安定したバージョン付き URI で `ui://` リソースを公開する。** 各コンポーネントは `ui://yourcompany.com/checkout/payment-picker@1.4.0` のような URI に存在します。すべての URI にバージョンを付けてください。エージェントは積極的にキャッシュするので、バージョンのない変更は会話を途中で壊します。
4. **ツールに `_meta.ui.resourceUri` をタグ付けする。** インラインで描画すべきすべてのツールに、`_meta.ui.resourceUri` を対応する `ui://` URI に設定します。エージェントホストは、ツール一覧の時点でこのメタデータを読み、呼び出し前にコンポーネントを事前ウォームします。
5. **コンポーネントとツールの契約を JSON Schema で定義する。** ツールの `inputSchema` と、リソースが期待する props は、どちらも JSON Schema です。これらを足並みをそろえて定義してください - `{ amount, currency, methods[] }` を期待する決済ピッカーは、ツールが返すものと正確に一致しなければなりません。
6. **積極的にサンドボックス化する。** すべてのバンドルを CSP でロックし、すべてのアセットに署名し、すべてのネットワーク呼び出しをあなたのオリジンのみにスコープし、ツールのレスポンスから任意の HTML を決して受け入れないでください。ホスト環境は他のツールのコンポーネントと共有されていると想定してください。

## 参考資料
- [MCP Apps extension spec](https://github.com/modelcontextprotocol/ext-apps?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP resources reference](https://modelcontextprotocol.io/docs/concepts/resources?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP `_meta` field reference](https://modelcontextprotocol.io/specification/2025-06-18/basic?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#meta)
- [CSP - Content Security Policy](https://www.w3.org/TR/CSP3/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

MCP サーバーを [**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m5-2-mcp-apps)（[4.4](./m4-4-mcp-server.md)）上で動かせば、MCP Apps の層がそれに付いてきます。あなたのツールは、ただプレーンテキストで答えるだけでなく - **あらかじめ定義されたストアフロントとサポートの UI** を描画します。製品とバリアントのピッカー、サイズセレクタ、その他の重要なコンポーネントです。

UI はあなたのブランドに合わせられます。色を設定し、デザインを調整し、カスタム CSS を提供して、コンポーネントが汎用ウィジェットではなく、あなたのストアフロントとして読まれるようにします。Content Security Policy はあなたのために管理され、設定可能なままです - そのため、ホストが要求するサンドボックスを弱めることなく、その中で自前のスクリプト（Google Analytics やその他のタグを含む）を展開できます。

あなたのものとして残るもの: ブランドの判断そのもの、あなたのカタログと価格設定。

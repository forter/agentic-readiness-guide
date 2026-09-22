---
id: m4-5-webmcp
module: actionable
moduleNumber: 4
guidelineNumber: 5
title: WebMCP でツールを公開する
complexity: 2
impact: 3
visualChange: none
forterApplies: 'partial'
---

# 4.5  WebMCP でツールを公開する

## 概要と理由
WebMCP（W3C の提案）は、ウェブサイトをエージェンティックにする最も摩擦の少ない方法です。MCP サーバー（[4.4](./m4-4-mcp-server.md)）がバックエンドのインフラであるのに対し - WebMCP はブラウザ API です。ページ上の数行の JavaScript が **ツール** を登録し、ブラウザ常駐のエージェント（Gemini を備えた Chrome、またはローカルモデル）が、ユーザー自身のセッションの中で、サーバーなし・別個の認証なし・API プログラム不要で、それらを直接呼び出します。

これは新興の Google と Microsoft の W3C 提案です - まだ初期段階ですが、採用は安価です。MCP と同じツールモデル（`name`、`description`、`inputSchema`、`annotations`）を再利用するので、[4.4](./m4-4-mcp-server.md) のために書いた説明とスキーマがそのまま引き継がれ - MCP サーバーをまったく持たないサイトでも、単独で WebMCP を採用できます。

**実際のところ、どこまで来ているのか（2026年後半）。** これについては正確でいてください。周辺のマーケティングは正確ではないからです。WebMCP は W3C 勧告では *ありません* し、勧告トラックにも入っていません。現在のテキストは、Microsoft と Google が編集する Web Machine Learning CG の Draft Community Group Report です。Chrome は 149 から 156 まで公開オリジントライアルを実施し、Edge はフラグ付きで搭載しています。Firefox と Safari は議論に参加していますが、コミットはしていません。普及は消費よりも速く進みました - 2026年8月時点で、この API は Shopify のストアフロントや Cloudflare 配下のサイトでデフォルト有効と報じられ、Expedia、Booking.com、Target、Credit Karma が実験しています - しかし **主要なエージェントはまだ WebMCP のツールを呼び出していません**。Claude、ChatGPT Agent、Perplexity、Gemini は依然として DOM やスクリーンショット経由でページを操作します。ですから、いまツールを登録するのは、作業が数時間で済み、消費が到来した瞬間に備えられるからであって、向こう側でトラフィックが待っているからではありません。

## スコアリング
- **工数 2/5** - フロントエンドの作業のみ。ページの JavaScript でツールを登録し、明確な説明と入力スキーマを書きます。サーバーなし、認証サーバーなし、OpenAPI の前提条件なし。仕様はまだ成熟途上なので、ある程度の API の変動を見込んでおいてください。
- **インパクト 3/5** - 新興標準ならではの伸びしろですが、意図的にこれ以上は高く評価していません。このサーフェスはすでに広く展開されています（Shopify と Cloudflare でデフォルト有効）が、まだ広く *消費* されてはいません - 今日、主要なエージェントは WebMCP のツールを呼び出しません。それでも、ブラウザ内エージェントから呼び出される最も安価な道であることに変わりはなく、コストを考えれば下振れのリスクはほぼゼロです。主要なエージェントランタイムが呼び出し始めたら、このスコアを見直してください。
- **視覚的変化: なし** - ツールは JavaScript で登録され、ページは以前とまったく同じように描画されます。

## 手順
1. **`registerTool()` でツールを登録する。** ページの model-context オブジェクトに対して呼び出します。現行の W3C 仕様はこれを `document.modelContext` として公開しますが、初期の Chrome ビルドと MCP-B ポリフィルは `navigator.modelContext` を使う（これはツールセット全体を一度に入れ替える古い `provideContext()` 形式も持ちます）ので、使う前に両方を機能検出してください。各ツールはページの JavaScript で宣言します - どのアクションを公開するかを正確に決めるのはあなたです。ツールには、`name`、自然言語の `description`、`inputSchema`（そのパラメータの JSON Schema）、そして作業を行って Promise を返す `execute` コールバックが必要です。
   ```js
   const mc = document.modelContext || navigator.modelContext;
   mc.registerTool({
     name: "search_products",
     description: "キーワードでカタログを検索し、一致する製品を返します。",
     inputSchema: {
       type: "object",
       properties: { query: { type: "string" } },
       required: ["query"]
     },
     annotations: { readOnlyHint: true },
     async execute({ query }) {
       const results = await searchCatalog(query);
       return { content: [{ type: "text", text: JSON.stringify(results) }] };
     }
   });
   ```
2. **何が安全かをエージェントが分かるようツールに注釈を付ける。** 状態を読むだけのツールには `annotations.readOnlyHint` を、あなたが制御しないデータを返すツールには `annotations.untrustedContentHint` を設定します。ブラウザエージェントはこれを読んで、自分で呼び出してよいものと、注意して扱うべきものを判断します。
3. **重大なアクションはユーザーの確認でゲートする。** ツールの `execute` コールバックは `ModelContextClient` を受け取ります。お金を使う、またはアカウントの状態を変えるものの前に `client.requestUserInteraction()` を呼び出してください。ユーザーはすでにブラウザにいます - エージェントに黙ってコミットさせるのではなく、ユーザーを輪の中に入れてください。
4. **ページの状態に合わせてツールを登録・登録解除する。** ツールリストは、現在のビューが実際にできることを反映すべきです。ビューがマウントされるときにツールを登録し、`AbortSignal` を渡して（`registerTool(tool, { signal })`）、ユーザーが離れたときに削除されるようにします。古いツールを提示されたエージェントは、それを呼び出して失敗します。

## 参考資料
- [WebMCP proposal - W3C](https://webmachinelearning.github.io/webmcp/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [JSON Schema](https://json-schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [The WebMCP Directory](https://webmcp.cool/)

## Forter による支援

[**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-5-webmcp) は、すでにあなたの MCP サーバー（[4.4](./m4-4-mcp-server.md)）を構築するのに使っているのと同じツール定義から、ページ内の `registerTool` バインディングを生成します - そのため、ブラウザ側とサーバー側のツールサーフェスは一度記述され、同期を保ちます。バインディング、`execute` コールバック、そしてページ状態のライフサイクル（ビューのマウント時に登録、ナビゲーション時に登録解除）が、出発点として手渡されるのではなく、あなたのために生成されます。

Forter は、**バインディングを既存のサイトに埋め込む** ことを支援します - 選んだページに単一のスクリプトタグを置くだけで、アプリケーションの書き直しは不要です。ひとたび埋め込まれれば、あなたが公開するツールは、WebMCP をサポートするすべてのブラウザ常駐エージェントや AI エージェントから呼び出せるようになり、あなたの MCP サーバーがすでにリモートエージェントに提供しているのと同じサーフェスと並びます。WebMCP はまだ動いている提案なので、Forter は仕様の改訂を追跡し、API が安定するにつれて生成されるバインディングを更新します - あなたの連携は、標準に逆らうのではなく、標準とともに動きます。

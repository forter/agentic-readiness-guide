---
id: m4-6-agent-registries
module: actionable
moduleNumber: 4
guidelineNumber: 6
title: エージェントレジストリに登録する
complexity: 1
impact: 3
visualChange: low
forterApplies: 'yes'
---

# 4.6  エージェントレジストリに登録する

## 概要と理由
MCP サーバーが稼働し（[4.4](./m4-4-mcp-server.md)）、OpenAPI がきれいになった（[4.1](./m4-1-openapi-spec.md)）いま、ようやく公開するものができました。エージェントは、クロールではなく **レジストリ** を通じて機能を発見します - そして重要なのは4つです。**mcp.run、mcphub.io、Smithery**（MCP サーバーのマーケットプレイス）と **skills.sh**（Claude と Cursor で一級のインデックスを持つ、ドメインレベルのスキルカタログ）です。登録は無料で、フォームは短く、規律は、ツールサーフェスが進化しても説明を正確に保つことです。

## スコアリング
- **工数 1/5** - 4つの登録、それぞれ約15分。登録の質は、背後の仕様の質で頭打ちになるので、作業のほとんどは [4.1](./m4-1-openapi-spec.md) と 4.4 で済んでいます。
- **インパクト 3/5** - 登録がなければ、機能の発見に対してあなたは見えない存在です。あれば、ユーザーが「X をするツール」を求めるたびに、ピッカーに現れます。
- **視覚的変化: 小** - 登録は第三者のレジストリ上に存在し、あなたのサイト上ではありません。

## 手順
1. **mcp.run と mcphub.io。** MCP サーバーの URL、1段落の説明、ツールリスト、ロゴを登録します。どちらもサーバーの `tools/list` エンドポイントからツールメタデータを引くので、各 MCP ツールの `description` が、ユーザーが実際に読むものです - マーケティングコピーではなく、API ドキュメントのように書いてください。ツールの説明の質は、[4.1](./m4-1-openapi-spec.md) のあなたの OpenAPI までたどれます。
2. **Smithery。** 最大の MCP マーケットプレイス。リポジトリのルートに `smithery.yaml` を追加し、ランタイム、環境変数、起動コマンドを宣言します - これが、Cursor と Windsurf でのワンクリックインストールを可能にします。
3. **skills.sh - ドメインを登録する。** skills.sh であなたのドメインを取得し、公開リポジトリごとにトップレベルの `SKILL.md` を公開して、呼び出し可能なすべてのスキルを `name`、`description`、`inputs`、`outputs`、そして `example` ブロックとともに列挙します。形式はフロントマター付きの Markdown です - よく知られたリポジトリ（例: `stripe/stripe.com/SKILL.md`）から借りてください。
4. **skills.sh - 品質シグナル。** レジストリは3つのシグナルで登録をランク付けします: (a) 同じドメイン配下の **複数のリポジトリ**、それぞれが独自の `SKILL.md` を持つ。(b) 明確さについて **LLM のルーブリックを通過する説明**（「強力で使いやすいプラットフォーム」のような埋め草はなし）。そして (c) **鮮度** - `SKILL.md` が90日以内に更新されている。薄い `SKILL.md` を1つ持つサイトは、焦点の絞られた5つを持つサイトより下位にランクされます。
5. **検証と監視。** 各登録の後、ブランド名と代表的なユースケースのクエリでレジストリを検索します。30日のリマインダーを設定して再検証してください - レジストリは定期的に再クロールし、5xx を返す、または形が変わったサーバーを黙ってリスト解除します。（消費者向け AI プラットフォーム - GPT Store、Custom GPTs、Claude 連携、Gemini extensions - は、独自のレビューサイクルを持つ 5.1 のジョブです。）

## 参考資料
- [Model Context Protocol Registry](https://github.com/modelcontextprotocol/registry?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Smithery - publishing servers](https://smithery.ai/docs/build?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [skills.sh - SKILL.md 仕様](https://skills.sh?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

MCP サーバーが [**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-6-agent-registries) 上で動いている場合、レジストリへの登録をあなたのために処理できます - 説明は、あなたの OpenAPI ドキュメントとツール注釈から自動生成されます。再検証はリリースごとに実行されるので、黙ってのリスト解除（最も一般的なレジストリの障害モード）は、発見可能性のコストになる前に捕捉されます。

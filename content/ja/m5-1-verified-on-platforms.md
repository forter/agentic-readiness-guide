---
id: m5-1-verified-on-platforms
module: experiential
moduleNumber: 5
guidelineNumber: 1
title: AI プラットフォームで認証を受ける
complexity: 3
impact: 5
visualChange: low
forterApplies: 'yes'
---

# 5.1  AI プラットフォームで認証を受ける

## 概要と理由
最も重要な登録経路は3つです。**ChatGPT GPT Store**（あなたの `/.well-known/ai-plugin.json` を読み、あなたのプラグインを使うユーザー作成の **Custom GPTs** を動かします）、**Claude 連携ディレクトリ**（あなたの MCP サーバーを掲載します、[4.4](./m4-4-mcp-server.md) を参照）、そして **Gemini extensions** です。それぞれが、レビューを通過した掲載に検証済み連携バッジを押します - そしてそのバッジは、ツール選択率を測定可能なほど高め、*かつ* ユーザーが直接目にする信頼シグナルとして機能します。なりすましの連携は、既知のフィッシングのサーフェスです。検証こそが、正規のものと、なりすますものを区別します。

作業そのものは、ほとんどが待つことです。各プラットフォームはレビューに2〜8週間かかり、あなたのマニフェスト、スコープ、認証フローが変わるたびに再検証します。

## スコアリング
- **工数 3/5** - プラットフォームごとの技術的な負荷は小さい（マニフェスト、スクリーンショットの一式、プライバシー URL）。コストは、カレンダー上の時間と、すべての破壊的変更で再登録する規律です。
- **インパクト 5/5** - 検証済みの掲載がなければ、あなたのツールはエージェントのツール選択で検証済みの競合より下位にランクされます。
- **視覚的変化: 小** - 掲載は第三者プラットフォームに現れます。サイト上の任意の「利用可能」バッジは、あなた次第です。

## 手順
1. **`/.well-known/ai-plugin.json` が最新であることを確認する**（ファイル自体は [1.2](./m1-2-well-known-agent-files.md) で提供されます）。登録には、[4.1](./m4-1-openapi-spec.md) のライブの OpenAPI と [3.1](./m3-1-oauth-discovery.md) の OAuth メタデータを指し、安定した `name_for_model` と `description_for_model` を持たなければなりません。登録前に、OpenAI のプラグインスキーマに対して検証してください。
2. **ChatGPT GPT Store に登録する。** マニフェスト URL、プライバシーポリシー URL、法的情報 URL、連絡先メール、そしてツールの使用中のスクリーンショット3〜5枚を提供します。初回レビューは2〜4週間を見込んでください。検証済みのプラグインが、ユーザーがあなたの認証ハンドシェイクを再実装せずに、あなたのサービスの上に **Custom GPTs** を作れるようにするものです。
3. **Claude 連携に登録する。** あなたの MCP サーバーの `/mcp` エンドポイント（[4.4](./m4-4-mcp-server.md)）と、対応する `oauth-protected-resource` メタデータを指します。Anthropic は、MCP ハンドシェイク、スコープのセマンティクス、ツールの説明を検証します。
4. **Gemini extensions に登録する。** Google のレビューは、OpenAPI のクリーンさ、OAuth スコープの最小化、同意画面の文言に焦点を当てます。GPT Store に登録するのと同じ OpenAPI が、たいてい修正なしで通ります。
5. **再検証の頻度を追跡する。** マニフェスト、OAuth スコープ、MCP ツールサーフェス、または価格モデルへのすべての破壊的変更が、再レビューを引き起こします。登録の更新にフラグを立て、それらを順次ではなく並行してキューに入れるリリースチェックリストを作ってください。

## 参考資料
- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-apps-in-chatgpt?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Claude integrations directory](https://www.anthropic.com/news/integrations?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Gemini extensions documentation](https://ai.google.dev/gemini-api/docs/extensions?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

プラグインマニフェストの公開、GPT Store / Custom GPT / Claude / Gemini への登録、そしてリリースごとの再検証は、オーケストレーションスイートを使う顧客のために管理できます。Forter は、あなたに代わって運用するライブの OAuth メタデータと MCP サーバーにマニフェストを同期させ続けるので、あなたが新しいスコープやツールを出荷した瞬間に検証が壊れることはありません。あなたは、登録キューを所有することなく、3つのプラットフォームにわたる検証済みバッジを受け継ぎます。

あなたのものとして残るもの: プライバシーポリシーの文言、連絡先メール、エージェントのサーフェスにおけるあなたの製品のスクリーンショット、そして、あなたが制御したいプラットフォーム固有のポジショニング。

---
id: m5-4-end-to-end-flows
module: experiential
moduleNumber: 5
guidelineNumber: 4
title: エンドツーエンドのエージェントフローを通過する
complexity: 4
impact: 5
visualChange: none
forterApplies: 'partial'
---

# 5.4  エンドツーエンドのエージェントフローを通過する

## 概要と理由
これは、モジュール1から4の統合テストです。発見、理解、信頼、実行が、会話から外れることなく、実在するユーザーのタスクを完遂する単一のエージェントフローへと組み合わさらなければなりません。最初の3つのモジュールが個別には合格しても、エンドツーエンドのフローが「これがいくらか分かりません」や「このリンクをブラウザで開いてください」で死ぬなら、個々のチェックマークがどうであれ、そのサイトはエージェント対応していません。

3つの懸念が並行して走ります。欠けた価格や比較コンテンツで行き止まりにならない **複数ターンの会話**、ブラウザ専用のステップのない **自律的なタスク完遂**、そしてリリースごとに ChatGPT-User、ClaudeBot、OpenClaw に対して行う **継続的なシミュレーション**。シミュレーションハーネスの側は十分に密度が高いので、ほとんどのチームはプロトコル層の半分について Forter と組みます。

## スコアリング
- **工数 4/5** - 3つのエージェントランタイムに対して CI を立ち上げるのは、本物のエンジニアリングです。それぞれが独自の認証、レート制限、ハーネスの慣例を持ちます。
- **インパクト 5/5** - モジュール1〜4が黙って食い違うリグレッションを捉える唯一のテストです。
- **視覚的変化: なし** - 作業はテストインフラです。ユーザーに見えるサイトは変わりません。

## 手順
1. **価格と比較のコンテンツを `llms.txt` から到達可能にする。** 機械可読な `/pricing.md` と `/compare/{competitor}` ページはすでに存在します（[2.4](./m2-4-competitive-positioning.md)）。`llms.txt` がその `## 料金` と比較のセクションからそれらにリンクしていること、そしてそれぞれが、エージェントが実際に読めるサーバーレンダリングされたテキストであることを確認してください。複数ターンのフローは、どんなプロトコルの失敗よりも、このコンテンツの隙間で死ぬことが多いのです。
2. **認証フローをエンドツーエンドでプログラム化する。** エージェントがあなたの `/auth.md` レシピ（[3.3](./m3-3-self-serve-credentials.md)）に従えること - `agent_auth` フックを解決し、自己登録し、OAuth + 動的クライアント登録（[3.1](./m3-1-oauth-discovery.md)）を完了できること - を、手作業のステップ1つなしで検証します。それ自体がインライン UI の MCP App でない「同意するためにこの URL をブラウザで開いてください」というステップはどれも、自律エージェントにとって行き止まりです。
3. **[3.3](./m3-3-self-serve-credentials.md) の認証フローハーネスを拡張して、エンドツーエンドのタスクを駆動する。** 3.3 はすでに、トークン発行のために ChatGPT-User、ClaudeBot、OpenClaw に対する CI ハーネスを立ち上げています - 各スクリプト化セッションを、発見 → 認証 → 実行のサイクル全体に拡張します。会話が、ウェブ取得にフォールバックすることなく N ターンで完了することをアサートします。
4. **エージェント間の違いをカバーする。** Claude のツール選択のヒューリスティクスと MCP ハンドシェイクの前提は、OpenAI のものとは異なります。OpenClaw の自律ループの挙動は、単一ターンのハーネスでは見逃すビジネスロジックの隙間（レート制限の処理、複数ステップのトランザクションフロー、エラー回復）を表面化させます。一方には不可視な問題が、もう一方では声高に現れます - だからこそ、3つすべてが重要なのです。
5. **このスイートを赤/緑の CI として扱う。** ユニットテストと同じように、リグレッションでビルドを壊します。失敗のサーフェスは、モジュール1〜4の残りが落ち着くにつれて、時間とともに縮むはずです。

## 参考資料
- [ChatGPT-User crawler documentation](https://platform.openai.com/docs/bots?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Anthropic crawlers documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenClaw project](https://github.com/openclaw/openclaw?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP testing guide](https://modelcontextprotocol.io/docs/tools/inspector?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

ChatGPT、Claude、OpenClaw に対する継続的なエンドツーエンドのシミュレーションが、オーケストレーションスイートがあなたに代わって運用するプロトコル層に対して走ります。OAuth ハンドシェイク、MCP ツールサーフェス、RFC 9421 の署名検証、プラグインマニフェスト、そしてインライン UI のコンポーネントは、すべて Forter のリリースごとに CI で実行されます。同じハーネスが挙動の変化も捉えます - エージェントランタイムが本番でツール選択のロジックやトークン処理の挙動を静かに変えたとき、あなたは顧客からのチケットではなく、緑/赤のシグナルから知ることになります。

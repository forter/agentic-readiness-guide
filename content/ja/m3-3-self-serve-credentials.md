---
id: m3-3-self-serve-credentials
module: trustworthy
moduleNumber: 3
guidelineNumber: 3
title: クレデンシャルをセルフサービス化する
complexity: 3
impact: 5
visualChange: medium
forterApplies: 'yes'
---

# 3.3  クレデンシャルをセルフサービス化する

## 概要と理由
エージェントは「お問い合わせ」フォームに記入することも、開発者リレーションの担当者を3日間待つこともできません。モジュール3のエンドツーエンドのテストは、自律エージェントが - あなたのドメインだけを与えられて - 人間が一切介在せずに、クレデンシャルを取得し、OAuth ハンドシェイクを完了し、あなたの API を呼び出せるかどうかです。その流れのどこかに人間の関門があるなら、上のプロトコルスタックは飾りにすぎません。

2つの半分があります。**(a)** サインアップ時に、プログラムで発行される、セルフサービスのサンドボックスおよび無料枠のクレデンシャル。**(b)** 実在のエージェントクライアント（ChatGPT-User、ClaudeBot）に対してフロー全体を駆動する、反復可能なエンドツーエンドのチェック - これを CI に組み込んで、リリースが 3.1 と 3.2 のディスカバリーをひそかに壊せないようにします。（実在のモデルを使ったライブの総仕上げ実行は [5.4](./m5-4-end-to-end-flows.md) です。このガイドラインは、監査が HTTP 越しに検証できるセルフサービスクレデンシャルの半分でスコアリングされます。）無料枠のクレデンシャルもまた、既知の悪用標的です - サンドボックスの制限と発行時の行動ベースラインが、スクレイピングされたデモキーが悪意ある者にとっての無料計算パイプラインになるのを防ぎます。

## スコアリング
- **工数 3/5** - ほとんどがプロダクトと DevEx の作業です。無料枠のポリシー、サンドボックスデータ、サインアップの自動化、そして実在のエージェントクライアントを駆動する CI ハーネス。
- **インパクト 5/5** - エージェントがあなたに対してオンボーディングできるかを左右します。これがなければ、3.1 と 3.2 は机上の空論です。
- **視覚的変化: 中** - サンドボックスキーを伴う開発者向けのサインアップ / ポータルのフローを追加（または強化）します。既存の公開ページは変わりません。

## 手順
1. **サインアップ時に、人間の関門なしの無料枠またはサンドボックス。** メール + 検証で十分です。「お問い合わせ」は不可です。エージェントが実行できるサインアップは、動作する API キーで終わらなければなりません。
2. **あらかじめ投入されたデモデータ。** サンドボックスアカウントは、現実的な製品、トランザクション、ユーザー、履歴を備えた状態で届き、エージェントの最初の呼び出しが空のリストではなく有用なデータを返すようにします。
3. **プログラムによるクレデンシャル発行 - あるいは、共有秘密をまったく持たない。** サインアップの先に、追加のクライアントクレデンシャル、スコープ付きのサンドボックスキー、短命トークンを発行する認証済みエンドポイントを公開してください - RFC 7591 動的クライアント登録が標準的な形で、あなたの CLI も SDK も両方これを呼び出します。さらに良いのは、公開鍵モデルをサポートすることです。エージェントに自前のキーペアを生成させ、JWKS を登録（または鍵ディレクトリを公開）させてから、各リクエストをそれで署名して認証します - Web Bot Auth（[3.2](./m3-2-web-bot-auth.md)）と同じ RFC 9421 HTTP Message Signatures の仕組みです。エージェントが秘密鍵を保持し、あなたは公開鍵側だけを保存します。
4. **`/auth.md` - エージェント登録のレシピ - を公開する。** [WorkOS のオープンな `auth.md` プロトコル](https://workos.com/auth-md?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) は、エージェントがあなたのドメインから動作するクレデンシャルにたどり着く方法を標準化します。`text/markdown` ファイルを `/auth.md` に提供し、トップレベルの `# ...auth.md...` 見出しで始め（isitagentready.com の `authMd` チェックはこのリテラル文字列をキーにします）、**Discover, Register, Claim, Use, Errors, Revocation** のセクションを設けます。機械可読な `agent_auth` ブロックを - ファイル内と、[3.1](./m3-1-oauth-discovery.md) の RFC 8414 / 9728 メタデータの両方で - 広告して、エージェントが散文を解析せずに *どうやって自己登録するか* を解決できるようにします。その3つのフローのうち少なくとも1つをサポートしてください。ID-JAG アイデンティティアサーション（エージェントのアイデンティティプロバイダがユーザーを保証し、人間は介在しない）、検証済みメールのアサーション（ユーザーのメールへの OTP）、または後から OTP でクレームする匿名登録です。これは、あなたがすでに公開している OAuth 保護リソースメタデータを組み合わせます。ファイルが散文、`agent_auth` ブロックがフックです。
5. **オンボーディングの可観測性。** サインアップから最初の成功 API 呼び出しまでのコンバージョン、ステップ別の離脱、最初のトークンまでの時間、発行済みサンドボックスキーの悪用シグナルを追跡するダッシュボード。最後の項目は、「誰かが私の無料枠をスクレイピングして転売していないか?」を見るレンズです - その答えはたいてい「イエス」であり、それは普通のことです。問題は、あなたがそれを見えているかどうかです。

## 参考資料
- [WorkOS auth.md プロトコル](https://workos.com/auth-md?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7591 - Dynamic Client Registration](https://datatracker.ietf.org/doc/html/rfc7591?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Stripe サンドボックスモデル](https://docs.stripe.com/keys?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Twilio テストクレデンシャル](https://www.twilio.com/docs/iam/test-credentials?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

[**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m3-3-self-serve-credentials) は、テストおよび／またはサンドボックスのクレデンシャルを生成し、あなたの開発者がデモデータで連携するのを支援できます。オーケストレーションスイートは、リリースごとに ChatGPT-User、ClaudeBot、OpenClaw、そして新興クライアントのロングテールに対して **継続的なフローシミュレーション** を実行します - そのため、いずれかがディスカバリーの挙動を変えたとき、あなたは顧客からのチケットではなく、その日のうちに緑/赤の CI シグナルから知ることになります。

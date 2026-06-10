---
id: m4-7-sdks-and-cli
module: actionable
moduleNumber: 4
guidelineNumber: 7
title: SDK と CLI を配布する
complexity: 3
impact: 4
visualChange: none
forterApplies: 'yes'
---

# 4.7  SDK と CLI を配布する

## 概要と理由
エージェントとそれを作る開発者は、まず SDK と CLI に手を伸ばし、生の HTTP は二の次です。連携者（あるいはその代わりにコードを書く LLM）が使っている言語にイディオマティックな SDK がなければ、すべての利用者が独自のクライアントを自作し、ページネーション、リトライ、エラー解析、認証のうち少なくとも1つを間違えます。npm と PyPI の SDK - 加えて npm と Homebrew の CLI - があれば、連携はインストール1回の距離になります。

ここはまた、[4.1](./m4-1-openapi-spec.md) の OpenAPI への投資が2つ目の配当を払う場所でもあります。完全な仕様は、1つ分のコストで SDK と CLI の両方を生成します。

## スコアリング
- **工数 3/5** - [4.1](./m4-1-openapi-spec.md) の OpenAPI 仕様がすでに公開されていることを前提とします。なければ、その作業が先です。仕様があれば、難しいのは公開パイプライン - 署名、バージョニング、レジストリごとのクレデンシャルです。生成そのものはほぼ解決済みです。
- **インパクト 4/5** - 大きな連携の加速装置です。連携コードを書く LLM は、`requests` より先に `import stripe` に手を伸ばします。
- **視覚的変化: なし** - SDK はパッケージレジストリに出荷され、あなたのサイトにではありません。

## 手順
1. **OpenAPI ジェネレータを1つ選んで決め切る。** Stainless、Speakeasy、Fern、または `openapi-generator` が有力な選択肢です。それぞれを [4.1](./m4-1-openapi-spec.md) のあなたの仕様に対してテストしてください - 出力を手で編集してもよいと思えるものが、選ぶべきものです。途中で乗り換えると数か月かかります。
2. **npm と PyPI の SDK を出荷する。** npm の TypeScript と PyPI の Python が、エージェントと連携コードの約80%をカバーします。イディオマティックな命名（`client.transactions.create({...})`、`client.postTransactions(...)` ではなく）、型付きレスポンス、[4.2](./m4-2-rate-limits-and-errors.md) の `Retry-After` ヘッダーを尊重する指数バックオフ付きの自動リトライ、そしてページネーションのイテレータ（`for await (const tx of client.transactions.list())`）。
3. **npm と Homebrew で CLI を配布する。** SDK のサーフェスをミラーします - `yourbrand transactions create --amount 1000` - 加えて認証ヘルパー（`yourbrand login` が [3.1](./m3-1-oauth-discovery.md) の OAuth デバイスフローを実行）、設定管理、そしてエージェントのワークフローへパイプするための `--json` フラグ。
4. **仕様リリースのたびに自動公開する。** CI パイプライン: 仕様の変更がマージされ、ジェネレータが走り、SDK と CLI の両方がビルドされ、サンドボックスに対してテストが通り、バージョンがセマンティックに上がり、仕様の差分から変更履歴が生成され、パッケージが3つのレジストリすべてに公開され、GitHub リリースが出ます。

## 参考資料
- [OpenAPI Generator](https://openapi-generator.tech?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [npm publishing docs](https://docs.npmjs.com/cli/commands/npm-publish?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [PyPI publishing guide](https://packaging.python.org/en/latest/tutorials/packaging-projects/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Homebrew tap creation](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Fern](https://buildwithfern.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Speakeasy](https://www.speakeasy.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

[**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-7-sdks-and-cli) 上で動かせば、SDK と CLI の層をあなたのために生成できます。あなたが公開するツールサーフェスから、Forter は主要な言語でイディオマティックな SDK をビルドして公開し - 開発者向けドキュメントから直接リンクできる状態に - そして、あなたのユーザーとそのエージェントが直接呼び出せる認証済み API を立ち上げます。認証、リトライ、エラー処理、ページネーションが配線済みで、ツールが変わるたびにすべての SDK が再生成されます。

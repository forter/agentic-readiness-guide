---
id: m2-3-document-for-agents
module: comprehensible
moduleNumber: 2
guidelineNumber: 3
title: エージェント向けにドキュメントを整える
complexity: 3
impact: 5
visualChange: medium
forterApplies: 'no'
---

# 2.3  エージェント向けにドキュメントを整える

## 概要と理由
エージェントが連携を推薦するかどうかを天秤にかけるとき、それはあなたの `/docs` を読み、ページにあるもので判断します - マーケティングコピーをクリックして通り抜け、本物のリファレンスを探しに行くことはしません。ドキュメントがエージェントにとって機能するのは、**深さ**（クイックスタート、認証のウォークスルー、複数言語の実行可能なコードサンプル、完全なエンドポイントリファレンス）と **引用可能性**（名前のある著者、日付入りの具体的な数字、正確なエンドポイントパス、書かれたとおりに動くコード）の両方を備えているときです。[Stripe API リファレンス](https://stripe.com/docs/api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) は、エージェントグレードのドキュメントの代表例です。すでにドキュメントサイトや開発者ポータルを運営しているなら、ゼロからのやり直しではありません - それにリンクし、その水準まで引き上げてください。

`/docs` の一部は、後のガイドラインで完成します - 認証のウォークスルーは [3.1](./m3-1-oauth-discovery.md)、生成されるエンドポイントリファレンスは [4.1](./m4-1-openapi-spec.md) で。ここで構造と引用可能性の基準を整えておけば、それらのページは、作り直しを強いることなく、すんなり収まります。

## スコアリング
- **工数 3/5** - 本物のドキュメント作業ですが、ほとんどは部分的に持っているコンテンツを組み立てて引き締めることです。
- **インパクト 5/5** - ドキュメントの深さは、エージェントが連携を推薦するかどうかを最も強く予測する単一の要因です。
- **視覚的変化: 中** - `/docs` に構造が加わります。クイックスタート、名前付き著者の署名、コードサンプルの増加。ドキュメントを読む人には見えます。

## 手順
1. **5分のクイックスタートを提供する。** 1ページで: `curl` リクエスト → レスポンス、コピー＆ペースト可能、実在する（サンドボックスの）クレデンシャル付き。クイックスタートは、「この製品は本当にユーザーが尋ねたことをするのか?」を確認するためにエージェントが最初に取得するものです。1画面に収まらなければ、もう負けています。
2. **認証フローをエンドツーエンドで文書化する。** OAuth のクライアント登録、トークン交換、リフレッシュ、スコープリファレンス、エラーコード。伏せ字にしつつ形だけは残したトークンを使った実例を含めます。（[3.1](./m3-1-oauth-discovery.md) がプロトコルを構築し、このページはそれが着地したときに完成します。）この散文の機械実行可能な対になるのが、[3.3](./m3-3-self-serve-credentials.md) の `/auth.md` エージェント登録レシピです。
3. **4つ以上の言語でコードサンプルを提供する。** Curl、JavaScript/TypeScript、Python、Go - 最低でもこれだけ。各サンプルは擬似コードではなく、実行可能でなければなりません。エージェントは言語をまたいでパターンマッチします。1つでも欠けると、あなたの取得サーフェスが縮みます。
4. **構造化された API リファレンスを公開する。** エンドポイントごとに1ページで、`path`、`method`、`parameters`、`request body`、`response body`、`error codes`、そして少なくとも1つの例を載せます。OpenAPI（[4.1](./m4-1-openapi-spec.md)）から生成して仕様から乖離しないようにします - これが、4.1 とともにオンラインになる `/docs` の唯一の部分です。
5. **主張を引用可能にする。** すべてのガイドに、資格を伴う名前付き著者（「By {氏名}, {役職}」）。日付入りで具体的な数字（「2026年Q1時点で、午後2時より前に発注された注文の94%が、当社の英国フルフィルメントネットワーク全域で当日出荷される」）- 「大規模でも超高速」ではなく。あなたが使うすべてのドメイン用語を解決する用語集ページを設け、エージェントがあなたの専門用語（それが何であれ - `chargeback`、`webhook`、`idempotency-key`、`tenant`）を、あなたのオリジンを離れずに解決できるようにします。
6. **コンテンツネゴシエーションでエージェントに Markdown を提供する。** エージェントは、必要なわずかな事実に到達するためにレンダリングされた HTML をかき分けることで、トークンの税を払います。*同じ正規 URL* 上で Markdown を要求できるようにしてください。リクエストが `Accept: text/markdown` を伴うとき、Markdown 表現を `Content-Type: text/markdown; charset=utf-8` - 登録済みのメディアタイプ（[RFC 7763](https://www.rfc-editor.org/rfc/rfc7763.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)）であり、非推奨の `text/x-markdown` や未登録の `application/markdown` では **ない** - で返し、そして **必ず** `Vary: Accept` を設定して、CDN が HTML をキャッシュして次のエージェントに渡してしまわないようにします。要求された型を本当に生成できないときにのみ `406 Not Acceptable` を返し、品質値を尊重します（Markdown に対する `q=0` は HTML にフォールバックしなければなりません）。`.md` の「双子」URL も公開する場合、それらは補完であって代替ではありません - エージェントがパスを推測せずに発見できるよう、それぞれを `Link: </page.md>; rel="alternate"; type="text/markdown"`（[RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)）で広告してください。正規のレシピとスタックごとの手順は [acceptmarkdown.com](https://acceptmarkdown.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) にあります。Cloudflare の *Markdown for Agents* は、アプリを一切変更せずにエッジでネゴシエーション全体を行います。

## 参考資料
- [Stripe API リファレンス](https://stripe.com/docs/api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Diataxis ドキュメンテーションフレームワーク](https://diataxis.fr?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenAPI 仕様](https://spec.openapis.org/oas/latest.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [acceptmarkdown.com - Markdown コンテンツネゴシエーション](https://acceptmarkdown.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7763 - The text/markdown Media Type](https://www.rfc-editor.org/rfc/rfc7763.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

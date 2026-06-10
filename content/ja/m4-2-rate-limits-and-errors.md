---
id: m4-2-rate-limits-and-errors
module: actionable
moduleNumber: 4
guidelineNumber: 2
title: レート制限とエラーを標準化する
complexity: 2
impact: 5
visualChange: none
forterApplies: 'yes'
---

# 4.2  レート制限とエラーを標準化する

## 概要と理由
自分でスロットリングできるエージェントは、ブロックされません。あなたのエラーを解析できるエージェントは賢くリトライし、できないエージェントは諦めます。すべてのレスポンスに付けるレート制限ヘッダーと、すべての失敗に付ける構造化されたエラーエンベロープは、追加コストがほぼゼロで、エージェントがすでに期待している慣例に従い、そして夜通し働くエージェントと、午前3時に人間を呼び出すエージェントの差を生みます。レート制限はまた、あなたの **エージェントストームに対する防御** でもあります - 暴走するループ、プロンプトインジェクションによる逸脱、リトライの連鎖 - だからこそ、上限に近いものだけでなく、すべてのレスポンスにヘッダーを付けます。

## スコアリング
- **工数 2/5** - ヘッダーと共有のエラースキーマ。どんな最新のフレームワークでも1日のミドルウェア作業、加えてステータスページのエンドポイント。
- **インパクト 5/5** - 最もレバレッジの効くランタイムのガイドラインです。これがなければエージェントは派手に失敗し、あれば優雅に回復します。
- **視覚的変化: なし** - HTTP ヘッダーと JSON のエラーボディ。ユーザーに見えるものは変わりません。

## 手順
1. **成功でも失敗でも、すべてのレスポンスにレート制限ヘッダーを出力する。** `X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset`（Unix エポック秒）。`429` では、さらに `Retry-After`（HTTP 日付ではなく秒 - 解析が簡単です）を送ります。OpenAPI で、エンドポイントごとのバケットのスコープを文書化します。
2. **共有の `Error` スキーマを1つ定義し、どこでも使う。** 必須フィールド: `type`（安定した URI、または `rate_limited`、`validation_failed`、`insufficient_funds` のような短いトークン）、`message`（1文）、`request_id`、`retry_hint`（`retry_now` | `retry_after_seconds:N` | `do_not_retry`）。任意: フィールドレベルの検証エラー用の `details[]`。
3. **HTTP ステータスをエラータイプに正直に対応させる。** `400` 検証、`401` 認証、`403` スコープ、`404` リソース、`409` 競合、`422` 意味的、`429` レート制限、`5xx` あなたのバグ。エージェントは、まずステータスコード、次に `type` フィールドでリトライを振り分けます。どちらかについて嘘をつくと、回復のループが壊れます。
4. **安定した URL にステータスページを公開する**（`/status` または `status.yourdomain.com`）。`Accept: application/json` で呼ばれたら JSON を返します。スキーマ: `status`（`operational` | `degraded` | `outage`）、`incidents[]`、`last_updated`。エージェントは、`5xx` が自分の問題だと決めつける前にこれをポーリングします。
5. **契約を文書化する。** 開発者向けドキュメントに「レート制限とエラー」ページを設け、すべての `type` の値、その意味、推奨されるリトライ戦略を1つの表にまとめます。

## 参考資料
- [RFC 6585 - Additional HTTP Status Codes](https://datatracker.ietf.org/doc/html/rfc6585?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7231 - Retry-After](https://datatracker.ietf.org/doc/html/rfc7231?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#section-7.1.3)
- [RFC 9457 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [GitHub API レート制限ヘッダー](https://docs.github.com/en/rest/overview/resources-in-the-rest-api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#rate-limiting)

## Forter による支援

内部ツールを [**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-2-rate-limits-and-errors) に公開すると、このガイドラインが説明する形でそれらを公開 API として発行します - そして、レート制限とエラーの標準化はゲートウェイで処理されます。Forter はすべてのレスポンスに `X-RateLimit-*` と `Retry-After` ヘッダーを出力し、テナントごとのスロットリングを強制し、すべての失敗を標準の `{type, message, request_id, retry_hint}` エンベロープで包みます - そのため、あなたのオリジンがヘッダーを1つも出力しなくても、エージェント向けの契約は正しく一貫します。

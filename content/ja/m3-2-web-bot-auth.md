---
id: m3-2-web-bot-auth
module: trustworthy
moduleNumber: 3
guidelineNumber: 2
title: ボットを暗号学的に検証する
complexity: 4
impact: 3
visualChange: none
forterApplies: 'flagship'
---

# 3.2  ボットを暗号学的に検証する

## 概要と理由
悪質なボットは善良なボットになりすませます。スクレイパーが `User-Agent: ChatGPT-User` を設定すれば、UA 許可リストはそれを通してしまいます。競合インテリジェンスのクローラーが Perplexity を名乗り、あなたの価格表を収集します。クレデンシャルスタッフィングのボットが ClaudeBot を装って、あなたのレート制限を回避します。暗号学的な証明がなければ、すべての UA 文字列は当て推量です。

**RFC 9421 HTTP Message Signatures** - Web Bot Auth の暗号学的な背骨 - がこれを解決します。本物のエージェント（例えば OpenAI のウェブ取得エージェント）は、自らのリクエストを Ed25519 鍵で署名し、`Signature-Agent` ヘッダー（例: `Signature-Agent: "https://chatgpt.com"`）で身元を名乗ります。あなたは、彼らが公開する鍵ディレクトリに対して署名を検証し、通します。有効な署名を持たないなりすましは、拒否されます。

## スコアリング
- **工数 4/5** - RFC 9421 は厳密です。正規化、署名ベースの構築、JWKS のホスティング、鍵のローテーション、リプレイキャッシュ、可観測性を、すべて正しくしなければなりません。
- **インパクト 3/5** - プロトコルスタックの中で最もクリーンな不正対策のサーフェスです。なりすましのボットトラフィックは支配的な不正ベクトルですが、普及はまだ進行中です。
- **視覚的変化: なし** - `/.well-known/http-message-signatures-directory` と DNS レコードを機械専用のパスに追加します。エッジでの検証は、人間の訪問者には不可視です。

## 手順
1. **署名ディレクトリを公開する。** `/.well-known/http-message-signatures-directory` に、Ed25519 JWK の `keys` 配列を置きます。各鍵は `kty=OKP`、`crv=Ed25519`、安定した `kid`、そして `nbf` / `exp` の有効期間を持ちます。
2. **`Signature-Input` と `Signature` ヘッダーを検証する。** 既知のエージェント UA を名乗るすべての受信リクエストで行います。対象コンポーネント（`@method`、`@authority`、`@path`、`content-digest` など）から署名ベースを再構築し、`keyid` をエージェント運用者が公開する JWKS に対して解決し、Ed25519 で検証します。不一致なら `401 Unauthorized` と `WWW-Authenticate: Signature` チャレンジで拒否します。
3. **署名のないボットトラフィックを拒否する。** 既知のエージェントを名乗るものに対して。`User-Agent: ChatGPT-User`（または証明できない `Signature-Agent`）を広告しながら有効な署名を持たないリクエストは、なりすましです - ドロップしてください。（まずログを取りたいかもしれません。なりすましのパターン自体が有用なテレメトリです。）
4. **既知の頻度で鍵をローテーションする。** 90日のローテーションが標準です。新しい鍵を未来の `nbf` でディレクトリに投入し、古い鍵は `exp` を設定して退役させ、署名中のものがローテーションの途中で失敗しないよう、有効期間を7〜14日重ねます。
5. **署名の `nonce` 値をキャッシュする。** リプレイを防ぐためです。`(kid, nonce)` をキーとし、`created` のスキュー許容よりわずかに長い TTL を持つ、上限付きの LRU で十分です。
6. **検証の失敗を計測する。** 署名済みリクエストの総数、モード別の失敗（未知の `kid`、不正な署名、期限切れの `created`、リプレイ）、UA ごとのなりすまし比率のメトリクスを出力します。これがあなたのボット不正のテレメトリであり - 異常検知への入力です。
7. **（新興）DNS-AID ディスカバリーレコードを公開する。** [DNS for AI Discovery (DNS-AID)](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) を使えば、エージェントはページ取得の前に、DNS から直接あなたのエントリポイントを見つけられます。[RFC 9460](https://www.rfc-editor.org/rfc/rfc9460?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) に従って、組織インデックス用の ServiceMode SVCB レコードを `_index._agents.example.com` に公開します（エージェントごとのレコードは、ラベルではなく `alpn` SvcParam にプロトコルを担わせます - `alpn="mcp"` / `alpn="a2a"`）。そして **公開ディスカバリーゾーンを DNSSEC で署名** して、検証するリゾルバが認証済みデータを返すようにします - これが、ディスカバリーを暗号学的にあなたのドメインに結びつけるものであり、慎重に展開すべき理由でもあります。DNSSEC の変更をしくじると、ゾーン全体が落ちる可能性があります。これは初期段階の IETF ドラフトです - 先行きを見据えたものとして扱ってください。

## 参考資料
- [RFC 9421 - HTTP Message Signatures](https://datatracker.ietf.org/doc/html/rfc9421?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)（`alg` ラベルは `ed25519`）
- [RFC 8032 - EdDSA（Ed25519 署名アルゴリズム）](https://www.rfc-editor.org/rfc/rfc8032?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8037 - JOSE/JWK における Ed25519 鍵（`kty=OKP`、`crv=Ed25519`）](https://datatracker.ietf.org/doc/html/rfc8037?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [web-bot-auth アーキテクチャドラフト](https://datatracker.ietf.org/doc/draft-meunier-web-bot-auth-architecture/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cloudflare Web Bot Auth](https://blog.cloudflare.com/web-bot-auth/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [DNS for AI Discovery (DNS-AID)](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9460 - SVCB and HTTPS DNS records](https://www.rfc-editor.org/rfc/rfc9460?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Forter Trusted Agentic Commerce Protocol (TACP)](https://github.com/forter/trusted-agentic-commerce-protocol?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

オーケストレーションスイートは、RFC 9421 の署名検証をエッジで実行します - Ed25519 鍵のローテーション、リプレイキャッシュ、JWKS の解決、そして受信するボットトラフィックのリクエストごとの検証。

Web Bot Auth は *誰が* 呼び出しているかを検証しますが、*何が* 交換されるかは保護しません。そのために Forter は、オープンな [**Trusted Agentic Commerce Protocol (TACP)**](https://github.com/forter/trusted-agentic-commerce-protocol?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) を策定しています - Web Bot Auth が署名プロトコルであるのに対し、TACP は暗号化プロトコルです。これは、多者間のエージェンティックコマースのデータを確実に双方向で運び、エージェント、マーチャント、その間の各当事者が、機微な注文・決済・アイデンティティのデータを、経路上のすべてのホップにさらすことなく交換できるようにします。

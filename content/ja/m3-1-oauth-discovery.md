---
id: m3-1-oauth-discovery
module: trustworthy
moduleNumber: 3
guidelineNumber: 1
title: OAuth を実装する
complexity: 5
impact: 4
visualChange: medium
forterApplies: 'flagship'
---

# 3.1  OAuth を実装する

## 概要と理由
OAuth 2.0 は、誰も設定ファイルにキーを貼り付けることなく、エージェントがユーザーに代わってあなたの API に認証できる唯一のクレデンシャルモデルです。これを2つの well-known ディスカバリードキュメント（認可サーバー向けの **RFC 8414**、保護リソース向けの **RFC 9728**）と組み合わせれば、エージェントはあなたのドメインだけから認証フローを解決できます。これは本ガイドで最も技術的に密度の高いガイドラインであり、Forter が最も提供を加速する箇所です。

これはまた、エージェントのセッションを **既知の再訪ユーザー** に変える唯一の確実な方法でもあります。認可コードのリダイレクトは、人間をファーストパーティのブラウザコンテキストに連れてきて、エージェントの背後に隠れたままではなく、あなたと直接認証させます - これにより、再訪する顧客を認識し、保存されたプロフィールと決済手段を紐づけ、アイデンティティを意識したリスクチェックを適用できます。これがなければ、エージェント主導の訪問はすべて、認識も推論もできない匿名のゲストに帰着します。

スコープはまた、あなたの **被害範囲の上限** でもあります - 漏洩または悪用されたトークンが、ユーザーが認可した以上のことをできてはなりません。スコープ設計は早めに正しくしておいてください。後から作り直すのは骨が折れます。

## スコアリング
- **工数 5/5** - 標準が多くを占めます。PKCE、リフレッシュトークンのローテーション、スコープ設計、鍵のローテーション、リプレイ保護、動的クライアント登録 (dynamic client registration) を、すべて正しくしなければなりません。既製のライブラリは助けになりますが、作業をなくしてはくれません。
- **インパクト 4/5** - 認証済みの再訪ユーザーへの唯一の確実な道です。これがあれば、エージェントの訪問は実在するアイデンティティに紐づき、なければ、すべてのやり取りが匿名のゲストに崩れ落ちます。
- **視覚的変化: 中** - 同意 / 認可画面を追加します。既存の公開ページは変わりません。

## 手順
1. **OAuth 2.0 + OIDC 認可サーバーを立ち上げる。** すべてのパブリッククライアントに対して PKCE を必須にします（RFC 6749、RFC 7636）。短命のアクセストークン（15〜60分）と、**毎回の使用ごとにローテーションする** リフレッシュトークンを発行します - こうすれば、流出したリフレッシュトークンは、正規のクライアントが次にリフレッシュした時点で無効化されます。
2. **API リソースに対応するスコープを、狭く設計する。** 汎用的な `read` / `write` より、`orders:read`、`payments:write` を優先します。エージェントには最小権限が付与され、監査証跡はよりクリーンになり、漏洩したトークンの被害範囲は実際に認可された範囲に限定されます。
3. **認可サーバーのメタデータを公開する。** `/.well-known/oauth-authorization-server`（RFC 8414）に: `issuer`、`authorization_endpoint`、`token_endpoint`、`jwks_uri`、サポートするレスポンスタイプとグラントタイプ。
4. **保護リソースのメタデータを公開する。** `/.well-known/oauth-protected-resource`（RFC 9728）に: `resource`、`authorization_servers`、`scopes_supported`、`bearer_methods_supported`。これにより、エージェントは 401 → `WWW-Authenticate` の往復を省き、認証を一度に解決できます。ここはまた、`auth.md` の `agent_auth` ディスカバリーフックが存在する場所でもあります - [3.3](./m3-3-self-serve-credentials.md) を参照。
5. **クライアントクレデンシャルをセルフサービスで発行する。** RFC 7591 動的クライアント登録が標準的な形です - 完全なプログラム発行フローは [3.3](./m3-3-self-serve-credentials.md) を参照。
6. **すべてのトークンイベントを監査ログに記録する。** 発行、リフレッシュ、失効、スコープ不一致による拒否 - `client_id` と `sub` でインデックス付けします。これは、後でセッションの調査が必要になったときの、あなたのフォレンジックの基本要素です。

## 参考資料
- [RFC 6749 - OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7591 - Dynamic Client Registration](https://datatracker.ietf.org/doc/html/rfc7591?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8414 - Authorization Server Metadata](https://datatracker.ietf.org/doc/html/rfc8414?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9728 - Protected Resource Metadata](https://datatracker.ietf.org/doc/html/rfc9728?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

[**Forter エージェンティック・オーケストレーション・スイート**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m3-1-oauth-discovery) は、本番稼働の OAuth 2.0 サーバーを運用し、リバースプロキシ経由であなたのドメイン配下に公開します。RFC 8414 + RFC 9728 のメタデータは、あなたのオリジン上に公開されます。PKCE、リフレッシュトークンのローテーション、JWKS のローテーション、リプレイキャッシュ、動的クライアント登録が処理されます - 標準が多くを占める構築作業を、シンプルな連携プロジェクトに変えます。

---
id: m5-3-cross-platform-consistency
module: experiential
moduleNumber: 5
guidelineNumber: 3
title: サーフェス間で一貫性を保つ
complexity: 2
impact: 3
visualChange: medium
forterApplies: 'partial'
---

# 5.3  サーフェス間で一貫性を保つ

## 概要と理由
エージェントは、あなたが自分自身について語ることを、サーフェス間で突き合わせて確認します。あなたの HTML `<title>`、OG の説明、MCP ツールの説明、プラグインマニフェスト、`llms.txt` の概要、エージェントカードは、エージェントがあなたのツールを呼び出すかどうかを決めるとき、すべて同じコンテキストウィンドウに収まります。それらが食い違うと、確信 - そしてツール選択率 - が下がります。これはマーケティングコピーの話ではありません。**同じ名詞** についての記述の一貫性、すなわちあなたの製品が何をするのか、誰のためのものか、いくらかかるか、の話です。

あなたは [1.2](./m1-2-well-known-agent-files.md) で正式コピーを確定し、それ以来すべてのガイドラインがそこから引いてきました - なので、これは **書き直しではなく検証のパス** です。何も乖離していないことを確認し、乖離した1つか2つのサーフェスを直します。

## スコアリング
- **工数 2/5** - すべてのサーフェスを1つのファイルに対して差分比較し、乖離したものについて PR を出すだけ。[1.2](./m1-2-well-known-agent-files.md) の正式コピーの規律が保たれていたなら、やることはほとんどありません。
- **インパクト 3/5** - 現実的ですが限定的。単独の勝利ではなく、モジュール5の残りの乗数です。
- **視覚的変化: 中** - meta タグ、OG カード、`<title>` の微調整は、ブラウザのタブとリンクプレビューに見えます。ページ本文は変わりません。

## 手順
1. **[1.2](./m1-2-well-known-agent-files.md) の正式コピーファイルを開く。** 短い名前、モデル向けの説明、人間向けの段落は、構築の最初に一度だけ確定されました。そのファイルが参照であり、他のすべてのサーフェスはそれに対してチェックされます。
2. **すべてのサーフェスをそれに対して差分比較する。** 各サーフェスを正式コピーと横並びで比較します: HTML `<title>`、`<meta name="description">`、OG の `og:title` / `og:description`、`llms.txt` の冒頭の段落、MCP の `serverInfo.name` とツールの `description` フィールド、`ai-plugin.json` の `name_for_human` / `description_for_model`、GPT Store / Claude / Gemini の掲載、エージェントカード。すべてのガイドラインが指示どおり正式ファイルから引いていたなら、これはクリーンです - 実際には、1つか2つのサーフェスが乖離します。
3. **乖離をその源で直す。** サーフェスがずれていたら、それを直し *かつ* それを生み出したテンプレートやジェネレータも直して、二度と乖離できないようにします。CMS が制御するサーフェス - HTML の head、OG タグ、サイトマップのタイトル、`llms.txt` - は、あなたのリポジトリとチームのものです。Forter はここには手を入れられません。
4. **Forter が制御するメタデータを揃える。** 正式な短い名前、説明、ツールレベルの説明を Forter の顧客コンソールに登録します。オーケストレーションスイートが、それらを MCP サーバーの `serverInfo`、すべてのツールの `description` フィールド、公開された `ai-plugin.json`、エージェントカード、そして GPT Store / Claude / Gemini ディレクトリへの再登録パッケージに伝播させます。

## 参考資料
- [Open Graph protocol](https://ogp.me/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP server initialization spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#initialization)
- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-apps-in-chatgpt?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter による支援

オーケストレーションスイートがあなたに代わって公開するメタデータ - MCP ツールの説明、`ai-plugin.json`、エージェントカード、レジストリのエントリ - は、あなたの顧客コンソールにある単一の信頼できる情報源に対して一貫性が強制されます。正式な名前と説明を一度更新すれば、Forter が公開するすべてのサーフェスが足並みをそろえて再レンダリングされ、次回のプラグインストア / Custom GPT の再検証（[5.1](./m5-1-verified-on-platforms.md)）が、別個の登録キューなしに新しいコピーを出荷します。

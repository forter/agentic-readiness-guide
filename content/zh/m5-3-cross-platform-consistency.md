---
id: m5-3-cross-platform-consistency
module: experiential
moduleNumber: 5
guidelineNumber: 3
title: 跨界面保持一致
complexity: 2
impact: 3
visualChange: medium
forterApplies: 'partial'
---

# 5.3  跨界面保持一致

## 是什么与为什么
智能体会跨界面交叉核对你对自己的说法。你的 HTML `<title>`、OG 描述、MCP 工具描述、插件清单、`llms.txt` 概览和智能体卡片，最终都会出现在智能体决定是否调用你的工具时的同一个上下文窗口里。当它们互相矛盾时，置信度 - 以及工具被选中的比率 - 就会下降。这与营销文案无关；这是关于**同一个名词**的描述一致性：你的产品做什么、面向谁、多少钱。

你早在 [1.2](./m1-2-well-known-agent-files.md) 就锁定了规范文案，此后每条准则都从它取用 - 所以这是一次**核对，而不是重写**：确认没有东西漂移，修好漂移了的那一两个界面。

## 评分
- **工作量 2/5** - 把每个界面与一个文件做 diff，再为漂移的部分提一个 PR。如果 [1.2](./m1-2-well-known-agent-files.md) 的规范文案纪律守住了，几乎没有事可做。
- **影响力 3/5** - 真实但有边界。是模块5其余部分的乘数，不是独立的胜利。
- **视觉变化：中** - meta 标签、OG 卡片和 `<title>` 的调整在浏览器标签页和链接预览中可见。页面正文不变。

## 步骤
1. **打开 [1.2](./m1-2-well-known-agent-files.md) 的规范文案文件。** 短名称、面向模型的描述和面向人的段落在构建之初就一次性定好了。那个文件是基准；其他每个界面都对照它检查。
2. **把每个界面与它做 diff。** 逐一并排对照规范文案：HTML `<title>`、`<meta name="description">`、OG 的 `og:title` / `og:description`、`llms.txt` 开头段落、MCP 的 `serverInfo.name` 和工具 `description` 字段、`ai-plugin.json` 的 `name_for_human` / `description_for_model`、`ai-catalog.json` 的描述、GPT Store / Claude / Gemini 条目、智能体卡片。如果每条准则都按要求从规范文件取用，这一步就是干净的 - 实践中总有一两个界面漂移。
3. **在源头修复漂移。** 界面偏离之处，修正它*并且*修正产生它的模板或生成器，让它不能再漂移。CMS 控制的界面 - HTML head、OG 标签、站点地图标题、`llms.txt` - 属于你的仓库和你的团队；Forter 无法伸手进来。
4. **对齐 Forter 控制的元数据。** 把规范短名称、描述和工具级描述提交到 Forter 的客户控制台；编排套件会把它们传播到 MCP 服务器的 `serverInfo`、每个工具的 `description` 字段、已发布的 `ai-plugin.json`、智能体卡片，以及 GPT Store / Claude / Gemini 目录的重新提交包。

## 参考资料
- [Open Graph 协议](https://ogp.me/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP 版本与兼容性](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-apps-in-chatgpt?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## Forter 如何提供帮助

编排套件替你发布的元数据 - MCP 工具描述、`ai-plugin.json`、智能体卡片、注册目录条目 - 被强制与你客户控制台中的单一事实来源保持一致。更新一次规范名称和描述，每个 Forter 发布的界面都同步重新渲染，而下一轮插件商店 / Custom GPT 重新认证（[5.1](./m5-1-verified-on-platforms.md)）会带上新文案发出，无需单独排提交队列。

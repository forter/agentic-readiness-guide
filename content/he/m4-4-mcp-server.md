---
id: m4-4-mcp-server
module: actionable
moduleNumber: 4
guidelineNumber: 4
title: הפעילו שרת MCP
complexity: 4
impact: 5
visualChange: none
forterApplies: 'flagship'
---

# 4.4  הפעילו שרת MCP

## מה ולמה
זוהי **נקודת** האינטגרציה להפעלה נייטיבית של סוכנים. עם שרת MCP על Streamable HTTP,‏ ChatGPT,‏ Claude,‏ Gemini, וכל LLM שתומך ב-function-calling יכולים לקרוא לכלים שלכם נייטיבית - ללא שאיבה, ללא קוד-דבק, ללא "ואז אנחנו מבקשים מהמשתמש להדביק מפתח API". שלבו את השרת עם server-card מפורסם וכיסיתם כיצד זמני-הריצה הגדולים של הסוכנים כיום מגיעים ללוגיקת העסק שלכם. (סוכנים שיושבים בדפדפן הם ערוץ נפרד - זה WebMCP,‏ [4.5](./m4-5-webmcp.md).)

זו גם השכבה שבה לסטיית סוכן יש את ההשלכה הגדולה ביותר - קריאות כלי MCP מריצות **לוגיקת עסק ממשית** (הזמנות, החזרים, תשלומים). הרשאות OAuth לכל-כלי (מ-[3.1](./m3-1-oauth-discovery.md)) תוחמות מה שכל קריאה בודדת יכולה לעשות, גם אם הסוכן הקורא מוסט ממסלולו על ידי prompt injection בדף שאוחזר. מהותי תפעולית מספיק כדי שרוב הצוותים משלבים את Forter כדי לספק את צד השער.

## ניקוד
- **מאמץ 4/5** - שרת MCP ממשי (Streamable HTTP, סשנים מקושרי-OAuth, הרשאה לכל-כלי), ועוד הערות כלים ומשאבים לקריאה-בלבד, ועוד WebMCP, ועוד server-card מפורסם, ועוד ניטור לכל-הפעלה. פריימוורקי MCP מוכנים-מהמדף עוזרים.
- **השפעה 5/5** - נקודת הקצה בעלת המינוף הגדול ביותר במדריך. כל זמן-ריצה של סוכן שחשוב צורך MCP ראשון.
- **שינוי חזותי: ללא** - נקודת הקצה `/mcp` ו-`/.well-known/mcp/server-card.json` הן למכונה בלבד. אין שינויי דף גלויים-למשתמש.

## שלבים
1. **ממשו שרת MCP עם טרנספורט Streamable HTTP.** הרכיבו אותו ב-`/mcp` (או `mcp.yourdomain.com`). קמפלו את רשימת הכלים שלכם ישירות ממפרט ה-OpenAPI מ-[4.1](./m4-1-openapi-spec.md): כל `operationId` הופך לכלי, כל סכמת בקשה הופכת לסכמת הקלט של הכלי, כל סכמת תגובה הופכת לסכמת הפלט. כתיבת כלים ידנית סוטה; ייצור לא.
2. **קשרו כל קריאת כלי לטוקן bearer של OAuth.** השתמשו שוב בשרת ה-auth מ-[3.1](./m3-1-oauth-discovery.md). כלים רצים תחת ההרשאות של הקורא - סוכן עם `orders:read` לא יכול להפעיל `payments:write`, גם אם הוא מנסה. דחו קריאות ללא טוקן, עם טוקנים שפגו, או עם הרשאה לא-מספקת באמצעות אותה מעטפת שגיאה מובנית מ-[4.2](./m4-2-rate-limits-and-errors.md) (`type: "insufficient_scope"`,‏ `retry_hint: "do_not_retry"`). זו השכבה שתוחמת את רדיוס הנזק אם סוכן סוטה מהכוונה.
3. **פרסמו server-card ב-`/.well-known/mcp/server-card.json`.** שדות חובה: `name`,‏ `description`,‏ `version`,‏ `serverUrl`,‏ `transport: "streamable-http"`,‏ `authorization` (מקשר למטא-נתוני RFC 8414 / 9728 שלכם מ-[3.1](./m3-1-oauth-discovery.md)), ו-`tools[]` עם `{name, description, inputSchema, outputSchema}`.
4. **הצהירו הערות התנהגותיות על כל כלי.** תייגו כל כלי עם `annotations.readOnlyHint` ו-`annotations.destructiveHint` כך שהמארח יודע אילו קריאות בטוחות לניסיון-חוזר או לאישור-אוטומטי ואילו משנות מצב - `getOrderStatus` הוא `readOnlyHint: true`, בעוד `cancelOrder`,‏ `initiateReturn`, ו-`disputeCharge` הם `destructiveHint: true`. סוכנים קוראים את אלה כדי להחליט מתי לעצור לאישור משתמש; כלי משנה-מצב ללא הערה נחסם או נקרא ללא הנחיית בטיחות.
5. **חשפו הקשר לקריאה-בלבד כמשאבי MCP.** כלים הם לפעולות; **משאבים** הם להקשר שסוכן קורא *לפני* שהוא פועל - קטלוגים, טבלאות תמחור, צילומי סטטוס, תיעוד. פרסמו את יכולת ה-`resources` בלחיצת היד `initialize` וממשו `resources/list` ו-`resources/read`. כל משאב זקוק ל-URI יציב, ל-`mimeType` מדויק, ולגוף לא-ריק. סוכן שיכול לקרוא `pricing://current` כמשאב לא צריך לבזבז קריאת כלי (והרשאה) רק כדי לענות "כמה זה עולה?".
6. **צפו בכל הפעלה.** רשמו ביומן כל קריאת כלי עם `{tool_name, client_id, sub, request_id, latency_ms, status, error_type}`. אגרו לתקציב השהיה / שגיאות לכל-כלי שאתם מתריעים עליו. זה שובל הביקורת הפורנזי שלכם - אם סוכן סוטה ושורשר קריאות כלים בדרכים לא-מכוונות, זו העדשה שתופסת זאת. (ברגע שהניטור מוצק, רשמו את השרת במרשמים - mcp.run,‏ mcphub.io,‏ Smithery,‏ skills.sh - לפי [4.6](./m4-6-agent-registries.md). פלטפורמות AI צרכניות - GPT Store,‏ Custom GPTs,‏ Claude,‏ Gemini - הן [5.1](./m5-1-verified-on-platforms.md).)

## מקורות
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#streamable-http)
- [MCP Server Card](https://modelcontextprotocol.io/community/server-card/charter?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP resources](https://modelcontextprotocol.io/docs/concepts/resources?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Registry](https://github.com/modelcontextprotocol/registry?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

שרת MCP בסביבת ייצור עם Streamable HTTP, מופעל עבורכם וחשוף תחת הדומיין שלכם. כלים מיוצרים-אוטומטית מה-OpenAPI שלכם בכל שחרור.‏ Server-card מפורסם ב-`/.well-known/mcp/server-card.json` שלכם דרך reverse-proxy. כל קריאת כלי רצה מאחורי שרת ה-OAuth ש-Forter מפעילה ב-[3.1](./m3-1-oauth-discovery.md) - הרשאות לכל-כלי נאכפות בשער לפני שקריאה מגיעה לדומיין שלכם. הערות כלים התנהגותיות (`readOnlyHint` / `destructiveHint` הנגזרות מפעלי ה-HTTP של המפרט שלכם) ומשאבי MCP לקריאה-בלבד כלולים. הגשות למרשמי MCP‏ (mcp.run,‏ mcphub.io,‏ Smithery) מטופלות ומאומתות-מחדש בכל שחרור. ניטור לכל-הפעלה עם לוחות בקרה והתרעות מחווטים פנימה. מה שאחרת היה בנייה הנדסית מהותית הופך לאינטגרציה.

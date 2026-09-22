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
- **מאמץ 4/5** - שרת MCP ממשי (Streamable HTTP, בקשות מקושרות-OAuth, הרשאה לכל-כלי), ועוד הערות כלים ומשאבים לקריאה-בלבד, ועוד WebMCP, ועוד server-card מפורסם, ועוד ניטור לכל-הפעלה. פריימוורקי MCP מוכנים-מהמדף עוזרים.
- **השפעה 5/5** - נקודת הקצה בעלת המינוף הגדול ביותר במדריך. כל זמן-ריצה של סוכן שחשוב צורך MCP ראשון.
- **שינוי חזותי: ללא** - נקודת הקצה `/mcp` ו-`/.well-known/mcp/server-card.json` הן למכונה בלבד. אין שינויי דף גלויים-למשתמש.

## שלבים
1. **ממשו שרת MCP עם טרנספורט Streamable HTTP.** הרכיבו אותו ב-`/mcp` (או `mcp.yourdomain.com`). קמפלו את רשימת הכלים שלכם ישירות ממפרט ה-OpenAPI מ-[4.1](./m4-1-openapi-spec.md): כל `operationId` הופך לכלי, כל סכמת בקשה הופכת לסכמת הקלט של הכלי, כל סכמת תגובה הופכת לסכמת הפלט. כתיבת כלים ידנית סוטה; ייצור לא.

   **בנו ללא מצב (stateless).** רביזיית `2026-07-28` הפכה את MCP לחסר-מצב בשכבת הפרוטוקול, וזה הדבר היחיד והגדול ביותר שכדאי לעשות נכון אם אתם מתחילים עכשיו. אין יותר לחיצת יד של `initialize` ואין כותרת `Mcp-Session-Id`: כל בקשה נושאת את גרסת הפרוטוקול ואת יכולות הלקוח שלה ב-`_meta` (`io.modelcontextprotocol/protocolVersion`,‏ `io.modelcontextprotocol/clientCapabilities`), והשרת שלכם **חייב** לממש את `server/discover` כדי שלקוח יוכל לשאול באילו יכולות אתם תומכים לפני שהוא מתחייב. כל דבר שצריך להימתח על פני קריאות - עגלה בטיוטה, החזרה רב-שלבית - הופך ל**ידית שהשרת מנפיק** (handle) שאתם מחזירים והלקוח מחזיר לכם כארגומנט כלי רגיל. לעולם אל תסיקו מצב מתוך החיבור: לקוחות רשאים לשזור בקשות לא-קשורות על אותה תעבורה. אם אתם כבר מפעילים שרת `2025-11-25` או מוקדם יותר, תוכלו להגיש את שתי התקופות מאותה נקודת קצה (בקשה עם `_meta` מודרני מקבלת טיפול חסר-מצב, `initialize` מקבל טיפול מדור קודם) - אבל כתבו שרתים חדשים מודרניים-בלבד.
2. **קשרו כל קריאת כלי לטוקן bearer של OAuth.** השתמשו שוב בשרת ה-auth מ-[3.1](./m3-1-oauth-discovery.md). כלים רצים תחת ההרשאות של הקורא - סוכן עם `orders:read` לא יכול להפעיל `payments:write`, גם אם הוא מנסה. דחו קריאות ללא טוקן, עם טוקנים שפגו, או עם הרשאה לא-מספקת באמצעות אותה מעטפת שגיאה מובנית מ-[4.2](./m4-2-rate-limits-and-errors.md) (`type: "insufficient_scope"`,‏ `retry_hint: "do_not_retry"`). זו השכבה שתוחמת את רדיוס הנזק אם סוכן סוטה מהכוונה.
3. **פרסמו server-card ב-`/.well-known/mcp/server-card.json`.** שדות חובה: `name`,‏ `description`,‏ `version`,‏ `serverUrl`,‏ `transport: "streamable-http"`,‏ `authorization` (מקשר למטא-נתוני RFC 8414 / 9728 שלכם מ-[3.1](./m3-1-oauth-discovery.md)), ו-`tools[]` עם `{name, description, inputSchema, outputSchema}`.
4. **הצהירו הערות התנהגותיות על כל כלי.** תייגו כל כלי עם `annotations.readOnlyHint` ו-`annotations.destructiveHint` כך שהמארח יודע אילו קריאות בטוחות לניסיון-חוזר או לאישור-אוטומטי ואילו משנות מצב - `getOrderStatus` הוא `readOnlyHint: true`, בעוד `cancelOrder`,‏ `initiateReturn`, ו-`disputeCharge` הם `destructiveHint: true`. סוכנים קוראים את אלה כדי להחליט מתי לעצור לאישור משתמש; כלי משנה-מצב ללא הערה נחסם או נקרא ללא הנחיית בטיחות.
5. **חשפו הקשר לקריאה-בלבד כמשאבי MCP.** כלים הם לפעולות; **משאבים** הם להקשר שסוכן קורא *לפני* שהוא פועל - קטלוגים, טבלאות תמחור, צילומי סטטוס, תיעוד. פרסמו את יכולת ה-`resources` בתוצאת ה-`server/discover` שלכם וממשו `resources/list` ו-`resources/read`. כל משאב זקוק ל-URI יציב, ל-`mimeType` מדויק, ולגוף לא-ריק. סוכן שיכול לקרוא `pricing://current` כמשאב לא צריך לבזבז קריאת כלי (והרשאה) רק כדי לענות "כמה זה עולה?".

6. **הפכו את הרשימות שלכם ליציבות וניתנות-לשמירה במטמון.** החל מ-`2026-07-28`, התוצאות של `tools/list`,‏ `prompts/list`,‏ `resources/list`,‏ `resources/read` ו-`resources/templates/list` נושאות `ttlMs` (רמז טריות) ו-`cacheScope` (`"public"` או `"private"`, ששולט אם מתווכים משותפים רשאים לשמור במטמון). הגדירו אותם במכוון: `ttlMs` נדיב על רשימת כלים יציבה חוסך לכל לקוח הלוך-ושוב, בעוד `cacheScope: "private"` הוא מה ששומר משאב ייעודי-ללקוח מחוץ למטמון משותף. החזירו כלים מ-`tools/list` גם ב**סדר דטרמיניסטי** - לקוחות שומרים במטמון לפיו, וסדר יציב משפר משמעותית את שיעור הפגיעות במטמון ההנחיות של ה-LLM. בנוסף, צפו לכותרות התקניות `Mcp-Method` ו-`Mcp-Name` ב-POST-ים של Streamable HTTP, ותייגו כל תוצאה ב-`resultType: "complete"`.

7. **דעו מה בדרך החוצה.** `2026-07-28` הציג מחזור-חיים פורמלי לפיצ'רים, עם חלון נטישה של שנים-עשר חודשים לפחות, והעביר את **sampling** (שרתים שמבקשים מהמודל של הלקוח השלמה), את **roots** ואת **logging** למצב Deprecated - אל תבנו עליהם עבודה חדשה. העבירו קבצים ותיקיות כפרמטרים של כלי או כ-URI של משאב במקום Roots; קראו ישירות ל-API של ספק LLM במקום Sampling; פלטו OpenTelemetry במקום Logging. בקשות ביוזמת השרת מוחלפות בדפוס **Multi Round-Trip Requests**: כשאתם צריכים עוד מהקורא, החזירו `resultType: "input_required"` עם payload של `inputRequests`, ותנו ללקוח לנסות מחדש את הבקשה המקורית כשהיא נושאת `inputResponses`. גם טרנספורט HTTP+SSE הוא Deprecated - Streamable HTTP הוא הטרנספורט היחיד שכדאי לבנות עליו.
8. **צפו בכל הפעלה.** רשמו ביומן כל קריאת כלי עם `{tool_name, client_id, sub, request_id, latency_ms, status, error_type}`. אגרו לתקציב השהיה / שגיאות לכל-כלי שאתם מתריעים עליו. זה שובל הביקורת הפורנזי שלכם - אם סוכן סוטה ושורשר קריאות כלים בדרכים לא-מכוונות, זו העדשה שתופסת זאת. (ברגע שהניטור מוצק, רשמו את השרת במרשמים - mcp.run,‏ mcphub.io,‏ Smithery,‏ skills.sh - לפי [4.6](./m4-6-agent-registries.md). פלטפורמות AI צרכניות - GPT Store,‏ Custom GPTs,‏ Claude,‏ Gemini - הן [5.1](./m5-1-verified-on-platforms.md).)

## מקורות
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP `2026-07-28` key changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP versioning and compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP feature lifecycle and deprecation policy](https://modelcontextprotocol.io/community/feature-lifecycle?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Server Card](https://modelcontextprotocol.io/community/server-card/charter?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP resources](https://modelcontextprotocol.io/docs/concepts/resources?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Registry](https://github.com/modelcontextprotocol/registry?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

שרת MCP בסביבת ייצור עם Streamable HTTP, מופעל עבורכם וחשוף תחת הדומיין שלכם. כלים מיוצרים-אוטומטית מה-OpenAPI שלכם בכל שחרור.‏ Server-card מפורסם ב-`/.well-known/mcp/server-card.json` שלכם דרך reverse-proxy. כל קריאת כלי רצה מאחורי שרת ה-OAuth ש-Forter מפעילה ב-[3.1](./m3-1-oauth-discovery.md) - הרשאות לכל-כלי נאכפות בשער לפני שקריאה מגיעה לדומיין שלכם. הערות כלים התנהגותיות (`readOnlyHint` / `destructiveHint` הנגזרות מפעלי ה-HTTP של המפרט שלכם) ומשאבי MCP לקריאה-בלבד כלולים. הגשות למרשמי MCP‏ (mcp.run,‏ mcphub.io,‏ Smithery) מטופלות ומאומתות-מחדש בכל שחרור. ניטור לכל-הפעלה עם לוחות בקרה והתרעות מחווטים פנימה. מה שאחרת היה בנייה הנדסית מהותית הופך לאינטגרציה.

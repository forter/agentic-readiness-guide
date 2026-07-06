---
id: m4-1-openapi-spec
module: actionable
moduleNumber: 4
guidelineNumber: 1
title: ספקו מפרט OpenAPI
complexity: 4
impact: 5
visualChange: none
forterApplies: 'yes'
---

# 4.1  ספקו מפרט OpenAPI

## מה ולמה
OpenAPI 3.x הוא מקור האמת שכל תוצר סוכן במורד הזרם מתקמפל ממנו: כלי MCP, סכמות function-calling,‏ SDK-ים, פקודות CLI, מניפסטי plugin. מפרט מלא - מפורסם, מקושר מקטלוג RFC 9727 - מאפשר לסוכן לפתור את כל מרחב ה-API שלכם מהדומיין שלכם בלבד. לרוב הצוותים כבר יש מפרט חלקי; העבודה היא מילוי פערים והידוק תיאורים.

התייחסו למפרט כ**בסיס חי**, לא כתוצר קפוא: [4.3](./m4-3-streaming.md) מוסיף בו הערות לפעולות הזרמה, [4.8](./m4-8-payment-protocols.md) מוסיף מטא-נתוני תשלום, וצינורות ה-SDK,‏ ה-CLI וה-MCP מתחדשים ממנו בכל שינוי. אתם כותבים אותו פעם אחת כאן ומרחיבים אותו במקום ככל שהנחיות מאוחרות נוחתות - זו התבגרות מתוכננת, לא עבודה מחדש.

## ניקוד
- **מאמץ 4/5** - עבודת סכמה ממשית על כל נקודת קצה, שגיאה ופרמטר עימוד. ייצור מונחה-הערות עוזר אך לא מחליף חשיבה.
- **השפעה 5/5** - מודולים 4 ו-5 פונקציונלית אינם קיימים בלי זה. כל ממשק פרוטוקול במורד הזרם תלוי בו.
- **שינוי חזותי: ללא** - מוסיף `/openapi.json` ו-`/.well-known/api-catalog` בנתיבים למכונה בלבד; האתר הגלוי-למשתמש לא משתנה.

## שלבים
1. **כתבו OpenAPI 3.1** (או 3.0 אם הכלים שלכם בפיגור) ב-`/openapi.json` וב-`/openapi.yaml`. כסו כל נקודת קצה ציבורית. הכשילו ב-CI כל route שמשתחרר ללא כיסוי במפרט. בצעו lint עם Spectral מול ערכת-כללים שאוסרת ברירות מחדל של `additionalProperties: true` ותגובות `object` ללא טיפוס.
2. **כתבו `operationId`-ים ו-`description`-ים תיאוריים.** `createOrder` עדיף על `postOrders`. כל פעולה מקבלת תיאור בן פסקה באנגלית פשוטה - זה מה שה-LLM קורא כשהוא בוחר כלי, ואותו טקסט מזין את תיאורי כלי ה-MCP של [4.4](./m4-4-mcp-server.md). תייגו פעולות לקבוצות משאבים כך שרשימות כלי ה-MCP הסופיות יישארו ניתנות-לסריקה.
3. **תנו טיפוס לכל תגובה, כולל שגיאות.** הגדירו סכמת `Error` משותפת עם `type`,‏ `message`,‏ `request_id`,‏ `retry_hint` (ראו [4.2](./m4-2-rate-limits-and-errors.md)) והפנו אליה מכל תגובת `4xx` / `5xx`. ללא בריחות `additionalProperties`; סוכנים לא יכולים להסיק את מה שלא הוצהר.
4. **ציינו עימוד במפורש.** בחרו מודל אחד - מבוסס-cursor הוא הידידותי ביותר - ותעדו את `cursor`,‏ `limit`, ואת מעטפת התגובה (`data[]`,‏ `next_cursor`,‏ `has_more`) בכל נקודת קצה של רשימה.
5. **פרסמו קטלוג API לפי RFC 9727** ב-`/.well-known/api-catalog`. מסמך JSON שמקשר את קובצי ה-OpenAPI שלכם, מדיניות הגרסאות, כתובות sandbox, ומטא-נתוני קשר.
6. **נהלו משא-ומתן על תצוגות ידידותיות-לסוכן.** כשסוכן שולח `Accept: text/markdown`, החזירו רינדור markdown של המשאב (כותרת, שדות מרכזיים, קישורים) במקום JSON גולמי, והגדירו `Vary: Accept` כך שמטמונים שומרים את וריאנט ה-JSON ואת וריאנט ה-markdown בנפרד. עבור סוכנים וסורקים שלא יכולים להגדיר כותרת בקשה, כבדו פרמטר שאילתה `?mode=agent` שמחזיר את אותה תצוגה מקולפת בסגנון-markdown של כל דף או משאב. לקוחות JSON ודפדפנים לא רואים שינוי.

## מקורות
- [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9727 - API Catalog](https://datatracker.ietf.org/doc/html/rfc9727?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Spectral OpenAPI linter](https://github.com/stoplightio/spectral?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/release-notes?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

זו הנחיה שאתם יכולים למסור ל-Forter כמעט במלואה. במקום לכתוב ולתחזק API ציבורי בעצמכם, אתם חושפים את הכלים והיכולות הפנימיים שלכם באופן פרטי ל[**חבילת המוכנות לסוכנים של Forter**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-1-openapi-spec) - ורק ל-Forter - והיא הופכת לשער ה-API שלכם. מהכלים שאתם מתירים, היא גוזרת את מפרט OpenAPI 3.x, כותבת את סכמות הבקשה והתגובה, מפרסמת את `/openapi.json` ואת קטלוג RFC 9727 על הדומיין שלכם, ושומרת את המפרט מיושר ככל שהכלים הללו משתנים - ללא סטייה, ללא מסמך מתוחזק-ביד.

כל מה שבמורד הזרם מיוצר מאותו ממשק חשוף יחיד: כלי MCP‏ ([4.4](./m4-4-mcp-server.md)), סכמות function-calling, ה-SDK-ים וה-CLI‏ ([4.7](./m4-7-sdks-and-cli.md)), וחוזה מגבלות-הקצב והשגיאות ([4.2](./m4-2-rate-limits-and-errors.md)) - מוגבלי-קצב ומנוהלי-גרסה בשער. עיצוב ה-REST, משמעת הסכמה, הפצת ה-SDK, והעבודה המתמשכת של שמירת המשתלבים מעודכנים - כולם מועברים הלאה ביעילות.

מה שנשאר שלכם: הכלים עצמם ולוגיקת העסק שמאחוריהם. אתם מחליטים מה לחשוף;‏ Forter הופכת זאת לממשק API שלם, מתוחזק ומוכן-לסוכנים.

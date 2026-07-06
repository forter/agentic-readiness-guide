---
id: m4-5-webmcp
module: actionable
moduleNumber: 4
guidelineNumber: 5
title: חשפו כלים עם WebMCP
complexity: 2
impact: 3
visualChange: none
forterApplies: 'partial'
---

# 4.5  חשפו כלים עם WebMCP

## מה ולמה
WebMCP הוא הדרך בעלת החיכוך הנמוך ביותר להפוך אתר לאג'נטי. בעוד ששרת MCP‏ ([4.4](./m4-4-mcp-server.md)) הוא תשתית backend -‏ WebMCP הוא API של דפדפן. כמה שורות JavaScript בדף רושמות **כלים**, וסוכן שיושב בדפדפן (Chrome עם Gemini, או מודל מקומי) קורא להם ישירות, בתוך הסשן של המשתמש עצמו, ללא שרת, ללא auth נפרד, וללא צורך בתוכנית API.

זוהי הצעת W3C מתפתחת של Google ו-Microsoft - מוקדמת, אך זולה לאימוץ. היא משתמשת שוב באותו מודל כלים כמו MCP‏ (`name`,‏ `description`,‏ `inputSchema`,‏ `annotations`), כך שהתיאורים והסכמות שנכתבו עבור [4.4](./m4-4-mcp-server.md) עוברים ישירות - ואתר ללא שרת MCP כלל עדיין יכול לאמץ WebMCP בכוחות עצמו.

## ניקוד
- **מאמץ 2/5** - עבודת front-end בלבד: רשמו כלים ב-JavaScript של הדף, כתבו תיאורים וסכמות קלט ברורים. ללא שרת, ללא שרת auth, ללא דרישת-קדם של OpenAPI. המפרט עדיין מתבגר, אז תקצבו לקצת תנודות API.
- **השפעה 3/5** - פוטנציאל סטנדרט-מתפתח. תמיכת הדפדפנים עדיין נוחתת, אך WebMCP הוא הנתיב הזול ביותר להיות ניתנים-לקריאה בידי סוכנים בתוך-הדפדפן, וסיכון החיסרון קרוב לאפס לאור העלות.
- **שינוי חזותי: ללא** - כלים נרשמים ב-JavaScript; הדף מרונדר בדיוק כמו קודם.

## שלבים
1. **רשמו כלים עם `registerTool()`.** קראו לו על אובייקט ה-model-context של הדף. מפרט ה-W3C הנוכחי חושף אותו כ-`document.modelContext`; בנייות Chrome מוקדמות יותר וה-polyfill של MCP-B משתמשים ב-`navigator.modelContext` (שגם נושא צורת `provideContext()` ישנה שמחליפה את כל ערכת הכלים בבת אחת), אז בדקו זיהוי-תכונה לשניהם לפני שימוש. אתם מצהירים על כל כלי ב-JavaScript של הדף - אתם מחליטים בדיוק אילו פעולות נחשפות. כלי זקוק ל-`name`, ל-`description` בשפה טבעית, ל-`inputSchema` (JSON Schema לפרמטרים שלו), ול-callback‏ `execute` שעושה את העבודה ומחזיר Promise:
   ```js
   const mc = document.modelContext || navigator.modelContext;
   mc.registerTool({
     name: "search_products",
     description: "Search the catalog by keyword and return matching products.",
     inputSchema: {
       type: "object",
       properties: { query: { type: "string" } },
       required: ["query"]
     },
     annotations: { readOnlyHint: true },
     async execute({ query }) {
       const results = await searchCatalog(query);
       return { content: [{ type: "text", text: JSON.stringify(results) }] };
     }
   });
   ```
2. **הוסיפו הערות לכלים כך שהסוכן יודע מה בטוח.** הגדירו `annotations.readOnlyHint` על כלים שרק קוראים מצב, ו-`annotations.untrustedContentHint` על כלים שמחזירים נתונים שאינכם שולטים בהם. סוכן דפדפן קורא את אלה כדי להחליט למה הוא יכול לקרוא בעצמו ובמה להתייחס בזהירות.
3. **התנו פעולות בעלות-השלכה באישור משתמש.** ה-callback‏ `execute` של כלי מקבל `ModelContextClient`; קראו ל-`client.requestUserInteraction()` לפני כל דבר שמוציא כסף או משנה מצב חשבון. המשתמש כבר בדפדפן - הכניסו אותו ללולאה במקום לתת לסוכן לבצע בשקט.
4. **רשמו ובטלו רישום כלים בהתאם למצב הדף.** רשימת הכלים צריכה לשקף מה התצוגה הנוכחית באמת יכולה לעשות: רשמו כלים כשתצוגה נטענת והעבירו `AbortSignal` (`registerTool(tool, { signal })`) כך שיוסרו כשהמשתמש מנווט משם. סוכן שמוצע לו כלי מיושן יקרא לו וייכשל.

## מקורות
- [WebMCP proposal - W3C](https://webmachinelearning.github.io/webmcp/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [JSON Schema](https://json-schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [The WebMCP Directory](https://webmcp.cool/)

## כיצד Forter יכולה לעזור

[**חבילת המוכנות לסוכנים של Forter**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-5-webmcp) מייצרת את קישורי ה-`registerTool` בתוך-הדף מאותן הגדרות כלים שמהן היא כבר בונה את שרת ה-MCP שלכם ([4.4](./m4-4-mcp-server.md)) - כך שמערכי הכלים שלכם בצד-הדפדפן ובצד-השרת מתוארים פעם אחת ונשארים מסונכרנים. הקישורים, ה-callbacks של `execute`, ומחזור-החיים של מצב-הדף (רישום בעליית תצוגה, ביטול רישום בניווט) מיוצרים עבורכם, לא נמסרים לכם כנקודת התחלה.

Forter עוזרת **להטמיע את הקישורים לתוך האתר הקיים שלכם** - תג script יחיד בדפים שתבחרו, ללא כתיבה מחדש של האפליקציה. לאחר ההטמעה, הכלים שאתם חושפים הופכים לניתנים-לקריאה בידי כל סוכן שיושב בדפדפן או סוכן AI שתומך ב-WebMCP, לצד אותו ממשק ששרת ה-MCP שלכם כבר מגיש לסוכנים מרוחקים.‏ WebMCP עדיין הצעה בתנועה, אז Forter עוקבת אחר תיקוני המפרט ומעדכנת את הקישורים המיוצרים ככל שה-API מתייצב - האינטגרציה שלכם נעה עם הסטנדרט, לא נגדו.

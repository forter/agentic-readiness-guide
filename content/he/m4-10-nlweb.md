---
id: m4-10-nlweb
module: actionable
moduleNumber: 4
guidelineNumber: 10
title: הפעילו נקודת קצה של NLWeb
complexity: 3
impact: 3
visualChange: none
forterApplies: 'yes'
---

# 4.10  הפעילו נקודת קצה של NLWeb

## מה ולמה
NLWeb הוא סטנדרט פתוח מתפתח להפיכת תוכן האתר שלכם למשהו שסוכן יכול *לשוחח איתו* במקום לשאוב אותו. אתם מפרסמים את התוכן המובנה שלכם כ-**Schema Feeds**, שרת NLWeb קולט אותם, והוא חושף נקודת קצה סטנדרטית יחידה - `POST /ask` - שעונה על שאלות בשפה טבעית מעל אותו תוכן ומחזירה JSON מובנה. כל מופע NLWeb הוא גם שרת MCP, ולכן אותה נקודת קצה `/ask` נגישה גם כנקודת קצה רגילה של HTTP וגם ככלי MCP. חשבו על זה כמקבילה השיחתית למפת האתר שלכם: מפת האתר מפרטת את הדפים שלכם,‏ NLWeb עונה על שאלות עליהם.

זה מוקדם - המפרט עדיין נע והאימוץ דליל - אבל זה זול להקים מעל נתונים מובנים שכבר אמורים להיות לכם ([2.1](./m2-1-json-ld.md)), וזו הדרך הנקייה ביותר לתת לסוכן לשאול "האם אתם מחזיקים X?" או "מה חלון ההחזרה שלכם?" בלי לסרוק.

## ניקוד
- **מאמץ 3/5** - פרסום Schema Feeds הוא אחר צהריים, ו-`/ask` מינימלי שעוטף את החיפוש הקיים שלכם הוא צנוע. שרת מלא עם vector-store-ומודל הוא העבודה האמיתית, אם כי ערכת הכלים בקוד פתוח של NLWeb עושה את רובה.
- **השפעה 3/5** - פוטנציאל סטנדרט-מתפתח. נמוך היום, מתקבל על הדעת כמרכזי ככל שאחזור שיחתי מתבגר; סיכון החיסרון קרוב לאפס לאור העלות הנמוכה.
- **שינוי חזותי: ללא** - שורת `Schemamap` ב-robots.txt, קובץ feed, ונקודת קצה `/ask` - הכול למכונה בלבד.

## שלבים
1. **פרסמו Schema Feeds.** הוסיפו שורה אחת ל-robots.txt - `Schemamap: https://example.com/.well-known/schema-map.xml` - והגישו Schema Map XML שמצביע על כל feed מסוג JSONL או RSS שאתם מפרסמים (feed-ים של מוצרים, של בלוג, של FAQ). פריטי ה-feed נושאים טיפוסי Schema.org, ולכן עבודת הנתונים-המובנים מ-[2.1](./m2-1-json-ld.md) היא הקורפוס ש-NLWeb מאחזר ממנו.
2. **התחילו עם `POST /ask` מינימלי.** כל הפרוטוקול מצטמצם לנקודת קצה אחת, והגרסה המינימלית בת-הקיימא לא צריכה vector store ולא מודל - היא יכולה להעביר את השאלה הנכנסת ישירות לנקודת הקצה או לכלי החיפוש הקיים שלכם. הבקשה היא גוף JSON שנושא את ה-`query` בשפה טבעית; התגובה היא תוצאות מדורגות ומובנות בתוספת בלוק `_meta`:
   ```json
   {
     "results": ["...ranked, structured matches..."],
     "_meta": { "response_type": "...", "version": "..." }
   }
   ```
   שני שדות ה-`_meta` - `response_type` ו-`version` - הם מה שמאפשר ללקוח לוודא שהוא מדבר עם שרת NLWeb תואם. שמרו את `/ask` ציבורי ולא-מאומת; אחזור סוכנים ללא חיכוך הוא כל העניין.
3. **(אופציונלי) הרחיבו לשרת NLWeb מלא.** כשאתם רוצים אחזור אמיתי בשפה טבעית במקום מעבר חיפוש, אמצו את ערכת הכלים בקוד פתוח של NLWeb: היא קולטת את ה-Schema Feeds שלכם לתוך vector store ומחווטת אותם ל-backend של LLM. הצביעו אותה אל ה-feed-ים משלב 1 ואנדקסו מחדש בלוח-זמנים כך שתשובות עוקבות אחר הקטלוג החי שלכם, לא צילום מיושן.
4. **תמכו בהזרמה.** כשהלקוח מבקש תגובה מוזרמת, שלחו תוצאות חזרה באופן הדרגתי כ-Server-Sent Events במקום גוף JSON חוסם אחד - אותה משמעת SSE כמו [4.3](./m4-3-streaming.md). תשובות ארוכות מרגישות מגיבות; קצרות לא עולות דבר נוסף.
5. **אמתו את שני הממשקים.** הריצו `curl` על נקודת הקצה `/ask` עם שאלה מייצגת וודאו את שדות ה-`_meta`; ואז התחברו לאותו שרת מעל MCP וודאו שכלי ה-`ask` מופיע. שרת NLWeb שנכשל בלחיצת היד של MCP פרוס רק חלקית.

## מקורות
- [NLWeb project](https://github.com/microsoft/NLWeb?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org vocabulary](https://schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [HTML Living Standard - Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

אם הקמת vector store, צינור קליטה, ו-backend של מודל היא יותר ממה שאתם רוצים להחזיק, [**חבילת המוכנות לסוכנים של Forter**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-10-nlweb) יכולה לארח את שרת ה-NLWeb עבורכם. הצביעו אותה אל ה-Schema Feeds שלכם ו-Forter מפרסמת נקודת קצה `POST /ask` תואמת תחת הדומיין שלכם - נגישה גם כ-HTTP רגיל וגם ככלי ה-MCP שכל מופע NLWeb גם חושף - וקולטת מחדש בלוח-זמנים כך שתשובות עוקבות אחר הקטלוג החי שלכם.

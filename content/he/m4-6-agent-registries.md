---
id: m4-6-agent-registries
module: actionable
moduleNumber: 4
guidelineNumber: 6
title: הירשמו במרשמי סוכנים
complexity: 1
impact: 3
visualChange: low
forterApplies: 'yes'
---

# 4.6  הירשמו במרשמי סוכנים

## מה ולמה
עם שרת ה-MCP חי ([4.4](./m4-4-mcp-server.md)) וה-OpenAPI נקי ([4.1](./m4-1-openapi-spec.md)), סוף-סוף יש לכם מה לפרסם. סוכנים מגלים יכולות דרך **מרשמים** - לא דרך סריקה - וארבעה מהם חשובים: **mcp.run,‏ mcphub.io,‏ Smithery** (מרקטפלייסים של שרתי MCP) ו-**skills.sh** (קטלוג skills ברמת-דומיין עם אינדוקס מהשורה הראשונה ב-Claude וב-Cursor). הרישום חינמי, הטפסים קצרים, והמשמעת היא שמירה על תיאורים מדויקים ככל שמערך הכלים שלכם מתפתח.

## ניקוד
- **מאמץ 1/5** - ארבע הגשות, ~15 דקות כל אחת. איכות הרישומים תחומה על ידי איכות המפרט הבסיסי, אז רוב העבודה קרתה ב-[4.1](./m4-1-openapi-spec.md) וב-4.4.
- **השפעה 3/5** - בלי רישומים אתם בלתי-נראים לגילוי-יכולות; איתם אתם מופיעים בבורר בכל פעם שמשתמש מבקש "כלים שעושים X".
- **שינוי חזותי: נמוך** - הרישומים חיים על מרשמי צד-שלישי, לא על האתר שלכם.

## שלבים
1. **mcp.run ו-mcphub.io.** הגישו את כתובת שרת ה-MCP שלכם, תיאור בן פסקה, רשימת הכלים שלכם, ולוגו. שניהם מושכים מטא-נתוני כלים מנקודת הקצה `tools/list` של השרת שלכם, ולכן ה-`description` בכל כלי MCP הוא מה שמשתמשים באמת קוראים - כתבו אותם כמו תיעוד API, לא טקסט שיווקי. איכות תיאור הכלי מתחקה חזרה ל-OpenAPI שלכם מ-[4.1](./m4-1-openapi-spec.md).
2. **Smithery.** המרקטפלייס הגדול ביותר של MCP. הוסיפו `smithery.yaml` בשורש המאגר שלכם שמצהיר על זמן-ריצה, משתני סביבה, ופקודת הפעלה - זה מה שמאפשר התקנות בקליק אחד ב-Cursor וב-Windsurf.
3. **skills.sh - רשמו את הדומיין שלכם.** תבעו את הדומיין שלכם ב-skills.sh ופרסמו `SKILL.md` ברמה העליונה לכל מאגר ציבורי, המפרט כל skill ניתנת-לקריאה עם `name`,‏ `description`,‏ `inputs`,‏ `outputs`, ובלוק `example`. הפורמט הוא markdown עם frontmatter - השאילו מכל מאגר מוכר (למשל `stripe/stripe.com/SKILL.md`).
4. **skills.sh - אותות איכות.** המרשם מדרג רישומים לפי שלושה אותות: (א) **מספר מאגרים** תחת אותו דומיין, לכל אחד `SKILL.md` משלו; (ב) **תיאורים שעוברים rubric של LLM** לבהירות (ללא מילוי של "פלטפורמה עוצמתית וקלה-לשימוש"); ו-(ג) **רעננות** -‏ `SKILL.md` מעודכן בתוך 90 יום. אתרים עם `SKILL.md` דק אחד מדורגים מתחת לאתרים עם חמישה ממוקדים.
5. **אמתו ונטרו.** אחרי כל הגשה, חפשו במרשם את שם המותג שלכם ושאילתת מקרה-שימוש מייצגת. הגדירו תזכורת ל-30 יום לאימות-מחדש - מרשמים סורקים מחדש מעת לעת ומסירים בשקט שרתים שמחזירים 5xx או משנים צורה. (פלטפורמות AI צרכניות - GPT Store,‏ Custom GPTs, אינטגרציות Claude, הרחבות Gemini - הן המשימה של 5.1, עם מחזור הסקירה שלהן.)

## מקורות
- [Model Context Protocol Registry](https://github.com/modelcontextprotocol/registry?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Smithery - publishing servers](https://smithery.ai/docs/build?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [skills.sh - SKILL.md spec](https://skills.sh?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

אם שרת ה-MCP שלכם רץ על [**חבילת המוכנות לסוכנים של Forter**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-6-agent-registries), ההגשה למרשמים יכולה להיות מטופלת עבורכם - עם תיאורים מיוצרים-אוטומטית ממסמך ה-OpenAPI ומהערות הכלים שלכם. האימות-מחדש רץ בכל שחרור, כך שהסרות בשקט (מצב הכשל הנפוץ ביותר במרשמים) נתפסות לפני שהן עולות לכם ביכולת הגילוי.

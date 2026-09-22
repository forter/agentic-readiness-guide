---
id: m2-3-document-for-agents
module: comprehensible
moduleNumber: 2
guidelineNumber: 3
title: תעדו עבור סוכנים
complexity: 3
impact: 5
visualChange: medium
forterApplies: 'no'
---

# 2.3  תעדו עבור סוכנים

## מה ולמה
דפי תיעוד הם הערוץ שאליו סוכנים מגיעים הכי הרבה בהרצות משימות. Cloudflare מדדה 31% פחות טוקנים ותשובות מהירות ב-66% לאחר שיפוץ התיעוד שלהם. כשסוכן שוקל אם להמליץ על אינטגרציה, הוא קורא את ה-`/docs` שלכם ושופט מה יש בדף - הוא לא יקליק מעבר לטקסט שיווקי כדי למצוא את ה-reference האמיתי. תיעוד עובד עבור סוכן כשיש בו גם **עומק** (quickstart, סקירת auth, דוגמאות קוד ניתנות-להרצה בכמה שפות, reference מלא של נקודות קצה) וגם **ניתנות לציטוט** (מחברים נקובים בשם, מספרים ספציפיים ומתוארכים, נתיבי נקודת-קצה מדויקים, קוד שרץ כפי שנכתב). ה-[Stripe API reference](https://stripe.com/docs/api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) הוא הדוגמה הקנונית לתיעוד ברמת-סוכן. אם אתם כבר מפעילים אתר תיעוד או פורטל מפתחים, אתם לא מתחילים מאפס - קשרו אליו והרימו אותו לרמה הזו.

חלקים מ-`/docs` מושלמים בהנחיות מאוחרות יותר - סקירת ה-auth בידי [3.1](./m3-1-oauth-discovery.md), ה-reference המיוצר של נקודות הקצה בידי [4.1](./m4-1-openapi-spec.md). הקימו כאן את המבנה ואת סטנדרט הציטוט כך שהדפים הללו ישתבצו במקום לכפות בנייה מחדש.

## ניקוד
- **מאמץ 3/5** - עבודת תיעוד ממשית, ברובה הרכבה והידוק של תוכן שיש לכם חלקית.
- **השפעה 5/5** - עומק התיעוד הוא המנבא היחיד החזק ביותר לכך שסוכן ימליץ על אינטגרציה.
- **שינוי חזותי: בינוני** - `/docs` מקבל מבנה: quickstart, ייחוס מחבר-נקוב-בשם, דוגמאות קוד נוספות. גלוי לכל מי שקורא תיעוד.

## שלבים
1. **ספקו quickstart של 5 דקות.** דף אחד: בקשת `curl` ← תגובה, ניתן להעתקה-הדבקה, עם אישור גישה (sandbox) אמיתי. ה-quickstart הוא מה שסוכנים מושכים ראשון כדי לוודא "האם המוצר הזה באמת עושה את הדבר שהמשתמש שאל עליו?". אם זה לוקח יותר ממסך אחד, הפסדתם.
2. **תעדו את זרימת ה-auth מקצה-לקצה.** רישום לקוח ב-OAuth, החלפת טוקן, רענון, reference של הרשאות, קודי שגיאה. כללו דוגמה מעובדת עם טוקנים מצונזרים-אך-בעלי-צורה. ([3.1](./m3-1-oauth-discovery.md) בונה את הפרוטוקול; הדף הזה מושלם כשהיא נוחתת.) המקבילה המכאנית-לפעולה לפרוזה הזו היא מתכון רישום-הסוכן `/auth.md` ב-[3.3](./m3-3-self-serve-credentials.md).
3. **ספקו דוגמאות קוד ב-4+ שפות.** Curl,‏ JavaScript/TypeScript,‏ Python,‏ Go - מינימום. כל דוגמה חייבת להיות ניתנת-להרצה, לא פסאודו-קוד. סוכנים מבצעים התאמת-תבנית בין שפות; חוסר באחת מכווץ את טווח האחזור שלכם.
4. **פרסמו API reference מובנה.** דף אחד לכל נקודת קצה עם `path`,‏ `method`,‏ `parameters`,‏ `request body`,‏ `response body`,‏ `error codes`, ולפחות דוגמה אחת. ייצרו אותו מ-OpenAPI‏ ([4.1](./m4-1-openapi-spec.md)) כך שלא יוכל לסטות מהמפרט - זהו החלק היחיד מ-`/docs` שעולה לאוויר עם 4.1.
5. **הפכו טענות לניתנות-לציטוט.** מחברים נקובים בשם עם הסמכות בכל מדריך ("By {Name}, {Title}"). מספרים ספציפיים ומתוארכים ("As of Q1 2026, 94% of orders placed before 2pm ship same-day across our UK fulfilment network") - לא "lightning-fast at scale". דף מילון מונחים שפותר כל מונח-תחום שאתם משתמשים בו, כך שסוכנים יכולים לפענח את הז'רגון שלכם (יהיה אשר יהיה - `chargeback`,‏ `webhook`,‏ `idempotency-key`,‏ `tenant`) בלי לעזוב את הדומיין שלכם.
6. **הגישו markdown לסוכנים דרך משא-ומתן תוכן.** סוכן משלם מס טוקנים בחציית HTML מרונדר כדי להגיע לכמה העובדות שהוא צריך. תנו לו לבקש markdown על *אותו URL קנוני*: כשבקשה נושאת `Accept: text/markdown`, החזירו את ייצוג ה-markdown עם `Content-Type: text/markdown; charset=utf-8` - סוג המדיה הרשום ([RFC 7763](https://www.rfc-editor.org/rfc/rfc7763.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)), **לא** ה-`text/x-markdown` המיושן או ה-`application/markdown` הלא-רשום - ו**תמיד** הגדירו `Vary: Accept`, כך ש-CDN לא יוכל לשמור את ה-HTML במטמון ולמסור אותו לסוכן הבא. החזירו `406 Not Acceptable` רק כשאתם באמת לא יכולים לייצר את הסוג המבוקש, וכבדו ערכי איכות (`q=0` על markdown חייב ליפול חזרה ל-HTML). אם אתם גם מפרסמים כתובות "תאומות" של `.md`, הן משלימות, לא תחליף - פרסמו כל אחת עם `Link: </page.md>; rel="alternate"; type="text/markdown"` ([RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)) כך שסוכן יגלה אותה בלי לנחש את הנתיב. המתכון הקנוני וההוראות לכל סטאק נמצאים ב-[acceptmarkdown.com](https://acceptmarkdown.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide); ה-*Markdown for Agents* של Cloudflare מבצע את כל המשא-ומתן בקצה ללא שינוי באפליקציה.

7. **שמרו את הדפים בתוך תקציב ההקשר של הסוכן.** ה-[Agent-Friendly Documentation Spec](https://agentdocsspec.com) (Mintlify, בודק בקוד פתוח ב-[github.com/agent-ecosystem/afdocs](https://github.com/agent-ecosystem/afdocs)) מזהה את גודל הדף כגורם מרכזי: דפים שחורגים מחלון ההקשר של הסוכן נחתכים, והתוכן שבסופם אובד כליל. כוונו לדפי תיעוד של פחות מ-30,000 טוקנים כל אחד; פצלו reference ארוך לדפים לפי נקודת קצה במקום דף-ענק יחיד.
8. **שמרו על יציבות ה-URL-ים.** סוכנים שומרים ומושכים מחדש כתובות תיעוד לאורך סשנים. כל שינוי URL ללא הפניה הוא ציטוט שבור. תחזקו הפניות לכל דף שהועבר, הימנעו מכתובות מבוססות-תאריך או מבוססות-hash שמתחלפות תדיר, והתייחסו למבנה ה-URL של התיעוד שלכם כאל API ציבורי.
9. **תארכו את הדפים ושמרו על דיוקם.** הוסיפו `dateModified` (או שורת "עודכן לאחרונה" גלויה) לכל דף תיעוד. לדף ללא תאריך אין אות טריות; סוכן לא יכול לדעת אם הוא מתאר את ה-API הנוכחי או כזה מלפני שנתיים. שלבו עם בדיקות CI שמסמנות דפים שלא עודכנו 90 ימים ומעלה.
10. **אל תסגרו את התיעוד מאחורי אימות.** דפי תיעוד צריכים להיות נגישים לציבור ללא התחברות. תיעוד שחסום מאחורי חומת אימות הוא בלתי-נראה לסוכנים שלא השלימו את תהליך ההצטרפות שלכם - ורובם לא ינסו לעבור אותו רק כדי לקרוא חומר reference.

## מקורות
- [Stripe API reference](https://stripe.com/docs/api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Diataxis documentation framework](https://diataxis.fr?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenAPI specification](https://spec.openapis.org/oas/latest.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [acceptmarkdown.com - markdown content negotiation](https://acceptmarkdown.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7763 - The text/markdown Media Type](https://www.rfc-editor.org/rfc/rfc7763.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Agent-Friendly Documentation Spec](https://agentdocsspec.com)
- [afdocs open-source checker](https://github.com/agent-ecosystem/afdocs)

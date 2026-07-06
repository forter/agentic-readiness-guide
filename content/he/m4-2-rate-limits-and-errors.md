---
id: m4-2-rate-limits-and-errors
module: actionable
moduleNumber: 4
guidelineNumber: 2
title: תקננו מגבלות קצב ושגיאות
complexity: 2
impact: 5
visualChange: none
forterApplies: 'yes'
---

# 4.2  תקננו מגבלות קצב ושגיאות

## מה ולמה
סוכנים שיכולים לווסת את עצמם לא נחסמים. סוכנים שיכולים לפענח את השגיאות שלכם מנסים שוב בחוכמה; סוכנים שלא יכולים, מוותרים. כותרות מגבלת-קצב בכל תגובה ומעטפות שגיאה מובנות בכל כשל עולות כמעט כלום להוסיף, עוקבות אחר מוסכמות שסוכנים כבר מצפים להן, ועושות את ההבדל בין סוכן שעובד כל הלילה לבין כזה שמזעיק אדם ב-3 לפנות בוקר. מגבלות קצב הן גם **ההגנה שלכם מפני סופות סוכנים** - לולאות מתפרצות, סטייה בעקבות prompt injection, מפלי ניסיונות-חוזרים - ולכן כל תגובה מקבלת כותרות, לא רק אלה הקרובות למגבלה.

## ניקוד
- **מאמץ 2/5** - כותרות וסכמת שגיאה משותפת. עבודת middleware של יום בכל פריימוורק מודרני, ועוד נקודת קצה של עמוד-סטטוס.
- **השפעה 5/5** - הנחיית הזמן-ריצה בעלת המינוף הגבוה ביותר. סוכנים נכשלים ברעש בלעדיה ומתאוששים בחן איתה.
- **שינוי חזותי: ללא** - כותרות HTTP וגופי שגיאה ב-JSON; שום דבר גלוי-למשתמש לא משתנה.

## שלבים
1. **פלטו כותרות מגבלת-קצב בכל תגובה - הצלחה או כשל.** `X-RateLimit-Limit`,‏ `X-RateLimit-Remaining`, ו-`X-RateLimit-Reset` (שניות Unix epoch). ב-`429`, שלחו גם `Retry-After` (שניות, לא HTTP-date - פשוט יותר לפענוח). תעדו את היקף הדלי לכל נקודת קצה ב-OpenAPI.
2. **הגדירו סכמת `Error` משותפת אחת והשתמשו בה בכל מקום.** שדות חובה: `type` (URI יציב או טוקן קצר כמו `rate_limited`,‏ `validation_failed`,‏ `insufficient_funds`),‏ `message` (משפט אחד),‏ `request_id`, ו-`retry_hint` (`retry_now` | `retry_after_seconds:N` | `do_not_retry`). אופציונלי: `details[]` לשגיאות אימות ברמת השדה.
3. **התאימו סטטוס HTTP לסוג השגיאה ביושר.** `400` אימות,‏ `401` auth,‏ `403` הרשאה,‏ `404` משאב,‏ `409` קונפליקט,‏ `422` סמנטי,‏ `429` מגבלת קצב,‏ `5xx` הבאג שלכם. סוכנים מנתבים ניסיונות-חוזרים קודם לפי קוד הסטטוס ואז לפי שדה ה-`type`; שקר על אחד מהם שובר את לולאת ההתאוששות.
4. **פרסמו עמוד סטטוס בכתובת יציבה** (`/status` או `status.yourdomain.com`) שמחזיר JSON כשקוראים לו עם `Accept: application/json`. סכמה: `status` (`operational` | `degraded` | `outage`),‏ `incidents[]`,‏ `last_updated`. סוכנים סוקרים אותו לפני שהם מניחים ש-`5xx` הוא הבעיה שלהם.
5. **תעדו את החוזה.** עמוד "Rate limits and errors" בתיעוד המפתחים שלכם עם טבלה אחת של כל ערכי `type`, משמעויותיהם, ואסטרטגיית הניסיון-החוזר המומלצת.

## מקורות
- [RFC 6585 - Additional HTTP Status Codes](https://datatracker.ietf.org/doc/html/rfc6585?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7231 - Retry-After](https://datatracker.ietf.org/doc/html/rfc7231?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#section-7.1.3)
- [RFC 9457 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [GitHub API rate-limit headers](https://docs.github.com/en/rest/overview/resources-in-the-rest-api?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#rate-limiting)

## כיצד Forter יכולה לעזור

כשאתם חושפים את הכלים הפנימיים שלכם ל[**חבילת המוכנות לסוכנים של Forter**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-2-rate-limits-and-errors), היא מפרסמת אותם כ-API ציבורי בצורה שההנחיה הזו מתארת - והגבלת הקצב ותקנון השגיאות מטופלים בשער.‏ Forter פולטת כותרות `X-RateLimit-*` ו-`Retry-After` בכל תגובה, אוכפת ויסות לכל-tenant, ועוטפת כל כשל במעטפת התקנית `{type, message, request_id, retry_hint}`, כך שהחוזה הפונה-לסוכן נכון ועקבי בלי שהדומיין שלכם יפלוט כותרת אחת.

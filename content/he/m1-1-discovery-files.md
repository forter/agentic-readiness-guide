---
id: m1-1-discovery-files
module: discoverable
moduleNumber: 1
guidelineNumber: 1
title: פרסמו את קובצי הגילוי
complexity: 1
impact: 4
visualChange: none
forterApplies: 'no'
---

# 1.1  פרסמו את קובצי הגילוי

## מה ולמה
ארבעה קובצי טקסט קטנים וסטטיים בשורש הדומיין שלכם מספרים לכל מערכת ה-AI מה יש לכם ומה אפשר לעשות איתו: `sitemap.xml`,‏ `robots.txt`,‏ `llms.txt` ו-`index.md`. כתיבתם לוקחת אחר צהריים, והם מאפשרים לכם לקבל בברכה סורקי סוכנים חיים (הכנסה) ובה בעת להגביל סורקי אימון (אין הכנסה). ערוץ חמישי אינו קובץ כלל: כותרות תגובה מסוג `Link:` ב-HTTP שמפרסמות את המשאבים הללו, כך שסוכן מאתר אותם מתוך בקשת `HEAD` בלי לפענח שורת HTML אחת. שימו לב שזו שכבת **מדיניות**, לא שכבת אכיפה - רק בוטים מתנהגים יכבדו אותה.

## ניקוד
- **מאמץ 1/5** - מעבר אחד של חצי יום, ברובו קובצי טקסט. החלק הקשה ביותר הוא לגרום ל-CMS שלכם לפלוט `<lastmod>` כראוי.
- **השפעה 4/5** - יסודי עבור גילוי מונחה-סורק: מודולים 2-5 לא נבדקים על ידי שום דבר שלא מצליח קודם למצוא אתכם כאן. שימו לב ש-robots.txt ו-sitemap.xml חיוניים לאינדוקס הסריקה, אך לעיתים רחוקות הם הדבר הראשון שסוכן חי מושך - התיעוד ודף הבית מקבלים הרבה יותר תעבורת סוכנים ישירה. דירוג ההשפעה 4 משקף את חשיבות אינדוקס-הסריקה הזו יותר מאשר גלישת סוכנים בזמן אמת.
- **שינוי חזותי: ללא** - קבצים חדשים בנתיבים למכונה בלבד (`/robots.txt`,‏ `/llms.txt`,‏ `/index.md`); הדפים המוצגים שלכם אינם משתנים.

## שלבים
1. **Sitemap.** מפת אתר היא הדרך המהירה ביותר לסורק ללמוד כל URL ששווה למשוך, במקום לנחש מתוך קישורים. הגישו `/sitemap.xml` המפרט כל URL בר-אינדוקס עם חותמות זמן `<lastmod>` מדויקות בתקן ISO-8601 - אותה חותמת זמן היא האות שמספר לסוכן שדף השתנה ושווה לקרוא אותו מחדש. הגבילו כל קובץ ל-50 MB / 50,000 כתובות והשתמשו ב-[sitemap index](https://www.sitemaps.org/protocol.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) עבור אתרים גדולים יותר. `/sitemap.xml` הוא הנתיב שסורקים בודקים ראשון, ולכן אם מפת האתר שלכם כבר שוכנת במקום אחר (`/sitemap_index.xml`, כתובת שה-CMS מייצר) אין צורך להעביר אותה - הוסיפו הפניית `301` מ-`/sitemap.xml` למיקום האמיתי, והנתיב המוסכם ייפתר.
   הרעננות חשובה לא פחות מהנוכחות: ודאו שלפחות `<lastmod>` אחד הוא מ-90 הימים האחרונים. מפת אתר שבה כל חותמות הזמן ישנות מסמנת תוכן נטוש. מה שסוכן מגיע אליו, הוא משתמש בו - דף נגיש עם מידע ישן או שגוי מזיק יותר מאשר היעדר דף כלל.
2. **Robots.txt עם מדיניות AI מבחינה.** `robots.txt` הוא המקום שבו אתם קובעים את כללי המעורבות עבור סורקים - והניואנס השימושי כיום הוא שלא כל סורקי ה-AI שווים. סוכן שמושך את הדף שלכם כדי לענות על שאלת קונה יכול להביא לכם מכירה; סורק ששואב אתכם כדי לאמן מודל לא נותן דבר בתמורה. [Content Signals](https://blog.cloudflare.com/content-signals-policy/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide), מוסכמה שמקורה ב-Cloudflare, מאפשרת לכם לומר מי הוא מי. הפנו אל מפת האתר שלכם, ואז הגדירו שלושה אותות:
   - `search` - האם דף זה רשאי להופיע באינדקס כדי לענות על שאילתות חיפוש (חיפוש קלאסי וחיפוש מבוסס-AI כאחד).
   - `ai-input` - האם דף זה רשאי להימשך בזמן שאילתה ולהיות מוזן לתוך תשובת AI (אחזור חי / RAG).
   - `ai-train` - האם דף זה רשאי לשמש כנתוני אימון למודלי AI.

   `search=yes, ai-input=yes, ai-train=no` היא התצורה שרוב האתרים רוצים - קבלו בברכה את הסוכנים שמביאים תעבורה חיה, סרבו לסורקים שרק קוצרים לצורך אימון. נסחו זאת במפורש, ואז חסמו לחלוטין את סורקי האימון הנקובים בשם, כיוון שלא כל סורק מכבד את האותות עדיין:
   ```
   Sitemap: https://example.com/sitemap.xml

   User-agent: *
   Content-Signal: search=yes, ai-input=yes, ai-train=no

   User-agent: GPTBot
   Disallow: /

   User-agent: CCBot
   Disallow: /
   ```
   אם אתם יושבים מאחורי Cloudflare (או WAF דומה), robots.txt לבדו אינו מספיק. לאחר שינוי המדיניות של Cloudflare מ-1 ביולי 2025, בוטים מאומתים מותרים רק בתוך קטגוריה שבעל האתר מפעיל במפורש (Search,‏ Agent,‏ Training). החל מ-15 בספטמבר 2025, אזורי Cloudflare חדשים חוסמים כברירת מחדל בוטים מסוג Agent ו-Training בדפים נושאי פרסום. פעולה: גשו אל Bot Management ← Verified Bots והפעילו את הקטגוריות **Agent** ו-**Search**. robots.txt אינו יכול לעקוף את ה-WAF.
3. **llms.txt.** דף הבית ה-HTML שלכם בנוי עבור בני אדם - ניווט, שיווק, סקריפטים - וסוכן צריך לחצות את כל זה כדי למצוא כמה עובדות. [`llms.txt`](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) הוא תדריך ב-markdown פשוט שנכתב עבור המודל במקום זאת: סיכום קצר ומובנה של מה אתם עושים, את מי אתם משרתים, מה סוכן יכול לעשות איתכם, וקישורים ל-API ולתיעוד שלכם. פרסמו אותו ב-`/llms.txt` עם מקטעים לסקירת המוצר, מקרי שימוש ומגבלות. הוא לא צריך ניסוח מושלם ביום הראשון - שלד מובנה היטב מספיק כדי להתחיל, ו-[2.2](./m2-2-llms-txt-content.md) מכסה את איכות התוכן.
4. **llms.txt מודולרי.** קובץ שורש יחיד של `llms.txt` לא יכול להעמיק בכל דבר בלי להתארך. הוסיפו וריאנטים לפי תחום - `/docs/llms.txt`,‏ `/api/llms.txt`,‏ `/developers/llms.txt` - כך שסוכן שעובד על משימה ספציפית ימשוך בדיוק את פרוסת ההקשר שהוא צריך. כל קובץ נשאר ממוקד, ואתם נשארים בתוך תקציב הקשב של המודל.
5. **תאומי Markdown לכל דף מפתח (דף הבית לכל הפחות).** חלק מהסוכנים מחפשים `/index.md` - גרסת markdown נקייה של דף הבית - לפני שהם טורחים לפענח HTML. תנו להם כזה (עם `Content-Type: text/markdown`): כותרת עליונה ואותו טקסט ליבה של הצעת הערך שדף הבית ה-HTML שלכם נושא. באופן אידיאלי, הרחיבו זאת לכל דף מפתח על ידי הגשת `{path}/index.md` לצד ה-HTML - המימוש של Cloudflare עושה בדיוק את זה באמצעות שני כללי edge, כיוון שנכון לתחילת 2026 רק Claude Code,‏ OpenCode ו-Cursor שולחים `Accept: text/markdown` כברירת מחדל; כל השאר זקוקים לחלופת ה-URL.
6. **כותרות תגובה `Link` ([RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)).** כל הנ"ל שוכן בנתיב ידוע, אבל סוכן עדיין צריך לבקש כל קובץ כדי למצוא אותו. כותרות תגובה `Link:` מאפשרות לכם לפרסם את כולם בתגובת ה-HTTP עצמה, כך שסוכן מגלה את כל הסט שלכם מבקשת `HEAD` אחת - ללא פענוח HTML כלל. קובץ ששום דבר אינו מצביע עליו מגיעים אליו מאוחר או אף פעם - קישור קובצי הגילוי שלכם מכותרות ה-HTTP ומכותרת התחתונה של התיעוד משפר את ההישג משמעותית. פלטו `Link: </sitemap.xml>; rel="sitemap"`,‏ `Link: </llms.txt>; rel="describedby"`,‏ `Link: </.well-known/api-catalog>; rel="api-catalog"`, ו-`Link: </openapi.json>; rel="service-desc"`. שני האחרונים מצביעים על קבצים ש-[4.1](./m4-1-openapi-spec.md) מעלה לאוויר - הנתיבים קבועים כבר היום, ולכן הכותרות נכונות ברגע שתגדירו אותן ומתחילות להיפתר כש-4.1 נוחתת. הוסיפו את הכותרות הללו בכל הדפים כך שכל דף מפרסם אותן באופן עקבי.

**ודאו את התוצאה.** `curl -I` שולח בקשת `HEAD` ב-HTTP ומדפיס רק את כותרות התגובה - לעולם לא את הגוף - וזו הדרך המהירה ביותר לוודא שנתיב קיים, מחזיר `200`, ונושא את ה-`Content-Type` הנכון. הריצו אותו מול כל קובץ שפרסמתם:

```
curl -I https://example.com/llms.txt
```

תגובה בריאה נראית כך:

```
HTTP/2 200
content-type: text/markdown; charset=utf-8
content-length: 1843
```

בדקו את `/sitemap.xml`,‏ `/robots.txt`,‏ `/llms.txt` ו-`/index.md` באותו אופן - בכל אחד, אתם רוצים סטטוס `200` ו-`content-type` הגיוני. אם השלמתם את שלב 6, `curl -I https://example.com` על דף הבית אמור גם לפרט את כותרות ה-`Link:` שלכם. הסירו את ה-`-I` כדי למשוך את הגוף לצד הכותרות.

## מקורות
- [פרוטוקול sitemaps.org](https://www.sitemaps.org/protocol.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cloudflare Content Signals](https://blog.cloudflare.com/content-signals-policy/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [הצעת llms.txt](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8288 - Web Linking](https://datatracker.ietf.org/doc/html/rfc8288?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

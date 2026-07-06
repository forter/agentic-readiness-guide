---
id: m2-4-competitive-positioning
module: comprehensible
moduleNumber: 2
guidelineNumber: 4
title: מצבו עצמכם תחרותית
complexity: 2
impact: 4
visualChange: high
forterApplies: 'no'
---

# 2.4  מצבו עצמכם תחרותית

## מה ולמה
כשמשתמש שואל סוכן "{אתם} מול {מתחרה}" או "חלופות ל-{מתחרה}", הסוכן מחזיר את כל הדפים שהוא מוצא. אם לא כתבתם את ההשוואה, התוצאה המובילה תהיה הבלוג של המתחרה שלכם או אתר ביקורות צד-שלישי שעבר אופטימיזציה להכנסות שותפים - לא לדיוק. בעלות על מרחב ההשוואה שלכם היא הדרך לוודא שלסוכנים יש גרסה ראשונית וניתנת-לציטוט של הבידול שלכם. אותו היגיון חל על **תמחור**: סוכן שנשאל "כמה עולה {אתם}?" צריך תשובה ראשונית וקריאה למכונה, אחרת הוא מצטט ניחוש צד-שלישי מיושן - והמחיר הוא אחד הדברים בעלי הכוונה הגבוהה ביותר שקונה שואל לפני המרה.

## ניקוד
- **מאמץ 2/5** - ברובו תרגיל כתיבה. דף אחד לכל מתחרה מוביל ועוד דף חלופות מאגד.
- **השפעה 4/5** - שאילתות-מול הן נתח עצום מתעבורת הסוכנים בעלת הכוונה הגבוהה ב-B2B.
- **שינוי חזותי: גבוה** - דפי שיווק ציבוריים חדשים לחלוטין: `/compare/{competitor}`,‏ `/alternatives`, ו-`/pricing`.

## שלבים
1. **פרסמו דפי `/compare/{competitor}` עבור 3-5 המתחרים הנקובים המובילים שלכם.** כל דף: סיכום הוגן בן פסקה, טבלת השוואת תכונות, השוואת מודל-תמחור, ו-1-2 מדדי-ניצחון של לקוחות ("After switching from {competitor}, customers report 31% fewer out-of-stock errors surfaced to shoppers over 6 months" - או כל מספר המרה, מילוי הזמנות, או שימור שהקונים שלכם באמת אכפת להם ממנו). סמנו טבלאות עם `Schema.org/Table` ואת הדף עם JSON-LD של `Article`.
2. **פרסמו דף מאגד יחיד `/alternatives`.** "Alternatives to {your product}" - המכסה כל מתחרה בקצרה, מתי כל אחד הוא ההתאמה הטובה יותר (כן, כולל מקרים שבהם זה לא אתם), ומקשר אל דפי כל-מתחרה. סוכנים מתגמלים יושר אינטלקטואלי בציטוטים.
3. **פרסמו דף `/pricing` קריא-לסוכן.** *(שלבים 3-4 חלים היכן שלמודל העסקי שלכם יש תמחור מוצג בפומבי - מוצרים דיגיטליים, מנויים, מסחר סמוך-SaaS. קמעונאים טרנזקציוניים רבים מתמחרים לפי SKU בדף המוצר במקום בשכבות תוכנית; אם זה אתם, המחירים שלכם כבר חיים ב-JSON-LD של `Product` / `Offer`‏ ([2.1](./m2-1-json-ld.md)) ותוכלו לדלג לשלב 5.)* כל שכבת תוכנית, מחירה, יחידת החיוב, ומה כלול - כטקסט HTML אמיתי וכ-`<table>`, לא תמונה או widget מרונדר-JS. סמנו כל שכבה עם JSON-LD של `schema.org/Offer`‏ (`price`,‏ `priceCurrency`,‏ `name`) המקונן תחת סכמת ה-`Product` / `SoftwareApplication` שלכם מ-[2.1](./m2-1-json-ld.md). אם התמחור שלכם באמת מבוסס-שימוש, ציינו את הנוסחה ודוגמה מעובדת - "מעורפל, צרו קשר" נקרא כאי-תמחור כלל.
4. **הוסיפו `/pricing.md` קריא למכונה.** מראה ב-markdown פשוט של דף התמחור - מקטע אחד לכל שכבה עם מחיר, יחידה, ומגבלות - מוגש כ-`text/markdown`. זה הקובץ שסוכן מושך כדי לענות על שאלת עלות בסבב אחד, והוא משתלב עם מקטע ה-`## Pricing` של ה-`llms.txt` שלכם ([2.2](./m2-2-llms-txt-content.md)).
5. **שמרו על טון עובדתי, לא מתנשא.** "{Competitor} offers per-event pricing; we offer per-outcome pricing tied to {your unit}" עדיף על "{Competitor}'s pricing is confusing and expensive". הראשון ניתן לציטוט; השני מסונן כרעש שיווקי.
6. **צטטו את המקורות שלכם.** כל טענה על מתחרה צריכה לקשר לתיעוד של המתחרה עצמו, לדף התמחור שלו, או להצהרה ציבורית מתוארכת. טענות לא-מצוטטות זוכות למשקל נמוך באחזור.

## מקורות
- [Schema.org Article](https://schema.org/Article?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Table](https://schema.org/Table?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Offer](https://schema.org/Offer?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

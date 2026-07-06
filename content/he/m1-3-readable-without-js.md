---
id: m1-3-readable-without-js
module: discoverable
moduleNumber: 1
guidelineNumber: 3
title: הציגו תוכן ללא JavaScript
complexity: 3
impact: 4
visualChange: low
forterApplies: 'no'
---

# 1.3  הציגו תוכן ללא JavaScript

## מה ולמה
סורקי סוכנים חיים מושכים את הדפים שלכם **ברגע שמשתמש שואל שאלה**, ברובם בלי להריץ JavaScript. אם דף הבית שלכם הוא מעטפת React שמתמלאת בצד הלקוח, סוכנים רואים `<div id="root">` ריק והמתחרה שלכם זוכה בתשובה. מה שצריך לתקן: HTML מרונדר בשרת, טקסט חלופי (alt) על כל אלמנט חזותי, מבנה סמנטי שאינדקסים וקטוריים יכולים לחתוך לפיו, ו-`<head>` מסמך מלא כך שסורקים יכולים לפתור ולחלק לעמודים את הדפים שלכם.

## ניקוד
- **מאמץ 3/5** - הנדסה ממשית, אך תחומה. קטנה אם הסטאק שלכם כבר מרנדר בשרת, משמעותית עבור אפליקציית React/SPA בצד-לקוח בלבד. השלמת טקסט חלופי היא מכאנית אך איטית.
- **השפעה 4/5** - ההבדל בין להופיע בתשובות AI לבין לא להופיע כלל.
- **שינוי חזותי: נמוך** - רינדור בשרת (SSR) בלתי-נראה למשתמשים רואים; טקסט חלופי מגיע לקוראי מסך; HTML סמנטי לא משנה פיקסלים.

## שלבים
1. **רנדרו בשרת את דף הבית ואת דפי המוצר המובילים.** זו הבעיה הגדולה ביותר באתרי React ו-SPA כיום: הם שולחים מסמך HTML כמעט-ריק ומרכיבים את הדף בדפדפן, כך שסוכן שלא מריץ JavaScript לא רואה דבר. ה-HTML חייב להכיל `<h1>` יחיד, לפחות 500 תווים של טקסט גוף משמעותי, ואת ה-CTA-ים העיקריים שלכם כקישורי `<a href>` אמיתיים. אם האתר שלכם מרנדר בצד הלקוח, העבירו את הדפים המרכזיים לרינדור בצד השרת (SSR) כך שה-markup שלם לפני שהוא עוזב את השרת; אם מעבר SSR מלא מחוץ לטווח, הוסיפו שלב prerender שמגיש תמונות HTML סטטיות ל-user-agents של סורקים ידועים. ודאו עם `curl https://example.com | grep -c "<h1"` - אתם רוצים `1`, לא משהו אחר.
2. **טקסט חלופי על 80%+ מהתמונות.** סוכנים מולטימודליים קוראים את ה-alt כאות העיקרי; התמונה עצמה משנית. בצעו ביקורת על ידי סריקת מפת האתר שלכם וספירת תגי `<img>` שחסר בהם `alt` או שהוא ריק. השלימו תמונות מוצר עם `{שם המוצר} - {מאפיין מרכזי} - {צבע/מידה}`, ותמונות דקורטיביות עם `alt=""` (ריק במכוון, לא חסר). ברמת ה-CMS, הפכו את alt לשדה חובה בהעלאת תמונה מכאן והלאה.
3. **HTML סמנטי, לא מרק div-ים.** `<h1>` אחד לכל דף, `<h2>`/`<h3>` בסדר המסמך, `<nav>`,‏ `<main>`,‏ `<article>`,‏ `<aside>`,‏ `<footer>` במקום `<div class="nav">`. רשימות כ-`<ul>`/`<ol>`, נתונים טבלאיים ב-`<table>` עם `<thead>`/`<tbody>`. מאגרים וקטוריים חותכים לפי הגבולות הללו.
4. **השלימו את `<head>` המסמך.** מערכות AI נשענות על מטא-נתוני ה-head כדי לפתור ולפענח את הדפים שלכם. כל דף צריך `<link rel="canonical">` המפנה לעצמו, מאפיין `<html lang>`, ותגי Open Graph - `og:title`,‏ `og:description`,‏ `og:type`, ו-`og:image` שבאמת נפתר לתמונה. בכל דף מחולק-לעמודים (בלוג, תיעוד, רשימות מוצרים), הוסיפו `<link rel="next">` / `<link rel="prev">` כך שסורקים יאנדקסו מעבר לעמוד הראשון במקום לעצור בו.
5. **בדקו כמו סוכן.** המטרה היא לראות את הדף שלכם כפי שסורק ללא-JavaScript רואה אותו: מקולף מ-CSS, תמונות וסקריפטים, עד לטקסט נקי. `lynx` הוא דפדפן טקסט-בלבד מבוסס-טרמינל שמרנדר בדיוק את זה. משכו דף עם ה-User-Agent של הסורק, ואז רנדרו אותו לטקסט:
   ```
   curl -sA "ChatGPT-User/1.0" https://example.com -o page.html
   lynx -dump page.html
   ```
   `curl -A` מגדיר את ה-User-Agent כך שתקבלו אותו HTML שסורק היה מקבל; `lynx -dump` מדפיס את הטקסט הקריא שנותר. עשו זאת עבור ~20 הכתובות המובילות שלכם. אם אדם שקורא את פלט הטקסט הזה לא יכול לענות "מה החברה הזו עושה ומה יש בדף הזה", גם סוכן לא יכול. (התקינו את lynx עם `brew install lynx` ב-macOS או `apt install lynx` ב-Linux.)

(JSON-LD של Schema.org היא משימה בפני עצמה - ראו [2.1](./m2-1-json-ld.md).)

## מקורות
- [אוצר המילים של Schema.org](https://schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google - JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [WCAG 2.2 - non-text content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

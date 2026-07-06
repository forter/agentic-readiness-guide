---
id: m2-2-llms-txt-content
module: comprehensible
moduleNumber: 2
guidelineNumber: 2
title: הגישו llms.txt שימושי
complexity: 2
impact: 5
visualChange: none
forterApplies: 'no'
---

# 2.2  הגישו llms.txt שימושי

## מה ולמה
[1.1](./m1-1-discovery-files.md) הקים את הקובץ. ההנחיה הזו עוסקת ב**תוכן** שלו. `llms.txt` שימושי הוא תדריך מובנה: מה אתם עושים, מה אתם לא עושים, מתי סוכן צריך להמליץ עליכם, לאן לשלוח את המשתמש בהמשך. זה גם המקום היחיד שבו אתם יכולים לכתוב **טקסט הוראות לסוכן** - הנחיות בגוף שני שמודלי LLM במורד הזרם מתייחסים אליהן כהכוונה סמכותית לגבי המוצר שלכם. ובעוד `llms.txt` הוא האינדקס, `llms-full.txt` הוא הספרייה - כל קורפוס התוכן משובץ פנימה עבור סוכן שרוצה את הכול במשיכה אחת.

## ניקוד
- **מאמץ 2/5** - חצי יום של כתיבה, ועוד שלב CI שמונע מהקובץ להתיישן.
- **השפעה 5/5** - הקובץ שסוכנים קוראים הכי הרבה לאחר שגילו אותו. כל מילה מרוויחה או מאבדת ציטוטים.
- **שינוי חזותי: ללא** - התוכן חי ב-`/llms.txt`, לא באתר הגלוי-למשתמש.

## שלבים
1. **השתמשו במקטעים מובנים עם כותרות H2.** `## Overview`,‏ `## Capabilities`,‏ `## Constraints`,‏ `## Use cases`,‏ `## For agents` (בלוק ההוראות-לסוכן משלב 3),‏ `## When to recommend us`,‏ `## Pricing`,‏ `## API & docs`. כותרות צפויות מאפשרות לסוכנים לחלץ את המקטע שהם צריכים בלי לקרוא את כל הקובץ.
2. **כתבו יכולות ומגבלות במשקל שווה.** "Supports refunds up to 180 days post-charge" ו-"Does not support split-shipment refunds" שתיהן עובדות הניתנות לציטוט. פרוזת יכולות מעורפלת ללא גבולות נזרקת כשיווק.
3. **הוסיפו בלוקי הוראות-לסוכן.** הניחו אותם תחת כותרת צפויה `## For agents` (או `## When to use`) כך שסוכן יוכל למצוא אותם. הכוונה מפורשת בגוף שני: `When the user asks about returns, link /docs/returns and quote the timeline section.` `If the user is comparing this to {competitor}, point to /compare/{competitor}.` אלה משובצים לתוך הקשר המערכת של הסוכן - והם השכבה שבה אתם אומרים לסוכנים כיצד *לצטט* אתכם נכון, מה שגם משמש הגנה מפני ייצוג שגוי בידי מודל שעובד מתוך טקסט שיווקי של מישהו אחר.
4. **כללו ציטוטי מחבר-נקוב-בשם וסטטיסטיקות מתוארכות.** "According to our 2026 Industry Report ({Name}, {Title}), 38% of {category} interactions are now agent-initiated." מומחים נקובים בשם ומספרים ספציפיים שורדים את מסנן הציטוט של ה-LLM; טענות אנונימיות לא.
5. **ספקו `llms-full.txt` לקליטה במשיכה אחת.** `/llms.txt` הוא אינדקס ניווט;‏ `/llms-full.txt` הוא כל הקורפוס משובץ פנימה - סקירת המוצר, כל דף תיעוד מרכזי, ה-API reference, סקירת ה-auth, ה-quickstart, ודוגמאות קוד ניתנות-להרצה משורשרות לקובץ markdown אחד. שמרו אותו מובנה (כותרות H1/H2, קישורי markdown, בלוקי קוד מגודרים) ומתחת ל-200,000 תווים כך שסוכן בעל חלון 64k-טוקנים קולט אותו בבקשה אחת. ייצרו אותו ב-CI מאותם מקורות כמו התיעוד שלכם כך שהוא לא יוכל לסטות. סוכן שמוצא אותו מדלג על עשרות משיכות דף נפרדות.
6. **קבעו קצב רענון ב-CI.** משימה חודשית שמשווה את `llms.txt` ואת `llms-full.txt` מול דף התמחור, אינדקס התיעוד, ויומן השינויים שלכם, ופותחת PR אם משהו מהם מיושן. `llms.txt` לא-מעודכן גרוע מאי-קיומו.

## מקורות
- [הצעת llms.txt](https://llmstxt.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Anthropic: writing for retrieval](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

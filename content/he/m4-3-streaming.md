---
id: m4-3-streaming
module: actionable
moduleNumber: 4
guidelineNumber: 3
title: הזרימו פעולות ארוכות-טווח
complexity: 5
impact: 4
visualChange: none
forterApplies: 'partial'
---

# 4.3  הזרימו פעולות ארוכות-טווח

## מה ולמה
כל דבר שסוכן ממתין לו יותר מחמש שניות זקוק למשוב התקדמות, אחרת הסוכן מניח שזה שבור ומנסה שוב - בדרך כלל משכפל תופעות לוואי.‏ Server-Sent Events להתקדמות בתוך-הערוץ, העברה chunked לגופים גדולים, ונתיב ביטול מפורש - הופכים הערכת סיכון של 30 שניות מ"מרגיש שבור" ל"מרגיש בזמן-אמת". ולעבודה ששורדת מעבר לכל חיבור פתוח סביר - דקות עד שעות - הסוכן לא אמור להחזיק socket כלל: הוא רושם **webhook** ומקבל קריאה-חזרה כשהתוצאה מוכנה.

## ניקוד
- **מאמץ 5/5** - היקף רחב על כל נתיב הבקשה:‏ SSE והעברה chunked בשרתי האפליקציה, כיוונון buffer-flushing ו-idle-timeout דרך כל proxy ו-load balancer, אידמפוטנטיות בניסיונות חוזרים, ותת-מערכת מסירת webhook מלאה עם חתימה, backoff, ומסירה-חוזרת. פריימוורקים מכסים חלקים, לא את הכול.
- **השפעה 4/5** - קריטי להחלטות הונאה, ייצור ארוך-טווח, פעולות אצווה, וכל פעולה סינכרונית מעבר לכמה שניות. בלעדיו, סוכנים פוגעים ב-timeouts ושולחים פעמיים.
- **שינוי חזותי: ללא** - שינויים ברמת ה-wire בלבד; האתר הגלוי-למשתמש לא מושפע.

## שלבים
1. **סמנו פעולות הזרמה ב-OpenAPI.** השתמשו ב-`text/event-stream` כסוג תוכן התגובה וב-extension‏ `x-streaming: true` על הפעולה. תעדו את סכמת האירוע: שם ה-`event` (`progress` | `partial` | `complete` | `error`), המטען `data`, והאירוע הסופי שסוגר את הזרם. לקוחות function-calling ומחוללי MCP נשענים על זה כדי לחווט את הטרנספורט הנכון.
2. **ממשו SSE להתקדמות.** בפעולות ארוכות, החזיקו את החיבור פתוח ופלטו `event: progress\ndata: {"percent": 40, "stage": "scoring"}\n\n` כל 1-3 שניות. סיימו ב-`event: complete\ndata: {...final result...}\n\n`. בצעו flush אחרי כל אירוע - SSE עם buffer הוא SSE שבור. הגדירו `Cache-Control: no-cache` ו-`X-Accel-Buffering: no` עבור nginx בקדמת.
3. **השתמשו בקידוד העברה chunked לגופי תגובה גדולים.** רשימות, ייצוא, ואגרגציות מזרימים JSON Lines‏ (`application/x-ndjson`) רשומה אחת בשורה כך שסוכן יכול לעבד באופן הדרגתי.
4. **תמכו בביטול.** כשהלקוח מתנתק, בטלו את העבודה הבסיסית ופלטו `event: cancelled` סופי אם אתם יכולים. הנפיקו מפתח אידמפוטנטיות בבקשה הראשונית כך שניסיון חוזר לאחר ביטול לא יחייב או יעריך מחדש. תעדו את חוזה הביטול בתיאור ה-OpenAPI של הפעולה.
5. **הציעו webhooks לעבודה ששורדת מעבר לחיבור.** לפעולות הנמדדות בדקות או שעות, תנו לקורא לרשום כתובת callback במקום להחזיק זרם פתוח. תעדו את סוגי האירועים, סכמת המטען, וסמנטיקת המסירה ב-OpenAPI; חתמו על כל מסירה (HMAC על הגוף, חתימה בכותרת) כך שהמקבל יכול לאמת מקור; נסו מסירות שנכשלו שוב עם backoff מעריכי וחשפו נקודת קצה למסירה-חוזרת לאלה שעדיין מחמיצות. שמרו שימוש חוזר בשמות האירועים משלב 1 (`progress`,‏ `complete`,‏ `error`) כך שסוכן מטפל במטען webhook ובפריים SSE עם אותו קוד.

## מקורות
- [HTML Living Standard - Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7230 §4.1 - Chunked Transfer Coding](https://datatracker.ietf.org/doc/html/rfc7230?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#section-4.1)
- [JSON Lines specification](https://jsonlines.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#streamable-http)
- [Standard Webhooks specification](https://www.standardwebhooks.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

החבילה מתווכת תגובות SSE ו-chunked מקצה-לקצה בלי buffering. ה-idle timeouts של החיבור מכווננים לעומסי-עבודה של סוכנים (זרמים של 10+ דקות). הביטול מתפשט מהסוכן דרך השער אל הדומיין שלכם. אירועי התקדמות עוברים ללא שינוי; השער מוסיף כותרות מתאם כך שכל פריים התקדמות ניתן למעקב אל קריאת כלי ה-MCP שמקורו בה. מסירות webhook מועברות ומאומתות-HMAC בשער, כך שמקור ה-callback נבדק לפני שהסוכן פועל עליו.

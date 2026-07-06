---
id: m5-2-mcp-apps
module: experiential
moduleNumber: 5
guidelineNumber: 2
title: הציגו UI עם MCP Apps
complexity: 4
impact: 5
visualChange: none
forterApplies: 'flagship'
---

# 5.2  הציגו UI עם MCP Apps

## מה ולמה
MCP Apps מאפשר לכלי שלכם לרנדר **רכיב UI אינטראקטיבי בתוך שיחת הצ'אט עצמה** - בורר מידה, בורר כתובת, בורר אמצעי-תשלום, דיאלוג אישור-הזמנה. לא הפניה, לא קישור החוצה. המשתמש מבצע עסקה בתוך סביבת הסוכן. זוהי קפיצת ה-UX הגדולה ביותר במסחר האג'נטי מאז OAuth, והיא מכווצת גילוי ← הבנה ← החלטה ← פעולה לכדי תור שיחתי יחיד.

כדאי לדעת: סביבת המארח **משותפת עם רכיבים מכלים אחרים**. התייחסו ל-bundle שלכם כמו לכל נכס ציבורי אחר - חתום, נעול-CSP, מתוחם-רשת לדומיין שלכם. הסטנדרטים מוגדרים היטב; הבנייה לא-טריוויאלית מספיק כך שרוב הצוותים משלבים את Forter, שמספקת את שכבת הרכיבים מוכנה-מראש.

## ניקוד
- **מאמץ 4/5** - שלוש חזיתות חדשות בבת אחת: הצהרת יכולת MCP Apps על השרת שלכם, חבילות הרכיבים עצמן (תואמות-מארח, נעולות-CSP, חתומות), וחוזה ה-JSON Schema שקושר כלים למשאבי UI. המפרט מתייצב.
- **השפעה 5/5** - כלים עם UI מוטמע ממירים דרמטית טוב יותר מכלים שמוסרים למשתמש קישור.
- **שינוי חזותי: ללא** *(באתר שלכם)* - רכיבים מרונדרים בתוך מארח הצ'אט (ChatGPT,‏ Claude). שום דבר באתר שלכם לא משתנה.

## שלבים
1. **הפעילו את יכולת ה-Apps על שרת ה-MCP שלכם.** בתגובת ה-`initialize`, פרסמו `capabilities.experimental.apps` (לפי טיוטת modelcontextprotocol-ext-apps). דורש את תשתית שרת ה-MCP מ-[4.4](./m4-4-mcp-server.md) כבר רצה עם Streamable HTTP.
2. **בנו חבילות רכיבים תואמות-מארח.** השתמשו ב-`@modelcontextprotocol/ext-apps` כדי לקמפל רכיבי React/Svelte/Vue לפורמט זמן-הריצה של המארח (מוגש עם סוג ה-MIME של MCP Apps,‏ `text/html;profile=mcp-app`). חבילות חייבות להיות עצמאיות וחתומות כך שהמארח יכול לאמת מקור לפני הרכבה. המארח אוכף CSP בסיסי קפדני (`default-src 'none'`,‏ `object-src 'none'`); הצהירו על כל מקור שאתם באמת צריכים דרך רשימות-ההיתר `_meta.ui.csp` של המפרט (`connectDomains`,‏ `resourceDomains`,‏ `frameDomains`,‏ `baseUriDomains`) במקום להרפות את ה-CSP כולו.
3. **חשפו משאבי `ui://` עם URI-ים יציבים וממוספרי-גרסה.** כל רכיב חי ב-URI כמו `ui://yourcompany.com/checkout/payment-picker@1.4.0`. מספרו גרסה לכל URI: סוכנים שומרים במטמון באגרסיביות, ושינוי לא-ממוספר משבית שיחות באמצע-טיסה.
4. **תייגו כלים עם `_meta.ui.resourceUri`.** על כל כלי שאמור לרנדר מוטמע, הגדירו `_meta.ui.resourceUri` ל-URI ה-`ui://` המתאים. מארח הסוכן קורא את המטא-נתון הזה בזמן רשימת-הכלים ומחמם מראש את הרכיב לפני ההפעלה.
5. **הגדירו את חוזה הרכיב-כלי דרך JSON Schema.** גם ה-`inputSchema` של הכלי וגם ה-props הצפויים של המשאב הם JSON Schema. הגדירו אותם בצעד אחיד - בורר תשלום שמצפה ל-`{ amount, currency, methods[] }` חייב להתאים בדיוק למה שהכלי מחזיר.
6. **בודדו ב-sandbox באגרסיביות.** נעלו-CSP כל bundle, חתמו על כל נכס, תחמו כל קריאת רשת לדומיין שלכם בלבד, ולעולם אל תקבלו HTML שרירותי מתגובת הכלי. הניחו שסביבת המארח משותפת עם רכיבים מכלים אחרים.

## מקורות
- [MCP Apps extension spec](https://github.com/modelcontextprotocol/ext-apps?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP resources reference](https://modelcontextprotocol.io/docs/concepts/resources?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP `_meta` field reference](https://modelcontextprotocol.io/specification/2025-06-18/basic?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#meta)
- [CSP - Content Security Policy](https://www.w3.org/TR/CSP3/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

אם אתם מריצים את שרת ה-MCP שלכם על [**חבילת המוכנות לסוכנים של Forter**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m5-2-mcp-apps) ([4.4](./m4-4-mcp-server.md)), שכבת ה-MCP Apps מגיעה איתה. הכלים שלכם לא רק עונים בטקסט פשוט - הם מרנדרים **UI מוגדר-מראש של חזית חנות ותמיכה**: בוררי מוצר ווריאנט, בורר מידה, ורכיבים נוספים שחשובים.

ה-UI שלכם למיתוג. הגדירו את הצבעים שלכם, התאימו את העיצוב, וספקו CSS מותאם כך שהרכיבים ייקראו כחזית החנות שלכם ולא כ-widget גנרי. ה-Content Security Policy מנוהלת עבורכם ונשארת ניתנת-להגדרה - כך שתוכלו להשיק סקריפטים משלכם בתוכה,‏ Google Analytics ותגים אחרים כלולים, בלי להחליש את ה-sandbox שהמארח דורש.

מה שנשאר שלכם: החלטות המיתוג עצמן, הקטלוג שלכם, והתמחור שלכם.

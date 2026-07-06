---
id: m5-3-cross-platform-consistency
module: experiential
moduleNumber: 5
guidelineNumber: 3
title: שמרו על עקביות בין הערוצים
complexity: 2
impact: 3
visualChange: medium
forterApplies: 'partial'
---

# 5.3  שמרו על עקביות בין הערוצים

## מה ולמה
סוכנים מצליבים את מה שאתם אומרים על עצמכם בין הערוצים. ה-`<title>` ב-HTML, תיאור ה-OG, תיאורי כלי ה-MCP, מניפסט ה-plugin, סקירת ה-`llms.txt`, וכרטיס הסוכן - כולם מגיעים לאותו חלון הקשר כשסוכן מחליט אם לקרוא לכלי שלכם. כשהם חלוקים, הביטחון - ושיעור בחירת-הכלי - יורד. זה לא עניין של טקסט שיווקי; זה עניין של עקביות תיאורית עבור **אותו שם-עצם**: מה המוצר שלכם עושה, למי הוא מיועד, כמה הוא עולה.

קיבעתם את הניסוח הקנוני עוד ב-[1.2](./m1-2-well-known-agent-files.md) וכל הנחיה מאז משכה ממנו - אז זה **מעבר אימות, לא כתיבה מחדש**: ודאו ששום דבר לא סטה, ותקנו את הערוץ או שניים שכן.

## ניקוד
- **מאמץ 2/5** - diff של כל ערוץ מול קובץ אחד, בתוספת PR לכל מה שסטה. אם משמעת הניסוח-הקנוני מ-[1.2](./m1-2-well-known-agent-files.md) החזיקה, כמעט אין מה לעשות.
- **השפעה 3/5** - אמיתית אך תחומה. מכפיל על שאר מודול 5, לא ניצחון עצמאי.
- **שינוי חזותי: בינוני** - תגי meta, כרטיסי OG, ושינויי `<title>` נראים בלשוניות הדפדפן ובתצוגות מקדימות של קישורים. גופי הדפים לא משתנים.

## שלבים
1. **פתחו את קובץ הניסוח הקנוני מ-[1.2](./m1-2-well-known-agent-files.md).** השם הקצר, התיאור הפונה למודל, והפסקה הפונה לאדם נקבעו פעם אחת, בתחילת הבנייה. הקובץ הזה הוא הרפרנס; כל ערוץ אחר נבדק מולו.
2. **בצעו diff של כל ערוץ מולו.** השוו כל אחד לניסוח הקנוני, זה לצד זה: ה-`<title>` ב-HTML,‏ `<meta name="description">`, ה-`og:title` / `og:description` של OG, הפסקה הפותחת של `llms.txt`, שדות `serverInfo.name` ו-`description` של כלי MCP, ה-`name_for_human` / `description_for_model` של `ai-plugin.json`, רישומי ה-GPT Store / Claude / Gemini, וכרטיס הסוכן. אם כל הנחיה משכה מהקובץ הקנוני כפי שהונחתה, זה נקי - בפועל ערוץ או שניים סוטים.
3. **תקנו את הסטייה במקור.** היכן שערוץ סטה, תקנו אותו *וגם* תקנו את התבנית או המחולל שייצר אותו, כך שלא יוכל לסטות שוב. ערוצים מבוקרי-CMS - ה-HTML head, תגי OG, כותרות מפת האתר, `llms.txt` - הם המאגר שלכם והצוות שלכם;‏ Forter לא יכולה להושיט יד לכאן.
4. **יישרו מטא-נתונים מבוקרי-Forter.** הגישו שם קצר קנוני, תיאורים, ותיאורים ברמת-הכלי לקונסולת הלקוח של Forter; החבילה מפיצה אותם ל-`serverInfo` של שרת ה-MCP, לשדה ה-`description` של כל כלי, ל-`ai-plugin.json` המפורסם, לכרטיס הסוכן, ולחבילות ההגשה-מחדש למדריכי ה-GPT Store / Claude / Gemini.

## מקורות
- [Open Graph protocol](https://ogp.me/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [MCP server initialization spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide#initialization)
- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-apps-in-chatgpt?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

המטא-נתונים שהחבילה מפרסמת בשמכם - תיאורי כלי MCP,‏ `ai-plugin.json`, כרטיסי סוכן, רשומות מרשם - נאכפים כעקביים מול מקור-אמת יחיד בקונסולת הלקוח שלכם. עדכנו את השם והתיאור הקנוניים פעם אחת; כל ערוץ מפורסם-Forter מרונדר מחדש בצעד אחיד, והסבב הבא של אימותי-מחדש של plugin-store / Custom GPT‏ ([5.1](./m5-1-verified-on-platforms.md)) משחרר את הניסוח החדש בלי תור הגשה נפרד.

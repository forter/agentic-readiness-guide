---
id: m1-2-well-known-agent-files
module: discoverable
moduleNumber: 1
guidelineNumber: 2
title: הוסיפו קובצי סוכן ב-well-known
complexity: 1
impact: 3
visualChange: none
forterApplies: 'partial'
---

# 1.2  הוסיפו קובצי סוכן ב-well-known

## מה ולמה
ארבעה קובצי JSON קטנים תחת `/.well-known/` מכסים ארבע מערכות סוכנים שונות: `ai-plugin.json` (OpenAI),‏ `agent.json` (גנרי),‏ `agent-card.json` (Google A2A), ומסמך הגילוי של MCP. כל אחד מהם קצר מ-30 שורות. חלקם מפנים לנקודות קצה שעולות לאוויר רק במודולים מאוחרים יותר - אך כל נתיב ידוע כבר היום, ולכן אתם כותבים כל קובץ פעם אחת, נכון, עם כתובות ה-URL הסופיות שלו, ולעולם לא פותחים אותו שוב.

## ניקוד
- **מאמץ 1/5** - ארבעה קובצי JSON ועוד החלטת ניסוח חד-פעמית. החלק הקשה ביותר הוא לקבע את השם הקנוני שלכם, את התיאורים, ההרשאות, ואת כתובת איש הקשר.
- **השפעה 3/5** - נמוכה מ-1.1 כיוון שלא כל סוכן משתמש בהם עדיין, אך הם פותחים ממשקי plugin / card מהשורה הראשונה בפלטפורמות שכן.
- **שינוי חזותי: ללא** - קבצים בנתיבי `/.well-known/*`; שום דבר גלוי-למשתמש באתר שלכם לא משתנה.

## שלבים
1. **קבעו תחילה את הניסוח הקנוני שלכם.** לפני שאתם כותבים ארבעה מניפסטים מלאי שמות ותיאורים, החליטו עליהם פעם אחת: שם מוצר קצר אחד (עד 40 תווים), תיאור אחד פונה למודל (עד 120 תווים), פסקה אחת פונה לאדם (עד 400 תווים). העבירו אותם לקובץ מקור-אמת יחיד במאגר שלכם (למשל, `brand-copy.md`). כל שדה שם ותיאור שהמדריך הזה מבקש מכאן והלאה - במניפסטים הללו, ב-JSON-LD‏ ([2.1](./m2-1-json-ld.md)), ב-`llms.txt`‏ ([2.2](./m2-2-llms-txt-content.md)), ברשימות כלי MCP‏ ([4.4](./m4-4-mcp-server.md)), בתגי meta ו-OG - **מועתק מהקובץ הזה, ולעולם לא מאולתר מחדש**. המשמעת היחידה הזו היא מה שהופך את [5.3](./m5-3-cross-platform-consistency.md) לאימות של חמש דקות במקום לכתיבה מחדש.
2. **`/.well-known/ai-plugin.json`** - מניפסט ה-plugin של OpenAI, מוגש כ-`application/json`:
   ```json
   {
     "schema_version": "v1",
     "name_for_human": "Acme Returns",
     "name_for_model": "acme_returns",
     "description_for_human": "Check order status and start a return for any Acme order.",
     "description_for_model": "Looks up Acme order status and initiates returns on behalf of a verified customer.",
     "auth": { "type": "oauth", "authorization_url": "https://example.com/.well-known/oauth-authorization-server" },
     "api": { "type": "openapi", "url": "https://example.com/openapi.json" },
     "logo_url": "https://example.com/logo.png",
     "contact_email": "agents@example.com",
     "legal_info_url": "https://example.com/legal"
   }
   ```
   שמות המפתחות לעיל מילוליים והכרחיים; הערכים הם מצייני מקום - החליפו אותם בניסוח הקנוני שלכם ובכתובות URL אמיתיות. `auth` מצביע על נקודות הקצה של OAuth מ-[3.1](./m3-1-oauth-discovery.md), ו-`api.url` על `/openapi.json` מ-[4.1](./m4-1-openapi-spec.md) - נקודות קצה שעולות לאוויר במודולים מאוחרים יותר. הנתיבים שלהן כבר הוחלטו, אז כתבו את ה**כתובות הסופיות עכשיו**: הקובץ נכון ברגע שאתם שומרים אותו, ופשוט מתחיל להיפתר כשההנחיות הללו נוחתות. ללא ציין מקום, ללא ביקור שני.
3. **`/.well-known/agent.json`** - מניפסט סוכן גנרי שבו משתמשות אינטגרציות של Claude וכמה מרשמים קטנים יותר. הוא משקף את מבנה ai-plugin:
   ```json
   {
     "name": "Acme Returns",
     "description": "Check order status and start a return for any Acme order.",
     "version": "1.0.0",
     "endpoints": { "openapi": "https://example.com/openapi.json" },
     "auth": { "type": "oauth", "authorization_url": "https://example.com/.well-known/oauth-authorization-server" },
     "capabilities": ["order-status", "returns"]
   }
   ```
   `description` הוא מה שמופיע בבוררי הכלים - הוא בא ישירות מהניסוח הקנוני שלכם.
4. **`/.well-known/agent-card.json`** - כרטיס פרוטוקול ה-A2A‏ (Agent-to-Agent) של Google. מערך ה-`skills` הוא החלק המהותי: ערך אחד לכל משימה שסוכן יכול למסור לכם, כל אחד עם משפטי דוגמה כך שסוכן קורא יודע מתי לנתב אליכם.
   ```json
   {
     "name": "Acme Returns",
     "description": "Check order status and start a return for any Acme order.",
     "url": "https://example.com",
     "version": "1.0.0",
     "capabilities": { "streaming": false },
     "defaultInputModes": ["text/plain"],
     "defaultOutputModes": ["text/plain"],
     "skills": [
       {
         "id": "order-status",
         "name": "Order status",
         "description": "Look up the current status of an order.",
         "tags": ["orders", "tracking"],
         "examples": ["Where is my order #1234?", "Has my package shipped yet?"]
       }
     ]
   }
   ```
5. **גילוי MCP.** פרסמו `/.well-known/mcp.json`, או הפניית `307` מ-`/.well-known/mcp` לאותו קובץ:
   ```json
   {
     "mcpServers": [
       {
         "name": "acme",
         "url": "https://mcp.example.com",
         "transport": "streamable-http"
       }
     ]
   }
   ```
   החליטו על כתובת ה-URL הקנונית של שרת ה-MCP שלכם עכשיו; [4.4](./m4-4-mcp-server.md) מעלה את נקודת הקצה לאוויר מאוחר יותר, אך קובץ הגילוי נכון ברגע שאתם כותבים אותו ומתחיל להיפתר כש-4.4 נוחתת. ללא ציין מקום.
6. **ודאו עם `curl`.** כל ארבעת קובצי ה-well-known חייבים להחזיר `200`,‏ `Content-Type: application/json`, ולהתפרש נקי כבר היום - הם קבצים סטטיים שאתם מגישים עכשיו. נקודות הקצה שאליהן הם *מצביעים* (OpenAPI,‏ OAuth,‏ MCP) נפתרות מאוחר יותר כשמודולים 3 ו-4 נוחתים. הוסיפו את ארבעת הקבצים לבדיקות smoke ב-CI כך שפריסת CMS לא תוכל לשבור אותם בשקט.

## מקורות
- [OpenAI Plugin Manifest](https://openai.com/index/chatgpt-plugins/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [A2A (Agent2Agent) Agent Card spec](https://a2a-protocol.org/latest/specification/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) ([repo](https://github.com/a2aproject/A2A?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide))
- [Model Context Protocol - discovery](https://modelcontextprotocol.io/specification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

אם אתם משתמשים בשער ה-MCP המאוחסן של [**חבילת המוכנות לסוכנים של Forter**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m1-2-well-known-agent-files),‏ Forter מפרסמת ומתחזקת את קובצי ה-well-known הקשורים ל-MCP‏ (`/.well-known/mcp.json` וכל הפניות גילוי של MCP) - כתובת השרת, הצהרת הטרנספורט, וקיבוע הגרסה נשמרים מעודכנים ככל שמפרט ה-MCP נע. הקבצים הללו מוגשים מהתשתית של Forter, לא מהדומיין שלכם; אנו ממליצים להוסיף כלל reverse-proxy כך שהם ייפתרו גם תחת הדומיין שלכם, ויאפשרו לסוכנים למשוך כל קובץ גילוי ממקום אחד.

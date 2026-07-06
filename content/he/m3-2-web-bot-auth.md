---
id: m3-2-web-bot-auth
module: trustworthy
moduleNumber: 3
guidelineNumber: 2
title: אמתו בוטים באופן קריפטוגרפי
complexity: 4
impact: 3
visualChange: none
forterApplies: 'flagship'
---

# 3.2  אמתו בוטים באופן קריפטוגרפי

## מה ולמה
בוטים זדוניים יכולים להתחזות לטובים. שואב (scraper) מגדיר `User-Agent: ChatGPT-User` ורשימת-היתר מבוססת-UA מנפנפת אותו פנימה; סורק מודיעין-תחרותי טוען שהוא Perplexity וקוצר את טבלאות התמחור שלכם; בוט credential-stuffing מתחפש ל-ClaudeBot כדי להתחמק ממגבלות הקצב שלכם. ללא הוכחה קריפטוגרפית, כל מחרוזת UA היא ניחוש.

**RFC 9421 HTTP Message Signatures** - עמוד השדרה הקריפטוגרפי של Web Bot Auth - פותר זאת. סוכנים אמיתיים (סוכן משיכת-הרשת של OpenAI, למשל) חותמים על בקשותיהם במפתחות Ed25519 ומזדהים באמצעות כותרת `Signature-Agent` (למשל `Signature-Agent: "https://chatgpt.com"`); אתם מאמתים את החתימה מול ספריית המפתחות שפרסמו ומכניסים אותם. מתחזה ללא חתימה תקפה נדחה.

## ניקוד
- **מאמץ 4/5** -‏ RFC 9421 מדויק: קנוניזציה, בניית בסיס החתימה, אחסון JWKS, רוטציית מפתחות, מטמון replay, וניטור - כולם חייבים להיות נכונים.
- **השפעה 3/5** - חזית בקרת-הניצול-לרעה הנקי ביותר בסטאק הפרוטוקולים. תעבורת בוטים מזויפת היא וקטור ניצול-לרעה דומיננטי אך עדיין צובר אימוץ.
- **שינוי חזותי: ללא** - מוסיף `/.well-known/http-message-signatures-directory` ורשומות DNS בנתיבים למכונה בלבד; האימות בקצה בלתי-נראה למבקרים אנושיים.

## שלבים
1. **פרסמו ספריית חתימות** ב-`/.well-known/http-message-signatures-directory` עם מערך `keys` של JWK-ים מסוג Ed25519. כל מפתח נושא `kty=OKP`,‏ `crv=Ed25519`,‏ `kid` יציב, וחלונות תוקף `nbf` / `exp`.
2. **אמתו כותרות `Signature-Input` ו-`Signature`** בכל בקשה נכנסת שטוענת UA של סוכן ידוע. שחזרו את בסיס החתימה מהרכיבים המכוסים (`@method`,‏ `@authority`,‏ `@path`,‏ `content-digest`, וכו'), פתרו את ה-`keyid` מול ה-JWKS שמפעיל הסוכן פרסם, ואמתו עם Ed25519. דחו באי-התאמה עם `401 Unauthorized` ואתגר `WWW-Authenticate: Signature`.
3. **דחו תעבורת בוטים לא-חתומה** שטוענת שהיא סוכן ידוע. בקשה שמפרסמת `User-Agent: ChatGPT-User` (או `Signature-Agent` שהיא לא יכולה להוכיח) ללא חתימה תקפה היא מתחזה - הפילו אותה. (ייתכן שתרצו לרשום ביומן קודם; דפוסי ההתחזות עצמם הם טלמטריה שימושית.)
4. **בצעו רוטציית מפתחות בקצב ידוע.** רוטציה של 90 יום היא הסטנדרט. הכניסו מפתחות חדשים לספרייה עם `nbf` עתידי, הוציאו משירות מפתחות ישנים על ידי הגדרת `exp`, וחפפו חלונות ב-7-14 יום כך שחותמים שבאוויר לא ייכשלו באמצע הרוטציה.
5. **שמרו ערכי `nonce` של חתימות במטמון** כדי למנוע replay. מטמון LRU תחום ממופתח לפי `(kid, nonce)` עם TTL מעט ארוך מסבולת ה-skew של `created` שלכם מספיק.
6. **מדדו כשלי אימות.** פלטו מטריקות לסך הבקשות החתומות, כשלים לפי מצב (`kid` לא-ידוע, חתימה שגויה, `created` פג, replay), ויחסי התחזות לכל UA. זו טלמטריית הונאת-הבוטים שלכם - והקלט לזיהוי אנומליות.
7. **(מתפתח) פרסמו רשומות גילוי DNS-AID.** [DNS for AI Discovery (DNS-AID)](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) מאפשר לסוכנים למצוא את נקודות הכניסה שלכם ישירות מ-DNS, עוד לפני כל משיכת דף. פרסמו רשומת SVCB מסוג ServiceMode לאינדקס הארגון שלכם ב-`_index._agents.example.com` (רשומות לכל-סוכן נושאות את הפרוטוקול ב-`alpn` SvcParam - `alpn="mcp"` / `alpn="a2a"` - לא בתווית) לפי [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide). ואז **חתמו על אזור הגילוי הציבורי עם DNSSEC** כך שפותרי-DNS מאמתים יחזירו נתונים מאומתים - זה מה שקושר קריפטוגרפית את הגילוי לדומיין שלכם, והסיבה להשיק אותו בזהירות: שינוי DNSSEC כושל יכול להחשיך את כל האזור. זו טיוטת IETF מוקדמת - התייחסו אליה כצופה-פני-עתיד.

## מקורות
- [RFC 9421 - HTTP Message Signatures](https://datatracker.ietf.org/doc/html/rfc9421?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) (תווית ה-`alg` היא `ed25519`)
- [RFC 8032 - EdDSA (the Ed25519 signature algorithm)](https://www.rfc-editor.org/rfc/rfc8032?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8037 - Ed25519 keys in JOSE/JWK (`kty=OKP`, `crv=Ed25519`)](https://datatracker.ietf.org/doc/html/rfc8037?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [web-bot-auth architecture draft](https://datatracker.ietf.org/doc/draft-meunier-web-bot-auth-architecture/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Cloudflare Web Bot Auth](https://blog.cloudflare.com/web-bot-auth/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [DNS for AI Discovery (DNS-AID)](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9460 - SVCB and HTTPS DNS records](https://www.rfc-editor.org/rfc/rfc9460?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Forter Trusted Agentic Commerce Protocol (TACP)](https://github.com/forter/trusted-agentic-commerce-protocol?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

החבילה מריצה אימות חתימות RFC 9421 בקצה - רוטציית מפתחות Ed25519, מטמון replay, פתרון JWKS, ואימות לכל-בקשה של תעבורת בוטים נכנסת.

Web Bot Auth מאמת *מי* קורא; הוא לא מגן על *מה* שמוחלף. לשם כך,‏ Forter מחברת את הפרוטוקול הפתוח [**Trusted Agentic Commerce Protocol (TACP)**](https://github.com/forter/trusted-agentic-commerce-protocol?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) - בעוד Web Bot Auth הוא פרוטוקול חתימה,‏ TACP הוא פרוטוקול הצפנה. הוא נושא נתוני מסחר-אג'נטי רב-צדדיים באמינות ובשני הכיוונים, כך שסוכן, הסוחר, והצדדים שביניהם יכולים להחליף נתוני הזמנה, תשלום וזהות רגישים בלי לחשוף אותם לכל קפיצה בנתיב.

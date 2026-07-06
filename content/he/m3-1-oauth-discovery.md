---
id: m3-1-oauth-discovery
module: trustworthy
moduleNumber: 3
guidelineNumber: 1
title: ממשו OAuth
complexity: 5
impact: 4
visualChange: medium
forterApplies: 'flagship'
---

# 3.1  ממשו OAuth

## מה ולמה
OAuth 2.0 הוא מודל אישורי-הגישה היחיד שמאפשר לסוכן לאמת מול ה-API שלכם בשם משתמש בלי שאיש ידביק מפתח לקובץ תצורה. שלבו אותו עם שני מסמכי גילוי מסוג well-known (**RFC 8414** עבור שרת ההרשאות, **RFC 9728** עבור המשאב המוגן), וסוכן יכול לפתור את זרימת ה-auth שלכם מהדומיין שלכם בלבד. זו ההנחיה הצפופה ביותר טכנית במדריך, וזו שבה Forter מאיצה את המסירה יותר מכול.

זו גם הדרך האמינה היחידה להפוך סשן של סוכן ל**משתמש מוכר וחוזר**. הפניית authorization-code מביאה את האדם לתוך הקשר דפדפן ראשוני כדי לאמת ישירות מולכם - במקום להישאר מוסתר מאחורי הסוכן - כך שתוכלו לזהות לקוח חוזר, לצרף את הפרופיל השמור ואת אמצעי התשלום שלו, ולהחיל בדיקות סיכון מודעות-זהות. בלעדיה, כל ביקור מונחה-סוכן נופל חזרה לאורח אנונימי שאינכם יכולים לזהות ולא להסיק לגביו.

הרשאות (scopes) הן גם **מגבלת רדיוס-הנזק** שלכם - טוקן שדלף או נוצל לרעה לא אמור להיות מסוגל לעשות יותר ממה שהמשתמש אישר. עשו את עיצוב ההרשאות נכון מוקדם; כואב להתאים אותו בדיעבד.

## ניקוד
- **מאמץ 5/5** - עתיר-סטנדרטים.‏ PKCE, רוטציית refresh-token, עיצוב הרשאות, רוטציית מפתחות, הגנה מ-replay, ורישום לקוח דינמי - כולם חייבים להיות נכונים. ספריות מוכנות-מהמדף עוזרות אך לא מבטלות את העבודה.
- **השפעה 4/5** - הנתיב האמין היחיד למשתמש מאומת וחוזר: איתה, ביקור של סוכן נצמד לזהות אמיתית; בלעדיה, כל אינטראקציה מתכווצת לאורח אנונימי.
- **שינוי חזותי: בינוני** - מוסיף מסך הסכמה / authorize. הדפים הציבוריים הקיימים לא משתנים.

## שלבים
1. **הקימו שרת הרשאות OAuth 2.0 + OIDC** עם PKCE כחובה לכל הלקוחות הציבוריים (RFC 6749,‏ RFC 7636). הנפיקו טוקני גישה קצרי-חיים (15-60 דק') וטוקני refresh עם **רוטציה בכל שימוש** - כך ש-refresh token שדלף נפסל בפעם הבאה שהלקוח הלגיטימי מרענן.
2. **עצבו הרשאות שממופות למשאבי API, בצמצום.** העדיפו `orders:read`,‏ `payments:write` על פני `read` / `write` גנריים. סוכנים מקבלים הרשאות מינימום, יומני הביקורת שלכם נקיים יותר, ורדיוס הנזק של כל טוקן שדלף תחום על ידי מה שאושר בפועל.
3. **פרסמו מטא-נתוני שרת-הרשאות** ב-`/.well-known/oauth-authorization-server`‏ (RFC 8414):‏ `issuer`,‏ `authorization_endpoint`,‏ `token_endpoint`,‏ `jwks_uri`, סוגי התגובה וה-grant הנתמכים.
4. **פרסמו מטא-נתוני משאב-מוגן** ב-`/.well-known/oauth-protected-resource`‏ (RFC 9728):‏ `resource`,‏ `authorization_servers`,‏ `scopes_supported`,‏ `bearer_methods_supported`. זה מאפשר לסוכן לדלג על סבב ה-401-ואז-`WWW-Authenticate` ולפתור auth במכה אחת. זה גם המקום שבו חי מנגנון הגילוי `agent_auth` של `auth.md` - ראו [3.3](./m3-3-self-serve-credentials.md).
5. **הנפיקו אישורי לקוח בשירות עצמי.**‏ RFC 7591 Dynamic Client Registration הוא הצורה הסטנדרטית - ראו [3.3](./m3-3-self-serve-credentials.md) לזרימת ההנפקה התכנותית המלאה.
6. **רשמו ביומן ביקורת כל אירוע טוקן** - הנפקה, רענון, ביטול, דחיות אי-התאמת-הרשאה - ממופתח לפי `client_id` ו-`sub`. זה הפרימיטיב הפורנזי שלכם כשסשן צריך חקירה מאוחר יותר.

## מקורות
- [RFC 6749 - OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 7591 - Dynamic Client Registration](https://datatracker.ietf.org/doc/html/rfc7591?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 8414 - Authorization Server Metadata](https://datatracker.ietf.org/doc/html/rfc8414?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [RFC 9728 - Protected Resource Metadata](https://datatracker.ietf.org/doc/html/rfc9728?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

[**חבילת המוכנות לסוכנים של Forter**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m3-1-oauth-discovery) מפעילה שרת OAuth 2.0 בסביבת ייצור, חשוף תחת הדומיין שלכם דרך reverse-proxy. מטא-נתוני RFC 8414 + RFC 9728 מתפרסמים על הדומיין שלכם.‏ PKCE, רוטציית refresh-token, רוטציית JWKS, מטמון replay, ורישום לקוח דינמי - כולם מטופלים, והופכים בנייה עתירת-סטנדרטים לפרויקט אינטגרציה פשוט.

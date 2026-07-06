---
id: m4-7-sdks-and-cli
module: actionable
moduleNumber: 4
guidelineNumber: 7
title: הפיצו SDK ו-CLI
complexity: 3
impact: 4
visualChange: none
forterApplies: 'yes'
---

# 4.7  הפיצו SDK ו-CLI

## מה ולמה
סוכנים והמפתחים שבונים אותם פונים ל-SDK-ים ול-CLI-ים ראשון, ל-HTTP גולמי שני. בלי SDK אידיומטי בשפה שמשתלב (או LLM שכותב קוד בשמו) משתמש בה, כל צרכן מגלגל לקוח משלו וטועה בלפחות אחד מהבאים: עימוד, ניסיונות חוזרים, פענוח שגיאות, או auth. עם SDK-ים ב-npm וב-PyPI - בתוספת CLI ב-npm וב-Homebrew - האינטגרציה במרחק התקנה אחת.

זה גם המקום שבו ההשקעה ב-OpenAPI מ-[4.1](./m4-1-openapi-spec.md) משלמת דיבידנד שני: מפרט מלא מייצר גם SDK-ים וגם CLI בעלות של אחד.

## ניקוד
- **מאמץ 3/5** - מניח שמפרט ה-OpenAPI מ-[4.1](./m4-1-openapi-spec.md) כבר מפורסם; אם לא, אותה עבודה באה ראשונה. בהינתן המפרט, החלק הקשה הוא צינור הפרסום - חתימה, ניהול גרסאות, ואישורים לכל-מרשם. הייצור עצמו פתור ברובו.
- **השפעה 4/5** - מאיץ אינטגרציה משמעותי; LLM-ים שכותבים קוד אינטגרציה פונים ל-`import stripe` לפני שהם פונים ל-`requests`.
- **שינוי חזותי: ללא** -‏ SDK-ים משתחררים למרשמי חבילות, לא לאתר שלכם.

## שלבים
1. **בחרו מחולל OpenAPI אחד והתחייבו.** Stainless,‏ Speakeasy,‏ Fern, או `openapi-generator` הם האפשרויות האמינות. בדקו כל אחד מול המפרט שלכם מ-[4.1](./m4-1-openapi-spec.md) - זה שהפלט שלו הייתם מוכנים לערוך-ביד הוא זה שיש לבחור. החלפה באמצע עולה חודשים.
2. **ספקו את ה-SDK-ים ל-npm ול-PyPI.** TypeScript ב-npm ו-Python ב-PyPI מכסים ~80% מקוד הסוכנים והאינטגרציה. שמות אידיומטיים (`client.transactions.create({...})`, לא `client.postTransactions(...)`), תגובות עם טיפוסים, ניסיונות חוזרים אוטומטיים עם backoff מעריכי שמכבדים את כותרות ה-`Retry-After` מ-[4.2](./m4-2-rate-limits-and-errors.md), ואיטרטורי עימוד (`for await (const tx of client.transactions.list())`).
3. **הפיצו CLI ב-npm וב-Homebrew.** שקפו את מערך ה-SDK שלכם - `yourbrand transactions create --amount 1000` - בתוספת עוזרי auth (`yourbrand login` שמבצע את זרימת ה-OAuth device מ-[3.1](./m3-1-oauth-discovery.md)), ניהול תצורה, ודגל `--json` לצנרת לתוך זרימות עבודה של סוכנים.
4. **פרסמו אוטומטית בכל שחרור מפרט.** צינור CI: שינוי מפרט מתמזג, המחולל רץ, גם ה-SDK-ים וגם ה-CLI נבנים, בדיקות עוברות מול sandbox, הגרסה מתעדכנת סמנטית, יומני שינויים נוצרים מ-diff-ים של המפרט, החבילות מתפרסמות לכל שלושת המרשמים, ושחרור GitHub יוצא.

## מקורות
- [OpenAPI Generator](https://openapi-generator.tech?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [npm publishing docs](https://docs.npmjs.com/cli/commands/npm-publish?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [PyPI publishing guide](https://packaging.python.org/en/latest/tutorials/packaging-projects/?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Homebrew tap creation](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Fern](https://buildwithfern.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Speakeasy](https://www.speakeasy.com?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

## כיצד Forter יכולה לעזור

הריצו על [**חבילת המוכנות לסוכנים של Forter**](https://www.forter.com/blog/agentic-orchestration/?utm_source=github&utm_medium=referral&utm_campaign=agentic-readiness-guide&utm_content=m4-7-sdks-and-cli) ושכבת ה-SDK וה-CLI יכולה להיות מיוצרת עבורכם. ממערך הכלים שאתם חושפים,‏ Forter בונה ומפרסמת SDK-ים אידיומטיים בשפות הפופולריות - מוכנים לקישור ישירות מתיעוד המפתחים שלכם - ומקימה API מאומת שהמשתמשים שלכם והסוכנים שלהם יכולים לקרוא לו ישירות.‏ Auth, ניסיונות חוזרים, טיפול בשגיאות, ועימוד מגיעים מחווטים פנימה, וכל SDK מתחדש כשהכלים שלכם משתנים.

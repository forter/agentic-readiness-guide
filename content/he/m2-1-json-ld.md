---
id: m2-1-json-ld
module: comprehensible
moduleNumber: 2
guidelineNumber: 1
title: פרסמו מבנה JSON-LD מלא
complexity: 2
impact: 4
visualChange: none
forterApplies: 'no'
---

# 2.1  פרסמו מבנה JSON-LD מלא

## מה ולמה
JSON-LD הוא הדרך שבה LLM מכווץ את "החברה ששמה {המותג שלכם}" לישות אחת במקום מחרוזת שם-מותג עמומה. בלוק `<script type="application/ld+json">` אחד לכל דף - שאורז כל ישות שהדף מתאר במערך `@graph`, ומצהיר על `@type`, על זהות, ועל קישורי `sameAs` - הוא ההבדל בין להיות מסוכם נכון לבין להתבלבל עם ספק אחר בעל אותו שם (או גרוע מכך, עם טקסט שיווקי עוין של ספק אחר). בונוס: זה מזין את Google Rich Results, את צילומי ה-AI של Bing, ואת שכבת ה-speakable שסוכני קול מקריאים בקול.

## ניקוד
- **מאמץ 2/5** - עבודת תבניות. בלוק אחד לכל סוג-דף (בית, מוצר, בלוג), ואז אוטומציה ממטא-נתוני ה-CMS.
- **השפעה 4/5** - פירוק עמימות זהות חיוני לכל מותג ששמו מתנגש עם ישות אחרת.
- **שינוי חזותי: ללא** - JSON-LD חי בתוך תגי `<script>`; משתמשים לא רואים דבר שונה.

## שלבים
1. **בלוק `@graph` אחד, ה-`@type` הנכון לכל דף.** עטפו כל ישות שדף מתאר במערך `"@graph": [ ... ]` יחיד במקום בתגי `<script>` מפוזרים. תנו לכל צומת `@id` יציב (למשל `https://example.com/#organization`) והצליבו לפי `@id` - כך ש-`brand` של `Product` מצביע על אותו צומת `Organization` וסוכנים פותרים ישות קוהרנטית אחת. בחרו את ה-`@type` לכל דף: `Organization` בדף הבית וב-`/about`;‏ `Product` או `SoftwareApplication` בדפי מוצר (`applicationCategory`,‏ `offers`,‏ `aggregateRating` היכן שכן);‏ `Article` בפוסטים (`author`,‏ `datePublished`,‏ `dateModified`).
2. **השלימו את בלוק ה-`Organization`.** חובה: `name`,‏ `url`,‏ `logo`,‏ `description`. הוסיפו `contactPoint` (`contactType`,‏ `email`,‏ `telephone`) ו-`address` כ-`PostalAddress`.
3. **הוסיפו קישור ישויות `sameAs`.** הצביעו על ויקיפדיה,‏ Wikidata‏ (`.../wiki/Q…`), ארגון ה-GitHub המאומת שלכם,‏ LinkedIn,‏ X,‏ Crunchbase. Wikidata הוא הציר המרכזי - זה המזהה שרוב גרפי הידע נשענים עליו.
4. **הוסיפו סימון `Speakable`.** צרפו מאפיין `speakable` לצומת ה-`WebPage`/`Article` של הדף: `"speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".summary", ".key-stats"] }` כך שסוכני קול יקראו את הסיכום שבחרתם ביד, לא פסקה מנוחשת. הסלקטורים חייבים להיפתר לאלמנטים אמיתיים בדף - `cssSelector` שלא מתאים לכלום הוא סימון מת. (`xpath` הוא אתר המיקום החלופי; שימו לב ש-schema.org מאיית `xpath` בעוד שתיעוד Google משתמש ב-`xPath`.)
5. **הרחיבו את אוצר המילים מעבר ליסודות.** `Organization`,‏ `Product` ו-`Article` הם הרצפה. הוסיפו טיפוסים מתאימים-לתחום - `FAQPage` בדפי עזרה,‏ `Service` לכל הצעה,‏ `Review` / `AggregateRating` היכן שכן,‏ `BreadcrumbList` לניווט,‏ `LocalBusiness` למיקומים פיזיים. כל אחד הוא מחלקה של שאלה שסוכן יכול לענות עליה מנתונים מובנים במקום לנחש.
6. **גבו את הסכמה בדפים אמיתיים שמבססים אמון.** ה-`contactPoint` וה-`address` משלב 2 חייבים להיפתר למשהו אמיתי: `/about` עם היסטוריה אמיתית,‏ `/contact` עם ערוצים פעילים,‏ `/privacy` עם מדיניות ממשית - כל אחד עם 500+ תווים של טקסט מהותי, לא שלד. סוכנים בודקים את אלה כדי לשפוט לגיטימיות לפני שהם ממליצים עליכם; דף אמון ריק נקרא כדגל אדום.
7. **אמתו.** הריצו כל סוג-דף דרך [Rich Results Test](https://search.google.com/test/rich-results?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide) של Google ו-[Schema.org Validator](https://validator.schema.org?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide). תקנו אזהרות, לא רק שגיאות - סוכנים מחמירים יותר מצינור הרינדור של Google.

כשמחברים את הכול יחד, בלוק של דף בית אורז את הארגון, המוצר, `FAQPage`, וסלקטורי ה-speakable לתוך `@graph` אחד, מוצלב לפי `@id`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Acme",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "description": "One-sentence, model-facing description of what Acme does.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "sales@example.com",
        "url": "https://example.com/contact"
      },
      "sameAs": [
        "https://en.wikipedia.org/wiki/Acme",
        "https://www.wikidata.org/wiki/Q12345678",
        "https://github.com/acme",
        "https://www.linkedin.com/company/acme"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://example.com/#software",
      "name": "Acme Platform",
      "applicationCategory": "BusinessApplication",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#organization" },
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/contact",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "ratingCount": "29"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://example.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does Acme do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A direct, factual two-sentence answer an agent can quote verbatim."
          }
        },
        {
          "@type": "Question",
          "name": "Can my AI agent integrate with Acme?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes - Acme publishes an MCP server, a REST API, and an OpenAPI 3.x spec. See https://example.com/AGENTS.md."
          }
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://example.com/#webpage",
      "url": "https://example.com",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".hero-subtitle", ".key-stats"]
      }
    }
  ]
}
```

## מקורות
- [Schema.org Organization](https://schema.org/Organization?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org sameAs](https://schema.org/sameAs?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org Speakable](https://schema.org/SpeakableSpecification?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Schema.org FAQPage](https://schema.org/FAQPage?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)
- [Google Rich Results Test](https://search.google.com/test/rich-results?utm_source=forter&utm_medium=referral&utm_campaign=agentic-readiness-guide)

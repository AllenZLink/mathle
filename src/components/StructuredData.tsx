import { locales, pageUrlForLocale } from "@/i18n/config";
import type { GameMode } from "@/lib/game";
import { homeMessages, modePageMessages, type Locale } from "@/messages";
import { siteUrl } from "@/lib/metadata";

type StructuredDataProps = Readonly<{
  locale: Locale;
  mode?: GameMode;
}>;

export default function StructuredData({ locale, mode }: StructuredDataProps) {
  const copy = mode ? modePageMessages[locale][mode] : homeMessages[locale];
  const homeCopy = homeMessages[locale];
  const pageUrl = pageUrlForLocale(locale, mode);
  const name = copy["meta.title"];
  const description = copy["meta.description"];
  const faqItems = [
    ["seo.faqQuestion1", "seo.faqAnswer1"],
    ["seo.faqQuestion2", "seo.faqAnswer2"],
    ["seo.faqQuestion3", "seo.faqAnswer3"],
    ["seo.faqQuestion4", "seo.faqAnswer4"],
    ["seo.faqQuestion5", "seo.faqAnswer5"],
    ["seo.faqQuestion6", "seo.faqAnswer6"],
    ["seo.faqQuestion7", "seo.faqAnswer7"]
  ] as const;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Mathle",
        url: siteUrl,
        inLanguage: locale
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name,
        description,
        isPartOf: {
          "@id": `${siteUrl}/#website`
        },
        mainEntity: {
          "@id": `${pageUrl}#faq`
        },
        inLanguage: locale
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        url: pageUrl,
        name: homeCopy["seo.faqHeading"],
        inLanguage: locale,
        mainEntity: faqItems.map(([questionKey, answerKey]) => ({
          "@type": "Question",
          name: homeCopy[questionKey],
          acceptedAnswer: {
            "@type": "Answer",
            text: homeCopy[answerKey]
          }
        }))
      },
      {
        "@type": "Game",
        "@id": `${siteUrl}/#game`,
        name: "Mathle",
        url: pageUrl,
        description: homeCopy["seo.intro"],
        genre: ["Puzzle", "Educational"],
        gamePlatform: "Web browser",
        applicationCategory: "Game",
        inLanguage: [...locales]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

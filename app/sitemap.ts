import type { MetadataRoute } from "next";
import { gameModes, locales, pathForLocale, pathForLocaleMode } from "@/i18n/config";
import { siteUrl } from "@/lib/metadata";

export const dynamic = "force-static";

const lastModified = new Date("2026-04-17");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...locales.map((locale) => ({
      url: `${siteUrl}${pathForLocale(locale)}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: locale === "en" ? 1 : 0.9
    })),
    ...locales.flatMap((locale) => gameModes.map((mode) => ({
      url: `${siteUrl}${pathForLocaleMode(locale, mode)}`,
      lastModified,
      changeFrequency: mode === "infinite" ? "weekly" as const : "daily" as const,
      priority: mode === "daily" ? 0.95 : 0.85
    }))),
    {
      url: `${siteUrl}/changelog/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.4
    },
    {
      url: `${siteUrl}/privacy/`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3
    }
  ];
}

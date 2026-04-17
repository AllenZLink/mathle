import type { Metadata } from "next";
import { siteUrl } from "@/lib/metadata";
import { GAME_MODES, MODE_LABELS, type GameMode } from "@/lib/game";
import { homeMessages, modePageMessages, type Locale } from "@/messages";

export const defaultLocale = "en" as const;
export const locales = ["en", "de"] as const satisfies readonly Locale[];
export const gameModes = [GAME_MODES.DAILY, GAME_MODES.HOURLY, GAME_MODES.INFINITE] as const satisfies readonly GameMode[];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  de: "Deutsch"
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isGameMode(value: string): value is GameMode {
  return (gameModes as readonly string[]).includes(value);
}

export function pathForLocale(locale: Locale): string {
  return locale === defaultLocale ? "/" : `/${locale}/`;
}

export function pathForLocaleMode(locale: Locale, mode: GameMode): string {
  return locale === defaultLocale ? `/${mode}/` : `/${locale}/${mode}/`;
}

export function localizedLocales(): Locale[] {
  return locales.filter((locale) => locale !== defaultLocale);
}

export function languageAlternates(mode?: GameMode): Record<string, string> {
  return Object.fromEntries([
    ...locales.map((locale) => [locale, mode ? pathForLocaleMode(locale, mode) : pathForLocale(locale)]),
    ["x-default", mode ? pathForLocaleMode(defaultLocale, mode) : pathForLocale(defaultLocale)]
  ]);
}

export function pageUrlForLocale(locale: Locale, mode?: GameMode): string {
  return `${siteUrl}${mode ? pathForLocaleMode(locale, mode) : pathForLocale(locale)}`;
}

export function gameMetadata(locale: Locale, mode?: GameMode): Metadata {
  const copy = mode ? modePageMessages[locale][mode] : homeMessages[locale];
  const path = mode ? pathForLocaleMode(locale, mode) : pathForLocale(locale);
  const title = copy["meta.title"];
  const description = copy["meta.description"];
  const image = {
    url: "/social-image.svg",
    width: 1200,
    height: 630,
    alt: homeMessages[locale]["meta.socialImageAlt"]
  };

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: languageAlternates(mode)
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Mathle",
      type: "website",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export function modePathsForLocale(locale: Locale): Record<GameMode, string> {
  return Object.fromEntries(gameModes.map((mode) => [mode, pathForLocaleMode(locale, mode)])) as Record<GameMode, string>;
}

export function modeLabel(mode: GameMode): string {
  return MODE_LABELS[mode];
}

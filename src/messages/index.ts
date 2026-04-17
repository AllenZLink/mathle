import deCommon from "./de/common.json";
import deDaily from "./de/daily.json";
import deHome from "./de/home.json";
import deHourly from "./de/hourly.json";
import deInfinite from "./de/infinite.json";
import enChangelog from "./en/changelog.json";
import enCommon from "./en/common.json";
import enDaily from "./en/daily.json";
import enHome from "./en/home.json";
import enHourly from "./en/hourly.json";
import enInfinite from "./en/infinite.json";
import enPrivacy from "./en/privacy.json";

export const messages = {
  en: enCommon,
  de: deCommon
} as const;

export const homeMessages = {
  en: enHome,
  de: deHome
} as const;

export const modePageMessages = {
  en: {
    daily: enDaily,
    hourly: enHourly,
    infinite: enInfinite
  },
  de: {
    daily: deDaily,
    hourly: deHourly,
    infinite: deInfinite
  }
} as const;

export const englishStaticPageMessages = {
  changelog: enChangelog,
  privacy: enPrivacy
} as const;

export type Locale = keyof typeof messages;
export type MessageKey = keyof typeof enCommon;
export type Messages = Record<MessageKey, string>;

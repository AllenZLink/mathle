import { modePathsForLocale } from "@/i18n/config";
import type { GameMode } from "@/lib/game";
import { messages, type Locale } from "@/messages";
import GameMount from "./GameMount";
import IntlProviderClient from "./IntlProviderClient";
import SiteFooter from "./SiteFooter";
import StaticSeoContent from "./StaticSeoContent";
import StructuredData from "./StructuredData";

type MathlePageProps = Readonly<{
  locale: Locale;
  mode?: GameMode;
}>;

export default function MathlePage({ locale, mode }: MathlePageProps) {
  return (
    <IntlProviderClient locale={locale} messages={messages[locale]}>
      <div className="site-shell">
        <GameMount initialMode={mode} modePaths={modePathsForLocale(locale)} />
        <StructuredData locale={locale} mode={mode} />
        {/* Advertising integration point: render future ad slots here, outside the game UI. */}
        <StaticSeoContent locale={locale} mode={mode} />
        <SiteFooter locale={locale} mode={mode} />
      </div>
    </IntlProviderClient>
  );
}

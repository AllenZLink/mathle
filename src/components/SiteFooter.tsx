import { localeLabels, locales, pathForLocale, pathForLocaleMode } from "@/i18n/config";
import type { GameMode } from "@/lib/game";
import type { Locale } from "@/messages";

type SiteFooterProps = Readonly<{
  locale?: Locale;
  mode?: GameMode;
}>;

export default function SiteFooter({ locale = "en", mode }: SiteFooterProps) {
  const languageLinkClass = (active: boolean) => `footer-link ${active ? "footer-link-active" : ""}`;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <nav className="footer-row" aria-label="Footer">
          <a className="footer-link" href="/">
            Home
          </a>
          <a className="footer-link" href="/changelog/">
            Changelog
          </a>
          <a className="footer-link" href="/privacy/">
            Privacy
          </a>
        </nav>
        <div className="footer-row" aria-label="Language options">
          {locales.map((item) => {
            const active = item === locale;

            return (
              <a
                key={item}
                className={languageLinkClass(active)}
                href={mode ? pathForLocaleMode(item, mode) : pathForLocale(item)}
                aria-current={active ? "page" : undefined}
              >
                {localeLabels[item]}
              </a>
            );
          })}
        </div>
        <p className="body-copy text-sm">
          © 2026 Mathle. All rights reserved. Mathle is an independent math puzzle for casual play.
        </p>
      </div>
    </footer>
  );
}

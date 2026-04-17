import type { Locale } from "@/messages";

type RootLayoutShellProps = Readonly<{
  lang: Locale;
  children: React.ReactNode;
}>;

export default function RootLayoutShell({ lang, children }: RootLayoutShellProps) {
  return (
    <html lang={lang} className="theme-dark">
      <body>
        {children}
        {/* Analytics integration point: add your own provider script here when needed. */}
        {/* Advertising integration point: add your own ad network script here when needed. */}
      </body>
    </html>
  );
}

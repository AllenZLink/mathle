"use client";

import { IntlProvider } from "react-intl";
import type { Locale, Messages } from "@/messages";

type IntlProviderClientProps = Readonly<{
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}>;

export default function IntlProviderClient({ locale, messages, children }: IntlProviderClientProps) {
  return (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      {children}
    </IntlProvider>
  );
}

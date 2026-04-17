import type { Metadata } from "next";
import MathlePage from "@/components/MathlePage";
import { defaultLocale, gameMetadata } from "@/i18n/config";

export const metadata: Metadata = gameMetadata(defaultLocale);

export default function HomePage() {
  return <MathlePage locale={defaultLocale} />;
}

import type { Metadata, Viewport } from "next";
import RootLayoutShell from "@/components/RootLayoutShell";
import { defaultLocale } from "@/i18n/config";
import { defaultMetadata, defaultViewport } from "@/lib/metadata";
import "../../styles/globals.css";

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = defaultViewport;

export default function DefaultRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootLayoutShell lang={defaultLocale}>{children}</RootLayoutShell>;
}

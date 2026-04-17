import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MathlePage from "@/components/MathlePage";
import { defaultLocale, gameMetadata, gameModes, isGameMode } from "@/i18n/config";

type ModePageProps = Readonly<{
  params: Promise<{ mode: string }>;
}>;

export function generateStaticParams() {
  return gameModes.map((mode) => ({ mode }));
}

export async function generateMetadata({ params }: ModePageProps): Promise<Metadata> {
  const { mode } = await params;

  if (!isGameMode(mode)) {
    return {};
  }

  return gameMetadata(defaultLocale, mode);
}

export default async function ModePage({ params }: ModePageProps) {
  const { mode } = await params;

  if (!isGameMode(mode)) {
    notFound();
  }

  return <MathlePage locale={defaultLocale} mode={mode} />;
}

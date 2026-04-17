import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MathlePage from "@/components/MathlePage";
import { gameMetadata, gameModes, isGameMode } from "@/i18n/config";

type LocalizedModePageProps = Readonly<{
  params: Promise<{ mode: string }>;
}>;

export function generateStaticParams() {
  return gameModes.map((mode) => ({ mode }));
}

export async function generateMetadata({ params }: LocalizedModePageProps): Promise<Metadata> {
  const { mode } = await params;

  if (!isGameMode(mode)) {
    return {};
  }

  return gameMetadata("de", mode);
}

export default async function LocalizedModePage({ params }: LocalizedModePageProps) {
  const { mode } = await params;

  if (!isGameMode(mode)) {
    notFound();
  }

  return <MathlePage locale="de" mode={mode} />;
}

import type { Metadata } from "next";
import MathlePage from "@/components/MathlePage";
import { gameMetadata } from "@/i18n/config";

export const metadata: Metadata = gameMetadata("de");

export default function GermanPage() {
  return <MathlePage locale="de" />;
}

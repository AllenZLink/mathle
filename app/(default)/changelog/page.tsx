import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { englishStaticPageMessages } from "@/messages";

const copy = englishStaticPageMessages.changelog;

export const metadata: Metadata = {
  title: copy["meta.title"],
  description: copy["meta.description"],
  alternates: {
    canonical: "/changelog/"
  },
  openGraph: {
    title: copy["meta.title"],
    description: copy["meta.description"],
    url: "/changelog/",
    siteName: "Mathle",
    type: "website"
  }
};

export default function ChangelogPage() {
  return (
    <StaticPageLayout>
      <h1 className="page-title">{copy.heading}</h1>
      <p className="body-copy mb-8">
        {copy.intro}
      </p>
      <section className="mb-8">
        <h2 className="section-title">{copy["release.heading"]}</h2>
        <ul className="body-copy list-disc space-y-2 pl-6">
          {copy["release.items"].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="section-title">{copy["reconstruction.heading"]}</h2>
        <p className="body-copy">
          {copy["reconstruction.body"]}
        </p>
      </section>
    </StaticPageLayout>
  );
}

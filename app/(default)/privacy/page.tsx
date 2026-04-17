import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { englishStaticPageMessages } from "@/messages";

const copy = englishStaticPageMessages.privacy;

export const metadata: Metadata = {
  title: copy["meta.title"],
  description: copy["meta.description"],
  alternates: {
    canonical: "/privacy/"
  },
  openGraph: {
    title: copy["meta.title"],
    description: copy["meta.description"],
    url: "/privacy/",
    siteName: "Mathle",
    type: "website"
  }
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout>
      <h1 className="page-title">{copy.heading}</h1>
      <p className="body-copy mb-6">
        {copy.intro}
      </p>
      <section className="mb-6">
        <h2 className="section-title">{copy["localStorage.heading"]}</h2>
        <p className="body-copy">
          {copy["localStorage.body"]}
        </p>
      </section>
      <section className="mb-6">
        <h2 className="section-title">{copy["analytics.heading"]}</h2>
        <p className="body-copy">
          {copy["analytics.body"]}
        </p>
      </section>
      <section className="mb-6">
        <h2 className="section-title">{copy["ads.heading"]}</h2>
        <p className="body-copy">
          {copy["ads.body"]}
        </p>
      </section>
      <section>
        <h2 className="section-title">{copy["contact.heading"]}</h2>
        <p className="body-copy">
          {copy["contact.body"]}
        </p>
      </section>
    </StaticPageLayout>
  );
}

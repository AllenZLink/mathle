import SiteFooter from "./SiteFooter";

type StaticPageLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function StaticPageLayout({ children }: StaticPageLayoutProps) {
  return (
    <div className="site-shell">
      <main className="content-panel">{children}</main>
      <SiteFooter locale="en" />
    </div>
  );
}

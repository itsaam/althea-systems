import Footer from "@/components/layout/footer";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

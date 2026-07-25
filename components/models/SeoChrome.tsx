import Footer from "@/components/Footer";
import ModelNavigation from "./ModelNavigation.client";

export function SeoNavigation() {
  return <ModelNavigation />;
}

export function SeoFooter() {
  return <Footer />;
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

import { notFound } from "next/navigation";
import DiscoveryPage, {
  metadataFor,
} from "@/components/discovery/DiscoveryPage";
import { discoveryPage, discoveryPages } from "@/lib/discovery/snapshot";
export const dynamicParams = false;
export function generateStaticParams() {
  return discoveryPages
    .filter((p) => p.family === "alternatives" && !p.children)
    .map((p) => ({ slug: p.slug }));
}
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return metadataFor(discoveryPage(`/models/${slug}/alternatives/`));
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = discoveryPage(`/models/${slug}/alternatives/`);
  if (!page) notFound();
  return <DiscoveryPage page={page} />;
}

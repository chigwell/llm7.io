import { notFound } from "next/navigation";
import DiscoveryPage, {
  metadataFor,
} from "@/components/discovery/DiscoveryPage";
import { discoveryPage, discoveryPages } from "@/lib/discovery/snapshot";
export const dynamicParams = false;
export function generateStaticParams() {
  return discoveryPages
    .filter((p) => p.family === "features" && !p.children)
    .map((p) => ({ feature: p.slug }));
}
type Props = { params: Promise<{ feature: string }> };
export async function generateMetadata({ params }: Props) {
  const { feature } = await params;
  return metadataFor(discoveryPage(`/models/features/${feature}/`));
}
export default async function Page({ params }: Props) {
  const { feature } = await params;
  const page = discoveryPage(`/models/features/${feature}/`);
  if (!page) notFound();
  return <DiscoveryPage page={page} />;
}

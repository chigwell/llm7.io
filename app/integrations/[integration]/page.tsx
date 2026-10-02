import { notFound } from "next/navigation";
import DiscoveryPage, {
  metadataFor,
} from "@/components/discovery/DiscoveryPage";
import { discoveryPage, discoveryPages } from "@/lib/discovery/snapshot";
export const dynamicParams = false;
export function generateStaticParams() {
  return discoveryPages
    .filter((p) => p.family === "integrations" && !p.children)
    .map((p) => ({ integration: p.slug }));
}
type Props = { params: Promise<{ integration: string }> };
export async function generateMetadata({ params }: Props) {
  const { integration } = await params;
  return metadataFor(discoveryPage(`/integrations/${integration}/`));
}
export default async function Page({ params }: Props) {
  const { integration } = await params;
  const page = discoveryPage(`/integrations/${integration}/`);
  if (!page) notFound();
  return <DiscoveryPage page={page} />;
}

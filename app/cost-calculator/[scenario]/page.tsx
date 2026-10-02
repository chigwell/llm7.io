import { notFound } from "next/navigation";
import DiscoveryPage, {
  metadataFor,
} from "@/components/discovery/DiscoveryPage";
import { discoveryPage, discoveryPages } from "@/lib/discovery/snapshot";
export const dynamicParams = false;
export function generateStaticParams() {
  return discoveryPages
    .filter((p) => p.family === "calculators" && !p.children)
    .map((p) => ({ scenario: p.slug }));
}
type Props = { params: Promise<{ scenario: string }> };
export async function generateMetadata({ params }: Props) {
  const { scenario } = await params;
  return metadataFor(discoveryPage(`/cost-calculator/${scenario}/`));
}
export default async function Page({ params }: Props) {
  const { scenario } = await params;
  const page = discoveryPage(`/cost-calculator/${scenario}/`);
  if (!page) notFound();
  return <DiscoveryPage page={page} />;
}

import { notFound } from "next/navigation";
import DiscoveryPage, {
  metadataFor,
} from "@/components/discovery/DiscoveryPage";
import { discoveryPage } from "@/lib/discovery/snapshot";
export const metadata = metadataFor(discoveryPage("/cost-calculator/"));
export default function Page() {
  const page = discoveryPage("/cost-calculator/");
  if (!page) notFound();
  return <DiscoveryPage page={page} />;
}

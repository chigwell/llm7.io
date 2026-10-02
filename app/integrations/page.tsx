import { notFound } from "next/navigation";
import DiscoveryPage, {
  metadataFor,
} from "@/components/discovery/DiscoveryPage";
import { discoveryPage } from "@/lib/discovery/snapshot";
export const metadata = metadataFor(discoveryPage("/integrations/"));
export default function Page() {
  const page = discoveryPage("/integrations/");
  if (!page) notFound();
  return <DiscoveryPage page={page} />;
}

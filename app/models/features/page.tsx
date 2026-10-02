import { notFound } from "next/navigation";
import DiscoveryPage, {
  metadataFor,
} from "@/components/discovery/DiscoveryPage";
import { discoveryPage } from "@/lib/discovery/snapshot";
export const metadata = metadataFor(discoveryPage("/models/features/"));
export default function Page() {
  const page = discoveryPage("/models/features/");
  if (!page) notFound();
  return <DiscoveryPage page={page} />;
}

import ModelPageProviders from "@/components/models/ModelPageProviders";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ModelPageProviders>{children}</ModelPageProviders>;
}

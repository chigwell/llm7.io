import ModelPageProviders from "@/components/models/ModelPageProviders";

export default function ModelsLayout({ children }: { children: React.ReactNode }) {
  return <ModelPageProviders>{children}</ModelPageProviders>;
}

"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/buttonShadcn";
import { ModelCard } from "./models/LiveModelCard";
import { MODELS_API_URL, useLlm7Models } from "@/hooks/use-llm7-models";
import { usePingMetrics } from "@/hooks/use-ping-metrics";
import { transformApiModel, sortModelsByProvider } from "@/lib/models/live-pricing";

export default function PayAsYouGoModels() {
  const [showAll, setShowAll] = useState(false);
  const { models: apiModels, modelsState } = useLlm7Models();
  const { latest: latestPingSnapshot } = usePingMetrics();

  const models = useMemo(() => apiModels.map(transformApiModel), [apiModels]);

  const visibleModels = useMemo(() => {
    const sortedModels = sortModelsByProvider(models);

    if (showAll) return sortedModels;

    return sortedModels.slice(0, 3);
  }, [models, showAll]);

  const hiddenCount = Math.max(models.length - visibleModels.length, 0);

  return (
    <section id="models" aria-labelledby="payg-heading" className="mx-auto w-full max-w-md scroll-mt-24 md:max-w-[61rem]">
      <div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Pay as you go</p>
          <h3 id="payg-heading" className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Scale frontier model access on your terms.
          </h3>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        {modelsState === "loading" ? "Loading current model pricing..." : null}
        {modelsState === "error" ? "Showing cached model pricing while live pricing is unavailable." : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {visibleModels.map((model) => {
          const availability = latestPingSnapshot?.modelAvailability[model.id.toLowerCase()];

          return <ModelCard key={model.id} model={model} availability={availability} />;
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Prices use each model&apos;s listed unit. Video prices start at the lowest listed rate, with configuration-specific rates shown on each card. Cache pricing appears when the model endpoint returns public cache price keys. Minimum request price is shown when provided by the model endpoint.{" "}
        <a href={MODELS_API_URL} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
          See all models in JSON format via API
        </a>
        .
      </p>

      {hiddenCount > 0 ? (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" onClick={() => setShowAll((value) => !value)}>
            {showAll ? (
              <>
                Show less <ChevronUpIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                Show all {models.length} models <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      ) : null}

      {showAll ? <div className="mt-4 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/models/">Browse the full model catalogue</Link>
        </Button>
      </div> : null}

    </section>
  );
}

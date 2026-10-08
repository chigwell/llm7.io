"use client";
import { useLivePrices } from "@/hooks/use-llm7-models";
import { withCurrentPricing } from "@/lib/models/current-pricing";
import { PricingStatus } from "@/components/models/LiveModelPricing.client";
import { useState } from "react";
import Link from "next/link";
import Decimal from "decimal.js-light";
import type { DiscoveryPage } from "@/lib/discovery/pages.js";
import {
  capability,
  configuration,
  estimate,
  idOrder,
  validCount,
} from "@/lib/discovery/pages.js";
import { formatPrice, parseTokenPricingUnit } from "@/lib/models/format";
import { isProviderQuoteModel } from "@/lib/models/video-pricing";
import ModelLogo from "@/components/models/ModelLogo";

export default function Explorer({ page }: { page: DiscoveryPage }) {
  const { prices, state } = useLivePrices();
  const [selected, setSelected] = useState(page.models[0]?.slug ?? "");
  const [copied, setCopied] = useState("");
  const [sort, setSort] = useState("id");
  const [requests, setRequests] = useState("10000");
  const [input, setInput] = useState(String(page.template?.input ?? 2000));
  const [output, setOutput] = useState(String(page.template?.output ?? 500));
  const calculator = page.family === "calculators";
  const integration = page.family === "integrations";
  const chosen = page.models.find((m) => m.slug === selected);
  const config = chosen ? configuration(page.slug, chosen) : "";
  const valid = [requests, input, output].every(validCount);
  const rows = page.models.map((snapshot) => {
    const price = prices.get(snapshot.model_id);
    const model = withCurrentPricing(snapshot, price);
    return { model, price, result: price ? estimate(model, requests, input, output) : { cost: null, status: "Current pricing unavailable" } };
  });
  rows.sort((a, b) => {
    if (calculator || sort === "price") {
      const price = (row: typeof a) => {
        if (calculator)
          return row.result.status.startsWith("Unsuitable")
            ? null
            : row.result.cost;
        const p = row.model.pricing;
        const unit = parseTokenPricingUnit(p.unit);
        return p.mode === "token" &&
          p.currency === "USD" &&
          p.input != null &&
          p.billing_strategy !== "provider_quote" &&
          unit?.gt(0)
          ? new Decimal(p.input).div(unit).toString()
          : null;
      };
      const av = price(a),
        bv = price(b);
      if (av == null || bv == null)
        return av === bv ? idOrder(a.model, b.model) : av == null ? 1 : -1;
      return new Decimal(av).cmp(bv) || idOrder(a.model, b.model);
    }
    if (sort === "context")
      return (
        (b.model.context_window.tokens ?? -1) -
          (a.model.context_window.tokens ?? -1) || idOrder(a.model, b.model)
      );
    return idOrder(a.model, b.model);
  });
  return (
    <section className="space-y-5">
      {state !== "ready" ? <PricingStatus state={state} /> : null}
      {integration && chosen ? (
        <div className="rounded-2xl border bg-card/55 p-5 space-y-4">
          <label className="block font-medium" htmlFor="integration-model">
            Configuration model
          </label>
          <select
            id="integration-model"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setCopied("");
            }}
            className="w-full min-w-0 rounded-lg border bg-background p-3"
          >
            {page.models.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.model_id}
              </option>
            ))}
          </select>
          <pre className="max-w-full overflow-x-auto rounded-xl bg-background p-4 text-sm">
            <code>{config}</code>
          </pre>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(config);
                setCopied("Copied");
              } catch {
                setCopied(
                  "Copy failed. Select and copy the configuration above.",
                );
              }
            }}
          >
            Copy configuration
          </button>
          <span className="ml-3 text-sm" role="status">
            {copied}
          </span>
        </div>
      ) : null}
      {calculator ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Requests", requests, setRequests],
              ["Input tokens per request", input, setInput],
              ["Output tokens per request", output, setOutput],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="text-sm font-medium">
                {String(label)}
                <input
                  aria-label={String(label)}
                  inputMode="numeric"
                  value={String(value)}
                  onChange={(e) =>
                    (setter as (v: string) => void)(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border bg-background p-3"
                />
              </label>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Editable assumptions. Estimates use requests × max(input cost +
            output cost, minimum request charge). Zero requests cost zero.
            Caching, retries, taxes, and non-token services are excluded.
            Context checks include input and output tokens.
          </p>
          {!valid ? (
            <p role="alert">Enter whole numbers between 0 and 1,000,000,000.</p>
          ) : null}
        </>
      ) : (
        <label className="block text-sm">
          Sort models{" "}
          <select
            aria-label="Sort models"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="ml-2 rounded-lg border bg-background p-2"
          >
            <option value="id">Model ID</option>
            <option value="price">Input price: lowest first</option>
            <option value="context">Context: largest first</option>
          </select>
        </label>
      )}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <caption className="p-4 text-left font-semibold">
            {calculator
              ? "Estimated scenario costs in USD"
              : "Eligible models and published pricing"}
          </caption>
          <thead className="bg-muted/50">
            <tr>
              {[
                "Model",
                "Pricing",
                "Context",
                "Tool calling",
                ...(calculator ? ["Estimated total", "Suitability"] : []),
              ].map((h) => (
                <th scope="col" key={h} className="p-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ model: m, result, price }) => (
              <tr key={m.slug} className="border-t">
                <td className="p-3">
                  <Link
                    href={`/models/${m.slug}/`}
                    className="flex items-center gap-2 font-medium text-primary"
                  >
                    <ModelLogo model={m} size="sm" />
                    {m.model_id}
                  </Link>
                </td>
                <td className="p-3 min-w-48">
                  {price ? isProviderQuoteModel(m) ? "Dynamic per-request quote" : formatPrice(m) : "Current pricing unavailable"}
                  {m.pricing.minimum_request_usd ? (
                    <p>Minimum: ${m.pricing.minimum_request_usd}/request</p>
                  ) : null}
                </td>
                <td className="p-3">
                  {m.context_window.tokens?.toLocaleString("en-US") ??
                    "Unknown context"}
                </td>
                <td className="p-3">
                  {capability(m, "tool-calling") === true
                    ? "Supported"
                    : capability(m, "tool-calling") === false
                      ? "Not supported"
                      : "Unknown"}
                </td>
                {calculator ? (
                  <>
                    <td className="p-3">
                      {result.cost == null
                        ? "Unknown price"
                        : `$${result.cost}`}
                    </td>
                    <td className="p-3">{result.status}</td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {calculator ? (
        <p className="text-sm text-muted-foreground">
          Unknown prices and models exceeding known context limits are excluded
          from numeric ranking. Unknown context requires verification. Compare
          token quantities with the{" "}
          <Link className="text-primary underline" href="/token-calculator/">
            token calculator
          </Link>
          .
        </p>
      ) : null}
    </section>
  );
}

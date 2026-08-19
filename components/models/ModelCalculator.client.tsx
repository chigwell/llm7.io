"use client";

import Decimal from "decimal.js-light";
import { useMemo, useState } from "react";
import { Minus, Plus, Sparkles } from "lucide-react";

type Props = {
  mode: "token" | "image" | "second";
  unit: string;
  inputPrice?: string;
  outputPrice?: string;
  price?: string;
  minimum?: string | null;
  effectiveDate?: string;
  durations?: number[];
  variablePricing?: boolean;
};

const wholeCount = (value: string) => /^\d+$/.test(value) && new Decimal(value || "0").lte("1000000000");
const decimalCount = (value: string) => /^\d+(?:\.\d+)?$/.test(value) && new Decimal(value || "0").lte("1000000000");

function tokenUnit(unit: string) {
  const found = unit.match(/^(\d+(?:\.\d+)?)\s*(k|m)?\s+tokens?$/i);
  if (!found) return null;
  return new Decimal(found[1]).times(found[2]?.toLowerCase() === "m" ? 1_000_000 : found[2]?.toLowerCase() === "k" ? 1000 : 1);
}

function money(value: Decimal) {
  const formatted = value.toFixed(8).replace(/(?:\.0+|(?<=(?:\.\d*?[1-9]))0+)$/, "") || "0";
  return "$" + formatted;
}

function formatQuantity(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat("en-US").format(number) : value;
}

function Presets({ values, onChoose, suffix = "" }: { values: number[]; onChoose: (value: number) => void; suffix?: string }) {
  return <div className="mt-2 flex flex-wrap gap-2">{values.map((value) => <button type="button" key={value} onClick={() => onChoose(value)} className="rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground">{formatQuantity(String(value))}{suffix}</button>)}</div>;
}

function StepperInput({ label, value, onChange, presets, suffix, step = 1 }: { label: string; value: string; onChange: (value: string) => void; presets: number[]; suffix?: string; step?: number }) {
  const decrement = () => onChange(String(Math.max(0, Number(value || 0) - step)));
  const increment = () => onChange(String(Math.min(1_000_000_000, Number(value || 0) + step)));

  return <div>
    <label className="text-sm font-medium">{label}</label>
    <div className="mt-2 flex overflow-hidden rounded-xl border border-border/70 bg-background/65 shadow-inner">
      <button type="button" aria-label={"Decrease " + label} onClick={decrement} className="grid w-11 place-items-center border-r border-border/70 transition-colors hover:bg-accent"><Minus className="h-4 w-4" /></button>
      <input inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-center font-semibold outline-none" />
      <button type="button" aria-label={"Increase " + label} onClick={increment} className="grid w-11 place-items-center border-l border-border/70 transition-colors hover:bg-accent"><Plus className="h-4 w-4" /></button>
    </div>
    <Presets values={presets} onChoose={(preset) => onChange(String(preset))} suffix={suffix} />
  </div>;
}

export default function ModelCalculator(props: Props) {
  const [first, setFirst] = useState(props.mode === "token" ? "10000" : "1");
  const [second, setSecond] = useState(props.mode === "token" ? "2500" : "1");
  const [duration, setDuration] = useState(String(props.durations?.[0] ?? 5));

  const calculated = useMemo(() => {
    try {
      if (props.mode === "token") {
        const unit = tokenUnit(props.unit);
        if (!unit || !wholeCount(first) || !wholeCount(second)) return null;
        const input = new Decimal(first).div(unit).times(props.inputPrice ?? 0);
        const output = new Decimal(second).div(unit).times(props.outputPrice ?? 0);
        const raw = input.plus(output);
        const total = props.minimum && raw.lessThan(props.minimum) ? new Decimal(props.minimum) : raw;
        return { input, output, raw, total, adjustment: total.minus(raw) };
      }
      if (!wholeCount(first) || (props.mode === "second" && !wholeCount(second))) return null;
      const units = props.mode === "second" ? new Decimal(duration).times(second) : new Decimal(first);
      if (!decimalCount(units.toString())) return null;
      const raw = units.times(props.price ?? 0);
      const total = props.minimum && raw.lessThan(props.minimum) ? new Decimal(props.minimum) : raw;
      return { units, raw, total, adjustment: total.minus(raw) };
    } catch {
      return null;
    }
  }, [first, second, duration, props]);

  const sliderValue = Math.min(1_000_000, Math.max(0, Number(props.mode === "token" ? first : props.mode === "image" ? first : second) || 0));
  const onSlider = (value: string) => {
    if (props.mode === "token" || props.mode === "image") setFirst(value);
    else setSecond(value);
  };
  const unitName = props.mode === "token" ? "tokens" : props.mode === "image" ? "images" : "videos";

  return (
    <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur md:p-6" aria-labelledby="calculator-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="calculator-heading" className="flex items-center gap-2 text-2xl font-semibold"><Sparkles className="h-5 w-5 text-primary" />Cost calculator</h2>
          <p className="mt-1 text-sm text-muted-foreground">{props.variablePricing ? "Estimate at the starting rate; resolution, input type, quality, and audio options may change the actual total." : "Adjust the volume to see an instant estimate at the current public price."}</p>
        </div>
        <span className="rounded-full border border-border/70 bg-background/65 px-3 py-1 text-xs font-medium">{props.unit}</span>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-background/45 p-4">
        <div className="flex items-center justify-between gap-4 text-sm"><label htmlFor="usage-volume" className="font-medium">Request volume</label><output className="font-semibold">{formatQuantity(String(sliderValue))} {unitName}</output></div>
        <input id="usage-volume" type="range" min="0" max="1000000" step={props.mode === "token" ? "1000" : "1"} value={sliderValue} onChange={(event) => onSlider(event.target.value)} className="model-range mt-4 w-full cursor-pointer" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>0</span><span>1M</span></div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {props.mode === "token" ? <>
          <StepperInput label="Input tokens" value={first} onChange={setFirst} presets={[1000, 10000, 100000, 1000000]} />
          <StepperInput label="Output tokens" value={second} onChange={setSecond} presets={[250, 2500, 25000, 250000]} />
        </> : props.mode === "image" ? (
          <StepperInput label="Images to generate" value={first} onChange={setFirst} presets={[1, 10, 100, 1000]} />
        ) : <>
          <div>
            <label className="text-sm font-medium">Video duration</label>
            <div className="mt-2 flex flex-wrap gap-2">{props.durations?.length ? props.durations.map((item) => <button type="button" key={item} onClick={() => setDuration(String(item))} className={"rounded-full border px-3 py-1 text-xs font-medium transition-colors " + (duration === String(item) ? "border-primary bg-primary text-primary-foreground" : "border-border/70 bg-background/60 hover:border-primary")}>{item}s</button>) : <input inputMode="decimal" value={duration} onChange={(event) => setDuration(event.target.value)} className="w-full rounded-xl border border-border/70 bg-background/65 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/50" />}
            </div>
          </div>
          <StepperInput label="Videos to generate" value={second} onChange={setSecond} presets={[1, 5, 10, 50]} />
        </>}
      </div>

      {!calculated ? <p className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Enter non-negative whole quantities to calculate an estimate.</p> : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {props.mode === "token" ? <>
            <div className="rounded-xl border border-border/60 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Input estimate</p><p className="mt-1 text-lg font-semibold">{money(calculated.input ?? new Decimal(0))}</p></div>
            <div className="rounded-xl border border-border/60 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Output estimate</p><p className="mt-1 text-lg font-semibold">{money(calculated.output ?? new Decimal(0))}</p></div>
          </> : <div className="rounded-xl border border-border/60 bg-background/45 p-3"><p className="text-xs text-muted-foreground">{props.mode === "image" ? "Generation estimate" : "Generated seconds"}</p><p className="mt-1 text-lg font-semibold">{props.mode === "image" ? money(calculated.raw) : (calculated.units?.toFixed() ?? "0") + " sec"}</p></div>}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3"><p className="text-xs text-muted-foreground">Estimated total</p><p className="mt-1 text-lg font-semibold">{money(calculated.total)}</p>{calculated.adjustment.greaterThan(0) ? <p className="mt-1 text-xs text-muted-foreground">Includes {money(calculated.adjustment)} minimum-request adjustment.</p> : null}</div>
        </div>
      )}
    </section>
  );
}

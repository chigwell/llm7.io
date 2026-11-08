import type { PublicModel } from "@/lib/models/api-types";
import { modelScores, type CriterionScore, type ModelScores } from "@/lib/models/scores";

function tone(value: number) {
  if (value >= 95) return { bar: "bg-emerald-700 dark:bg-emerald-500", text: "text-emerald-800 dark:text-emerald-300", label: "Excellent" };
  if (value >= 80) return { bar: "bg-emerald-500 dark:bg-emerald-400", text: "text-emerald-700 dark:text-emerald-300", label: "Strong" };
  if (value >= 50) return { bar: "bg-orange-500 dark:bg-orange-400", text: "text-orange-700 dark:text-orange-300", label: "Moderate" };
  return { bar: "bg-red-500 dark:bg-red-400", text: "text-red-700 dark:text-red-300", label: "Weak" };
}

function ScoreBar({ value, label }: { value: number | null; label: string }) {
  if (value === null) return <div className="h-2 rounded-full bg-muted/60" aria-label={label + ": not rated"} />;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted/70" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={"h-full rounded-full " + tone(value).bar} style={{ width: Math.max(value, 2) + "%" }} />
    </div>
  );
}

function Value({ score }: { score: CriterionScore }) {
  if (score.value === null) return <span className="text-xs text-muted-foreground">{score.note ?? "Not rated"}</span>;
  return <span className={"text-sm font-semibold tabular-nums " + tone(score.value).text}>{score.value}%</span>;
}

function Disclaimer({ scores }: { scores: ModelScores[] }) {
  const date = scores[0]?.judgedAt?.slice(0, 10);
  const opponents = Math.max(...scores.map((item) => item.opponents));
  return <p className="mt-1 text-sm text-muted-foreground">AI-estimated ratings on {scores[0].criteria.length} criteria from head-to-head comparisons against {opponents} other {scores[0].field} in the LLM7 catalog, judged by TypeSafe Jev from {scores[0].basis}{date ? " (" + date + ")" : ""}. Each score is the win rate against the field, relative to the strongest model for that criterion (100%). Not a benchmark.</p>;
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
      {[["bg-red-500", "Below 50%"], ["bg-orange-500", "50–79%"], ["bg-emerald-500", "80–94%"], ["bg-emerald-700", "95%+"]].map(([color, label]) => <span key={label} className="inline-flex items-center gap-1.5"><span className={"h-2 w-2 rounded-full " + color} />{label}</span>)}
    </div>
  );
}

function OverallBadge({ value, caption }: { value: number; caption: string }) {
  const style = tone(value);
  return (
    <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{caption}</p>
      <p className={"mt-1 text-3xl font-bold tabular-nums " + style.text}>{value}%</p>
      <div className="mt-2"><ScoreBar value={value} label={caption} /></div>
      <p className="mt-1 text-xs text-muted-foreground">{style.label}</p>
    </div>
  );
}

export function ModelScoresSection({ model }: { model: PublicModel }) {
  const scores = modelScores(model);
  if (!scores) return null;
  return (
    <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur">
      <h2 className="text-2xl font-semibold">Capability scores</h2>
      <Disclaimer scores={[scores]} />
      <Legend />
      <div className="mt-5 max-w-xs"><OverallBadge value={scores.overall} caption="Overall score" /></div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {scores.groups.map((group) => (
          <div key={group.key}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">{group.label}</h3>
            <ul className="mt-3 space-y-3">
              {scores.criteria.filter((item) => item.group === group.key).map((item) => (
                <li key={item.key} title={item.description}>
                  <div className="mb-1 flex items-baseline justify-between gap-3"><span className="text-sm">{item.label}</span><Value score={item} /></div>
                  <ScoreBar value={item.value} label={item.label} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ComparisonScoresSection({ left, right }: { left: PublicModel; right: PublicModel }) {
  const leftScores = modelScores(left);
  const rightScores = modelScores(right);
  if (!leftScores || !rightScores) return null;
  const rows = leftScores.criteria.map((item, index) => ({ left: item, right: rightScores.criteria[index] }));
  const decided = rows.filter((row) => row.left.value !== null && row.right.value !== null && row.left.value !== row.right.value);
  const leftWins = decided.filter((row) => row.left.value! > row.right.value!).length;
  const rightWins = decided.length - leftWins;

  return (
    <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur">
      <h2 className="text-2xl font-semibold">Capability scores</h2>
      <Disclaimer scores={[leftScores, rightScores]} />
      <Legend />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <OverallBadge value={leftScores.overall} caption={left.model_id + " · leads in " + leftWins} />
        <OverallBadge value={rightScores.overall} caption={right.model_id + " · leads in " + rightWins} />
      </div>
      <div className="mt-6 space-y-6">
        {leftScores.groups.map((group) => (
          <div key={group.key}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">{group.label}</h3>
            <ul className="mt-3 space-y-4">
              {rows.filter((row) => row.left.group === group.key).map((row) => {
                const winner = row.left.value !== null && row.right.value !== null && row.left.value !== row.right.value ? (row.left.value > row.right.value ? "left" : "right") : null;
                return (
                  <li key={row.left.key} title={row.left.description}>
                    <p className="mb-2 text-sm font-medium">{row.left.label}</p>
                    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                      {([["left", left, row.left], ["right", right, row.right]] as const).map(([side, model, score]) => (
                        <div key={side}>
                          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs text-muted-foreground"><span className="truncate">{model.model_id}{winner === side ? <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Leads</span> : null}</span><Value score={score} /></div>
                          <ScoreBar value={score.value} label={model.model_id + " " + score.label} />
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

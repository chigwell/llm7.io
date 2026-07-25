"use client";

export default function ModelHistoryChart({ entries }: { entries: Array<{ effective_from: string; changed_fields: string[] }> }) {
  return <details className="mt-4"><summary>Historical revision data table</summary><table className="mt-2 w-full border-collapse text-sm"><thead><tr><th className="border p-2 text-left">Effective date (UTC)</th><th className="border p-2 text-left">Changed public fields</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.effective_from}><td className="border p-2">{new Date(entry.effective_from).toISOString()}</td><td className="border p-2">{entry.changed_fields.join(", ") || "No changed fields listed"}</td></tr>)}</tbody></table></details>;
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckIcon, CopyIcon, Terminal } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/buttonShadcn";
import type { CodeExample } from "@/lib/models/code-examples";

const languageIcons: Record<string, string> = {
  bash: "/language-icons/curl.svg",
  python: "/language-icons/python.svg",
  javascript: "/language-icons/javascript.svg",
};

export default function ModelCodeExamples({ examples }: { examples: CodeExample[] }) {
  const [activeId, setActiveId] = useState(examples[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const active = useMemo(() => examples.find((example) => example.id === activeId) ?? examples[0], [activeId, examples]);

  if (!active) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(active.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card/55 p-4 shadow-sm backdrop-blur md:p-5" aria-labelledby="examples-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="examples-heading" className="flex items-center gap-2 text-2xl font-semibold"><Terminal className="h-6 w-6 text-primary" />Start building</h2>
          <p className="mt-1 text-sm text-muted-foreground">A verified request for this exact model. Add your API key and run it.</p>
        </div>
        {active.docsUrl ? <a href={active.docsUrl} className="text-sm font-medium text-primary underline-offset-4 hover:underline">Read the docs</a> : null}
      </div>
      <Tabs value={active.id} onValueChange={setActiveId} className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-gray-950 shadow-xl">
        <div className="flex min-h-12 items-center gap-3 border-b border-white/10 bg-gray-900/95 px-3">
          <div className="flex shrink-0 gap-1.5" aria-hidden="true"><span className="h-3 w-3 rounded-full bg-red-500" /><span className="h-3 w-3 rounded-full bg-yellow-400" /><span className="h-3 w-3 rounded-full bg-green-500" /></div>
          <div className="min-w-0 flex-1 overflow-x-auto py-2">
            <TabsList className="h-auto min-w-max bg-transparent p-0 text-gray-300">
              {examples.map((example) => <TabsTrigger key={example.id} value={example.id} className="h-8 rounded-md px-3 text-xs text-gray-300 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none dark:data-[state=active]:bg-white/10">
                {languageIcons[example.language] ? <Image src={languageIcons[example.language]} alt="" width={16} height={16} className="h-4 w-4 object-contain" /> : null}{example.label}
              </TabsTrigger>)}
            </TabsList>
          </div>
        </div>
        <div className="relative min-h-[260px] overflow-x-auto bg-gray-950 pb-12">
          <SyntaxHighlighter language={active.language} style={oneDark} wrapLongLines customStyle={{ margin: 0, minHeight: "260px", padding: "1rem", paddingBottom: "3.5rem", background: "transparent", fontSize: "0.8rem", lineHeight: 1.55, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }} codeTagProps={{ style: { fontFamily: "JetBrains Mono, Consolas, Monaco, 'Courier New', monospace" } }}>
            {active.code}
          </SyntaxHighlighter>
          <Button type="button" size="icon" variant="ghost" className="absolute bottom-3 right-3 h-8 w-8 border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white" onClick={copy} aria-label={copied ? "Copied example code" : "Copy example code"}>
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
        </div>
      </Tabs>
    </section>
  );
}

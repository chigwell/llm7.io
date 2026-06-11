"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from "next/image";
import { CheckIcon, CodeIcon, CopyIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/buttonShadcn";

const examples = [
  {
    id: "python",
    label: "Python",
    icon: "/language-icons/python.svg",
    code: `import openai

client = openai.OpenAI(
    base_url="https://api.llm7.io/v1",
    api_key="YOUR_FREE_TOKEN"  # Get it for free at https://token.llm7.io/
)

response = client.chat.completions.create(
    model="default",
    messages=[
        {"role": "user", "content": "Tell me a short story about a brave squirrel."}
    ]
)

print(response.choices[0].message.content)`,
  },
  {
    id: "curl",
    label: "cURL",
    icon: "/language-icons/curl.svg",
    code: `curl https://api.llm7.io/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_FREE_TOKEN" \\
  -d '{
    "model": "default",
    "messages": [
      {
        "role": "user",
        "content": "Tell me a short story about a brave squirrel."
      }
    ]
  }'`,
  },
  {
    id: "js",
    label: "JS",
    icon: "/language-icons/javascript.svg",
    code: `const response = await fetch("https://api.llm7.io/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_FREE_TOKEN", // Get it for free at https://token.llm7.io/
  },
  body: JSON.stringify({
    model: "default",
    messages: [
      { role: "user", content: "Tell me a short story about a brave squirrel." },
    ],
  }),
});

const data = await response.json();
console.log(data.choices[0].message.content);`,
  },
  {
    id: "csharp",
    label: "C#",
    icon: "/language-icons/csharp.svg",
    code: `using System.Net.Http.Headers;
using System.Text;

using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", "YOUR_FREE_TOKEN"); // Get it for free at https://token.llm7.io/

var json = """
{
  "model": "default",
  "messages": [
    { "role": "user", "content": "Tell me a short story about a brave squirrel." }
  ]
}
""";

var response = await client.PostAsync(
    "https://api.llm7.io/v1/chat/completions",
    new StringContent(json, Encoding.UTF8, "application/json")
);

Console.WriteLine(await response.Content.ReadAsStringAsync());`,
  },
  {
    id: "java",
    label: "Java",
    icon: "/language-icons/java.svg",
    code: `HttpClient client = HttpClient.newHttpClient();

String body = """
{
  "model": "default",
  "messages": [
    { "role": "user", "content": "Tell me a short story about a brave squirrel." }
  ]
}
""";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.llm7.io/v1/chat/completions"))
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer YOUR_FREE_TOKEN") // Get it for free at https://token.llm7.io/
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response =
    client.send(request, HttpResponse.BodyHandlers.ofString());

System.out.println(response.body());`,
  },
  {
    id: "go",
    label: "Go",
    icon: "/language-icons/go.svg",
    code: `package main

import (
  "bytes"
  "fmt"
  "io"
  "net/http"
)

func main() {
  body := []byte(\`{
    "model": "default",
    "messages": [
      {"role": "user", "content": "Tell me a short story about a brave squirrel."}
    ]
  }\`)

  req, _ := http.NewRequest("POST", "https://api.llm7.io/v1/chat/completions", bytes.NewReader(body))
  req.Header.Set("Content-Type", "application/json")
  req.Header.Set("Authorization", "Bearer YOUR_FREE_TOKEN") // Get it for free at https://token.llm7.io/

  res, _ := http.DefaultClient.Do(req)
  defer res.Body.Close()

  data, _ := io.ReadAll(res.Body)
  fmt.Println(string(data))
}`,
  },
  {
    id: "ruby",
    label: "Ruby",
    icon: "/language-icons/ruby.svg",
    code: `require "net/http"
require "json"

uri = URI("https://api.llm7.io/v1/chat/completions")
request = Net::HTTP::Post.new(uri)
request["Content-Type"] = "application/json"
request["Authorization"] = "Bearer YOUR_FREE_TOKEN" # Get it for free at https://token.llm7.io/
request.body = {
  model: "default",
  messages: [
    { role: "user", content: "Tell me a short story about a brave squirrel." }
  ]
}.to_json

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end

puts response.body`,
  },
] as const;

export default function ConsoleAnimation() {
  const [activeExample, setActiveExample] = useState<(typeof examples)[number]["id"]>("python");
  const [copied, setCopied] = useState(false);

  const selectedExample = useMemo(() => {
    return examples.find((example) => example.id === activeExample) ?? examples[0];
  }, [activeExample]);

  const [typedLength, setTypedLength] = useState(selectedExample.code.length);

  useEffect(() => {
    setTypedLength(0);
  }, [selectedExample]);

  useEffect(() => {
    if (typedLength >= selectedExample.code.length) return;

    const timeout = window.setTimeout(() => {
      setTypedLength((value) => Math.min(value + 10, selectedExample.code.length));
    }, 16);

    return () => window.clearTimeout(timeout);
  }, [selectedExample, typedLength]);

  const handleExampleChange = (value: string) => {
    setActiveExample(value as (typeof examples)[number]["id"]);
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedExample.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (

    <>
      <div id="example" className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <motion.h3
              id="featured-heading"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3"
            >
              <CodeIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Example Usage
              </span>
            </motion.h3>
        </div>
      </div>
    <div className="relative group flex items-center justify-center py-6 sm:py-10 px-4">
      <Tabs value={activeExample} onValueChange={handleExampleChange} className="w-full max-w-4xl gap-0 overflow-hidden rounded-lg border border-border/60 bg-gray-950 shadow-xl">
        <div className="flex min-h-12 items-center gap-5 border-b border-white/10 bg-gray-900/95 px-3">
          <div className="flex shrink-0 items-center gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto py-2">
            <TabsList className="h-auto min-w-max bg-transparent p-0 text-gray-300">
              {examples.map((example) => {
                return (
                  <TabsTrigger
                    key={example.id}
                    value={example.id}
                    className="h-8 rounded-md px-3 text-xs text-gray-300 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none dark:data-[state=active]:bg-white/10"
                  >
                    <Image src={example.icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                    {example.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>
        <div className="relative">
          <pre style={{ minHeight: '320px' }}
              className="w-full overflow-x-auto bg-gray-950 p-4 pb-14 font-mono text-xs text-gray-100 md:p-5 md:pb-14 md:text-sm">
            <code>
              {selectedExample.code.slice(0, typedLength)}
              {typedLength < selectedExample.code.length ? <span className="animate-pulse">█</span> : null}
            </code>
          </pre>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute bottom-3 right-3 h-8 w-8 border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white"
            onClick={handleCopy}
            aria-label={copied ? "Copied example code" : "Copy example code"}
          >
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
        </div>
      </Tabs>
    </div>
    </>
  );
}

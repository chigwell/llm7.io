import Decimal from "decimal.js-light";
import { parseTokenPricingUnit } from "../models/token-unit.js";

export const BASE = "https://api.llm7.io/v1";
export const TEMPLATE_VERSION = 1;
export const features = [
  {
    slug: "tool-calling",
    title: "Tool calling",
    description:
      "Models that can request function calls with structured arguments.",
    limitation:
      "Your application must validate arguments, execute tools, and return tool results. Tool support does not guarantee reliable multi-step agent behavior.",
  },
  {
    slug: "vision",
    title: "Vision",
    description:
      "Chat models with explicitly reported vision support or image input.",
    limitation:
      "Image formats, size limits, and visual accuracy vary. Verify image requirements on the model documentation.",
  },
  {
    slug: "long-context",
    title: "Long context",
    description:
      "Chat models with a published context window of at least 128,000 tokens.",
    limitation:
      "The context budget includes instructions, conversation, tool definitions, and output. A large window does not guarantee accurate retrieval.",
  },
  {
    slug: "json-mode",
    title: "JSON mode",
    description:
      "Chat models that report support for JSON-formatted responses.",
    limitation:
      "JSON mode is not guaranteed JSON Schema compliance. Ask for JSON explicitly and validate the response in your application.",
  },
  {
    slug: "streaming",
    title: "Streaming",
    description: "Chat models that report incremental response streaming.",
    limitation:
      "Handle partial chunks, interrupted connections, and final usage separately. Streaming does not imply lower total latency.",
  },
  {
    slug: "reasoning",
    title: "Reasoning",
    description: "Chat models with explicitly reported reasoning capability.",
    limitation:
      "Reasoning controls and token accounting vary by model. The capability alone does not establish reasoning-effort parameter support or output quality.",
  },
];
export const integrations = [
  {
    slug: "hermes-agent",
    title: "Hermes Agent",
    reviewed: "2026-09-14",
    sources: [
      "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    ],
    steps: [
      "Install Hermes using its documentation, then run hermes model and select Custom endpoint.",
      "Use the configuration below in ~/.hermes/config.yaml and replace the API key placeholder.",
      "Start a new session after changing providers. Budget tools and conversation within the published context window.",
    ],
    limitation:
      "Requires reported tool calling and at least 64,000 context tokens. Auxiliary models and individual tools may need separate configuration.",
  },
  {
    slug: "openclaw",
    title: "OpenClaw",
    reviewed: "2026-09-14",
    sources: ["https://docs.openclaw.ai/gateway/config-tools/custom-providers"],
    steps: [
      "Install OpenClaw using its documentation.",
      "Merge the custom provider and default model below into ~/.openclaw/openclaw.json. Replace the API key placeholder.",
      "Reload the gateway after configuration changes and inspect the selected model.",
    ],
    limitation:
      "Requires tool calling. Unknown context and output limits are omitted; client defaults may differ from API limits. No strict-tool-schema or reasoning-effort compatibility is assumed.",
  },
  {
    slug: "n8n",
    title: "n8n",
    reviewed: "2026-09-14",
    sources: [
      "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatopenai/",
      "https://docs.n8n.io/integrations/builtin/credentials/openai/",
    ],
    steps: [
      "Add an OpenAI Chat Model node to your workflow.",
      "Create custom OpenAI credentials with the API key and Base URL below.",
      "Enter the model ID manually if it is absent from the dropdown. Keep Use Responses API disabled.",
    ],
    limitation:
      "This is a settings checklist, not an importable workflow. Agent workflows need a model with tool support. Responses-only built-in tools are unavailable through this configuration.",
  },
  {
    slug: "langchain",
    title: "LangChain",
    reviewed: "2026-09-14",
    sources: ["https://docs.langchain.com/oss/python/integrations/chat/openai"],
    steps: [
      "Install the Python dependency with pip install langchain-openai.",
      "Set LLM7_API_KEY in your environment; the placeholder below must be replaced.",
      "Run the ChatOpenAI example. Bind tools only when the selected model reports tool support.",
    ],
    limitation:
      "Only standard Chat Completions behavior is inferred. Provider-specific extensions and Responses API features are outside this template.",
  },
  {
    slug: "vercel-ai-sdk",
    title: "Vercel AI SDK",
    reviewed: "2026-09-14",
    sources: ["https://ai-sdk.dev/providers/openai-compatible-providers"],
    steps: [
      "Install dependencies with npm install ai @ai-sdk/openai-compatible.",
      "Set LLM7_API_KEY on your server with your own key in place of the placeholder.",
      "Use the compatible chatModel adapter below in server-side code.",
    ],
    limitation:
      "Keep the API key on the server. Use tools only with models that report tool support. Responses-only features are outside this template.",
  },
];
export const scenarios = [
  {
    slug: "customer-support",
    title: "Customer support",
    input: 2000,
    output: 500,
    description:
      "Estimate the token cost of support conversations using editable per-request assumptions.",
  },
  {
    slug: "document-processing",
    title: "Document processing",
    input: 8000,
    output: 1000,
    description:
      "Estimate the token cost of processing extracted document text. OCR and file conversion are separate.",
  },
  {
    slug: "json-extraction",
    title: "JSON extraction",
    input: 2000,
    output: 300,
    description:
      "Estimate extraction costs for models reporting JSON mode. Validate results against your schema.",
  },
];
export const idOrder = (a, b) =>
  a.model_id < b.model_id ? -1 : a.model_id > b.model_id ? 1 : 0;
export function capability(model, name) {
  if (name === "long-context")
    return model.context_window.tokens == null
      ? null
      : model.context_window.tokens >= 128000;
  if (name === "vision") {
    if (model.modalities.input.includes("image")) return true;
    if (model.model_type === "systemone" || model.model_type === "audio_to_text") return false;
  }
  const [top, nested] = {
    "tool-calling": ["tools_calling", "tools"],
    streaming: ["stream", "stream"],
    "json-mode": ["json_mode", "json_mode"],
  }[name] ?? [name, name];
  const value =
    model[top] !== undefined ? model[top] : model.capabilities[nested];
  return typeof value === "boolean" ? value : null;
}
export const activeChat = (m) =>
  m.status === "active" && m.model_type === "chat";
export const chatInterface = (m) =>
  m.api_interfaces.some(
    (a) => a.path === "/v1/chat/completions" && a.method === "POST",
  );
export function integrationEligible(model, slug) {
  return (
    activeChat(model) &&
    chatInterface(model) &&
    (!["hermes-agent", "openclaw"].includes(slug) ||
      capability(model, "tool-calling") === true) &&
    (slug !== "hermes-agent" ||
      (model.context_window.tokens != null &&
        model.context_window.tokens >= 64000))
  );
}
export function facts(model) {
  return [
    ...features
      .filter((f) => capability(model, f.slug) === true)
      .map((f) => f.title),
    ...Object.keys(model.capabilities)
      .sort()
      .filter(
        (k) =>
          !["tools", "vision", "stream", "json_mode", "reasoning"].includes(
            k,
          ) && model.capabilities[k] === true,
      )
      .map((k) => k.replaceAll("_", " ")),
    ...model.modalities.input.map((m) => `${m} input`),
    ...model.modalities.output.map((m) => `${m} output`),
  ];
}
export function alternatives(original, models) {
  const known = new Set(facts(original));
  const score = (m) => facts(m).filter((f) => known.has(f)).length;
  const distance = (m) =>
    original.context_window.tokens == null || m.context_window.tokens == null
      ? Infinity
      : Math.abs(original.context_window.tokens - m.context_window.tokens);
  return models
    .filter(
      (m) =>
        m.status === "active" &&
        m.model_type === original.model_type &&
        m.model_id !== original.model_id,
    )
    .sort(
      (a, b) =>
        score(b) - score(a) ||
        (distance(a) === distance(b)
          ? 0
          : distance(a) < distance(b)
            ? -1
            : 1) ||
        idOrder(a, b),
    )
    .slice(0, 6);
}
export function validCount(value) {
  return /^\d+$/.test(String(value)) && new Decimal(value).lte("1000000000");
}
export function estimate(model, requests, input, output) {
  if (![requests, input, output].every(validCount))
    return { cost: null, status: "Invalid input" };
  const context = model.context_window.tokens;
  const status =
    context == null
      ? "Unknown context"
      : new Decimal(input).plus(output).gt(context)
        ? "Unsuitable: context exceeded"
        : "Within context";
  const p = model.pricing;
  const unit = parseTokenPricingUnit(p.unit);
  if (
    p.mode !== "token" ||
    p.currency !== "USD" ||
    p.billing_strategy === "provider_quote" ||
    !unit ||
    unit.lte(0) ||
    ![p.input, p.output].every(
      (v) => typeof v === "string" && /^\d+(\.\d+)?$/.test(v),
    )
  )
    return { cost: null, status };
  const raw = new Decimal(input)
    .times(p.input)
    .plus(new Decimal(output).times(p.output))
    .div(unit);
  const perRequest =
    p.minimum_request_usd && raw.lt(p.minimum_request_usd)
      ? new Decimal(p.minimum_request_usd)
      : raw;
  return { cost: perRequest.times(requests).toFixed(), status };
}
export function configuration(slug, model) {
  const id = JSON.stringify(model.model_id);
  if (slug === "hermes-agent")
    return `model:\n  provider: custom\n  default: ${id}\n  base_url: ${BASE}\n  api_key: "YOUR_LLM7_API_KEY"\n  context_length: ${model.context_window.tokens}\n`;
  if (slug === "openclaw")
    return JSON.stringify(
      {
        models: {
          mode: "merge",
          providers: {
            llm7: {
              baseUrl: BASE,
              apiKey: "YOUR_LLM7_API_KEY",
              api: "openai-completions",
              models: [
                {
                  id: model.model_id,
                  name: model.display_name,
                  ...(capability(model, "reasoning") != null
                    ? { reasoning: capability(model, "reasoning") }
                    : {}),
                  input: model.modalities.input.filter((m) =>
                    ["text", "image"].includes(m),
                  ),
                  ...(model.context_window.tokens != null
                    ? { contextWindow: model.context_window.tokens }
                    : {}),
                },
              ],
            },
          },
        },
        agents: { defaults: { model: { primary: `llm7/${model.model_id}` } } },
      },
      null,
      2,
    );
  if (slug === "n8n")
    return `Credential type: OpenAI\nAPI Key: YOUR_LLM7_API_KEY\nBase URL: ${BASE}\nNode: OpenAI Chat Model\nModel: ${model.model_id}\nUse Responses API: disabled`;
  if (slug === "langchain")
    return `# Environment: LLM7_API_KEY=YOUR_LLM7_API_KEY\nimport os\nfrom langchain_openai import ChatOpenAI\n\nmodel = ChatOpenAI(\n    model=${id},\n    api_key=os.environ["LLM7_API_KEY"],\n    base_url="${BASE}",\n    use_responses_api=False,\n)\nprint(model.invoke("Hello!").content)`;
  return `// Server environment: LLM7_API_KEY=YOUR_LLM7_API_KEY\nimport { createOpenAICompatible } from '@ai-sdk/openai-compatible';\nimport { generateText } from 'ai';\n\nconst llm7 = createOpenAICompatible({\n  name: 'llm7',\n  baseURL: '${BASE}',\n  apiKey: process.env.LLM7_API_KEY,\n});\nconst result = await generateText({\n  model: llm7.chatModel(${id}),\n  prompt: 'Hello!',\n});\nconsole.log(result.text);`;
}
export function featureExample(slug, model) {
  const payload = {
    model: model.model_id,
    messages: [
      {
        role: "user",
        content:
          slug === "json-mode"
            ? "Return a JSON object with a greeting field."
            : slug === "reasoning"
              ? "Explain how to verify a multi-step calculation."
              : slug === "long-context"
                ? "Summarize the following document: <insert document text within the context budget>"
                : "Hello!",
      },
    ],
  };
  if (slug === "json-mode") payload.response_format = { type: "json_object" };
  if (slug === "streaming") payload.stream = true;
  if (slug === "tool-calling") {
    payload.messages[0].content = "What is the weather in London?";
    payload.tools = [
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Get weather for a city",
          parameters: {
            type: "object",
            properties: { city: { type: "string" } },
            required: ["city"],
          },
        },
      },
    ];
  }
  if (slug === "vision")
    payload.messages[0].content = [
      { type: "text", text: "Describe this image." },
      {
        type: "image_url",
        image_url: { url: "https://example.com/your-image.jpg" },
      },
    ];
  return `POST ${BASE}/chat/completions\nAuthorization: Bearer YOUR_LLM7_API_KEY\nContent-Type: application/json\n\n${JSON.stringify(payload, null, 2)}`;
}
export function definePages(snapshot) {
  const models = snapshot.models.map((e) => e.model).sort(idOrder);
  if (models.some((m) => m.slug === "features"))
    throw new Error("Reserved model slug: features");
  const pages = [];
  const add = (family, slug, title, description, members, extra = {}) =>
    pages.push({
      family,
      slug,
      title,
      description,
      models: members,
      indexable: members.length > 0,
      ...extra,
    });
  for (const f of features)
    add(
      "features",
      f.slug,
      `${f.title} models`,
      f.description,
      models.filter((m) => activeChat(m) && capability(m, f.slug) === true),
      { template: f, path: `/models/features/${f.slug}/` },
    );
  for (const i of integrations)
    add(
      "integrations",
      i.slug,
      `${i.title} with LLM7`,
      `Configure ${i.title} with LLM7: eligible models, setup instructions, and a copyable configuration.`,
      models.filter((m) => integrationEligible(m, i.slug)),
      { template: i, path: `/integrations/${i.slug}/` },
    );
  for (const s of scenarios)
    add(
      "calculators",
      s.slug,
      `${s.title} cost calculator`,
      s.description,
      models.filter(
        (m) =>
          activeChat(m) &&
          m.modalities.input.includes("text") &&
          m.modalities.output.includes("text") &&
          (s.slug !== "json-extraction" || capability(m, "json-mode") === true),
      ),
      { template: s, path: `/cost-calculator/${s.slug}/` },
    );
  for (const m of models) {
    const candidates = alternatives(m, models);
    if (candidates.length >= 2)
      add(
        "alternatives",
        m.slug,
        `${m.model_id} alternatives`,
        `Compare active ${m.model_type} alternatives to ${m.model_id}, including capabilities, context, pricing, and API changes.`,
        candidates,
        { original: m, path: `/models/${m.slug}/alternatives/` },
      );
  }
  for (const [family, path, title, description] of [
    [
      "features",
      "/models/features/",
      "Model capabilities",
      "Browse chat models by explicitly reported capabilities.",
    ],
    [
      "integrations",
      "/integrations/",
      "LLM7 integrations",
      "Connect LLM7 to agents, workflows, and application frameworks.",
    ],
    [
      "calculators",
      "/cost-calculator/",
      "Scenario cost calculators",
      "Compare model costs with editable request and token assumptions.",
    ],
  ]) {
    const children = pages.filter((p) => p.family === family);
    add(
      family,
      "",
      title,
      description,
      models.filter((m) => children.some((p) => p.models.includes(m))),
      {
        path,
        children: children.map((p) => ({
          path: p.path,
          title: p.title,
          indexable: p.indexable,
        })),
      },
    );
  }
  return pages;
}

import type { PublicModel } from "./api-types";

export type CodeExample = { id: string; label: string; language: string; code: string; docsUrl?: string | null };

const API_BASE = "https://api.llm7.io/v1";
const IMAGE_GUIDE = "https://docs.llm7.io/guides/image-generation";
const VIDEO_GUIDE = "https://docs.llm7.io/guides/video-generation";
const QUICKSTART = "https://docs.llm7.io/quickstart";
const slash = String.fromCharCode(92);

function chatExamples(model: PublicModel): CodeExample[] {
  const curlCode = [
    "curl " + API_BASE + "/chat/completions " + slash,
    '  -H "Authorization: Bearer $LLM7_API_TOKEN" ' + slash,
    '  -H "Content-Type: application/json" ' + slash,
    "  -d '{",
    '    "model": "' + model.model_id + '",',
    '    "messages": [',
    '      { "role": "user", "content": "Hello!" }',
    "    ]",
    "  }'",
  ].join("\n");
  const pythonCode = [
    "import os",
    "from openai import OpenAI",
    "",
    "client = OpenAI(",
    '    api_key=os.environ["LLM7_API_TOKEN"],',
    '    base_url="' + API_BASE + '",',
    ")",
    "",
    "response = client.chat.completions.create(",
    '    model="' + model.model_id + '",',
    '    messages=[{"role": "user", "content": "Hello!"}],',
    ")",
    "",
    "print(response.choices[0].message.content)",
  ].join("\n");
  const javascriptCode = [
    'const response = await fetch("' + API_BASE + '/chat/completions", {',
    '  method: "POST",',
    "  headers: {",
    '    Authorization: "Bearer " + process.env.LLM7_API_TOKEN,',
    '    "Content-Type": "application/json",',
    "  },",
    "  body: JSON.stringify({",
    '    model: "' + model.model_id + '",',
    '    messages: [{ role: "user", content: "Hello!" }],',
    "  }),",
    "});",
    "",
    "if (!response.ok) throw new Error(await response.text());",
    "const data = await response.json();",
    "console.log(data.choices[0].message.content);",
  ].join("\n");

  return [
    { id: "chat-curl", label: "cURL", language: "bash", code: curlCode, docsUrl: QUICKSTART },
    { id: "chat-python", label: "Python", language: "python", code: pythonCode, docsUrl: QUICKSTART },
    { id: "chat-javascript", label: "JavaScript", language: "javascript", code: javascriptCode, docsUrl: QUICKSTART },
  ];
}

function imageExamples(model: PublicModel): CodeExample[] {
  const size = model.capabilities.supported_sizes?.[0] ?? "1024x1024";
  const prompt = "A clean product photo of a matte black desk lamp on a white desk";
  const curlCode = [
    "curl " + API_BASE + "/images/generations " + slash,
    '  -H "Authorization: Bearer $LLM7_API_TOKEN" ' + slash,
    '  -H "Content-Type: application/json" ' + slash,
    "  -d '{",
    '    "model": "' + model.model_id + '",',
    '    "prompt": "' + prompt + '",',
    '    "size": "' + size + '",',
    '    "n": 1',
    "  }'",
  ].join("\n");
  const pythonCode = [
    "import base64",
    "import os",
    "from openai import OpenAI",
    "",
    "client = OpenAI(",
    '    api_key=os.environ["LLM7_API_TOKEN"],',
    '    base_url="' + API_BASE + '",',
    ")",
    "",
    "result = client.images.generate(",
    '    model="' + model.model_id + '",',
    '    prompt="' + prompt + '",',
    '    size="' + size + '",',
    "    n=1,",
    ")",
    "",
    'with open("generated.png", "wb") as file:',
    "    file.write(base64.b64decode(result.data[0].b64_json))",
  ].join("\n");
  const examples: CodeExample[] = [
    { id: "image-generate-curl", label: "Generate · cURL", language: "bash", code: curlCode, docsUrl: IMAGE_GUIDE },
    { id: "image-generate-python", label: "Generate · Python", language: "python", code: pythonCode, docsUrl: IMAGE_GUIDE },
  ];

  if (model.capabilities.image_edits) {
    const editCode = [
      "curl " + API_BASE + "/images/edits " + slash,
      '  -H "Authorization: Bearer $LLM7_API_TOKEN" ' + slash,
      '  -F "model=' + model.model_id + '" ' + slash,
      '  -F "prompt=Replace the empty wall area with a framed painting" ' + slash,
      '  -F "size=' + size + '" ' + slash,
      '  -F "image=@room.png"',
    ].join("\n");
    examples.push({ id: "image-edit-curl", label: "Edit · cURL", language: "bash", code: editCode, docsUrl: IMAGE_GUIDE });
  }

  return examples;
}

function videoExamples(model: PublicModel): CodeExample[] {
  const seconds = String(model.capabilities.supported_seconds?.[0] ?? 5);
  const size = model.capabilities.supported_sizes?.[0];
  const prompt = "Waves crashing on rocks, cinematic slow motion";
  const payload = [
    "{",
    '  "model": "' + model.model_id + '",',
    '  "prompt": "' + prompt + '",',
    '  "seconds": "' + seconds + '"' + (size ? "," : ""),
    ...(size ? ['  "size": "' + size + '"'] : []),
    "}",
  ];
  const curlCode = [
    "curl " + API_BASE + "/videos " + slash,
    '  -H "Authorization: Bearer $LLM7_API_TOKEN" ' + slash,
    '  -H "Content-Type: application/json" ' + slash,
    "  -d '" + payload.join("\n") + "'",
  ].join("\n");
  const pythonCode = [
    "import os",
    "import time",
    "import requests",
    "",
    'headers = {"Authorization": "Bearer " + os.environ["LLM7_API_TOKEN"]}',
    "payload = " + payload.join("\n"),
    "",
    'task = requests.post("' + API_BASE + '/videos",',
    "    headers=headers, json=payload, timeout=30).json()",
    "",
    'while task["status"] in {"queued", "in_progress"}:',
    "    time.sleep(2)",
    '    task = requests.get("' + API_BASE + '/videos/" + task["id"],',
    "        headers=headers, timeout=30).json()",
    "",
    'if task["status"] != "completed":',
    '    raise RuntimeError(task["status"])',
    "",
    'video = requests.get("' + API_BASE + '/videos/" + task["id"] + "/content",',
    "    headers=headers, timeout=120)",
    'open("output.mp4", "wb").write(video.content)',
  ].join("\n");
  const examples: CodeExample[] = [
    { id: "video-create-curl", label: "Create · cURL", language: "bash", code: curlCode, docsUrl: VIDEO_GUIDE },
    { id: "video-poll-python", label: "Create + poll · Python", language: "python", code: pythonCode, docsUrl: VIDEO_GUIDE },
  ];

  if (model.modalities.input.includes("image")) {
    const referenceCode = [
      "curl " + API_BASE + "/videos " + slash,
      '  -H "Authorization: Bearer $LLM7_API_TOKEN" ' + slash,
      '  -F "model=' + model.model_id + '" ' + slash,
      '  -F "prompt=Animate this first frame" ' + slash,
      '  -F "seconds=' + seconds + '"' + (size ? " " + slash : ""),
      ...(size ? ['  -F "size=' + size + '" ' + slash] : []),
      '  -F "input_reference=@first-frame.png"',
    ].join("\n");
    examples.push({ id: "video-reference-curl", label: "Image to video · cURL", language: "bash", code: referenceCode, docsUrl: VIDEO_GUIDE });
  }

  return examples;
}

function verifiedInterfaceExample(model: PublicModel): CodeExample[] {
  const api = model.api_interfaces[0];
  if (!api) return [];
  return [{
    id: "verified-interface",
    label: api.method + " " + api.path,
    language: "text",
    code: ["Verified endpoint: " + api.method + " " + API_BASE + api.path, "Operation: " + api.operation, "See the linked documentation for the request body."].join("\n"),
    docsUrl: api.docs_url ?? "https://docs.llm7.io",
  }];
}

export function codeExamplesForModel(model: PublicModel): CodeExample[] {
  if (model.model_type === "chat") return chatExamples(model);
  if (model.model_type === "image") return imageExamples(model);
  if (model.model_type === "video") return videoExamples(model);
  return verifiedInterfaceExample(model);
}

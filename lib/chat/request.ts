const ID_TOKEN_KEY = "id_token";
export type ChatRequest = {
  text: string;
  model: string;
  apiToken: string | null;
  getCookie: (name: string) => string;
  fetchApiToken: (idToken: string) => Promise<string | null>;
};

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 180_000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function requestChat({
  text,
  model,
  apiToken,
  getCookie,
  fetchApiToken,
}: ChatRequest) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  let token = apiToken ?? "";

  if (model.toLowerCase() === "pro" && !token) {
    let idToken = getCookie(ID_TOKEN_KEY);
    try {
      idToken = sessionStorage.getItem(ID_TOKEN_KEY) || idToken;
    } catch {
      // ignore blocked storage and fall back to the cookie
    }
    token = idToken ? ((await fetchApiToken(idToken)) ?? "") : "";
    if (!token) {
      throw new Error(
        "Please sign in with an LLM7 account that has an active subscription or available balance, or top up your balance.",
      );
    }
  }

  if (token && token.includes("%")) {
    token = decodeURIComponent(token);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetchWithTimeout(
    "https://api.llm7.io/v1/chat/completions",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: text },
        ],
        stream: false,
        temperature: 0.7,
      }),
    },
    180_000, // 180 seconds
  );

  if (!response.ok) {
    throw new Error(
      `Failed to generate text: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  let generatedText: string = data.choices[0]?.message?.content ?? "";

  if (generatedText.startsWith('{"choices":[')) {
    try {
      const parsed = JSON.parse(generatedText);
      generatedText = parsed.choices[0].message.content;
    } catch (jsonError) {
      console.error("Error parsing generated text as JSON:", jsonError);
    }
  }

  return generatedText;
}

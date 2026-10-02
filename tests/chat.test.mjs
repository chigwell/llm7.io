import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./support/load-typescript.mjs";
const { requestChat, fetchWithTimeout } = loadTypeScript("lib/chat/request.ts");
const auth = loadTypeScript("lib/chat/auth.ts");
const { CHAT_MODELS, transformApiModel } = loadTypeScript("lib/chat/models.ts");
const options = {
  text: "hello",
  model: "default",
  apiToken: null,
  getCookie: () => "",
  fetchApiToken: async () => null,
};
function globalValue(t, key, value) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, {
    value,
    configurable: true,
    writable: true,
  });
  t.after(() =>
    descriptor
      ? Object.defineProperty(globalThis, key, descriptor)
      : delete globalThis[key],
  );
}
test("chat fixed choices and display labels remain independent of live pricing models", () => {
  assert.deepEqual(
    CHAT_MODELS.map(transformApiModel)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => [m.id, m.name]),
    [
      ["default", "Default"],
      ["fast", "Fast"],
      ["pro", "Pro"],
    ],
  );
});
test("chat preserves request payload and optional decoded bearer token", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "reply" } }] }),
    };
  });
  assert.equal(await requestChat(options), "reply");
  assert.equal(calls[0].url, "https://api.llm7.io/v1/chat/completions");
  assert.deepEqual(calls[0].init.headers, {
    "Content-Type": "application/json",
  });
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    model: "default",
    messages: [
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: "hello" },
    ],
    stream: false,
    temperature: 0.7,
  });
  await requestChat({ ...options, apiToken: "opaque%2Btoken" });
  assert.equal(calls[1].init.headers.Authorization, "Bearer opaque+token");
});
test("pro requests use session ID before cookie ID and handle blocked storage", async (t) => {
  const ids = [];
  globalValue(t, "sessionStorage", { getItem: () => "session-id" });
  t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: "ok" } }] }),
  }));
  const pro = {
    ...options,
    model: "pro",
    getCookie: () => "cookie-id",
    fetchApiToken: async (id) => {
      ids.push(id);
      return "api";
    },
  };
  await requestChat(pro);
  globalThis.sessionStorage.getItem = () => {
    throw new Error("blocked");
  };
  await requestChat(pro);
  assert.deepEqual(ids, ["session-id", "cookie-id"]);
  await assert.rejects(
    requestChat({ ...pro, getCookie: () => "" }),
    /Please sign in/,
  );
});
test("chat retains nested-response parsing, empty choices, HTTP errors, and timeout abort", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({
      choices: [
        {
          message: {
            content: '{"choices":[{"message":{"content":"nested"}}]}',
          },
        },
      ],
    }),
  }));
  assert.equal(await requestChat(options), "nested");
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ choices: [] }),
  });
  assert.equal(await requestChat(options), "");
  globalThis.fetch = async () => ({
    ok: false,
    status: 429,
    statusText: "Too Many Requests",
  });
  await assert.rejects(
    requestChat(options),
    /Failed to generate text: 429 Too Many Requests/,
  );
  globalThis.fetch = async (_url, { signal }) =>
    new Promise((_resolve, reject) =>
      signal.addEventListener("abort", () =>
        reject(new DOMException("aborted", "AbortError")),
      ),
    );
  await assert.rejects(fetchWithTimeout("https://fixture.test", {}, 1), {
    name: "AbortError",
  });
});
test("token issuance selects first existing token and falls back to creation", async (t) => {
  const saved = [],
    calls = [];
  t.mock.method(Date, "now", () => 0);
  t.mock.method(globalThis, "fetch", async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      json: async () => [{ token: "first" }, { token: "second" }],
    };
  });
  assert.equal(
    await auth.issueApiToken("id", (token) => saved.push(token)),
    "first",
  );
  assert.equal(calls.length, 1);
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    if (init.method === "GET") throw new Error("offline");
    return { ok: true, json: async () => ({ token: "new" }) };
  };
  assert.equal(
    await auth.issueApiToken("id", (token) => saved.push(token)),
    "new",
  );
  assert.deepEqual(JSON.parse(calls.at(-1).init.body), {
    name: "Web chat token",
    expires_at: "1970-01-31T00:00:00.000Z",
  });
  assert.equal(calls.at(-1).init.headers.Authorization, "Bearer id");
  assert.deepEqual(saved, ["first", "new"]);
  globalThis.fetch = async () => ({ ok: false });
  assert.equal(await auth.issueApiToken("id", () => assert.fail()), null);
});
test("cookie storage preserves encoding, security attributes, and blocked-storage boundaries", (t) => {
  globalValue(t, "window", { location: { protocol: "https:" } });
  globalValue(t, "document", { cookie: "" });
  globalValue(t, "sessionStorage", { setItem: () => {}, removeItem: () => {} });
  globalValue(t, "localStorage", { removeItem: () => {} });
  auth.persistIdToken("id+token");
  assert.equal(
    document.cookie,
    "id_token=id%2Btoken; path=/; max-age=3600; SameSite=Strict; Secure",
  );
  assert.equal(auth.getCookie("id_token"), "id%2Btoken");
  sessionStorage.setItem = () => {
    throw new Error("blocked");
  };
  auth.persistIdToken("new");
  assert(document.cookie.startsWith("id_token=id%2Btoken;"));
  sessionStorage.removeItem = () => {
    throw new Error("blocked");
  };
  auth.clearIdToken();
  assert.equal(
    document.cookie,
    "id_token=; path=/; max-age=0; SameSite=Strict; Secure",
  );
  window.location.protocol = "http:";
  auth.persistCookie("test", "value");
  assert(!document.cookie.includes("Secure"));
});

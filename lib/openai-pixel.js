export const OPENAI_PIXEL_ID = "R6Lhmsm3gcUZKbvLQNuDKX";

// Nothing from auth storage, URLs, or account data is persisted by this helper.
export function createOpenAiPixel(browser = () => typeof window === "undefined" ? null : window) {
  let lastWindow, lastRoute, allowed, identity = "", generation = 0;
  let pendingIdentity = Promise.resolve();
  let consentSource;
  function cookie(name) {
    try {
      const value = browser()?.document?.cookie.split("; ").find(item => item.startsWith(name + "="));
      return value ? decodeURIComponent(value.slice(name.length + 1)) : undefined;
    } catch { return undefined; }
  }
  function consent() {
    try {
      if (consentSource && consentSource() !== "allowed") return null;
      const value = JSON.parse(cookie("llm7_ads_consent") || "null");
      const age = Date.now() - Date.parse(value?.consented_at);
      return value?.version === 1 && value.choice === "allowed" && age >= 0 && age < 180 * 86400000 ? value : null;
    } catch { return null; }
  }
  function call(...args) {
    try {
      const win = browser();
      if (typeof win?.oaiq !== "function") return false;
      win.oaiq(...args);
      return true;
    } catch { return false; }
  }
  function syncConsent() {
    const next = Boolean(consent());
    if (next !== allowed) {
      if (!next) {
        generation++; identity = ""; pendingIdentity = Promise.resolve();
        call("init", { pixelId: OPENAI_PIXEL_ID, user: {} });
        lastRoute = undefined;
      }
      if (call("consent", next)) allowed = next;
    }
    return next;
  }
  async function hash(value) {
    const bytes = await browser().crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
  }
  function identify(email, externalId) {
    const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
    const id = (typeof externalId === "string" || typeof externalId === "number") && String(externalId).trim() && String(externalId) !== "0" ? String(externalId).trim() : "";
    const key = JSON.stringify([normalized, id]);
    if (!syncConsent()) return Promise.resolve();
    if (key === identity) return pendingIdentity;
    identity = key;
    const revision = ++generation;
    // Clear the previous account immediately, including while hashing a new one.
    call("init", { pixelId: OPENAI_PIXEL_ID, user: {} });
    pendingIdentity = (async () => {
      const user = {};
      if (normalized) user.email_sha256 = await hash(normalized);
      if (id) user.external_id_sha256 = await hash(id);
      if (generation === revision && syncConsent()) call("init", { pixelId: OPENAI_PIXEL_ID, user });
    })().catch(() => { if (generation === revision) identity = ""; });
    return pendingIdentity;
  }
  return {
    setConsentSource(source) { consentSource = source; },
    syncConsent, identify,
    pageViewed(route) {
      const win = browser();
      if (!syncConsent() || !win || (win === lastWindow && route === lastRoute)) return;
      if (call("measure", "page_viewed", { type: "contents" })) { lastWindow = win; lastRoute = route; }
    },
    checkoutContext() {
      if (!syncConsent()) return null;
      const saved = consent();
      return { consented_at: saved.consented_at, consent_id: saved.consent_id,
        ...(cookie("__oppref") ? { oppref: cookie("__oppref") } : {}),
        ...(cookie("__obref") ? { obref: cookie("__obref") } : {}) };
    },
    async checkoutStarted(amount, eventId) {
      await pendingIdentity;
      if (!syncConsent() || !Number.isSafeInteger(amount) || amount <= 0 || typeof eventId !== "string" || !eventId) return;
      call("measure", "checkout_started", { type: "contents", amount, currency: "USD" }, { event_id: eventId });
    },
  };
}

export const openAiPixel = createOpenAiPixel();

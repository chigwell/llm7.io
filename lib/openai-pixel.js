export const OPENAI_PIXEL_ID = "R6Lhmsm3gcUZKbvLQNuDKX";

// Nothing from auth storage, URLs, or account data is persisted by this helper.
export function createOpenAiPixel(browser = () => typeof window === "undefined" ? null : window) {
  let lastWindow, lastRoute, allowed, identity = "", generation = 0;
  let pendingIdentity = Promise.resolve();
  let consentSource;
  const viewedContents = new Set();
  function cookie(name, decode = false) {
    try {
      const value = browser()?.document?.cookie.split("; ").find(item => item.startsWith(name + "="));
      if (!value) return undefined;
      const raw = value.slice(name.length + 1);
      return decode ? decodeURIComponent(raw) : raw;
    } catch { return undefined; }
  }
  function consent() {
    try {
      if (consentSource && consentSource() !== "allowed") return null;
      const value = JSON.parse(cookie("llm7_ads_consent", true) || "null");
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
  async function measureAction(name, payload, options) {
    // Consent belongs to the action, never to a later grant. A queued action
    // also cannot inherit another account's identity while hashing completes.
    if (!syncConsent()) return;
    const revision = generation;
    const consentId = consent()?.consent_id;
    await pendingIdentity;
    if (revision !== generation || !syncConsent() || consent()?.consent_id !== consentId) return;
    call("measure", name, payload, ...(options ? [options] : []));
  }
  function custom(name) {
    return measureAction("custom", { type: "custom" }, { custom_event_name: name });
  }
  return {
    setConsentSource(source) { consentSource = source; },
    syncConsent, identify,
    pageViewed(route) {
      const win = browser();
      if (!syncConsent() || !win || (win === lastWindow && route === lastRoute)) return;
      if (call("measure", "page_viewed", { type: "contents" })) { lastWindow = win; lastRoute = route; }
    },
    contentsViewed(contentId = "model_catalogue") {
      const key = `${browser()?.location?.pathname || "/"}:${contentId}`;
      if (viewedContents.has(key)) return Promise.resolve();
      viewedContents.add(key);
      return measureAction("contents_viewed", { type: "contents" });
    },
    addBalanceClicked() { return custom("addbalanceclick"); },
    paymentProviderChosen(method) {
      if (method !== "stripe" && method !== "oxapay") return Promise.resolve();
      return custom(method === "stripe" ? "choosestripe" : "chooseoxapya");
    },
    checkoutContext() {
      if (!syncConsent()) return null;
      const saved = consent();
      return { consented_at: saved.consented_at, consent_id: saved.consent_id,
        ...(cookie("__oppref") ? { oppref: cookie("__oppref") } : {}),
        ...(cookie("__obref") ? { obref: cookie("__obref") } : {}) };
    },
    async checkoutStarted(amount, eventId) {
      if (!Number.isSafeInteger(amount) || amount <= 0 || typeof eventId !== "string" || !eventId) return;
      return measureAction("checkout_started", { type: "contents", amount, currency: "USD" }, { event_id: eventId });
    },
  };
}

export const openAiPixel = createOpenAiPixel();

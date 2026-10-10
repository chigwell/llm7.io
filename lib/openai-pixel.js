export const OPENAI_PIXEL_ID = "R6Lhmsm3gcUZKbvLQNuDKX";
const SDK_URL = "https://bzrcdn.openai.com/sdk/oaiq.min.js";
const DAY = 86400000;

// Shared verbatim by both frontends. Eligibility storage belongs to ads-attribution-core.
export function createOpenAiPixel(browser = () => typeof window === "undefined" ? null : window) {
  let lastWindow, lastRoute, policyKey = "", identity = "", generation = 0;
  let pendingIdentity = Promise.resolve(), loading, ready = false, initialized = false;
  let consentSource, attributionSource, loadGeneration = 0;
  const viewedContents = new Set();
  function cookie(name) {
    try {
      const value = browser()?.document?.cookie.split(";").map(item => item.trim()).find(item => item.startsWith(name + "="));
      return value ? decodeURIComponent(value.slice(name.length + 1)) : undefined;
    } catch { return undefined; }
  }
  function policy() {
    try {
      if (consentSource && consentSource() !== "allowed") return null;
      const consent = JSON.parse(cookie("llm7_ads_consent") || "null");
      const attribution = attributionSource?.();
      const age = Date.now() - Date.parse(consent?.consented_at);
      const visitAge = Date.now() - Date.parse(attribution?.captured_at);
      if (consent?.version !== 1 || consent.choice !== "allowed" || age < 0 || age >= 180 * DAY
        || !Number.isFinite(age) || attribution?.version !== 1 || attribution.source !== "openai"
        || !Number.isFinite(visitAge) || visitAge < 0 || visitAge >= 30 * DAY) return null;
      return { consent, attribution, key: JSON.stringify([consent.consent_id, consent.consented_at, attribution.captured_at, attribution.oppref]) };
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
  function canonicalClick(attribution) {
    try {
      const win = browser(), url = new URL(win.location.href);
      // The trusted eligibility parser already resolved oppref/click_id precedence.
      // Restore it before init after callback cleanup or a cross-domain transition.
      const existing = url.searchParams.getAll("oppref");
      if (existing.length === 1 && existing[0].length > 0 && existing[0].length <= 4096 && !/[\s{}<>\u0000-\u001f\u007f]/u.test(existing[0])) return;
      if (attribution.oppref) url.searchParams.set("oppref", attribution.oppref);
      else if (existing.length) url.searchParams.delete("oppref");
      else return;
      win.history.replaceState(win.history.state, "", url.href);
    } catch { /* A blocked history API cannot interfere with authentication. */ }
  }
  function activate() {
    const current = policy();
    if (!current || !ready) return false;
    canonicalClick(current.attribution);
    if (!initialized) {
      if (!call("consent", true)) return false;
      initialized = call("init", { pixelId: OPENAI_PIXEL_ID, debug: false, user: {} });
    }
    return initialized;
  }
  function ensureSdk() {
    if (ready) return Promise.resolve(activate());
    if (loading) return loading;
    const win = browser();
    if (!policy() || !win) return Promise.resolve(false);
    if (typeof win.oaiq === "function") {
      ready = true;
      return Promise.resolve(activate());
    }
    if (!win.document?.createElement || !win.document?.head) return Promise.resolve(false);
    const attempt = ++loadGeneration;
    loading = new Promise(resolve => {
      let settled = false, timer, script;
      const queue = function (...args) { queue.q.push(args); };
      // Never queue a grant, identity or measurement before the SDK has loaded.
      queue.q = [];
      const finish = success => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (!success) {
          script?.remove();
          if (win.oaiq === queue) delete win.oaiq;
        }
        resolve(success);
      };
      try {
        win.oaiq = queue;
        script = win.document.createElement("script");
        script.async = true;
        script.src = SDK_URL;
        script.onload = () => {
          if (settled || attempt !== loadGeneration) return;
          if (win.oaiq === queue) { finish(false); return; }
          ready = true;
          if (!policy()) call("consent", false);
          // Withdrawal/account changes while downloading must not replay a grant.
          finish(activate());
        };
        script.onerror = () => finish(false);
        timer = setTimeout(() => finish(false), 5000);
        win.document.head.appendChild(script);
      } catch { finish(false); }
    }).finally(() => { loading = undefined; });
    return loading;
  }
  function syncConsent() {
    const current = policy(), nextKey = current?.key || "";
    if (nextKey !== policyKey) {
      generation++;
      identity = "";
      pendingIdentity = Promise.resolve();
      lastRoute = undefined;
      // Calling init on a never-eligible visit would itself initialize tracking.
      if (initialized) {
        call("consent", false);
        call("init", { pixelId: OPENAI_PIXEL_ID, user: {} });
        initialized = false;
      }
      policyKey = nextKey;
    }
    if (current) void ensureSdk();
    return Boolean(current);
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
    const previous = identity ? JSON.parse(identity) : null;
    const accountChanged = previous && (previous[0] !== normalized || (previous[1] && previous[1] !== id));
    identity = key;
    const revision = ++generation, actionPolicy = policyKey;
    if (initialized) {
      // The SDK batches events with its current user at dispatch time. Purge
      // business events before replacing an account so none inherit new hashes.
      if (accountChanged) call("consent", false);
      call("init", { pixelId: OPENAI_PIXEL_ID, user: {} });
      if (accountChanged) initialized = false;
    }
    pendingIdentity = (async () => {
      const user = {};
      if (normalized) user.email_sha256 = await hash(normalized);
      if (id) user.external_id_sha256 = await hash(id);
      if (await ensureSdk() && revision === generation && syncConsent() && policyKey === actionPolicy) {
        call("init", { pixelId: OPENAI_PIXEL_ID, user });
      }
    })().catch(() => { if (generation === revision) identity = ""; });
    return pendingIdentity;
  }
  async function measureAction(name, payload, options) {
    if (!syncConsent()) return;
    const revision = generation, actionPolicy = policyKey;
    await pendingIdentity;
    if (!await ensureSdk() || revision !== generation || !syncConsent() || policyKey !== actionPolicy) return;
    call("measure", name, payload, ...(options ? [options] : []));
  }
  function custom(name) {
    return measureAction("custom", { type: "custom" }, { custom_event_name: name });
  }
  return {
    setConsentSource(source) { consentSource = source; },
    setAttributionSource(source) { attributionSource = source; },
    syncConsent, identify,
    pageViewed(route) {
      const win = browser();
      if (!syncConsent() || !win || (win === lastWindow && route === lastRoute)) return Promise.resolve();
      lastWindow = win; lastRoute = route;
      return measureAction("page_viewed", { type: "contents" });
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
      const current = policy();
      if (!current) return null;
      const { consent, attribution } = current;
      return { consented_at: consent.consented_at, consent_id: consent.consent_id,
        attribution: { version: 1, source: "openai", captured_at: attribution.captured_at },
        ...(attribution.oppref ? { oppref: attribution.oppref } : {}),
        ...(cookie("__obref") ? { obref: cookie("__obref") } : {}) };
    },
    async checkoutStarted(amount, eventId) {
      if (!Number.isSafeInteger(amount) || amount <= 0 || typeof eventId !== "string" || !eventId) return;
      return measureAction("checkout_started", { type: "contents", amount, currency: "USD" }, { event_id: eventId });
    },
  };
}

export const openAiPixel = createOpenAiPixel();

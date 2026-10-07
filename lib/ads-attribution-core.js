// Shared verbatim by the landing site and dashboard. No advertising SDK is loaded.
const CONSENT_COOKIE = "llm7_ads_consent";
const ATTRIBUTION_COOKIE = "llm7_ads_attribution";
const REVOCATIONS_COOKIE = "llm7_ads_revocations";
const DAY = 86400000;
const CLICK_TTL = 30 * DAY;
const CONSENT_TTL = 180 * DAY;
const FUTURE_TOLERANCE = 5 * 60000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CLICK_ID = /^[A-Za-z0-9_-]{1,512}$/;
const TYPES = ["gclid", "gbraid", "wbraid"];
const REVOKE_URL = "https://api-token.llm7.io/ads-consent/revoke";

export function createAdsAttribution(options = {}) {
  const browser = options.browser || (() => typeof window === "undefined" ? null : window);
  const now = options.now || Date.now;
  const listeners = new Set();
  const pendingRevocations = new Set();
  const acknowledgedRevocations = new Set();
  let localDeclined = null;
  let candidate = null, seenClick = null, cachedConsent = null;
  let running = 0, removeLifecycle = null, flushing = false, failures = 0, nextRetry = 0;

  function read(name) {
    try {
      const prefix = name + "=";
      const parts = browser()?.document?.cookie?.split(";") || [];
      const part = parts.map(item => item.trim()).find(item => item.startsWith(prefix));
      return part ? JSON.parse(decodeURIComponent(part.slice(prefix.length))) : null;
    } catch { return null; }
  }
  function write(name, value, ttl) {
    try {
      const win = browser();
      if (!win?.document) return;
      const host = win.location?.hostname || "";
      const domain = host === "llm7.io" || host.endsWith(".llm7.io") ? "; Domain=llm7.io" : "";
      const secure = win.location?.protocol === "https:" ? "; Secure" : "";
      win.document.cookie = `${name}=${value === null ? "" : encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=${value === null ? 0 : Math.max(0, Math.floor(ttl / 1000))}; SameSite=Lax${domain}${secure}`;
    } catch { /* Storage may be blocked; never interfere with checkout. */ }
  }
  function timestamp(value, ttl) {
    if (typeof value !== "string") return false;
    const ms = Date.parse(value);
    return Number.isFinite(ms) && new Date(ms).toISOString() === value && ms <= now() + FUTURE_TOLERANCE && ms >= now() - ttl;
  }
  function consentRecord() {
    const value = read(CONSENT_COOKIE);
    if (value?.version !== 1 || !timestamp(value.consented_at, CONSENT_TTL)) return null;
    if (value.choice === "declined") return { version: 1, choice: "declined", consented_at: value.consented_at };
    return value.choice === "allowed" && UUID.test(value.consent_id || "") ? value : null;
  }
  function effectiveConsent() {
    return localDeclined ? { version: 1, choice: "declined", consented_at: localDeclined } : consentRecord();
  }
  function getConsent() { return effectiveConsent()?.choice || "unknown"; }
  function revocations() {
    const value = read(REVOCATIONS_COOKIE);
    return [...new Set([...(Array.isArray(value) ? value : []), ...pendingRevocations]
      .filter(id => typeof id === "string" && UUID.test(id) && !acknowledgedRevocations.has(id)))].slice(-32);
  }
  function queueRevocation(id) {
    if (!UUID.test(id || "") || acknowledgedRevocations.has(id)) return;
    pendingRevocations.add(id);
    while (pendingRevocations.size > 32) pendingRevocations.delete(pendingRevocations.values().next().value);
    write(REVOCATIONS_COOKIE, revocations(), CONSENT_TTL);
  }
  async function flushRevocations() {
    if (flushing || now() < nextRetry) return;
    const win = browser();
    const request = options.fetch || win?.fetch?.bind(win);
    if (!request || !revocations().length) return;
    flushing = true;
    try {
      for (const consent_id of revocations()) {
        // This endpoint only records withdrawal, and never reveals whether a receipt exists.
        const Abort = win?.AbortController || globalThis.AbortController;
        const controller = Abort ? new Abort() : null;
        let timeout;
        let response;
        try {
          response = await Promise.race([
            request(REVOKE_URL, {
              method: "POST", credentials: "omit", keepalive: true,
              ...(controller ? { signal: controller.signal } : {}),
              headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consent_id }),
            }),
            new Promise((_, reject) => {
              timeout = setTimeout(() => { controller?.abort(); reject(new Error("Withdrawal timed out")); }, options.revocationTimeoutMs || 10000);
            }),
          ]);
        } finally { if (timeout !== undefined) clearTimeout(timeout); }
        if (response.status !== 204) throw new Error("Withdrawal not acknowledged");
        acknowledgedRevocations.add(consent_id);
        pendingRevocations.delete(consent_id);
        const remaining = revocations().filter(id => id !== consent_id);
        write(REVOCATIONS_COOKIE, remaining.length ? remaining : null, CONSENT_TTL);
      }
      failures = 0;
      nextRetry = 0;
    } catch {
      failures += 1;
      nextRetry = now() + Math.min(3600000, 30000 * (2 ** Math.min(failures - 1, 7)));
    } finally { flushing = false; }
  }
  function capture() {
    try {
      const params = new URLSearchParams(browser()?.location?.search || "");
      const type = TYPES.find(key => params.getAll(key).length === 1 && CLICK_ID.test(params.get(key) || ""));
      if (!type) return;
      const id = params.get(type), key = `${type}:${id}`;
      // Do not renew a click's lifetime on every focus or consent synchronization.
      if (key === seenClick) return;
      seenClick = key;
      const previous = read(ATTRIBUTION_COOKIE);
      const captured_at = previous?.click_id_type === type && previous.click_id === id && timestamp(previous.captured_at, CLICK_TTL)
        ? previous.captured_at : new Date(now()).toISOString();
      candidate = { click_id_type: type, click_id: id, captured_at };
    } catch { /* Ignore malformed URLs. */ }
  }
  function validAttribution(value, consent) {
    return value?.version === 1 && TYPES.includes(value.click_id_type) && typeof value.click_id === "string" && CLICK_ID.test(value.click_id)
      && timestamp(value.captured_at, CLICK_TTL) && timestamp(value.consented_at, CONSENT_TTL)
      && UUID.test(value.consent_id || "") && value.consent_id === consent?.consent_id
      && value.consented_at === consent?.consented_at;
  }
  function persistCandidate(consent) {
    if (!candidate || consent?.choice !== "allowed" || !timestamp(candidate.captured_at, CLICK_TTL)) return;
    const previous = read(ATTRIBUTION_COOKIE);
    // A return to the original URL must not replace a newer cross-tab click.
    if (validAttribution(previous, consent) && Date.parse(previous.captured_at) >= Date.parse(candidate.captured_at)) return;
    const value = { version: 1, ...candidate, consented_at: consent.consented_at, consent_id: consent.consent_id };
    write(ATTRIBUTION_COOKIE, value, CLICK_TTL - Math.max(0, now() - Date.parse(candidate.captured_at)));
  }
  function notify() {
    for (const listener of listeners) { try { listener(); } catch { /* Observers are optional. */ } }
  }
  function syncConsent() {
    capture();
    const consent = effectiveConsent();
    const previous = cachedConsent;
    cachedConsent = consent;
    if (previous?.choice === "allowed" && previous.consent_id !== consent?.consent_id) queueRevocation(previous.consent_id);
    if (consent?.choice !== "allowed") {
      const attribution = read(ATTRIBUTION_COOKIE);
      if (previous?.choice === "allowed") queueRevocation(previous.consent_id);
      if (attribution?.consent_id) queueRevocation(attribution.consent_id);
      if (attribution) write(ATTRIBUTION_COOKIE, null, 0);
    } else {
      persistCandidate(consent);
    }
    void flushRevocations();
    if (JSON.stringify(previous) !== JSON.stringify(consent)) notify();
    return consent?.choice || "unknown";
  }
  function setConsent(allowed) {
    const previous = consentRecord();
    capture();
    if (allowed) {
      let id;
      try { id = browser()?.crypto?.randomUUID?.(); } catch { /* Fail closed without secure randomness. */ }
      if ((previous?.choice !== "allowed" || localDeclined) && (!UUID.test(id || "") || id === previous?.consent_id || acknowledgedRevocations.has(id) || revocations().includes(id))) return;
      const consent = previous?.choice === "allowed" && !localDeclined ? previous : {
        version: 1, choice: "allowed", consented_at: new Date(now()).toISOString(), consent_id: id,
      };
      write(CONSENT_COOKIE, consent, CONSENT_TTL);
      const saved = consentRecord();
      // Do not re-enable collection if a blocked cookie retains the old grant.
      if (saved?.choice === "allowed" && saved.consent_id === consent.consent_id && saved.consented_at === consent.consented_at) localDeclined = null;
    } else {
      localDeclined = new Date(now()).toISOString();
      if (previous?.choice === "allowed") queueRevocation(previous.consent_id);
      const attribution = read(ATTRIBUTION_COOKIE);
      if (attribution?.consent_id) queueRevocation(attribution.consent_id);
      write(ATTRIBUTION_COOKIE, null, 0);
      candidate = null;
      write(CONSENT_COOKIE, { version: 1, choice: "declined", consented_at: localDeclined }, CONSENT_TTL);
    }
    syncConsent();
  }
  function getAttribution() {
    syncConsent();
    const consent = effectiveConsent(), value = read(ATTRIBUTION_COOKIE);
    if (consent?.choice !== "allowed" || !validAttribution(value, consent)) return null;
    // Reconstruct an exact allowlist; cookie edits cannot inject arbitrary request fields.
    return { version: 1, click_id_type: value.click_id_type, click_id: value.click_id,
      captured_at: value.captured_at, consented_at: value.consented_at, consent_id: value.consent_id };
  }
  function start() {
    running += 1;
    if (running === 1) {
      const win = browser();
      const sync = () => syncConsent();
      win?.addEventListener?.("focus", sync);
      win?.addEventListener?.("pageshow", sync);
      win?.addEventListener?.("popstate", sync);
      win?.document?.addEventListener?.("visibilitychange", sync);
      const interval = win?.setInterval?.(sync, 30000);
      removeLifecycle = () => {
        win?.removeEventListener?.("focus", sync);
        win?.removeEventListener?.("pageshow", sync);
        win?.removeEventListener?.("popstate", sync);
        win?.document?.removeEventListener?.("visibilitychange", sync);
        if (interval !== undefined) win?.clearInterval?.(interval);
      };
      syncConsent();
    }
    let stopped = false;
    return () => {
      if (stopped) return;
      stopped = true;
      running -= 1;
      if (running === 0) { removeLifecycle?.(); removeLifecycle = null; }
    };
  }
  return { getConsent, syncConsent, setConsent, getAttribution, start,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); } };
}

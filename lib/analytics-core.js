// Keep this contract identical in the dashboard and landing repositories.
export const CONSENT_COOKIE = "llm7_analytics_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60;

const oneOf = (...values) => value => values.includes(value);
const flag = value => typeof value === "boolean";
const model = value => typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,99}$/.test(value);
const outcome = oneOf("success", "failure");
const latency = oneOf("under_1s", "1_5s", "5_30s", "over_30s");
export const EVENT_PROPERTIES = {
  $pageview: {},
  cta_clicked: { target: oneOf("dashboard", "example", "docs", "chat"), placement: oneOf("hero", "navigation", "footer", "content") },
  demo_submitted: { model },
  demo_result: { model, outcome, latency_bucket: latency },
  code_copied: { language: oneOf("python", "javascript", "typescript", "curl", "go", "java", "ruby", "php", "csharp", "rust") },
  model_showcase_selected: { model: oneOf("default", "fast", "pro") },
  referral_choice: { accepted: flag },
  auth_result: { outcome },
  api_key_created: {},
  api_key_renamed: {},
  api_key_revoked: {},
  checkout_created: { method: oneOf("stripe", "oxapay"), amount_bucket: oneOf("10_24", "25_49", "50_99", "100_249", "250_500") },
  notification_preferences_saved: { enabled: flag, allowance_enabled: flag, balance_enabled: flag },
  referral_link_copied: { target: oneOf("landing", "dashboard") },
  playground_result: { model, outcome, latency_bucket: latency },
};

export function latencyBucket(ms) {
  return ms < 1000 ? "under_1s" : ms < 5000 ? "1_5s" : ms < 30000 ? "5_30s" : "over_30s";
}
export function amountBucket(cents) {
  return cents < 2500 ? "10_24" : cents < 5000 ? "25_49" : cents < 10000 ? "50_99" : cents < 25000 ? "100_249" : "250_500";
}
export function sanitizeRoute(surface, location) {
  if (surface === "dashboard") {
    const hash = (location.hash || "").split("?")[0];
    return /^#\/(?:usage|api-keys|billing|notifications|referral|models|playground|change-password)?$/.test(hash) ? "/" + hash : "/#/";
  }
  const path = location.pathname || "/";
  return /^\/(?:$|(?:models|compare|cost-calculator|integrations|token-calculator|showcase|Themes|email-verification)(?:\/[a-zA-Z0-9_-]+)*\/?)$/.test(path) ? path : "/other";
}
function propertiesFor(event, properties = {}) {
  const schema = EVENT_PROPERTIES[event];
  if (!schema) return null;
  return Object.fromEntries(Object.entries(schema)
    .filter(([key, accepts]) => accepts(properties[key]))
    .map(([key]) => [key, properties[key]]));
}
const attempt = callback => {
  try {
    const value = callback();
    if (value && typeof value.catch === "function") value.catch(() => {});
    return value;
  } catch { return undefined; }
};

export function createAnalytics({ token, host, surface, loadSdk, browser = () => typeof window === "undefined" ? null : window }) {
  let client;
  let initializing = false;
  let failed = false;
  let generation = 0;
  let queue = [];
  let lastPage = "";
  let lastIdentity = "";
  let knownConsent;
  const listeners = new Set();

  function getConsent() {
    return attempt(() => {
      const value = browser()?.document.cookie.split(";").map(part => part.trim()).find(part => part.startsWith(CONSENT_COOKIE + "="))?.split("=")[1];
      return value === "v1_allowed" ? "allowed" : value === "v1_declined" ? "declined" : "unknown";
    }) || "unknown";
  }
  function enabled() { return Boolean(token && host && browser()); }
  function discardPendingRequests() {
    // posthog-js 1.435.6 does not discard pending batches/retries on opt-out.
    // Keep this pinned-SDK adapter covered when upgrading the dependency.
    for (const pending of [client?._requestQueue, client?._retryQueue]) {
      if (Array.isArray(pending?._queue)) pending._queue.length = 0;
    }
  }
  function guardTransport(instance) {
    // Check consent at dispatch/retry time as well as at capture time.
    for (const [owner, key] of [[instance, "_send_request"], [instance, "_send_retriable_request"], [instance._retryQueue, "retriableRequest"], [instance._retryQueue, "_enqueue"], [instance._retryQueue, "unload"]]) {
      const original = owner?.[key];
      if (typeof original === "function") owner[key] = function (...args) {
        if (getConsent() === "allowed") return original.apply(this, args);
      };
    }
  }
  function syncConsent() {
    const consent = getConsent();
    if (consent === knownConsent) return consent;
    knownConsent = consent;
    generation += 1;
    initializing = false;
    failed = false;
    if (consent !== "allowed") {
      queue = [];
      lastPage = "";
      lastIdentity = "";
      discardPendingRequests();
      attempt(() => client?.opt_out_capturing());
    }
    for (const listener of listeners) attempt(listener);
    return consent;
  }
  function setConsent(allowed) {
    attempt(() => {
      const win = browser();
      if (!win) return;
      const shared = /(^|\.)llm7\.io$/.test(win.location.hostname);
      win.document.cookie = CONSENT_COOKIE + "=" + (allowed ? "v1_allowed" : "v1_declined") +
        "; Path=/; Max-Age=" + CONSENT_MAX_AGE + "; SameSite=Lax" +
        (shared ? "; Domain=llm7.io" : "") + (win.location.protocol === "https:" ? "; Secure" : "");
    });
    syncConsent();
  }
  function beforeSend(event) {
    if (getConsent() !== "allowed") return null;
    const props = event.properties || {};
    const selected = propertiesFor(event.event, props);
    if (!selected && !["$identify", "$set"].includes(event.event)) return null;
    // SDK defaults include URLs, referrers and person properties; allowlist the final payload too.
    const safe = { ...(selected || {}), surface, consent_version: CONSENT_VERSION };
    for (const key of ["token", "distinct_id", "$device_id", "$session_id", "$window_id", "$lib", "$lib_version", "$is_identified", "$process_person_profile", "$anon_distinct_id"]) {
      if (["string", "number", "boolean"].includes(typeof props[key])) safe[key] = props[key];
    }
    safe.route = sanitizeRoute(surface, props.route ? (surface === "dashboard" ? { hash: String(props.route).slice(1) } : { pathname: props.route }) : browser().location);
    safe.$current_url = "https://" + (surface === "landing" ? "llm7.io" : "dash.llm7.io") + safe.route;
    safe.$pathname = surface === "landing" ? safe.route : "/";
    if (["$identify", "$set"].includes(event.event) && props.$set && oneOf("0", "2", "3")(props.$set.plan)) safe.$set = { plan: props.$set.plan };
    // Person updates may also live on the envelope, outside properties.
    const result = { event: event.event, properties: safe };
    if (event.uuid) result.uuid = event.uuid;
    if (event.timestamp) result.timestamp = event.timestamp;
    if (["$identify", "$set"].includes(event.event) && oneOf("0", "2", "3")(event.$set?.plan)) result.$set = { plan: event.$set.plan };
    return result;
  }
  function deliver(entry) {
    if (getConsent() !== "allowed") return;
    if (entry.kind === "identify") {
      attempt(() => client.identify(entry.id, { plan: entry.plan }));
    } else {
      attempt(() => client.capture(entry.event, entry.properties));
    }
  }
  function start() {
    if (!enabled() || syncConsent() !== "allowed" || initializing || failed) return;
    if (client) {
      attempt(() => client.opt_in_capturing({ captureEventName: false }));
      return;
    }
    initializing = true;
    const version = generation;
    // Import and initialization are deliberately detached from rendering and business requests.
    Promise.resolve().then(loadSdk).then(module => {
      if (version !== generation || getConsent() !== "allowed") return;
      const sdk = module.default?.default || module.default || module;
      sdk.init(token, {
        api_host: host,
        // Async XHR avoids the unmangled CJS entrypoint's unbound fetch receiver.
        api_transport: "XHR",
        ui_host: "https://eu.posthog.com",
        persistence: "cookie",
        opt_out_capturing_persistence_type: "cookie",
        opt_out_persistence_by_default: true,
        cookie_expiration: 180,
        cross_subdomain_cookie: /(^|\.)llm7\.io$/.test(browser().location.hostname),
        secure_cookie: browser().location.protocol === "https:",
        person_profiles: "identified_only",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_performance: false,
        capture_exceptions: false,
        capture_dead_clicks: false,
        rageclick: false,
        disable_session_recording: true,
        disable_surveys: true,
        enable_heatmaps: false,
        advanced_disable_flags: true,
        advanced_disable_toolbar_metrics: true,
        disable_external_dependency_loading: true,
        save_referrer: false,
        save_campaign_params: false,
        get_current_url: () => "https://" + (surface === "landing" ? "llm7.io" : "dash.llm7.io") + sanitizeRoute(surface, browser().location),
        on_request_error: () => {},
        request_batching: true,
        request_queue_config: { flush_interval_ms: 3000 },
        before_send: beforeSend,
        loaded: instance => {
          if (version !== generation || getConsent() !== "allowed") {
            attempt(() => instance.opt_out_capturing());
            return;
          }
          client = instance;
          guardTransport(instance);
          initializing = false;
          attempt(() => instance.opt_in_capturing({ captureEventName: false }));
          // Available to an explicit PostHog toolbar launch; no automatic authorization.
          attempt(() => { browser().posthog = instance; });
          const pending = queue;
          queue = [];
          pending.forEach(deliver);
        },
      });
    }).catch(() => {
      if (version !== generation) return;
      failed = true;
      initializing = false;
      queue = [];
    });
  }
  function enqueue(entry) {
    if (!enabled() || syncConsent() !== "allowed" || failed) return;
    if (client) {
      start();
      deliver(entry);
    } else {
      if (queue.length >= 50) queue.splice(queue.findIndex(item => item.kind === "capture"), 1);
      queue.push(entry);
      start();
    }
  }
  function track(event, properties = {}) {
    attempt(() => {
      const safe = propertiesFor(event, properties);
      if (!safe) return;
      enqueue({ kind: "capture", event, properties: { ...safe, surface, consent_version: CONSENT_VERSION, route: sanitizeRoute(surface, browser()?.location || {}) } });
    });
  }
  function trackPageView() {
    attempt(() => {
      if (!enabled() || syncConsent() !== "allowed") return;
      const route = sanitizeRoute(surface, browser().location);
      if (route === lastPage) return;
      lastPage = route;
      track("$pageview");
    });
  }
  function identify(id, plan) {
    attempt(() => {
      if (surface !== "dashboard" || !enabled() || syncConsent() !== "allowed") return;
      const key = String(id ?? "");
      if (!/^(?:[1-9][0-9]*|[0-9a-fA-F-]{32,36})$/.test(key)) return;
      const tier = ["0", "2", "3"].includes(String(plan)) ? String(plan) : "0";
      if (lastIdentity === key + ":" + tier) return;
      if (lastIdentity && !lastIdentity.startsWith(key + ":")) reset();
      lastIdentity = key + ":" + tier;
      // Preserve only the latest identity while loading; never evict it for captures.
      if (!client) queue = queue.filter(entry => entry.kind !== "identify");
      enqueue({ kind: "identify", id: key, plan: tier });
    });
  }
  function reset() {
    queue = [];
    lastIdentity = "";
    lastPage = "";
    discardPendingRequests();
    attempt(() => client?.reset(true));
  }
  function subscribe(listener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }
  return { enabled, getConsent, setConsent, syncConsent, start, track, trackPageView, identify, reset, subscribe };
}

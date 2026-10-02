const defaultSleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export function createPublicRequester({
  previousEtags = {},
  fetchImpl = fetch,
  sleep = defaultSleep,
} = {}) {
  const RETRIES = 3;
  const CONCURRENCY = 6;
  let requestsInFlight = 0;
  const requestWaiters = [];

  async function acquireRequestSlot() {
    if (requestsInFlight >= CONCURRENCY)
      await new Promise((resolvePromise) =>
        requestWaiters.push(resolvePromise),
      );
    requestsInFlight += 1;
  }
  function releaseRequestSlot() {
    requestsInFlight -= 1;
    requestWaiters.shift()?.();
  }
  async function fetchPublic(url, headers) {
    await acquireRequestSlot();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      return await fetchImpl(url, {
        redirect: "follow",
        signal: controller.signal,
        headers,
      });
    } finally {
      clearTimeout(timeout);
      releaseRequestSlot();
    }
  }
  async function requestJson(url, prior, etags) {
    const previousEtag = previousEtags[url];
    let failure;
    for (let attempt = 0; attempt < RETRIES; attempt += 1) {
      try {
        const response = await fetchPublic(
          url,
          previousEtag ? { "If-None-Match": previousEtag } : {},
        );
        const responseEtag = response.headers.get("etag") ?? previousEtag;
        if (response.status === 304) {
          if (prior === undefined)
            throw new Error(
              `304 without a previously validated response for ${url}`,
            );
          if (responseEtag) etags[url] = responseEtag;
          return { value: prior, canonicalUrl: response.url || url };
        }
        if (response.ok) {
          const value = await response.json();
          if (responseEtag) etags[url] = responseEtag;
          return { value, canonicalUrl: response.url || url };
        }
        if (response.status < 500)
          throw new Error(`Permanent HTTP ${response.status} for ${url}`);
        failure = new Error(`HTTP ${response.status} for ${url}`);
      } catch (error) {
        if (
          String(error?.message ?? error).startsWith("Permanent HTTP") ||
          String(error?.message ?? error).includes("304 without")
        )
          throw error;
        failure = error;
      }
      if (attempt < RETRIES - 1) await sleep(250 * 2 ** attempt);
    }
    throw failure ?? new Error(`Unable to request ${url}`);
  }

  return requestJson;
}

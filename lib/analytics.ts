import { createAnalytics } from "./analytics-core";
export { latencyBucket } from "./analytics-core";

export const analytics = createAnalytics({
  token: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  surface: "landing",
  // Unmangled entrypoint required by the pinned consent dispatch adapter.
  loadSdk: () => import("posthog-js/lib/src/entrypoints/module.slim.es.js"),
});
export const { track, trackPageView, identify, reset } = analytics;

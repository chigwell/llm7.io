import { track } from "./analytics";

// Only known product handoffs and explicitly marked CTAs; never capture link text or full URLs.
export function trackLandingLink(element: Element, base: string) {
  const url = new URL(element.getAttribute("href") || "", base);
  const target = url.hostname === "dash.llm7.io" ? "dashboard"
    : url.hostname === "docs.llm7.io" ? "docs"
    : url.hostname === "llm7.chat" ? "chat"
    : element.getAttribute("data-analytics-target");
  if (!target) return;
  const placement = element.closest("[data-analytics-placement]")?.getAttribute("data-analytics-placement")
    || (element.closest("nav") ? "navigation" : element.closest("footer") ? "footer" : "content");
  track("cta_clicked", { target, placement });
}

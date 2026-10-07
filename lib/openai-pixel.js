// Keep pixel failures isolated from navigation and payments.
export function createOpenAiPixel(browser = () => typeof window === "undefined" ? null : window) {
  let lastWindow, lastRoute;
  const measure = event => {
    try {
      const win = browser();
      if (typeof win?.oaiq !== "function") return false;
      win.oaiq("measure", event, { type: "contents" });
      return true;
    } catch { return false; }
  };
  return {
    pageViewed(route) {
      const win = browser();
      if (!win || (win === lastWindow && route === lastRoute)) return;
      if (measure("page_viewed")) { lastWindow = win; lastRoute = route; }
    },
    checkoutStarted() { measure("checkout_started"); },
  };
}

export const openAiPixel = createOpenAiPixel();

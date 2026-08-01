export const EMAIL_REPORT_API_URL =
  "https://api.llm7.io/v1/email-verifications/report-not-you";

export function readEmailReportToken(search) {
  const token = new URLSearchParams(search).get("token")?.trim() ?? "";
  return token.length > 0 && token.length <= 10_000 ? token : null;
}

export function isConfirmedReportDrag({ progress, durationMs, moveCount }) {
  return progress >= 95 && durationMs >= 400 && moveCount >= 6;
}

export async function submitEmailReport(token, fetchImplementation = globalThis.fetch) {
  try {
    const response = await fetchImplementation(EMAIL_REPORT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (response.ok) {
      return "recorded";
    }
    if (response.status === 400) {
      const payload = await response.json().catch(() => null);
      if (payload?.error?.code === "report_link_invalid") {
        return "invalid";
      }
    }
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

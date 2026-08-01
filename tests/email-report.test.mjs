import assert from "node:assert/strict";
import test from "node:test";

import {
  EMAIL_REPORT_API_URL,
  readEmailReportToken,
  submitEmailReport,
} from "../lib/email-report.js";

test("report token is read without making a request", () => {
  assert.equal(readEmailReportToken("?token=v1.opaque%2Btoken"), "v1.opaque+token");
  assert.equal(readEmailReportToken(""), null);
  assert.equal(readEmailReportToken("?token=%20"), null);
});

test("report is submitted only when the helper is explicitly called", async () => {
  const calls = [];
  const result = await submitEmailReport("v1.opaque", async (url, options) => {
    calls.push({ url, options });
    return { ok: true, status: 200 };
  });

  assert.equal(result, "recorded");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, EMAIL_REPORT_API_URL);
  assert.equal(calls[0].options.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].options.body), { token: "v1.opaque" });
  assert.equal(calls[0].options.credentials, "omit");
  assert.equal(calls[0].options.referrerPolicy, "no-referrer");
});

test("invalid and unavailable API responses map to safe page states", async () => {
  const invalid = await submitEmailReport("v1.invalid", async () => ({
    ok: false,
    status: 400,
    json: async () => ({ error: { code: "report_link_invalid" } }),
  }));
  const unavailable = await submitEmailReport("v1.valid", async () => ({
    ok: false,
    status: 503,
    json: async () => ({}),
  }));

  assert.equal(invalid, "invalid");
  assert.equal(unavailable, "unavailable");
});

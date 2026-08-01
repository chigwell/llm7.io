"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  readEmailReportToken,
  submitEmailReport,
} from "@/lib/email-report";

import styles from "./page.module.css";

type ViewState = "loading" | "ready" | "submitting" | "recorded" | "invalid" | "unavailable";

export default function ReportConfirmation() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<ViewState>("loading");

  useEffect(() => {
    const nextToken = readEmailReportToken(window.location.search);
    setToken(nextToken);
    setState(nextToken ? "ready" : "invalid");
  }, []);

  async function confirmReport() {
    if (!token || state !== "ready") {
      return;
    }
    setState("submitting");
    const result = await submitEmailReport(token);
    window.history.replaceState({}, document.title, window.location.pathname);
    setToken(null);
    setState(result);
  }

  const finished = state === "recorded" || state === "invalid" || state === "unavailable";

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-live="polite">
        <Link className={styles.brand} href="/" aria-label="LLM7.io home">
          LLM7.io
        </Link>

        {state === "loading" ? (
          <p className={styles.message}>Checking the report link…</p>
        ) : null}

        {state === "ready" || state === "submitting" ? (
          <>
            <p className={styles.eyebrow}>EMAIL SECURITY</p>
            <h1>Didn&apos;t request this verification code?</h1>
            <p className={styles.message}>
              Confirming this report will record the incident and temporarily prevent its
              source from requesting more verification emails.
            </p>
            <button
              className={styles.reportButton}
              type="button"
              onClick={() => void confirmReport()}
              disabled={state === "submitting"}
            >
              {state === "submitting" ? "Reporting…" : "Report this request"}
            </button>
            <Link className={styles.cancelLink} href="/">
              Cancel and return to LLM7.io
            </Link>
          </>
        ) : null}

        {state === "recorded" ? (
          <>
            <p className={styles.statusIcon} aria-hidden="true">
              ✓
            </p>
            <h1>Thank you for letting us know</h1>
            <p className={styles.message}>
              We recorded your report. Thank you for helping us keep verification emails
              safe.
            </p>
          </>
        ) : null}

        {state === "invalid" ? (
          <>
            <h1>This report link is no longer valid</h1>
            <p className={styles.message}>
              It may have expired or already been used. No action was taken.
            </p>
          </>
        ) : null}

        {state === "unavailable" ? (
          <>
            <h1>We couldn&apos;t record the report</h1>
            <p className={styles.message}>Please reopen the link from your email and try again.</p>
          </>
        ) : null}

        {finished ? (
          <Link className={styles.homeButton} href="/">
            Return to LLM7.io
          </Link>
        ) : null}

        <p className={styles.support}>
          Need help? <a href="mailto:support@llm7.io">support@llm7.io</a>
        </p>
      </section>
    </main>
  );
}

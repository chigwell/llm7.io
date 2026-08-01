"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import {
  isConfirmedReportDrag,
  readEmailReportToken,
  submitEmailReport,
} from "@/lib/email-report";

import styles from "./page.module.css";

type ViewState = "loading" | "ready" | "submitting" | "recorded" | "invalid" | "unavailable";

export default function ReportConfirmation() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<ViewState>("loading");
  const [sliderProgress, setSliderProgress] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<{
    pointerId: number;
    startedAt: number;
    moveCount: number;
    progress: number;
  } | null>(null);

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

  function updatePointerProgress(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    const slider = sliderRef.current;
    if (!gesture || !slider || gesture.pointerId !== event.pointerId || !event.isTrusted) {
      return;
    }
    const bounds = slider.getBoundingClientRect();
    const thumbWidth = 54;
    const usableWidth = Math.max(1, bounds.width - thumbWidth);
    const progress = Math.max(
      0,
      Math.min(100, ((event.clientX - bounds.left - thumbWidth / 2) / usableWidth) * 100),
    );
    gesture.moveCount += 1;
    gesture.progress = progress;
    setSliderProgress(progress);
  }

  function beginPointerGesture(event: PointerEvent<HTMLDivElement>) {
    if (state !== "ready" || !event.isTrusted) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX > bounds.left + 66) {
      setSliderProgress(0);
      return;
    }
    gestureRef.current = {
      pointerId: event.pointerId,
      startedAt: performance.now(),
      moveCount: 0,
      progress: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePointerProgress(event);
  }

  function finishPointerGesture(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    updatePointerProgress(event);
    const confirmed =
      event.isTrusted &&
      isConfirmedReportDrag({
        progress: gesture.progress,
        durationMs: performance.now() - gesture.startedAt,
        moveCount: gesture.moveCount,
      });
    gestureRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (confirmed) {
      setSliderProgress(100);
      void confirmReport();
    } else {
      setSliderProgress(0);
    }
  }

  function cancelPointerGesture(event: PointerEvent<HTMLDivElement>) {
    if (gestureRef.current?.pointerId !== event.pointerId) {
      return;
    }
    gestureRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setSliderProgress(0);
  }

  function handleSliderKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (state !== "ready" || !event.isTrusted) {
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSliderProgress((current) => Math.min(100, current + 10));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSliderProgress((current) => Math.max(0, current - 10));
    } else if ((event.key === "Enter" || event.key === " ") && sliderProgress === 100) {
      event.preventDefault();
      void confirmReport();
    }
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
              Slide to record the incident. We wait until the verification code expires before
              restricting its source, so confirming your email cancels the restriction.
            </p>
            <div
              ref={sliderRef}
              className={`${styles.reportSlider} ${
                state === "submitting" ? styles.reportSliderSubmitting : ""
              }`}
              role="slider"
              tabIndex={state === "submitting" ? -1 : 0}
              aria-label="Slide right to report this request"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderProgress)}
              aria-disabled={state === "submitting"}
              onPointerDown={beginPointerGesture}
              onPointerMove={updatePointerProgress}
              onPointerUp={finishPointerGesture}
              onPointerCancel={cancelPointerGesture}
              onKeyDown={handleSliderKeyDown}
            >
              <span className={styles.sliderLabel}>
                {state === "submitting" ? "Recording report…" : "Slide to report"}
              </span>
              <span
                className={styles.sliderThumb}
                aria-hidden="true"
                style={{ left: `calc(3px + (100% - 58px) * ${sliderProgress / 100})` }}
              >
                →
              </span>
            </div>
            <p className={styles.keyboardHint}>
              Keyboard: use the right arrow until 100%, then press Enter.
            </p>
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
              We recorded your report. If the code is not verified before it expires, its
              source will be temporarily restricted from requesting more codes.
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

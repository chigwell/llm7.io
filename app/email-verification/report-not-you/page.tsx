import type { Metadata } from "next";

import ReportConfirmation from "./ReportConfirmation";

export const metadata: Metadata = {
  title: "Report an email verification request | LLM7.io",
  description: "Report an LLM7.io verification email that you did not request.",
  alternates: { canonical: "/email-verification/report-not-you/" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function EmailVerificationReportPage() {
  return <ReportConfirmation />;
}

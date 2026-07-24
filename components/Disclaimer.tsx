"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface DisclaimerProps {
  /**
   * The disclaimer text to display
   */
  text?: string;
  /**
   * Duration in milliseconds to show the skeleton before revealing text
   */
  loadingDuration?: number;
  /**
   * Additional class names for the disclaimer container
   */
  className?: string;
  /**
   * Maximum width of the disclaimer
   */
  maxWidth?: string;
}

/**
 * A centered disclaimer component with skeleton loading effect
 */
export default function Disclaimer({
  text = "This is a disclaimer message. By using this service, you agree to our terms and conditions. Please read carefully before proceeding.",
  loadingDuration = 2000,
  className,
  maxWidth = "max-w-3xl", // Changed from max-w-2xl to match the chart component
}: DisclaimerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadingDuration);

    return () => clearTimeout(timer);
  }, [loadingDuration]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        className={cn(
          "w-full",
          maxWidth,
          "bg-card border border-border/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm",
          className
        )}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
                <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-foreground">Disclaimer</h2>
              <div className="mt-8 px-4 max-w-2xl text-gray-700 text-sm text-center">
                <p className="text-justify">
                  LLM7.io offers a free tier supported by donors and a paid subscription: <b>Pro</b> (highest limits plus JSON mode, function calling, and Pro models).
                </p>
                <p className="text-justify">
                  Current access limits include anonymous access up to 500,000 tokens/day with 60 requests/hour, 10 requests/minute,
                  and 1 request/second; free-token access up to 1,000,000 tokens/day with 250 requests/hour, 60 requests/minute,
                  and 2 requests/second; and Pro subscription access with 15,000 requests/hour, 1,500 requests/minute,
                  and 25 requests/second. Pro token allowance is calculated dynamically across the billing period.
                  Usage-billed paid requests are not limited by a daily token quota, but remain subject
                  to available balance, rate limits, model availability, fair-use calculations, and abuse-prevention controls.
                </p>
                <p className="text-justify">
                  Subscription features, limits, and pricing may change at any time.
                </p>
                <p className="text-justify">
                  All third-party names, logos, trademarks, service marks, model names, provider names, and media materials are the property of their respective owners, and their display does not imply endorsement, sponsorship, or affiliation unless expressly stated.
                </p>
                <p className="text-justify">
                  <b>Important:</b> Large language models may generate inaccurate or misleading content (&quot;hallucinations&quot;).
                  Do not rely on outputs as legal, medical, financial, or other professional advice. You must independently
                  verify any critical output before use.
                </p>
                <p className="text-justify">
                  The Service is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind (express or implied),
                  including merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee
                  uptime, latency, availability of any particular model, or the accuracy, reliability, completeness, or
                  timeliness of generated content. We may modify, replace, restrict, or withdraw models and features at any
                  time without notice.
                </p>
                <p className="text-justify">
                  Access to the Service may be <b>suspended, restricted, or terminated at any time</b>, at our sole discretion,
                  including where there is a <b>risk of fraud, abuse, or unreasonable or non-meaningful use</b>, as determined
                  automatically or manually by our internal systems, partner systems, or administrators. Such actions may occur
                  without prior notice or compensation.
                </p>
                <p className="text-justify">
                  To the maximum extent permitted by law, you use the Service at your own risk. LLM7.io and its contributors
                  will not be liable for any direct, indirect, incidental, special, consequential, or punitive losses or damages
                  (including loss of data, business interruption, or loss of profits) arising from your use of the Service, even
                  if advised of the possibility of such damages. Nothing in this notice excludes or limits liability for death or
                  personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot
                  lawfully be limited or excluded.
                </p>
                <p className="text-justify">
                  We collect anonymous usage data to improve the Service. If you use <code>dash.llm7.io</code> to issue access
                  tokens for <code>llm7.io</code>, we will store your email address (and minimal related metadata) for the purpose
                  of issuing, managing, and securing those tokens, enforcing rate limits, and preventing abuse. We do not sell
                  personal data. Data are retained only as long as necessary to provide the Service and to meet legal obligations.
                </p>
                <p className="text-justify">
                  Anonymous usage data may be collected and analysed to improve future models; no personally identifying
                  information is stored or used by LLM7.io.
                </p>
                <p className="mt-2">
                  For more details, please see our{" "}
                  <a
                    href="https://github.com/chigwell/llm7.io/blob/main/TERMS.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://github.com/chigwell/llm7.io/blob/main/PRIVACY.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Privacy Policy
                  </a>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

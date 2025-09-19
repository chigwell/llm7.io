import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GA_CLIENT_ID =
  "264062651955-8qamru5vjtu9kc1tk2trsgte5e10hm0m.apps.googleusercontent.com";
const BASE_API_URL = "https://llm7-api.chigwel137.workers.dev";
const ID_TOKEN_KEY = "id_token";

const styles = {
  section: { padding: "32px 16px" },
  container: {
    maxWidth: 896,
    margin: "0 auto",
    width: "100%",
  },
  hSmall: { marginBottom: 8, fontWeight: 700, color: "#334155" },
  h1: {
    margin: "0 0 12px",
    lineHeight: 1.2,
    fontSize: 28,
    color: "#1f2937",
    textAlign: "center",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },
  lead: {
    marginBottom: 32,
    color: "#4b5563",
    textAlign: "center",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },

  card: {
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 6px 16px rgba(0,0,0,0.07)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minWidth: 0, // allow flex children to shrink
    overflow: "hidden",
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#334155",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },
  desc: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#6b7280",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },
  priceRow: { marginTop: 12, display: "flex", alignItems: "baseline", gap: 8 },
  price: { fontSize: 28, fontWeight: 800, color: "#1f2937" },
  period: { fontSize: 16, fontWeight: 700, opacity: 0.7 },

  features: {
    listStyle: "none",
    padding: 0,
    margin: "16px 0 24px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: "1 1 auto",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#374151",
    minWidth: 0,
  },

  check: {
    width: 18,
    height: 18,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#dcfce7",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800,
    flex: "0 0 18px",
  },

  btn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #9ca3af",
    background: "linear-gradient(#f3f4f6, #e5e7eb)",
    cursor: "pointer",
    width: "100%",
    fontWeight: 600,
  },

  footnote: { marginTop: 24, color: "#4b5563", fontSize: 12 },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    width: "min(520px, 100%)", // fit small screens
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalTitle: { margin: "0 0 8px", fontSize: 20, color: "#111827", fontWeight: 700 },
  modalText: { margin: 0, color: "#374151", fontSize: 14 },
  modalActions: { display: "flex", justifyContent: "end", gap: 8, marginTop: 16 },
  modalBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #9ca3af",
    background: "#fff",
    cursor: "pointer",
  },
  modalBtnPrimary: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #212121",
    background: "#212121",
    color: "#fff",
    cursor: "pointer",
  },
    checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    fontSize: 12,
    color: "#374151",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: "1px solid #9ca3af",
    accentColor: "#212121",
    flex: "0 0 16px",
    cursor: "pointer",
  },
};

/* ------------------------- Utils ------------------------- */
function loadGsiOnce() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      resolve();
      return;
    }
    const existing = document.getElementById("gsi-client");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("GSI failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = "gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("GSI failed to load"));
    document.body.appendChild(script);
  });
}

/* ---------------- Google sign-in modal block --------------- */
function BasicSubGoogleBlock({ onClose, onSuccess }) {
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'ok' | 'error'
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const btnRef = useRef(null);

  // Guards / refs to avoid re-rendering the GSI button
  const renderedRef = useRef(false);
  const termsRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    termsRef.current = isTermsAccepted;
  }, [isTermsAccepted]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const runSetSub = useCallback(async (credential) => {
    if (!termsRef.current) {
      setStatus("error");
      setMessage("Please accept the Terms and Privacy Policy first.");
      return;
    }
    setStatus("loading");
    setMessage("Signing in…");
    try {
      localStorage.setItem(ID_TOKEN_KEY, credential);

      // 1) Verify
      const v = await fetch(`${BASE_API_URL}/verify`, {
        method: "GET",
        headers: { Authorization: `Bearer ${credential}` },
      });
      if (!v.ok) throw new Error("Token verification failed");
      const data = await v.json();
      const verifiedEmail = (data && data.email) || "";
      setEmail(verifiedEmail);

      // 2) Activate
      setMessage("Activating Basic subscription…");
      const s = await fetch(`${BASE_API_URL}/set-sub`, {
        method: "POST",
        headers: { Authorization: `Bearer ${credential}` },
      });
      if (!s.ok) {
        const t = await s.text().catch(() => "");
        throw new Error(t || "Failed to activate subscription");
      }

      setStatus("ok");
      setMessage("Basic subscription activated.");
      onSuccessRef.current(verifiedEmail);
    } catch (err) {
      setStatus("error");
      setMessage(err?.message || "Something went wrong");
    }
  }, []); // stable

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (renderedRef.current) return; // prevent double-render (incl. StrictMode)
      renderedRef.current = true;

      try {
        await loadGsiOnce();
        if (cancelled) return;

        const google = window.google;
        google.accounts.id.initialize({
          client_id: GA_CLIENT_ID,
          callback: (response) => {
            const cred = response && response.credential;
            if (cred) runSetSub(cred);
          },
        });

        if (btnRef.current) {
          google.accounts.id.renderButton(btnRef.current, {
            theme: "outline",
            size: "large",
            width: 260,
          });
        }
      } catch (e) {
        setStatus("error");
        setMessage("Failed to initialise Google Sign-In");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [runSetSub]);

  return (
    <div>
      <div style={styles.modalTitle}>Join the Waitlist</div>
      <p style={styles.modalText}>Sign in with Google to subscribe</p>

      {/* Google button (blocked until terms accepted) */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginTop: 12,
          pointerEvents: isTermsAccepted ? "auto" : "none",
          opacity: isTermsAccepted ? 1 : 0.5,
        }}
        aria-disabled={!isTermsAccepted}
      >
        <div ref={btnRef} />
      </div>

      {/* Terms checkbox */}
      <div style={styles.checkboxRow}>
        <input
          id="terms-accept"
          type="checkbox"
          checked={isTermsAccepted}
          onChange={(e) => setIsTermsAccepted(e.target.checked)}
          style={styles.checkbox}
        />
        <label htmlFor="terms-accept" style={{ userSelect: "none" }}>
          I agree to the{" "}
          <a
            href="https://github.com/chigwell/llm7.io/blob/main/TERMS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
          >
            Terms of Service
          </a>{" "}
          and acknowledge the{" "}
          <a
            href="https://github.com/chigwell/llm7.io/blob/main/PRIVACY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
          >
            Privacy Policy
          </a>
          .
        </label>
      </div>

      {status !== "idle" ? (
        <p style={{ ...styles.modalText, marginTop: 12 }}>
          {message} {email ? <>({email})</> : null}
        </p>
      ) : null}

      <div style={styles.modalActions}>
        <button type="button" style={styles.modalBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}


/* ------------------ Pricing UI ------------------ */
function PricingCard({ plan }) {
  const handleClick = useCallback(() => {
    if (plan.action.href) {
      window.open(plan.action.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (plan.action.onClick) plan.action.onClick();
  }, [plan]);

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{plan.title}</h3>
      <p style={styles.desc}>{plan.desc}</p>

      <div style={styles.priceRow}>
        <div style={styles.price}>{plan.price}</div>
        {plan.period ? <div style={styles.period}>/{plan.period}</div> : null}
      </div>

      <ul style={styles.features}>
        {plan.features.map((info, idx) => (
          <li key={idx} style={styles.featureItem}>
            <span aria-hidden="true" style={styles.check}>
              ✓
            </span>
            <span style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>{info}</span>
          </li>
        ))}
      </ul>

      <button
          type="button"
          style={{ ...styles.btn, ...(plan.action.buttonStyle || {}) }}
          onClick={handleClick}
        >
          {plan.action.label}
        </button>
    </div>
  );
}

export default function PricingSection() {
  const [modal, setModal] = useState(null);
  const [justActivatedEmail, setJustActivatedEmail] = useState("");

  const scrollToExample = useCallback(() => {
    const el = document.getElementById("example-usage");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const plans = useMemo(
  () => [
    {
      title: "Free (Anonymous)",
      desc: "Start now — no sign-up.",
      price: "$0",
      features: ["No sign-up", "750 req/h", "45 req/min", "1 req/s"],
      action: { label: "See Example", onClick: scrollToExample },
    },
    {
      title: "Free (Token-based)",
      desc: "Higher limits with a free token.",
      price: "$0",
      features: [
        "Free token",
        "4,500 req/h",
        "150 req/min",
        "20 req/s",
        "20+ LLMs",
        "Image gen (watermark)",
      ],
      action: { label: "Get Free Token", href: "https://token.llm7.io/" },
    },
    {
      title: "Subscription Waitlist",
      desc: "For production apps.",
      price: "Coming soon",
      period: "",
      features: [
        "From $2/mo*",
        "9k+ req/h",
        "500+ req/min",
        "100+ req/s",
        "30+ LLMs",
        "Image gen (no watermark)",
        "OCR",
        "Speech-to-text",
        "Priority support",
        "Revenue share**",
      ],
      action: {
        label: "Join Waitlist",
        onClick: () => setModal("basic"),
        buttonStyle: {
          background: "#212121",
          color: "#fff",
          border: "1px solid #212121",
        },
      },
    },
  ],
  [scrollToExample],
);

  return (
    <section style={styles.section} className={"p-4 md:p-6 rounded-lg w-full mx-4  mt-6"}>
      {/* Valid, responsive grid CSS */}
      <style>{`
        .pricing-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 600px) {
          .pricing-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 896px) {
          .pricing-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>

      <div style={styles.container}>
        <h2 style={styles.h1}>Pick a plan that grows with your goals.</h2>
        <p style={styles.lead}>Compare the benefits and limits below to find the right fit.</p>

        <div className="pricing-grid">
          {plans.map((plan, idx) => (
            <PricingCard key={idx} plan={plan} />
          ))}
        </div>

        <div style={styles.footnote}>
          <p>* - Features, limits and pricing may change.</p>
          <p>** - Partner programme details soon.</p>
        </div>
      </div>

      {modal && (
        <div style={styles.overlay} role="presentation" onClick={() => setModal(null)}>
          <div role="dialog" aria-modal="true" style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {modal === "basic" ? (
              justActivatedEmail ? (
                <>
                  <div style={styles.modalTitle}>✅ All set</div>
                  <p style={styles.modalText}>
                    We will notify you when subscriptions are available.
                  </p>
                  <div style={styles.modalActions}>
                    <button type="button" style={styles.modalBtnPrimary} onClick={() => setModal(null)}>
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <BasicSubGoogleBlock
                  onClose={() => setModal(null)}
                  onSuccess={(email) => setJustActivatedEmail(email || "")}
                />
              )
            ) : (
              <>
                <div style={styles.modalTitle}>Join the Waitlist</div>
                <p style={styles.modalText}>
                  Thanks for your interest. Subscriptions will open soon. This is a placeholder dialog—no data is
                  collected here.
                </p>
                <div style={styles.modalActions}>
                  <button type="button" style={styles.modalBtn} onClick={() => setModal(null)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import LandingHeader from "../_landing/LandingHeader";
import LandingFooter from "../_landing/LandingFooter";

/** Monospace style for small labels. */
const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono-brand, 'IBM Plex Mono', monospace)",
};

const fieldLabel: React.CSSProperties = { fontSize: 13.5, fontWeight: 700 };

const inputBase: React.CSSProperties = {
  padding: "13px 14px",
  borderRadius: 10,
  border: "1px solid #D6DBE4",
  fontSize: 15,
  color: "#0E1420",
  outline: "none",
  width: "100%",
  background: "#fff",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const roles = [
  "Resident",
  "Municipal employee",
  "Contractor",
  "Councillor or community group",
  "Press or other",
];

/** Contact page — two-column layout matching the design handoff. */
export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  /** Simulates form submission — swap this for a real API call when ready. */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  function handleReset() {
    setName("");
    setEmail("");
    setRole(roles[0]);
    setMessage("");
    setSent(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7F9", color: "#0E1420" }}>
      <LandingHeader />

      <main style={{ padding: "72px 24px 92px" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 56,
            alignItems: "start",
          }}
        >
          {/* ── Left column: contact info ── */}
          <div>
            <span
              style={{
                ...mono,
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#2563EB",
              }}
            >
              Contact
            </span>
            <h1
              style={{
                fontSize: "clamp(32px, 4.2vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                margin: "14px 0 0",
              }}
            >
              Before you sign up, ask us anything
            </h1>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: "#4B5566",
                margin: "16px 0 34px",
                maxWidth: "34em",
              }}
            >
              Residents, ward councillors, municipal teams and contractors all land here. Tell us who
              you are and we&rsquo;ll route it to the right person.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>General &amp; support</h3>
                <a href="mailto:hello@reporthole.co.za" style={{ fontSize: 15.5, color: "#2563EB" }}>
                  hello@reporthole.co.za
                </a>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Municipal partnerships</h3>
                <a href="mailto:partners@reporthole.co.za" style={{ fontSize: 15.5, color: "#2563EB" }}>
                  partners@reporthole.co.za
                </a>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Where we operate</h3>
                <p style={{ margin: 0, fontSize: 15.5, color: "#4B5566" }}>
                  Gauteng, South Africa — expanding province by province.
                </p>
              </div>

              {/* Callout */}
              <div style={{ background: "#F3F4F6", borderRadius: 14, padding: "18px 20px" }}>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#1240C4" }}>
                  <strong>Reporting an urgent hazard?</strong> Don&rsquo;t use this form — create an
                  account and file it in the app so it reaches the queue with a location attached.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right column: form ── */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E3E7EE",
              borderRadius: 20,
              padding: "clamp(24px, 3vw, 36px)",
            }}
          >
            {sent ? (
              /* Success state */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: "24px 0",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Message sent</span>
                <p style={{ margin: 0, fontSize: 15.5, color: "#4B5566", lineHeight: 1.6 }}>
                  Thanks — we reply within two working days.
                </p>
                <button
                  onClick={handleReset}
                  style={{
                    alignSelf: "center",
                    marginTop: 8,
                    padding: "12px 22px",
                    borderRadius: 10,
                    border: "1px solid #D6DBE4",
                    background: "#fff",
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: "#0E1420",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Send another
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 18,
                  }}
                >
                  <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <span style={fieldLabel}>Full name</span>
                    <input
                      type="text"
                      placeholder="Thandi Mokoena"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={inputBase}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#111111";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,86,240,0.14)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#D6DBE4";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <span style={fieldLabel}>Email</span>
                    <input
                      type="email"
                      placeholder="you@example.co.za"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputBase}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#111111";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,86,240,0.14)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#D6DBE4";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </label>
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <span style={fieldLabel}>I&rsquo;m a…</span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ ...inputBase, appearance: "auto" }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#111111";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,86,240,0.14)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#D6DBE4";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {roles.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <span style={fieldLabel}>Message</span>
                  <textarea
                    rows={6}
                    placeholder="What would you like to know?"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ ...inputBase, resize: "vertical" }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#111111";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,86,240,0.14)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#D6DBE4";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </label>

                <button
                  type="submit"
                  style={{
                    padding: "15px 22px",
                    borderRadius: 12,
                    border: "none",
                    background: "#111111",
                    color: "#fff",
                    fontSize: 15.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#374151")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
                >
                  Send message
                </button>

                <p style={{ ...mono, margin: 0, fontSize: 12, color: "#7A8497", lineHeight: 1.5 }}>
                  We only use your details to reply. Nothing here creates an account.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

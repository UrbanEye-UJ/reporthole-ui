"use client";

import { useState } from "react";
import Link from "next/link";
import LandingHeader from "./_landing/LandingHeader";
import LandingFooter from "./_landing/LandingFooter";
import PinIcon from "./_landing/PinIcon";
import ContactSection from "./_landing/ContactSection";
import LandingMapWrapper from "./_landing/LandingMapWrapper";
import { LandingThemeProvider, useLandingTheme } from "./_landing/LandingThemeContext";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";
import InstallInstructionsModal from "@/components/shared/InstallInstructionsModal";

/** Monospace style used for labels and stats sub-text. */
const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono-brand, 'IBM Plex Mono', monospace)",
};

const issueTypes = [
  "Potholes",
  "Cracked surface",
  "Faded lane markings",
  "Damaged traffic signs",
  "Blocked storm drains",
  "Broken traffic lights",
  "Accidents",
];

const steps = [
  {
    num: "01",
    title: "Snap it",
    body: "Take the photo in-app. Your GPS location is attached automatically, so you never type an address.",
  },
  {
    num: "02",
    title: "Classify it",
    body: "Pick a category and add a line of context. If someone already reported it nearby, we ask you to confirm theirs instead of filing a duplicate.",
  },
  {
    num: "03",
    title: "Follow it",
    body: "Every report carries an audit trail. You get a live update each time the status moves or another resident backs your report.",
  },
];

const muniPoints = [
  "Geospatial clustering so one road fault is one work item, not forty tickets.",
  "Every status change timestamped and attributed for accountability.",
  "Reporter confirmations give you a real severity signal, not guesswork.",
];

const stats = [
  { value: "7 issue types", label: "potholes to broken robots" },
  { value: "1 km radius", label: "duplicate detection on submit" },
  { value: "5 statuses", label: "reported → resolved" },
  { value: "Live push", label: "updates the moment status changes" },
];

/** Inner page — reads from LandingThemeContext. */
function LandingContent() {
  const { dark } = useLandingTheme();
  const { canInstall, isStandalone, isIOS, promptInstall } = useInstallPrompt();
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const handleInstallClick = () => {
    if (canInstall) {
      promptInstall();
    } else {
      setShowInstallInstructions(true);
    }
  };

  // ── Palette ──────────────────────────────────────────────────────────────
  const pageBg   = dark ? "#0F0F0F" : "#F9FAFB";
  const pageText = dark ? "#F9FAFB" : "#111111";
  const cardBg   = dark ? "#161616" : "#FFFFFF";
  const border   = dark ? "#2D2D2D" : "#E5E7EB";
  const bodyText = dark ? "#9CA3AF" : "#4B5566";
  const chipBg   = dark ? "#262626" : "#F3F4F6";
  const chipText = dark ? "#F9FAFB" : "#111111";
  const accentText = dark ? "#FFFFFF" : "#111111";

  // Sections that stay dark in BOTH modes (hero, stats band, muni card, footer, final CTA)
  const heroBtnPrimaryColor = "#111111"; // white bg button text always dark
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: pageBg, color: pageText }}>
      <LandingHeader />

      <main id="top">
        {/* ── Hero — always dark ── */}
        <section style={{ background: "#111111", color: "#fff", padding: "clamp(48px, 8vw, 96px) 24px clamp(52px, 8vw, 96px)" }}>
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  ...mono,
                  display: "inline-block",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "7px 12px",
                  border: "1px solid rgba(255,255,255,0.30)",
                  borderRadius: 999,
                }}
              >
                Gauteng · civic reporting
              </span>
              <h1
                style={{
                  fontSize: "clamp(38px, 5.2vw, 62px)",
                  lineHeight: 1.03,
                  letterSpacing: "-0.035em",
                  fontWeight: 800,
                  margin: "22px 0 0",
                }}
              >
                Report the pothole.<br />Track the fix.
              </h1>
              <p
                style={{
                  fontSize: 18.5,
                  lineHeight: 1.55,
                  maxWidth: "30em",
                  margin: "20px 0 0",
                  color: "#9CA3AF",
                }}
              >
                Photograph a road issue, drop the location, and follow its status from reported to
                resolved — with live updates every time someone else confirms the same problem.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
                <Link
                  href="/register"
                  style={{
                    padding: "16px 28px",
                    borderRadius: 12,
                    background: "#fff",
                    color: heroBtnPrimaryColor,
                    fontWeight: 800,
                    fontSize: 16,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Create free account
                </Link>
                <Link
                  href="/login"
                  style={{
                    padding: "16px 28px",
                    borderRadius: 12,
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Sign in
                </Link>
                {!isStandalone && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    style={{
                      padding: "16px 28px",
                      borderRadius: 12,
                      border: "1.5px dashed rgba(255,255,255,0.4)",
                      background: "transparent",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Install app
                  </button>
                )}
              </div>
              <p style={{ ...mono, fontSize: 12.5, color: "#6B7280", margin: "18px 0 0" }}>
                Free for residents · Accounts keep your reports traceable
              </p>
            </div>

            {/* Phone mockup */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: 300,
                  maxWidth: "100%",
                  aspectRatio: "9 / 18.5",
                  borderRadius: 34,
                  background: "#1C1C1C",
                  padding: 10,
                  boxShadow: "0 28px 60px rgba(0,0,0,0.45)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 26,
                    background: "#2D2D2D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PinIcon size={108} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats band — always dark ── */}
        <section style={{ background: "#111111", borderTop: "1px solid #1C1C1C", color: "#fff", padding: "26px 24px" }}>
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 24,
            }}
          >
            {stats.map((s) => (
              <div key={s.value} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{s.value}</span>
                <span style={{ ...mono, fontSize: 12.5, color: "#6B7280" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works — switches with theme ── */}
        <section id="how" style={{ padding: "clamp(48px, 7vw, 92px) 24px", maxWidth: 1180, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 3.4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
              color: pageText,
            }}
          >
            Three taps from pothole to paper trail
          </h2>
          <p style={{ fontSize: 17, color: bodyText, maxWidth: "38em", margin: "14px 0 0", lineHeight: 1.55 }}>
            Reporthole is built for the side of the road: one hand, bad signal, two minutes.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              marginTop: 44,
            }}
          >
            {steps.map((step) => (
              <div
                key={step.num}
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 18,
                  padding: 28,
                }}
              >
                <span style={{ ...mono, fontSize: 12.5, color: accentText }}>{step.num}</span>
                <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", margin: "12px 0 8px", color: pageText }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: bodyText, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What you can report — switches with theme ── */}
        <section
          id="report"
          style={{
            background: cardBg,
            borderTop: `1px solid ${border}`,
            borderBottom: `1px solid ${border}`,
            padding: "clamp(48px, 7vw, 88px) 24px",
          }}
        >
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "clamp(28px, 3.4vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  color: pageText,
                }}
              >
                What you can report
              </h2>
              <p style={{ fontSize: 17, color: bodyText, maxWidth: "34em", margin: "14px 0 28px", lineHeight: 1.55 }}>
                Seven categories cover the road faults that actually get municipal work orders raised.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {issueTypes.map((label) => (
                  <span
                    key={label}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      background: chipBg,
                      color: chipText,
                      fontSize: 14.5,
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Gauteng map */}
            <div
              style={{
                width: "100%",
                aspectRatio: "520 / 360",
                borderRadius: 18,
                overflow: "hidden",
                border: `1px solid ${border}`,
              }}
            >
              <LandingMapWrapper />
            </div>
          </div>
        </section>

        {/* ── For municipalities — always dark ── */}
        <section id="municipalities" style={{ padding: "clamp(48px, 7vw, 92px) 24px", maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              background: "#111111",
              color: "#fff",
              borderRadius: 24,
              padding: "clamp(32px, 5vw, 60px)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "clamp(26px, 3.2vw, 38px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  margin: 0,
                }}
              >
                For municipalities and contractors
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "#9CA3AF", margin: "16px 0 0", maxWidth: "34em" }}>
                Deduplicated, geotagged, photo-backed reports with a full status audit trail — ready to
                route to the crew that fixes it.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {muniPoints.map((point) => (
                <div key={point} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#9CA3AF",
                      marginTop: 8,
                      flex: "none",
                    }}
                  />
                  <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.55, color: "#E3E8F2" }}>{point}</p>
                </div>
              ))}
              <Link
                href="/contact"
                style={{
                  alignSelf: "flex-start",
                  marginTop: 10,
                  padding: "14px 24px",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#111111",
                  fontWeight: 800,
                  fontSize: 15.5,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Talk to us
              </Link>
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <ContactSection />

        {/* ── Final CTA — always dark ── */}
        <section style={{ background: "#111111", color: "#fff", padding: "clamp(48px, 7vw, 80px) 24px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 3.6vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Your street, on the record.
          </h2>
          <p
            style={{
              fontSize: 17.5,
              color: "#9CA3AF",
              margin: "14px auto 30px",
              maxWidth: "34em",
              lineHeight: 1.55,
            }}
          >
            Create an account and file your first report in under two minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/register"
              style={{
                padding: "16px 30px",
                borderRadius: 12,
                background: "#fff",
                color: "#111111",
                fontWeight: 800,
                fontSize: 16,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Create account
            </Link>
            <Link
              href="/login"
              style={{
                padding: "16px 30px",
                borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,0.4)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />

      <InstallInstructionsModal
        open={showInstallInstructions}
        onClose={() => setShowInstallInstructions(false)}
        isIOS={isIOS}
      />
    </div>
  );
}

/** Full marketing landing page — wraps content in the landing theme provider. */
export default function LandingPage() {
  return (
    <LandingThemeProvider>
      <LandingContent />
    </LandingThemeProvider>
  );
}
